import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  INSTRUMENTS, getPrice, computePnl, marginRequired,
  STOP_LEVEL_PIPS, FREEZE_LEVEL_PIPS, MARGIN_CALL_LEVEL, STOP_OUT_LEVEL, randomSlippage,
} from '../utils/prices.js';

const router = Router();
const STARTING_BALANCE = 10000;
const ORDER_TYPES = ['market', 'limit', 'stop', 'stop_limit'];

// Validate SL/TP price levels relative to entry & direction, and enforce the
// broker's Stop Level (minimum distance an SL/TP must keep from the price).
function validateSlTp(inst, side, entry, sl, tp) {
  const minDist = STOP_LEVEL_PIPS * inst.pip;
  if (sl != null) {
    if (side === 'buy' && !(sl < entry)) return 'Stop Loss must be below entry for a BUY';
    if (side === 'sell' && !(sl > entry)) return 'Stop Loss must be above entry for a SELL';
    if (Math.abs(entry - sl) < minDist) return `Stop Loss must be at least ${STOP_LEVEL_PIPS} pips from the price (stop level)`;
  }
  if (tp != null) {
    if (side === 'buy' && !(tp > entry)) return 'Take Profit must be above entry for a BUY';
    if (side === 'sell' && !(tp < entry)) return 'Take Profit must be below entry for a SELL';
    if (Math.abs(entry - tp) < minDist) return `Take Profit must be at least ${STOP_LEVEL_PIPS} pips from the price (stop level)`;
  }
  return null;
}

// Validate a pending order's trigger price relative to the current market price
// (MT5 rules): Limit orders fill at a better price than market, Stop orders fill
// on a breakout past the market. Also enforces the Stop Level minimum distance.
function validatePendingTrigger(inst, side, orderType, trigger, marketPrice) {
  const kind = orderType === 'stop_limit' ? 'Stop Limit' : orderType === 'stop' ? 'Stop' : 'Limit';
  if (orderType === 'limit') {
    if (side === 'buy' && !(trigger < marketPrice)) return 'Buy Limit price must be below the current market price';
    if (side === 'sell' && !(trigger > marketPrice)) return 'Sell Limit price must be above the current market price';
  } else {
    if (side === 'buy' && !(trigger > marketPrice)) return `Buy ${kind} price must be above the current market price`;
    if (side === 'sell' && !(trigger < marketPrice)) return `Sell ${kind} price must be below the current market price`;
  }
  const minDist = STOP_LEVEL_PIPS * inst.pip;
  if (Math.abs(trigger - marketPrice) < minDist) return `Order price must be at least ${STOP_LEVEL_PIPS} pips from the current market price (stop level)`;
  return null;
}

// A Buy Stop Limit's limit price must sit at/below its stop price (you're
// buying a small pullback after the breakout confirms); Sell Stop Limit is the
// mirror image.
function validateStopLimitPair(side, stopPrice, limitPrice) {
  if (side === 'buy' && !(limitPrice <= stopPrice)) return 'Buy Stop Limit price must be at or below the stop price';
  if (side === 'sell' && !(limitPrice >= stopPrice)) return 'Sell Stop Limit price must be at or above the stop price';
  return null;
}

// Freeze Level: once price is within a few pips of a level, it can no longer
// be modified or cancelled (the broker "freezes" it right before execution).
function checkFreeze(inst, currentPrice, level) {
  if (level == null) return null;
  const minDist = FREEZE_LEVEL_PIPS * inst.pip;
  if (Math.abs(currentPrice - level) < minDist) return 'This order is frozen — price is too close to its trigger level to modify or cancel right now';
  return null;
}

// Fills a pending order (converts it to an open position). Stop-triggered
// entries get adverse slippage (a real breakout rarely fills at the exact
// requested price); Limit-triggered entries fill exactly, like a real limit order.
async function fillPending(t, inst, adverseSlippage) {
  let fillPrice = t.entryPrice;
  if (adverseSlippage) {
    const dir = t.side === 'buy' ? 1 : -1; // worse for a buy = higher; worse for a sell = lower
    fillPrice = t.entryPrice + randomSlippage(inst.dp, dir);
  }
  await prisma.paperTrade.update({
    where: { id: t.id },
    data: { status: 'open', entryPrice: fillPrice, openedAt: new Date() },
  });
}

// Closes an open position, realizing P&L into the balance.
async function closePosition(t, exit, reason) {
  const pnl = computePnl(t, exit);
  await prisma.$transaction([
    prisma.paperTrade.update({ where: { id: t.id }, data: { status: 'closed', exitPrice: exit, pnl, closedAt: new Date(), closeReason: reason } }),
    prisma.user.update({ where: { id: t.userId }, data: { paperBalance: { increment: pnl } } }),
  ]);
}

// Margin Call / Stop Out: if margin level (equity ÷ used margin × 100) falls
// below STOP_OUT_LEVEL, the broker force-closes the worst-losing open position
// (repeating until the account is safe again or nothing losing remains).
async function checkStopOut(userId) {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  let open = await prisma.paperTrade.findMany({ where: { userId, status: 'open' } });
  if (open.length === 0) return;

  for (let guard = 0; guard < 50; guard++) { // safety cap against any runaway loop
    let usedMargin = 0, openPnl = 0;
    const withPnl = [];
    for (const t of open) {
      usedMargin += t.stake;
      let pnl = 0;
      try { pnl = computePnl(t, await getPrice(t.symbol)); } catch { /* skip */ }
      openPnl += pnl;
      withPnl.push({ t, pnl });
    }
    if (usedMargin <= 0) return;
    const equity = user.paperBalance + openPnl;
    const marginLevel = (equity / usedMargin) * 100;
    if (marginLevel >= STOP_OUT_LEVEL) return;

    withPnl.sort((a, b) => a.pnl - b.pnl);
    const worst = withPnl[0];
    if (!worst || worst.pnl >= 0) return; // nothing losing left; avoid closing profitable trades
    let exitPrice;
    try { exitPrice = await getPrice(worst.t.symbol); } catch { return; }
    await closePosition(worst.t, exitPrice, 'stopout');

    user = await prisma.user.findUnique({ where: { id: userId } });
    open = await prisma.paperTrade.findMany({ where: { userId, status: 'open' } });
    if (open.length === 0) return;
  }
}

// Settles a user's book: triggers pending orders whose price has been reached
// (including converting a triggered Stop Limit into a live Limit order),
// auto-closes open positions whose SL/TP has been hit, then runs Stop Out.
// Called before any read of positions/pending/account so the view is fresh.
async function settleTriggers(userId) {
  const [pending, open] = await Promise.all([
    prisma.paperTrade.findMany({ where: { userId, status: 'pending' } }),
    prisma.paperTrade.findMany({ where: { userId, status: 'open' } }),
  ]);

  for (const t of pending) {
    const inst = INSTRUMENTS[t.symbol];
    let price;
    try { price = await getPrice(t.symbol); } catch { continue; }

    if (t.orderType === 'stop_limit') {
      const stopHit = t.side === 'buy' ? price >= t.entryPrice : price <= t.entryPrice;
      if (!stopHit) continue;
      const limitLevel = t.limitPrice;
      await prisma.paperTrade.update({ where: { id: t.id }, data: { orderType: 'limit', entryPrice: limitLevel } });
      const limitHit = t.side === 'buy' ? price <= limitLevel : price >= limitLevel;
      if (limitHit) await fillPending({ ...t, orderType: 'limit', entryPrice: limitLevel }, inst, false);
      continue;
    }

    const hit = t.orderType === 'limit'
      ? (t.side === 'buy' ? price <= t.entryPrice : price >= t.entryPrice)
      : (t.side === 'buy' ? price >= t.entryPrice : price <= t.entryPrice);
    if (hit) await fillPending(t, inst, t.orderType === 'stop');
  }

  for (const t of open) {
    if (t.sl == null && t.tp == null) continue;
    const inst = INSTRUMENTS[t.symbol];
    let price;
    try { price = await getPrice(t.symbol); } catch { continue; }
    let exit = null, reason = null;
    if (t.side === 'buy') {
      if (t.sl != null && price <= t.sl) { exit = t.sl + randomSlippage(inst.dp, -1); reason = 'sl'; }
      else if (t.tp != null && price >= t.tp) { exit = t.tp; reason = 'tp'; }
    } else {
      if (t.sl != null && price >= t.sl) { exit = t.sl + randomSlippage(inst.dp, 1); reason = 'sl'; }
      else if (t.tp != null && price <= t.tp) { exit = t.tp; reason = 'tp'; }
    }
    if (exit != null) await closePosition(t, exit, reason);
  }

  await checkStopOut(userId);
}

// List tradable instruments (with live prices + contract info for margin sizing)
router.get('/instruments', requireAuth, async (_req, res) => {
  try {
    const list = await Promise.all(
      Object.entries(INSTRUMENTS).map(async ([symbol, i]) => {
        let price = null;
        try { price = await getPrice(symbol); } catch { /* ignore */ }
        return { symbol, display: i.display, dp: i.dp, contract: i.contract, usdBase: !!i.usdBase, pip: i.pip, price };
      })
    );
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/price/:symbol', requireAuth, async (req, res) => {
  try {
    const price = await getPrice(req.params.symbol);
    res.json({ symbol: req.params.symbol, price });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Account summary. Margin is reserved by open AND pending orders alike.
router.get('/account', requireAuth, async (req, res) => {
  try {
    await settleTriggers(req.user.id);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const [open, pending] = await Promise.all([
      prisma.paperTrade.findMany({ where: { userId: req.user.id, status: 'open' } }),
      prisma.paperTrade.findMany({ where: { userId: req.user.id, status: 'pending' } }),
    ]);
    let usedMargin = pending.reduce((s, t) => s + t.stake, 0);
    let openPnl = 0;
    for (const t of open) {
      usedMargin += t.stake;
      try { openPnl += computePnl(t, await getPrice(t.symbol)); } catch { /* skip */ }
    }
    const balance = user.paperBalance;
    const equity = balance + openPnl;
    const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : null;
    res.json({
      balance, usedMargin, available: balance - usedMargin, openPnl, equity,
      openCount: open.length, pendingCount: pending.length,
      marginLevel, marginCall: marginLevel != null && marginLevel < MARGIN_CALL_LEVEL,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Open positions with live price + unrealized P&L
router.get('/positions', requireAuth, async (req, res) => {
  try {
    await settleTriggers(req.user.id);
    const open = await prisma.paperTrade.findMany({
      where: { userId: req.user.id, status: 'open' },
      orderBy: { openedAt: 'desc' },
    });
    const rows = await Promise.all(open.map(async t => {
      let price = null, pnl = null;
      try { price = await getPrice(t.symbol); pnl = computePnl(t, price); } catch { /* skip */ }
      return { ...t, price, pnl };
    }));
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Pending (not-yet-triggered) orders
router.get('/pending', requireAuth, async (req, res) => {
  try {
    await settleTriggers(req.user.id);
    const rows = await prisma.paperTrade.findMany({
      where: { userId: req.user.id, status: 'pending' },
      orderBy: { openedAt: 'desc' },
    });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/history', requireAuth, async (req, res) => {
  const rows = await prisma.paperTrade.findMany({
    where: { userId: req.user.id, status: 'closed' },
    orderBy: { closedAt: 'desc' },
    take: 100,
  });
  res.json(rows);
});

// Place an order — market (fills instantly, with slippage), or pending
// (limit/stop/stop_limit, waits for a trigger).
router.post('/open', requireAuth, async (req, res) => {
  try {
    const { symbol, side, lots, sl, tp } = req.body;
    const orderType = ORDER_TYPES.includes(req.body.orderType) ? req.body.orderType : 'market';
    const inst = INSTRUMENTS[symbol];
    if (!inst) return res.status(400).json({ error: 'Unknown instrument' });
    if (side !== 'buy' && side !== 'sell') return res.status(400).json({ error: 'Side must be buy or sell' });
    const lotsN = Number(lots);
    if (!(lotsN > 0)) return res.status(400).json({ error: 'Enter a valid lot size' });

    const slN = sl === '' || sl == null ? null : Number(sl);
    const tpN = tp === '' || tp == null ? null : Number(tp);
    if (slN != null && !(slN > 0)) return res.status(400).json({ error: 'Invalid Stop Loss' });
    if (tpN != null && !(tpN > 0)) return res.status(400).json({ error: 'Invalid Take Profit' });

    const marketPrice = await getPrice(symbol);
    let fillPrice = marketPrice;
    let status = 'open';
    let limitPriceField = null;

    if (orderType === 'market') {
      fillPrice = marketPrice + randomSlippage(inst.dp, null);
    } else if (orderType === 'stop_limit') {
      const stopPrice = Number(req.body.price);
      const limitPrice = Number(req.body.limitPrice);
      if (!(stopPrice > 0) || !(limitPrice > 0)) return res.status(400).json({ error: 'Enter valid stop and limit prices' });
      const trigErr = validatePendingTrigger(inst, side, 'stop_limit', stopPrice, marketPrice);
      if (trigErr) return res.status(400).json({ error: trigErr });
      const pairErr = validateStopLimitPair(side, stopPrice, limitPrice);
      if (pairErr) return res.status(400).json({ error: pairErr });
      fillPrice = stopPrice;
      limitPriceField = limitPrice;
      status = 'pending';
    } else {
      const trigger = Number(req.body.price);
      if (!(trigger > 0)) return res.status(400).json({ error: 'Enter a valid order price' });
      const trigErr = validatePendingTrigger(inst, side, orderType, trigger, marketPrice);
      if (trigErr) return res.status(400).json({ error: trigErr });
      fillPrice = trigger;
      status = 'pending';
    }

    const err = validateSlTp(inst, side, fillPrice, slN, tpN);
    if (err) return res.status(400).json({ error: err });

    const margin = marginRequired(symbol, lotsN, fillPrice);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const [open, pending] = await Promise.all([
      prisma.paperTrade.findMany({ where: { userId: req.user.id, status: 'open' } }),
      prisma.paperTrade.findMany({ where: { userId: req.user.id, status: 'pending' } }),
    ]);
    const usedMargin = [...open, ...pending].reduce((s, t) => s + t.stake, 0);
    if (margin > user.paperBalance - usedMargin) {
      return res.status(400).json({ error: 'Not enough free margin for this order' });
    }

    const trade = await prisma.paperTrade.create({
      data: { userId: req.user.id, symbol, display: inst.display, side, orderType, lots: lotsN, stake: margin, entryPrice: fillPrice, limitPrice: limitPriceField, sl: slN, tp: tpN, status },
    });
    res.json(trade);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Modify SL/TP on an open position OR a still-pending order
router.post('/modify/:id', requireAuth, async (req, res) => {
  try {
    const trade = await prisma.paperTrade.findUnique({ where: { id: Number(req.params.id) } });
    if (!trade || trade.userId !== req.user.id) return res.status(404).json({ error: 'Position not found' });
    if (trade.status !== 'open' && trade.status !== 'pending') return res.status(400).json({ error: 'Order already closed' });
    const inst = INSTRUMENTS[trade.symbol];

    let currentPrice;
    try { currentPrice = await getPrice(trade.symbol); } catch { currentPrice = trade.entryPrice; }
    const freezeErr = checkFreeze(inst, currentPrice, trade.sl) || checkFreeze(inst, currentPrice, trade.tp);
    if (freezeErr) return res.status(400).json({ error: freezeErr });

    const { sl, tp } = req.body;
    const slN = sl === '' || sl == null ? null : Number(sl);
    const tpN = tp === '' || tp == null ? null : Number(tp);
    if (slN != null && !(slN > 0)) return res.status(400).json({ error: 'Invalid Stop Loss' });
    if (tpN != null && !(tpN > 0)) return res.status(400).json({ error: 'Invalid Take Profit' });
    const err = validateSlTp(inst, trade.side, trade.entryPrice, slN, tpN);
    if (err) return res.status(400).json({ error: err });

    const updated = await prisma.paperTrade.update({ where: { id: trade.id }, data: { sl: slN, tp: tpN } });
    res.json(updated);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Cancel a pending order (frees its reserved margin)
router.post('/cancel/:id', requireAuth, async (req, res) => {
  try {
    const trade = await prisma.paperTrade.findUnique({ where: { id: Number(req.params.id) } });
    if (!trade || trade.userId !== req.user.id) return res.status(404).json({ error: 'Order not found' });
    if (trade.status !== 'pending') return res.status(400).json({ error: 'Order is not pending' });
    const inst = INSTRUMENTS[trade.symbol];

    let currentPrice;
    try { currentPrice = await getPrice(trade.symbol); } catch { currentPrice = trade.entryPrice; }
    const freezeErr = checkFreeze(inst, currentPrice, trade.entryPrice);
    if (freezeErr) return res.status(400).json({ error: freezeErr });

    const updated = await prisma.paperTrade.update({ where: { id: trade.id }, data: { status: 'closed', closeReason: 'cancelled', closedAt: new Date(), pnl: 0 } });
    res.json(updated);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Close a position manually (market execution — small two-sided slippage applies)
router.post('/close/:id', requireAuth, async (req, res) => {
  try {
    const trade = await prisma.paperTrade.findUnique({ where: { id: Number(req.params.id) } });
    if (!trade || trade.userId !== req.user.id) return res.status(404).json({ error: 'Position not found' });
    if (trade.status !== 'open') return res.status(400).json({ error: 'Position already closed' });
    const inst = INSTRUMENTS[trade.symbol];

    const marketPrice = await getPrice(trade.symbol);
    const exitPrice = marketPrice + randomSlippage(inst.dp, null);
    await closePosition(trade, exitPrice, 'manual');
    const updated = await prisma.paperTrade.findUnique({ where: { id: trade.id } });
    res.json(updated);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Reset the demo account
router.post('/reset', requireAuth, async (req, res) => {
  await prisma.paperTrade.deleteMany({ where: { userId: req.user.id } });
  await prisma.user.update({ where: { id: req.user.id }, data: { paperBalance: STARTING_BALANCE } });
  res.json({ ok: true, balance: STARTING_BALANCE });
});

export default router;
