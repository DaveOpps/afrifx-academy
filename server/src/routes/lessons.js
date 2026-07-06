import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/:id', requireAuth, async (req, res) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: Number(req.params.id) },
    include: { module: { include: { course: true, lessons: { orderBy: { order: 'asc' } }, quizzes: true } } }
  });
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  res.json(lesson);
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { moduleId, title, videoUrl, duration, order } = req.body;
    const lesson = await prisma.lesson.create({ data: { moduleId: Number(moduleId), title, videoUrl, duration, order: order || 0 } });
    res.json(lesson);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, videoUrl, duration, order } = req.body;
    const lesson = await prisma.lesson.update({
      where: { id: Number(req.params.id) },
      data: { title, videoUrl, duration, order }
    });
    res.json(lesson);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.lesson.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
