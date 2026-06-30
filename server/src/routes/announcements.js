import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { sendAnnouncement } from '../utils/email.js';

const router = Router();

// Student: list announcements with read status + unread count
router.get('/', requireAuth, async (req, res) => {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }]
  });
  const reads = await prisma.announcementRead.findMany({ where: { userId: req.user.id } });
  const readIds = new Set(reads.map(r => r.announcementId));
  const withRead = announcements.map(a => ({ ...a, read: readIds.has(a.id) }));
  const unread = withRead.filter(a => !a.read).length;
  res.json({ announcements: withRead, unread });
});

// Student: mark one as read
router.post('/:id/read', requireAuth, async (req, res) => {
  await prisma.announcementRead.upsert({
    where: { userId_announcementId: { userId: req.user.id, announcementId: Number(req.params.id) } },
    update: {},
    create: { userId: req.user.id, announcementId: Number(req.params.id) }
  });
  res.json({ ok: true });
});

// Student: mark all as read
router.post('/read-all', requireAuth, async (req, res) => {
  const all = await prisma.announcement.findMany({ select: { id: true } });
  for (const a of all) {
    await prisma.announcementRead.upsert({
      where: { userId_announcementId: { userId: req.user.id, announcementId: a.id } },
      update: {},
      create: { userId: req.user.id, announcementId: a.id }
    });
  }
  res.json({ ok: true });
});

// Admin: create announcement (optionally email all students)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, body, pinned, emailAll } = req.body;
    if (!title || !body) return res.status(400).json({ error: 'Title and body required' });
    const ann = await prisma.announcement.create({ data: { title, body, pinned: !!pinned } });
    if (emailAll) {
      const students = await prisma.user.findMany({ where: { role: 'student' } });
      students.forEach(s => sendAnnouncement(s.email, s.name, title, body).catch(() => {}));
    }
    res.json(ann);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: list all (for management)
router.get('/all', requireAdmin, async (req, res) => {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { _count: { select: { reads: true } } }
  });
  res.json(announcements);
});

// Admin: delete
router.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.announcement.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
