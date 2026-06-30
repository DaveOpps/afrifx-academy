import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { awardPoints, POINTS } from '../utils/gamify.js';

const router = Router();

router.get('/:id', requireAuth, async (req, res) => {
  const quiz = await prisma.quiz.findUnique({ where: { id: Number(req.params.id) } });
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json({ ...quiz, questions: JSON.parse(quiz.questions) });
});

router.post('/:id/submit', requireAuth, async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({ where: { id: Number(req.params.id) } });
    const questions = JSON.parse(quiz.questions);
    const { answers } = req.body;
    let score = 0;
    questions.forEach((q, i) => { if (answers[i] === q.answer) score++; });
    const pct = Math.round((score / questions.length) * 100);
    const result = await prisma.quizResult.create({
      data: { userId: req.user.id, quizId: quiz.id, score: pct }
    });

    // Award points based on performance
    if (pct === 100) await awardPoints(req.user.id, POINTS.QUIZ_PERFECT);
    else if (pct >= 60) await awardPoints(req.user.id, POINTS.QUIZ_PASS);

    res.json({ score: pct, total: questions.length, correct: score, result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { moduleId, questions } = req.body;
    const quiz = await prisma.quiz.create({
      data: { moduleId: Number(moduleId), questions: JSON.stringify(questions) }
    });
    res.json(quiz);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
