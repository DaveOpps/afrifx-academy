import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';
import { INSTRUMENTS, getPrice, computePnl, marginRequired } from '../utils/prices.js';

const router = Router();
const STARTING_BALANCE = 10000;
const ORDER_TYPES = ['market', 'limit', 'stop'];

// Validate SL/TP price levels relative to entry & direction (MT5-style).
function validateSlTp(side, entry, sl, tp) {
  if (sl != null) {
    if (side === 'buy' && !(sl < entry)) return 'Stop Loss must be below entry for a BUY';
    if (side === 'sell' && !(sl > entry)) return 'Stop Loss must be above entry for a SELL';
  }
  if (tp != null) {
    if (side === 'buy' && !(tp > entry)) return 'Take Profit must be above entry for a BUY';
    if (side === 'sell' && !(tp < entry)) return 'Take Profit must be below entry for a SELL';
  }
  return null;
}

// Validate a pending order's trigger price relative to the current market price
// (MT5 rules): Limit orders fill at a better price than market, Stop orders fill
// on a breakout past the market.
function validatePendingTrigger(side, orderType, trigger, marketPrice) {
  if (orderType === 'limit') {
    if (side === 'buy' && !(trigger < marketPrice)) return 'Buy Limit price must be below the current market price';
    if (side === 'sell' && !(trigger > marketPrice)) return 'Sell Limit price must be above the current market price';
  } else if (orderType === 'stop') {
    if (side === 'buy' && !(trigger > marketPrice)) return 'Buy Stop price must be above the current market price';
    if (side === 'sell' && !(trigger < marketPrice)) return 'Sell Stop price must be below the current market price';
  }
  return null;
}

// Fills a pending order (converts it to an open position at its trigger price).
async function fillPending(t) {
  await prisma.paperTrade.update({
    where: { id: t.id },
    data: { status: 'open', entryPrice: t.entryPrice, openedAt: new Date() },
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

// Settles a user's book: triggers pending orders whose price has been reached,
// and auto-closes open positions whose SL/TP has been hit. Called before any
// read of positions/pending/account so the view is always up to date.
async function settleTriggers(userId) {
  const [pending, open] = await Promise.all([
    prisma.paperTrade.findMany({ where: { userId, status: 'pending' } }),
    prisma.paperTrade.findMany({ where: { userId, status: 'open' } }),
  ]);

  for (const t of pending) {
    let price;
    try { price = await getPrice(t.symbol); } catch { continue; }
    const hit = t.orderType === 'limit'
      ? (t.side === 'buy' ? price <= t.entryPrice : price >= t.entryPrice)
      : (t.side === 'buy' ? price >= t.entryPrice : price <= t.entryPrice);
    if (hit) await fillPending(t);
  }

  for (const t of open) {
    if (t.sl == null && t.tp == null) continue;
    let price;
    try { price = await getPrice(t.symbol); } catch { continue; }
    let exit = null, reason = null;
    if (t.side === 'buy') {
      if (t.sl != null && price <= t.sl) { exit = t.sl; reason = 'sl'; }
      else if (t.tp != null && price >= t.tp) { exit = t.tp; reason = 'tp'; }
    } else {
      if (t.sl != null && price >= t.sl) { exit = t.sl; reason = 'sl'; }
      else if (t.tp != null && price <= t.tp) { exit = t.tp; reason = 'tp'; }
    }
    if (exit != null) await closePosition(t, exit, reason);
  }
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
    res.json({ balance, usedMargin, available: balance - usedMargin, openPnl, equity: balance + openPnl, openCount: open.length, pendingCount: pending.length });
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

// Place an order — market (fills instantly) or pending (limit/stop, waits for trigger).
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

    if (orderType !== 'market') {
      const trigger = Number(req.body.price);
      if (!(trigger > 0)) return res.status(400).json({ error: 'Enter a valid order price' });
      const trigErr = validatePendingTrigger(side, orderType, trigger, marketPrice);
      if (trigErr) return res.status(400).json({ error: trigErr });
      fillPrice = trigger;
      status = 'pending';
    }

    const err = validateSlTp(side, fillPrice, slN, tpN);
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
      data: { userId: req.user.id, symbol, display: inst.display, side, orderType, lots: lotsN, stake: margin, entryPrice: fillPrice, sl: slN, tp: tpN, status },
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

    const { sl, tp } = req.body;
    const slN = sl === '' || sl == null ? null : Number(sl);
    const tpN = tp === '' || tp == null ? null : Number(tp);
    if (slN != null && !(slN > 0)) return res.status(400).json({ error: 'Invalid Stop Loss' });
    if (tpN != null && !(tpN > 0)) return res.status(400).json({ error: 'Invalid Take Profit' });
    const err = validateSlTp(trade.side, trade.entryPrice, slN, tpN);
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
    const updated = await prisma.paperTrade.update({ where: { id: trade.id }, data: { status: 'closed', closeReason: 'cancelled', closedAt: new Date(), pnl: 0 } });
    res.json(updated);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Close a position manually — realizes P&L into the balance
router.post('/close/:id', requireAuth, async (req, res) => {
  try {
    const trade = await prisma.paperTrade.findUnique({ where: { id: Number(req.params.id) } });
    if (!trade || trade.userId !== req.user.id) return res.status(404).json({ error: 'Position not found' });
    if (trade.status !== 'open') return res.status(400).json({ error: 'Position already closed' });

    const exitPrice = await getPrice(trade.symbol);
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
