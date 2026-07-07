import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { sendSignalAlert } from '../utils/email.js';
import { announceSignal, signalSummary } from '../utils/signalNotify.js';
import { getPrice } from '../utils/prices.js';
import { resolveSymbol, pendingTriggered } from '../utils/signalEngine.js';

const router = Router();

// Reject inconsistent figures: every price must be a positive number and the
// Stop Loss / Take Profits must sit on the right side of the entry for the
// direction (BUY: SL below entry, TPs progressively above; SELL: the reverse).
function validateSignalFigures(dir, entry, stopLoss, tp1, tp2, tp3) {
  const e = parseFloat(entry), s = parseFloat(stopLoss), t1 = parseFloat(tp1);
  const has = (v) => v != null && v !== '';
  const t2 = has(tp2) ? parseFloat(tp2) : null;
  const t3 = has(tp3) ? parseFloat(tp3) : null;
  const pos = (v) => Number.isFinite(v) && v > 0;
  if (!pos(e)) return 'Entry must be a positive number.';
  if (!pos(s)) return 'Stop Loss must be a positive number.';
  if (!pos(t1)) return 'TP1 must be a positive number.';
  if (has(tp2) && !pos(t2)) return 'TP2 must be a positive number.';
  if (has(tp3) && !pos(t3)) return 'TP3 must be a positive number.';

  const sign = dir === 'BUY' ? 1 : -1;          // profit direction
  const slSide = dir === 'BUY' ? 'below' : 'above';
  const tpSide = dir === 'BUY' ? 'above' : 'below';
  if (sign * (e - s) <= 0) return `For a ${dir}, Stop Loss must be ${slSide} the entry price.`;
  let prev = e, prevName = 'the entry';
  for (const [name, tp] of [['TP1', t1], ['TP2', t2], ['TP3', t3]]) {
    if (tp == null) continue;
    if (sign * (tp - prev) <= 0) return `For a ${dir}, ${name} must be ${tpSide} ${prevName}.`;
    prev = tp; prevName = name;
  }
  return null;
}

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
router.get('/', requireAuth, async (req, res) => {
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
router.get('/latest', requireAuth, async (req, res) => {
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
const ORDER_TYPES = ['Market', 'Buy Limit', 'Sell Limit', 'Buy Stop', 'Sell Stop'];

router.post('/', requireAdmin, async (req, res) => {
  const { pair, type, direction, entry, stopLoss, tp1, tp2, tp3, notes, status, orderType, autoManage } = req.body;
  if (!pair || !direction || !entry || !stopLoss || !tp1) {
    return res.status(400).json({ error: 'pair, direction, entry, stopLoss and tp1 are required' });
  }
  try {
    // Normalise the order type, and keep BUY/SELL consistent with pending types
    const ot = ORDER_TYPES.includes(orderType) ? orderType : 'Market';
    const dir = ot.startsWith('Buy') ? 'BUY' : ot.startsWith('Sell') ? 'SELL' : direction.toUpperCase();

    // Reject inconsistent figures (SL/TP on the wrong side, non-numbers, etc.)
    const figErr = validateSignalFigures(dir, entry, stopLoss, tp1, tp2, tp3);
    if (figErr) return res.status(400).json({ error: figErr });

    // A Market order can't sit pending (nothing to trigger it), so only pending
    // order types may be posted as pending.
    const st = (status === 'pending' && ot !== 'Market') ? 'pending' : 'active';

    // Live-sensitive: a pending order must be placed on the waiting side of the
    // market. If it would trigger at the current price, it's on the wrong side.
    if (st === 'pending') {
      const sym = resolveSymbol(pair);
      if (sym) {
        try {
          const price = await getPrice(sym);
          if (pendingTriggered(ot, parseFloat(entry), price)) {
            return res.status(400).json({ error: `At the live price ${price}, a ${ot} on ${pair.toUpperCase()} would trigger immediately — set the trigger on the correct side (Buy Limit below market, Sell Limit above, Buy Stop above, Sell Stop below).` });
          }
        } catch { /* price feed unavailable — skip the live-side check */ }
      }
    }

    const signal = await prisma.signal.create({
      data: { pair: pair.toUpperCase(), type: type || 'Forex', direction: dir, orderType: ot, entry, stopLoss, tp1, tp2: tp2 || null, tp3: tp3 || null, notes: notes || null, status: st, autoManage: autoManage !== false }
    });
    res.json(signal);
    // Bell announcement for everyone
    const postedLabel = signal.status === 'pending' ? '⏳ New Pending Signal' : '📊 New Signal';
    announceSignal(`${postedLabel}: ${signal.pair} ${signal.direction}`, signalSummary(signal));
    // Email all active signal subscribers (fire-and-forget) — skip for pending signals not yet triggered
    if (signal.status === 'active') {
      prisma.user.findMany({
        where: { OR: [{ tier: 'vvip' }, { signalSubUntil: { gt: new Date() } }] },
        select: { email: true, name: true }
      }).then(users => {
        users.forEach(u => sendSignalAlert(u.email, u.name, signal).catch(() => {}));
      }).catch(() => {});
    }
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// PUT /api/signals/:id — admin update (close with result)
router.put('/:id', requireAdmin, async (req, res) => {
  const { status, result, pips, notes, autoManage } = req.body;
  try {
    const prev = await prisma.signal.findUnique({ where: { id: Number(req.params.id) } });
    const signal = await prisma.signal.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(status ? { status } : {}),
        ...(result ? { result } : {}),
        ...(pips !== undefined ? { pips: pips !== '' ? Number(pips) : null } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(autoManage !== undefined ? { autoManage: !!autoManage } : {})
      }
    });
    res.json(signal);
    // Notify the bell on meaningful status changes (trigger / close / cancel)
    if (prev && status && status !== prev.status) {
      if (status === 'active' && prev.status === 'pending') {
        announceSignal(`🎯 Signal Triggered: ${signal.pair} ${signal.direction}`, `${signalSummary(signal)} — now active.`);
      } else if (status === 'closed') {
        announceSignal(`✅ Signal Closed: ${signal.pair} ${signal.direction}`, `Result: ${(signal.result || 'closed').toUpperCase()}${signal.pips != null ? ` · ${signal.pips > 0 ? '+' : ''}${signal.pips} pips` : ''}.`);
      } else if (status === 'cancelled') {
        announceSignal(`🚫 Signal Cancelled: ${signal.pair} ${signal.direction}`, `The ${signal.pair} ${signal.direction} signal was cancelled.`);
      }
    }
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
