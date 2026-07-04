import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public: list all courses
router.get('/', async (req, res) => {
  const courses = await prisma.course.findMany({
    include: { modules: { include: { lessons: true, quizzes: true } }, _count: { select: { enrollments: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json(courses);
});

// Public: single course
router.get('/:id', async (req, res) => {
  const course = await prisma.course.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      modules: { include: { lessons: { orderBy: { order: 'asc' } }, quizzes: true }, orderBy: { order: 'asc' } },
      _count: { select: { enrollments: true } }
    }
  });
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

// Admin: create course
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;
    const course = await prisma.course.create({ data: { title, description, thumbnail } });
    res.json(course);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: update course
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;
    const course = await prisma.course.update({
      where: { id: Number(req.params.id) },
      data: { title, description, thumbnail }
    });
    res.json(course);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: delete course
router.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.course.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// Admin: add module
router.post('/:id/modules', requireAdmin, async (req, res) => {
  try {
    const { title, order } = req.body;
    const mod = await prisma.module.create({ data: { courseId: Number(req.params.id), title, order: order || 0 } });
    res.json(mod);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: delete module
router.delete('/:id/modules/:moduleId', requireAdmin, async (req, res) => {
  await prisma.module.delete({ where: { id: Number(req.params.moduleId) } });
  res.json({ ok: true });
});

export default router;
