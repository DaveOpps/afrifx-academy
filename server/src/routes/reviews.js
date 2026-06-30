import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Get all reviews for a course (public)
router.get('/course/:courseId', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { courseId: Number(req.params.courseId) },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  res.json({ reviews, avg: Math.round(avg * 10) / 10, count: reviews.length });
});

// Create or update a review (must be enrolled)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    const enrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: Number(courseId) } }
    });
    if (!enrolled) return res.status(403).json({ error: 'You must be enrolled to review this course' });

    const review = await prisma.review.upsert({
      where: { userId_courseId: { userId: req.user.id, courseId: Number(courseId) } },
      update: { rating: Number(rating), comment },
      create: { userId: req.user.id, courseId: Number(courseId), rating: Number(rating), comment }
    });
    res.json(review);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get my review for a course
router.get('/my/:courseId', requireAuth, async (req, res) => {
  const review = await prisma.review.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId: Number(req.params.courseId) } }
  });
  res.json(review);
});

export default router;
