import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../utils/db.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { sendWelcome, sendPasswordReset } from '../utils/email.js';
import { generateStudentId } from '../utils/studentId.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) return res.status(400).json({ error: 'Name, email, password and phone are required' });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const studentId = await generateStudentId();
    const user = await prisma.user.create({ data: { name, email, password: hash, phone, role: 'student', studentId } });
    sendWelcome(email, name).catch(() => {});
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const sel = { id: true, name: true, email: true, role: true, phone: true, points: true, studentId: true, tier: true, signalSubUntil: true, createdAt: true };
  let user = await prisma.user.findUnique({ where: { id: req.user.id }, select: sel });
  // Generate studentId for legacy accounts that don't have one
  if (!user.studentId) {
    const studentId = await generateStudentId();
    user = await prisma.user.update({ where: { id: req.user.id }, data: { studentId }, select: sel });
  }
  res.json(user);
});

// Full personal dashboard data in one call
router.get('/me/full', requireAuth, async (req, res) => {
  try {
    const uid = req.user.id;
    const [user, enrollments, certs, payments, quizResults, progress] = await Promise.all([
      prisma.user.findUnique({
        where: { id: uid },
        select: { id: true, name: true, email: true, phone: true, role: true, points: true, studentId: true, tier: true, signalSubUntil: true, createdAt: true },
      }),
      prisma.enrollment.findMany({
        where: { userId: uid },
        include: {
          course: { select: { id: true, title: true, category: true, modules: { include: { lessons: { select: { id: true } } } } } },
        },
        orderBy: { enrolledAt: 'desc' },
      }),
      prisma.certificate.findMany({ where: { userId: uid }, orderBy: { issuedAt: 'desc' } }),
      prisma.payment.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' } }),
      prisma.quizResult.findMany({
        where: { userId: uid },
        include: { quiz: { select: { moduleId: true } } },
        orderBy: { takenAt: 'desc' },
      }),
      prisma.progress.findMany({ where: { userId: uid }, select: { lessonId: true } }),
    ]);

    const watchedIds = new Set(progress.map(p => p.lessonId));
    const enriched = enrollments.map(e => {
      const totalLessons = e.course.modules.reduce((s, m) => s + m.lessons.length, 0);
      const watched = e.course.modules.reduce((s, m) => s + m.lessons.filter(l => watchedIds.has(l.id)).length, 0);
      const pct = totalLessons ? Math.round((watched / totalLessons) * 100) : 0;
      return { courseId: e.course.id, title: e.course.title, level: e.course.category, totalLessons, watched, pct, enrolledAt: e.enrolledAt };
    });

    const isPremium = enrollments.length > 0 || (user.tier && user.tier !== 'free');
    const { userHasSignalAccess } = await import('../middleware/access.js');
    const signalActive = userHasSignalAccess({ ...user, role: req.user.role });

    res.json({ user, enrollments: enriched, certificates: certs, payments, quizResults, isPremium, signalActive });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/me', requireAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, role: true, phone: true }
    });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Change password (logged in)
router.put('/password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hash } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Forgot password — generate reset token
router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond ok to avoid leaking which emails exist
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetExpiry: expiry } });
      const resetUrl = `http://localhost:5173/reset/${token}`;
      sendPasswordReset(email, user.name, resetUrl).catch(() => {});
      // For dev convenience when email isn't configured, return the token
      return res.json({ ok: true, devResetUrl: resetUrl });
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reset password with token
router.post('/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const user = await prisma.user.findFirst({ where: { resetToken: token, resetExpiry: { gt: new Date() } } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hash, resetToken: null, resetExpiry: null } });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
