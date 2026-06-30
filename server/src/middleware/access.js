import { prisma } from '../utils/db.js';
import { requireAuth } from './auth.js';

// True if the user can view trading signals (VVIP, active monthly sub, or staff)
export function userHasSignalAccess(u) {
  if (!u) return false;
  if (u.role === 'admin' || u.role === 'instructor') return true;
  if (u.tier === 'vvip') return true;
  if (u.signalSubUntil && new Date(u.signalSubUntil) > new Date()) return true;
  return false;
}

export function requireSignalAccess(req, res, next) {
  requireAuth(req, res, async () => {
    const u = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!userHasSignalAccess(u)) {
      return res.status(403).json({ error: 'signal_subscription_required' });
    }
    next();
  });
}
