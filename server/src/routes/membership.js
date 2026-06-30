import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';
import { userHasSignalAccess } from '../middleware/access.js';

const router = Router();

const PRICES = { premium: 0, vvip: 50, signal_sub: 5 };

// Current membership / subscription status
router.get('/status', requireAuth, async (req, res) => {
  const u = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { tier: true, signalSubUntil: true }
  });
  res.json({
    tier: u.tier,
    signalSubUntil: u.signalSubUntil,
    signalActive: userHasSignalAccess({ ...u, role: req.user.role }),
  });
});

// Upgrade membership tier (mock checkout — real gateway plugs in here later)
router.post('/upgrade', requireAuth, async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['premium', 'vvip'].includes(tier)) return res.status(400).json({ error: 'Invalid tier' });
    const data = { tier };
    // VVIP includes lifetime signals
    if (tier === 'vvip') data.signalSubUntil = new Date('2099-12-31');
    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    await prisma.payment.create({ data: { userId: req.user.id, amount: PRICES[tier], purpose: tier } });
    res.json({ ok: true, tier: user.tier, signalSubUntil: user.signalSubUntil });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Subscribe to monthly signals ($5/mo) — mock checkout, +30 days
router.post('/subscribe-signals', requireAuth, async (req, res) => {
  try {
    const current = await prisma.user.findUnique({ where: { id: req.user.id } });
    const base = current.signalSubUntil && new Date(current.signalSubUntil) > new Date()
      ? new Date(current.signalSubUntil) : new Date();
    base.setDate(base.getDate() + 30);
    const user = await prisma.user.update({ where: { id: req.user.id }, data: { signalSubUntil: base } });
    await prisma.payment.create({ data: { userId: req.user.id, amount: PRICES.signal_sub, purpose: 'signal_sub' } });
    res.json({ ok: true, signalSubUntil: user.signalSubUntil });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// My payment history
router.get('/payments', requireAuth, async (req, res) => {
  const payments = await prisma.payment.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
  res.json(payments);
});

export default router;
