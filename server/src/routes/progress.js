import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';
import { awardPoints, POINTS } from '../utils/gamify.js';
import { sendCourseComplete } from '../utils/email.js';

const router = Router();

router.post('/', requireAuth, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const already = await prisma.progress.findUnique({
      where: { userId_lessonId: { userId: req.user.id, lessonId: Number(lessonId) } }
    });

    const p = await prisma.progress.upsert({
      where: { userId_lessonId: { userId: req.user.id, lessonId: Number(lessonId) } },
      update: { watchedAt: new Date() },
      create: { userId: req.user.id, lessonId: Number(lessonId) }
    });

    // Award points only the first time a lesson is watched
    if (!already) await awardPoints(req.user.id, POINTS.LESSON);

    // Check if course is complete
    const lesson = await prisma.lesson.findUnique({
      where: { id: Number(lessonId) },
      include: { module: { include: { course: { include: { modules: { include: { lessons: true } } } } } } }
    });
    const allLessons = lesson.module.course.modules.flatMap(m => m.lessons.map(l => l.id));
    const watched = await prisma.progress.findMany({
      where: { userId: req.user.id, lessonId: { in: allLessons } }
    });
    if (watched.length === allLessons.length) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: req.user.id, courseId: lesson.module.courseId } }
      });
      if (enrollment && !enrollment.completedAt) {
        await prisma.enrollment.update({ where: { id: enrollment.id }, data: { completedAt: new Date() } });
        await awardPoints(req.user.id, POINTS.COURSE_DONE);
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        sendCourseComplete(user.email, user.name, lesson.module.course.title).catch(() => {});
      }
    }
    res.json({ ok: true, progress: p });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/my/:courseId', requireAuth, async (req, res) => {
  const watched = await prisma.progress.findMany({
    where: { userId: req.user.id },
    select: { lessonId: true }
  });
  res.json(watched.map(w => w.lessonId));
});

export default router;
