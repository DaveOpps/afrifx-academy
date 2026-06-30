import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public — submit an application (IB partnership or seminar/event collaboration)
router.post('/', async (req, res) => {
  try {
    const { type, name, email, phone, data } = req.body;
    if (!['ib', 'seminar'].includes(type)) return res.status(400).json({ error: 'Invalid application type' });
    if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });
    const app = await prisma.application.create({
      data: { type, name, email, phone: phone || null, data: JSON.stringify(data || {}) }
    });
    res.json({ ok: true, id: app.id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin — list all applications
router.get('/', requireAdmin, async (req, res) => {
  const apps = await prisma.application.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(apps.map(a => ({ ...a, data: safeParse(a.data) })));
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const app = await prisma.application.update({ where: { id: Number(req.params.id) }, data: { status } });
    res.json(app);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try { await prisma.application.delete({ where: { id: Number(req.params.id) } }); res.json({ ok: true }); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

function safeParse(s) { try { return JSON.parse(s); } catch { return {}; } }

export default router;
