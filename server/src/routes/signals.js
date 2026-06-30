import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { requireSignalAccess } from '../middleware/access.js';
import { sendSignalAlert } from '../utils/email.js';

const router = Router();

// GET /api/signals/performance — PUBLIC transparency stats (trust builder)
router.get('/performance', async (req, res) => {
  try {
    const closed = await prisma.signal.findMany({ where: { status: 'closed' }, orderBy: { createdAt: 'desc' } });
    const wins = closed.filter(s => s.result === 'win');
    const losses = closed.filter(s => s.result === 'loss');
    const breakeven = closed.filter(s => s.result === 'breakeven');
    const decided = wins.length + losses.length;
    const winRate = decided ? Math.round((wins.length / decided) * 100) : 0;
    const totalPips = closed.reduce((sum, s) => {
      const p = Math.abs(s.pips || 0);
      if (s.result === 'win') return sum + p;
      if (s.result === 'loss') return sum - p;
      return sum;
    }, 0);

    // Monthly performance — last 6 months, sum of pips
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en-GB', { month: 'short' });
      const inMonth = closed.filter(s => {
        const sd = new Date(s.createdAt);
        return sd.getFullYear() === d.getFullYear() && sd.getMonth() === d.getMonth();
      });
      const pips = inMonth.reduce((sum, s) => {
        const p = Math.abs(s.pips || 0);
        return s.result === 'win' ? sum + p : s.result === 'loss' ? sum - p : sum;
      }, 0);
      months.push({ label, pips: Math.round(pips), trades: inMonth.length });
    }

    // Risk:Reward — avg win pips / avg loss pips
    const avgWin = wins.length ? wins.reduce((s, w) => s + Math.abs(w.pips || 0), 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((s, l) => s + Math.abs(l.pips || 0), 0) / losses.length : 1;
    const rr = avgLoss ? +(avgWin / avgLoss).toFixed(2) : 0;

    // Weekly performance — last 8 weeks
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const start = new Date(); start.setDate(start.getDate() - i * 7 - 6);
      const end = new Date(); end.setDate(end.getDate() - i * 7);
      const label = `W${8 - i}`;
      const inWeek = closed.filter(s => { const d = new Date(s.createdAt); return d >= start && d <= end; });
      const pips = inWeek.reduce((sum, s) => { const p = Math.abs(s.pips || 0); return s.result === 'win' ? sum + p : s.result === 'loss' ? sum - p : sum; }, 0);
      const wr = inWeek.filter(s => s.result !== 'loss').length;
      weeks.push({ label, pips: Math.round(pips), trades: inWeek.length, wins: wr });
    }

    res.json({
      trades: closed.length,
      wins: wins.length,
      losses: losses.length,
      breakeven: breakeven.length,
      winRate,
      totalPips: Math.round(totalPips),
      rr,
      avgWin: Math.round(avgWin),
      avgLoss: Math.round(avgLoss),
      months,
      weeks,
      history: closed.slice(0, 50),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/signals — all signals (subscribers only)
router.get('/', requireSignalAccess, async (req, res) => {
  try {
    const { type, status } = req.query;
    const where = {};
    if (type && type !== 'All') where.type = type;
    if (status && status !== 'All') where.status = status;
    const signals = await prisma.signal.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(signals);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/signals/latest — latest 5 active (subscribers only)
router.get('/latest', requireSignalAccess, async (req, res) => {
  try {
    const signals = await prisma.signal.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    res.json(signals);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/signals — admin create
router.post('/', requireAdmin, async (req, res) => {
  const { pair, type, direction, entry, stopLoss, tp1, tp2, tp3, notes } = req.body;
  if (!pair || !direction || !entry || !stopLoss || !tp1) {
    return res.status(400).json({ error: 'pair, direction, entry, stopLoss and tp1 are required' });
  }
  try {
    const signal = await prisma.signal.create({
      data: { pair: pair.toUpperCase(), type: type || 'Forex', direction: direction.toUpperCase(), entry, stopLoss, tp1, tp2: tp2 || null, tp3: tp3 || null, notes: notes || null }
    });
    res.json(signal);
    // Email all active signal subscribers (fire-and-forget)
    prisma.user.findMany({
      where: { OR: [{ tier: 'vvip' }, { signalSubUntil: { gt: new Date() } }] },
      select: { email: true, name: true }
    }).then(users => {
      users.forEach(u => sendSignalAlert(u.email, u.name, signal).catch(() => {}));
    }).catch(() => {});
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// PUT /api/signals/:id — admin update (close with result)
router.put('/:id', requireAdmin, async (req, res) => {
  const { status, result, pips, notes } = req.body;
  try {
    const signal = await prisma.signal.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(status ? { status } : {}),
        ...(result ? { result } : {}),
        ...(pips !== undefined ? { pips: pips !== '' ? Number(pips) : null } : {}),
        ...(notes !== undefined ? { notes } : {})
      }
    });
    res.json(signal);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE /api/signals/:id — admin delete
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.signal.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
