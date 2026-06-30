import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';
import { generateCertBytes } from '../utils/generateCert.js';
import { sendCertReady } from '../utils/email.js';

const router = Router();

// Public: download/stream the certificate PDF, regenerated on the fly from DB data.
// No file is ever stored on disk — works on hosts without a persistent filesystem.
router.get('/file/:code', async (req, res) => {
  try {
    const cert = await prisma.certificate.findUnique({
      where: { verifyCode: req.params.code },
      include: { user: { select: { name: true } }, course: { select: { title: true } } }
    });
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    const date = new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const bytes = await generateCertBytes({
      name: cert.user.name,
      course: cert.course.title,
      date,
      certId: `AFX-${cert.userId}-${cert.courseId}`,
      verifyCode: cert.verifyCode
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="AfriFX-Certificate-${cert.verifyCode}.pdf"`);
    res.send(Buffer.from(bytes));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/my', requireAuth, async (req, res) => {
  const certs = await prisma.certificate.findMany({
    where: { userId: req.user.id },
    include: { course: true }
  });
  res.json(certs);
});

// Public verification endpoint — no auth required
router.get('/verify/:code', async (req, res) => {
  try {
    const cert = await prisma.certificate.findUnique({
      where: { verifyCode: req.params.code },
      include: { user: { select: { name: true } }, course: { select: { title: true } } }
    });
    if (!cert) return res.status(404).json({ error: 'Certificate not found' });
    res.json({
      valid: true,
      holderName: cert.user.name,
      course: cert.course.title,
      issuedAt: cert.issuedAt,
      verifyCode: cert.verifyCode
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/claim', requireAuth, async (req, res) => {
  try {
    const { courseId } = req.body;
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: Number(courseId) } },
      include: { course: true }
    });
    if (!enrollment?.completedAt) return res.status(400).json({ error: 'Course not completed yet' });

    const existing = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId: req.user.id, courseId: Number(courseId) } }
    });
    if (existing) return res.json(existing);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const verifyCode = crypto.randomBytes(6).toString('hex').toUpperCase();

    const cert = await prisma.certificate.create({
      data: {
        userId: req.user.id,
        courseId: Number(courseId),
        fileUrl: `/api/certificates/file/${verifyCode}`,
        verifyCode
      }
    });
    sendCertReady(user.email, user.name, enrollment.course.title).catch(() => {});
    res.json(cert);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
