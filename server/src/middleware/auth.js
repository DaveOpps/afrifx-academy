import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'afrifx_secret_2026';

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
    next();
  });
}

// Admins OR instructors may host meetings
export function requireHost(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor')
      return res.status(403).json({ error: 'Hosts only (admin or instructor)' });
    next();
  });
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}
