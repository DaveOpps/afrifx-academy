import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { awardPoints, POINTS } from '../utils/gamify.js';

const router = Router();

// Validates the questions array shape before it's stored: each question needs
// non-empty text, 2-4 non-empty options, and a correct-answer index in range.
function validateQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return 'Add at least one question';
  for (const [i, q] of questions.entries()) {
    if (!q.question || !q.question.trim()) return `Question ${i + 1} needs question text`;
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 4) return `Question ${i + 1} needs 2-4 options`;
    if (q.options.some((o) => !o || !o.trim())) return `Question ${i + 1} has an empty option`;
    if (typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length) return `Question ${i + 1} needs a correct answer selected`;
  }
  return null;
}

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

// Admin: create a quiz for a module (one quiz per module — the student lesson
// viewer only ever shows the first quiz on a module).
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { moduleId, questions } = req.body;
    const err = validateQuestions(questions);
    if (err) return res.status(400).json({ error: err });
    const existing = await prisma.quiz.findFirst({ where: { moduleId: Number(moduleId) } });
    if (existing) return res.status(400).json({ error: 'This module already has a quiz — edit it instead' });
    const quiz = await prisma.quiz.create({
      data: { moduleId: Number(moduleId), questions: JSON.stringify(questions) }
    });
    res.json(quiz);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: replace a quiz's questions
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { questions } = req.body;
    const err = validateQuestions(questions);
    if (err) return res.status(400).json({ error: err });
    const quiz = await prisma.quiz.update({
      where: { id: Number(req.params.id) },
      data: { questions: JSON.stringify(questions) }
    });
    res.json(quiz);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Admin: delete a quiz (and its results, via cascade)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.quizResult.deleteMany({ where: { quizId: Number(req.params.id) } });
    await prisma.quiz.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
