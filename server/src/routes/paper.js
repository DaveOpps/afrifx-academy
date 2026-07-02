import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';
import { INSTRUMENTS, getPrice, computePnl, marginRequired } from '../utils/prices.js';

const router = Router();
const STARTING_BALANCE = 10000;

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

// Auto-close any open positions whose SL/TP has been hit. Fills at the SL/TP
// level (no slippage). Called before returning positions/account.
async function settleTriggers(userId) {
  const open = await prisma.paperTrade.findMany({ where: { userId, status: 'open' } });
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
    if (exit != null) {
      const pnl = computePnl(t, exit);
      await prisma.$transaction([
        prisma.paperTrade.update({ where: { id: t.id }, data: { status: 'closed', exitPrice: exit, pnl, closedAt: new Date(), closeReason: reason } }),
        prisma.user.update({ where: { id: userId }, data: { paperBalance: { increment: pnl } } }),
      ]);
    }
  }
}

// List tradable instruments (with live prices + contract info for margin sizing)
router.get('/instruments', requireAuth, async (_req, res) => {
  try {
    const list = await Promise.all(
      Object.entries(INSTRUMENTS).map(async ([symbol, i]) => {
        let price = null;
        try { price = await getPrice(symbol); } catch { /* ignore */ }
        return { symbol, display: i.display, dp: i.dp, contract: i.contract, usdBase: !!i.usdBase, price };
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

// Account summary
router.get('/account', requireAuth, async (req, res) => {
  try {
    await settleTriggers(req.user.id);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const open = await prisma.paperTrade.findMany({ where: { userId: req.user.id, status: 'open' } });
    let usedMargin = 0, openPnl = 0;
    for (const t of open) {
      usedMargin += t.stake;
      try { openPnl += computePnl(t, await getPrice(t.symbol)); } catch { /* skip */ }
    }
    const balance = user.paperBalance;
    res.json({ balance, usedMargin, available: balance - usedMargin, openPnl, equity: balance + openPnl, openCount: open.length });
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

router.get('/history', requireAuth, async (req, res) => {
  const rows = await prisma.paperTrade.findMany({
    where: { userId: req.user.id, status: 'closed' },
    orderBy: { closedAt: 'desc' },
    take: 100,
  });
  res.json(rows);
});

// Open a new position (lot-based, optional SL/TP)
router.post('/open', requireAuth, async (req, res) => {
  try {
    const { symbol, side, lots, sl, tp } = req.body;
    const inst = INSTRUMENTS[symbol];
    if (!inst) return res.status(400).json({ error: 'Unknown instrument' });
    if (side !== 'buy' && side !== 'sell') return res.status(400).json({ error: 'Side must be buy or sell' });
    const lotsN = Number(lots);
    if (!(lotsN > 0)) return res.status(400).json({ error: 'Enter a valid lot size' });

    const slN = sl === '' || sl == null ? null : Number(sl);
    const tpN = tp === '' || tp == null ? null : Number(tp);
    if (slN != null && !(slN > 0)) return res.status(400).json({ error: 'Invalid Stop Loss' });
    if (tpN != null && !(tpN > 0)) return res.status(400).json({ error: 'Invalid Take Profit' });

    const entryPrice = await getPrice(symbol);
    const err = validateSlTp(side, entryPrice, slN, tpN);
    if (err) return res.status(400).json({ error: err });

    const margin = marginRequired(symbol, lotsN, entryPrice);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const open = await prisma.paperTrade.findMany({ where: { userId: req.user.id, status: 'open' } });
    const usedMargin = open.reduce((s, t) => s + t.stake, 0);
    if (margin > user.paperBalance - usedMargin) {
      return res.status(400).json({ error: 'Not enough free margin for this lot size' });
    }

    const trade = await prisma.paperTrade.create({
      data: { userId: req.user.id, symbol, display: inst.display, side, lots: lotsN, stake: margin, entryPrice, sl: slN, tp: tpN },
    });
    res.json(trade);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Modify SL/TP on an open position
router.post('/modify/:id', requireAuth, async (req, res) => {
  try {
    const trade = await prisma.paperTrade.findUnique({ where: { id: Number(req.params.id) } });
    if (!trade || trade.userId !== req.user.id) return res.status(404).json({ error: 'Position not found' });
    if (trade.status !== 'open') return res.status(400).json({ error: 'Position already closed' });

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

// Close a position manually — realizes P&L into the balance
router.post('/close/:id', requireAuth, async (req, res) => {
  try {
    const trade = await prisma.paperTrade.findUnique({ where: { id: Number(req.params.id) } });
    if (!trade || trade.userId !== req.user.id) return res.status(404).json({ error: 'Position not found' });
    if (trade.status !== 'open') return res.status(400).json({ error: 'Position already closed' });

    const exitPrice = await getPrice(trade.symbol);
    const pnl = computePnl(trade, exitPrice);
    const [closed] = await prisma.$transaction([
      prisma.paperTrade.update({ where: { id: trade.id }, data: { status: 'closed', exitPrice, pnl, closedAt: new Date(), closeReason: 'manual' } }),
      prisma.user.update({ where: { id: req.user.id }, data: { paperBalance: { increment: pnl } } }),
    ]);
    res.json(closed);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Reset the demo account
router.post('/reset', requireAuth, async (req, res) => {
  await prisma.paperTrade.deleteMany({ where: { userId: req.user.id } });
  await prisma.user.update({ where: { id: req.user.id }, data: { paperBalance: STARTING_BALANCE } });
  res.json({ ok: true, balance: STARTING_BALANCE });
});

export default router;
