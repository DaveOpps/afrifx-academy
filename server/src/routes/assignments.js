import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all assignments for a module
router.get('/module/:moduleId', requireAuth, async (req, res) => {
  const assignments = await prisma.assignment.findMany({
    where: { moduleId: Number(req.params.moduleId) },
    include: {
      submissions: { where: { userId: req.user.id }, select: { id: true, grade: true, feedback: true, submittedAt: true, content: true } }
    }
  });
  res.json(assignments);
});

// Submit an assignment
router.post('/:id/submit', requireAuth, async (req, res) => {
  try {
    const { content, fileUrl } = req.body;
    const sub = await prisma.assignmentSubmit.upsert({
      where: { assignmentId_userId: { assignmentId: Number(req.params.id), userId: req.user.id } },
      create: { assignmentId: Number(req.params.id), userId: req.user.id, content, fileUrl },
      update: { content, fileUrl, submittedAt: new Date() },
    });
    res.json(sub);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: create assignment for a module
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { moduleId, title, description, dueDate } = req.body;
    const a = await prisma.assignment.create({ data: { moduleId: Number(moduleId), title, description, dueDate: dueDate ? new Date(dueDate) : null } });
    res.json(a);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: list all submissions for an assignment
router.get('/:id/submissions', requireAdmin, async (req, res) => {
  const subs = await prisma.assignmentSubmit.findMany({
    where: { assignmentId: Number(req.params.id) },
    include: { user: { select: { id: true, name: true, email: true, studentId: true } } },
    orderBy: { submittedAt: 'desc' }
  });
  res.json(subs);
});

// Admin: grade a submission
router.put('/submissions/:id/grade', requireAdmin, async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const sub = await prisma.assignmentSubmit.update({ where: { id: Number(req.params.id) }, data: { grade: Number(grade), feedback } });
    res.json(sub);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
