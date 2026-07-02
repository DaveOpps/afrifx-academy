import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';
import { INSTRUMENTS, getPrice, computePnl } from '../utils/prices.js';

const router = Router();
const STARTING_BALANCE = 10000;

// List tradable instruments (with live prices)
router.get('/instruments', requireAuth, async (_req, res) => {
  try {
    const list = await Promise.all(
      Object.entries(INSTRUMENTS).map(async ([symbol, i]) => {
        let price = null;
        try { price = await getPrice(symbol); } catch { /* ignore */ }
        return { symbol, display: i.display, dp: i.dp, price };
      })
    );
    res.json(list);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Single live price
router.get('/price/:symbol', requireAuth, async (req, res) => {
  try {
    const price = await getPrice(req.params.symbol);
    res.json({ symbol: req.params.symbol, price });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Account summary: balance, margin in use, open P&L, equity
router.get('/account', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const open = await prisma.paperTrade.findMany({ where: { userId: req.user.id, status: 'open' } });
    let usedMargin = 0, openPnl = 0;
    for (const t of open) {
      usedMargin += t.stake;
      try { openPnl += computePnl(t, await getPrice(t.symbol)); } catch { /* skip */ }
    }
    const balance = user.paperBalance;
    res.json({
      balance,
      usedMargin,
      available: balance - usedMargin,
      openPnl,
      equity: balance + openPnl,
      openCount: open.length,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Open positions with live price + unrealized P&L
router.get('/positions', requireAuth, async (req, res) => {
  try {
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

// Closed trade history
router.get('/history', requireAuth, async (req, res) => {
  const rows = await prisma.paperTrade.findMany({
    where: { userId: req.user.id, status: 'closed' },
    orderBy: { closedAt: 'desc' },
    take: 100,
  });
  res.json(rows);
});

// Open a new position
router.post('/open', requireAuth, async (req, res) => {
  try {
    const { symbol, side, stake, leverage } = req.body;
    const inst = INSTRUMENTS[symbol];
    if (!inst) return res.status(400).json({ error: 'Unknown instrument' });
    if (side !== 'buy' && side !== 'sell') return res.status(400).json({ error: 'Side must be buy or sell' });
    const stakeN = Number(stake);
    const levN = Math.max(1, Math.min(200, Number(leverage) || 1));
    if (!(stakeN > 0)) return res.status(400).json({ error: 'Enter a valid stake amount' });

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const open = await prisma.paperTrade.findMany({ where: { userId: req.user.id, status: 'open' } });
    const usedMargin = open.reduce((s, t) => s + t.stake, 0);
    if (stakeN > user.paperBalance - usedMargin) {
      return res.status(400).json({ error: 'Not enough available balance' });
    }

    const entryPrice = await getPrice(symbol);
    const trade = await prisma.paperTrade.create({
      data: { userId: req.user.id, symbol, display: inst.display, side, stake: stakeN, leverage: levN, entryPrice },
    });
    res.json(trade);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Close a position — realizes P&L into the balance
router.post('/close/:id', requireAuth, async (req, res) => {
  try {
    const trade = await prisma.paperTrade.findUnique({ where: { id: Number(req.params.id) } });
    if (!trade || trade.userId !== req.user.id) return res.status(404).json({ error: 'Position not found' });
    if (trade.status !== 'open') return res.status(400).json({ error: 'Position already closed' });

    const exitPrice = await getPrice(trade.symbol);
    const pnl = computePnl(trade, exitPrice);
    const [closed] = await prisma.$transaction([
      prisma.paperTrade.update({
        where: { id: trade.id },
        data: { status: 'closed', exitPrice, pnl, closedAt: new Date() },
      }),
      prisma.user.update({ where: { id: req.user.id }, data: { paperBalance: { increment: pnl } } }),
    ]);
    res.json(closed);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Reset the demo account (close nothing kept; wipe history + restore balance)
router.post('/reset', requireAuth, async (req, res) => {
  await prisma.paperTrade.deleteMany({ where: { userId: req.user.id } });
  await prisma.user.update({ where: { id: req.user.id }, data: { paperBalance: STARTING_BALANCE } });
  res.json({ ok: true, balance: STARTING_BALANCE });
});

export default router;
