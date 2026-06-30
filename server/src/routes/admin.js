import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../utils/db.js';
import { requireAdmin } from '../middleware/auth.js';
import { ensureStudentId } from '../utils/studentId.js';

const router = Router();

// Dashboard stats
router.get('/stats', requireAdmin, async (req, res) => {
  const [students, enrollments, certs, courses] = await Promise.all([
    prisma.user.count({ where: { role: 'student' } }),
    prisma.enrollment.count(),
    prisma.certificate.count(),
    prisma.course.count()
  ]);
  const recent = await prisma.user.findMany({
    where: { role: 'student' }, orderBy: { createdAt: 'desc' }, take: 5,
    select: { id: true, name: true, email: true, createdAt: true }
  });
  res.json({ students, enrollments, certs, courses, recent });
});

// Rich analytics
router.get('/analytics', requireAdmin, async (req, res) => {
  try {
    const [allStudents, allEnrollments, completed, allCourses] = await Promise.all([
      prisma.user.findMany({ where: { role: 'student' }, select: { createdAt: true } }),
      prisma.enrollment.findMany({ select: { courseId: true, enrolledAt: true, completedAt: true } }),
      prisma.enrollment.count({ where: { completedAt: { not: null } } }),
      prisma.course.findMany({ select: { id: true, title: true, _count: { select: { enrollments: true } } } })
    ]);

    // Signups over last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('en', { month: 'short' });
      const count = allStudents.filter(s => {
        const c = new Date(s.createdAt);
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
      }).length;
      months.push({ label, count });
    }

    // Enrollments per course (popularity)
    const popularity = allCourses
      .map(c => ({ title: c.title, enrollments: c._count.enrollments }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 6);

    const completionRate = allEnrollments.length ? Math.round((completed / allEnrollments.length) * 100) : 0;

    res.json({
      signups: months,
      popularity,
      completionRate,
      totalEnrollments: allEnrollments.length,
      completedEnrollments: completed,
      activeEnrollments: allEnrollments.length - completed
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: set a user's role (student <-> instructor)
router.post('/students/:id/role', requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'instructor'].includes(role)) return res.status(400).json({ error: 'Role must be student or instructor' });
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { role },
      select: { id: true, name: true, role: true }
    });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: reset a student's password
router.post('/students/:id/reset-password', requireAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const bcrypt = (await import('bcryptjs')).default;
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: Number(req.params.id) }, data: { password: hash } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// All students with progress
router.get('/students', requireAdmin, async (req, res) => {
  const students = await prisma.user.findMany({
    where: { role: { in: ['student', 'instructor'] } },
    include: {
      enrollments: { include: { course: true } },
      certificates: { include: { course: true } },
      _count: { select: { progress: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(students);
});

// Single student detail
router.get('/students/:id', requireAdmin, async (req, res) => {
  const student = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      enrollments: { include: { course: { include: { modules: { include: { lessons: true } } } } } },
      progress: { include: { lesson: true } },
      quizResults: { include: { quiz: { include: { module: true } } } },
      certificates: { include: { course: true } }
    }
  });
  if (!student) return res.status(404).json({ error: 'Student not found' });
  // Backfill a Student ID if this account never had one
  if (!student.studentId) student.studentId = await ensureStudentId(student.id);
  res.json(student);
});

// Issue certificate manually
router.post('/certificates/issue', requireAdmin, async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { id: Number(userId) } }),
      prisma.course.findUnique({ where: { id: Number(courseId) } })
    ]);
    if (!user || !course) return res.status(404).json({ error: 'User or course not found' });

    const verifyCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    const fileUrl = `/api/certificates/file/${verifyCode}`;

    const cert = await prisma.certificate.upsert({
      where: { userId_courseId: { userId: Number(userId), courseId: Number(courseId) } },
      update: { fileUrl, verifyCode, issuedAt: new Date() },
      create: { userId: Number(userId), courseId: Number(courseId), fileUrl, verifyCode }
    });
    res.json(cert);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// All certificates
router.get('/certificates', requireAdmin, async (req, res) => {
  const certs = await prisma.certificate.findMany({
    include: { user: { select: { name: true, email: true } }, course: true },
    orderBy: { issuedAt: 'desc' }
  });
  res.json(certs);
});

export default router;
