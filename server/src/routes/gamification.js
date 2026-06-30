import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';
import { computeAchievements, getUserStats } from '../utils/gamify.js';

const router = Router();

// My points, achievements & rank
router.get('/me', requireAuth, async (req, res) => {
  const stats = await getUserStats(req.user.id);
  const achievements = computeAchievements(stats);

  // Rank = position among all students by points
  const higher = await prisma.user.count({
    where: { role: 'student', points: { gt: stats.points } }
  });
  res.json({
    points: stats.points,
    rank: higher + 1,
    stats,
    achievements,
    earned: achievements.filter(a => a.earned).length,
    total: achievements.length
  });
});

// Activity — last 7 days of lesson-watch counts + current streak
router.get('/activity', requireAuth, async (req, res) => {
  const rows = await prisma.progress.findMany({
    where: { userId: req.user.id },
    select: { watchedAt: true },
  });
  const dayKey = (d) => new Date(d).toISOString().slice(0, 10);
  const counts = {};
  for (const r of rows) counts[dayKey(r.watchedAt)] = (counts[dayKey(r.watchedAt)] || 0) + 1;

  // Last 7 days (oldest → newest)
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, label: d.toLocaleDateString('en-GB', { weekday: 'short' })[0], count: counts[key] || 0 });
  }

  // Streak — consecutive days with activity ending today or yesterday
  let streak = 0;
  const cur = new Date(today);
  if (!counts[cur.toISOString().slice(0, 10)]) cur.setDate(cur.getDate() - 1); // allow today not yet active
  while (counts[cur.toISOString().slice(0, 10)]) { streak++; cur.setDate(cur.getDate() - 1); }

  res.json({ streak, days, totalDays: Object.keys(counts).length });
});

// Leaderboard — top students by points
router.get('/leaderboard', requireAuth, async (req, res) => {
  const top = await prisma.user.findMany({
    where: { role: 'student' },
    orderBy: { points: 'desc' },
    take: 20,
    select: { id: true, name: true, points: true }
  });
  res.json(top.map((u, i) => ({ ...u, rank: i + 1, isMe: u.id === req.user.id })));
});

export default router;
