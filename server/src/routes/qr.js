import { Router } from 'express';
import QRCode from 'qrcode';

const router = Router();

// GET /api/qr?text=...&size=... — returns a PNG QR code (public)
router.get('/', async (req, res) => {
  try {
    const text = req.query.text;
    if (!text) return res.status(400).json({ error: 'text required' });
    const size = Math.min(600, Math.max(80, Number(req.query.size) || 240));
    const buf = await QRCode.toBuffer(String(text), {
      margin: 1, width: size,
      color: { dark: '#0d0d0d', light: '#ffffff' },
    });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
