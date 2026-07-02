import { Router } from 'express';
import multer from 'multer';
import { extname } from 'path';
import { prisma } from '../utils/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

// In-memory upload — file bytes are persisted to the database (FileBlob),
// not the local disk, so uploads survive on hosts without persistent storage.
// 4 MB cap keeps uploads/downloads under Vercel's serverless body limit (~4.5 MB).
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });

const router = Router();

// Get resources for a lesson (enrolled students)
router.get('/lesson/:lessonId', requireAuth, async (req, res) => {
  const resources = await prisma.resource.findMany({ where: { lessonId: Number(req.params.lessonId) } });
  res.json(resources);
});

// Admin: upload a file resource (stored in the database)
router.post('/upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    const { lessonId, title } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const blob = await prisma.fileBlob.create({
      data: {
        filename: req.file.originalname,
        mimeType: req.file.mimetype || 'application/octet-stream',
        data: req.file.buffer
      }
    });
    const fileUrl = `/api/files/${blob.id}`;
    const type = extname(req.file.originalname).replace('.', '').toLowerCase() || 'file';
    const resource = await prisma.resource.create({
      data: { lessonId: Number(lessonId), title: title || req.file.originalname, fileUrl, type }
    });
    res.json(resource);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: add a link resource (no file)
router.post('/link', requireAdmin, async (req, res) => {
  try {
    const { lessonId, title, fileUrl } = req.body;
    const resource = await prisma.resource.create({
      data: { lessonId: Number(lessonId), title, fileUrl, type: 'link' }
    });
    res.json(resource);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: delete
router.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.resource.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
