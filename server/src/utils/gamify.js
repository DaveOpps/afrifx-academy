import { prisma } from './db.js';

// Point values
export const POINTS = {
  LESSON:        10,
  QUIZ_PASS:     25,
  QUIZ_PERFECT:  50,
  COURSE_DONE:   100,
};

export async function awardPoints(userId, amount) {
  if (!amount) return;
  await prisma.user.update({ where: { id: userId }, data: { points: { increment: amount } } });
}

// Achievement definitions — computed from a user's stats
export function computeAchievements(stats) {
  const list = [
    { id: 'first-lesson',  icon: '🎬', title: 'First Steps',       desc: 'Watched your first lesson',       earned: stats.lessons >= 1 },
    { id: 'five-lessons',  icon: '📚', title: 'Bookworm',          desc: 'Watched 5 lessons',               earned: stats.lessons >= 5 },
    { id: 'first-quiz',    icon: '📝', title: 'Quiz Taker',        desc: 'Completed your first quiz',        earned: stats.quizzes >= 1 },
    { id: 'perfect-quiz',  icon: '💯', title: 'Perfectionist',     desc: 'Scored 100% on a quiz',           earned: stats.perfectQuiz },
    { id: 'first-course',  icon: '🎓', title: 'Graduate',          desc: 'Completed your first course',      earned: stats.completedCourses >= 1 },
    { id: 'first-cert',    icon: '🏅', title: 'Certified Trader',  desc: 'Earned your first certificate',    earned: stats.certs >= 1 },
    { id: 'point-100',     icon: '⭐', title: 'Rising Star',       desc: 'Earned 100 points',               earned: stats.points >= 100 },
    { id: 'point-500',     icon: '🌟', title: 'Trading Pro',       desc: 'Earned 500 points',               earned: stats.points >= 500 },
  ];
  return list;
}

export async function getUserStats(userId) {
  const [user, lessons, quizResults, completedCourses, certs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.progress.count({ where: { userId } }),
    prisma.quizResult.findMany({ where: { userId } }),
    prisma.enrollment.count({ where: { userId, completedAt: { not: null } } }),
    prisma.certificate.count({ where: { userId } }),
  ]);
  return {
    points: user?.points || 0,
    lessons,
    quizzes: quizResults.length,
    perfectQuiz: quizResults.some(q => q.score === 100),
    completedCourses,
    certs,
  };
}
