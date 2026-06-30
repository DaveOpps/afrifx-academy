import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.body;
    const enroll = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: req.user.id, courseId: Number(courseId) } },
      update: {},
      create: { userId: req.user.id, courseId: Number(courseId) }
    });
    res.json(enroll);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/my', requireAuth, async (req, res) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: req.user.id },
    include: {
      course: {
        include: {
          modules: { include: { lessons: true } },
          _count: { select: { enrollments: true } }
        }
      }
    }
  });

  // Attach watchedCount per enrollment (how many lessons in this course the user has watched)
  const watched = await prisma.progress.findMany({
    where: { userId: req.user.id },
    select: { lessonId: true }
  });
  const watchedIds = new Set(watched.map(w => w.lessonId));

  const withProgress = enrollments.map(en => {
    const lessonIds = en.course.modules.flatMap(m => m.lessons.map(l => l.id));
    const watchedCount = lessonIds.filter(id => watchedIds.has(id)).length;
    return { ...en, watchedCount, totalLessons: lessonIds.length };
  });

  res.json(withProgress);
});

export default router;
