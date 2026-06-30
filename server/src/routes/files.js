import { Router } from 'express';
import { prisma } from '../utils/db.js';

const router = Router();

// Public: stream a stored file (uploaded resource) from the database.
// Replaces local-disk /uploads serving so it works without a persistent filesystem.
router.get('/:id', async (req, res) => {
  try {
    const blob = await prisma.fileBlob.findUnique({ where: { id: Number(req.params.id) } });
    if (!blob) return res.status(404).json({ error: 'File not found' });
    res.setHeader('Content-Type', blob.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${blob.filename}"`);
    res.send(Buffer.from(blob.data));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
