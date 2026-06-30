import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPw = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@afrifx.com' },
    update: {},
    create: { name: 'Super Admin', email: 'admin@afrifx.com', password: adminPw, role: 'admin' }
  });

  const stuPw = await bcrypt.hash('student123', 10);
  await prisma.user.upsert({
    where: { email: 'student@afrifx.com' },
    update: {},
    create: { name: 'Kofi Mensah', email: 'student@afrifx.com', password: stuPw, role: 'student', phone: '+233 24 000 0000' }
  });

  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, title: 'Free Forex Trading Class', description: 'Master the fundamentals of Forex trading from scratch. Learn candlestick patterns, risk management, and live market analysis.', thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600' }
  });

  const mod1 = await prisma.module.upsert({ where: { id: 1 }, update: {}, create: { id: 1, courseId: course.id, title: 'Module 1: Forex Fundamentals', order: 1 } });
  await prisma.lesson.upsert({ where: { id: 1 }, update: {}, create: { id: 1, moduleId: mod1.id, title: 'What is Forex?', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12:34', order: 1 } });
  await prisma.lesson.upsert({ where: { id: 2 }, update: {}, create: { id: 2, moduleId: mod1.id, title: 'Currency Pairs Explained', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15:20', order: 2 } });
  await prisma.quiz.upsert({ where: { id: 1 }, update: {}, create: { id: 1, moduleId: mod1.id, questions: JSON.stringify([{ question: 'What does Forex stand for?', options: ['Foreign Exchange','Forward Exchange','Financial Exchange','Federal Exchange'], answer: 0 },{ question: 'EUR/USD is an example of a:', options: ['Currency pair','Stock','Commodity','Index'], answer: 0 },{ question: 'Most traded pair?', options: ['GBP/JPY','EUR/USD','AUD/NZD','USD/CAD'], answer: 1 }]) } });

  const mod2 = await prisma.module.upsert({ where: { id: 2 }, update: {}, create: { id: 2, courseId: course.id, title: 'Module 2: Candlestick Patterns', order: 2 } });
  await prisma.lesson.upsert({ where: { id: 3 }, update: {}, create: { id: 3, moduleId: mod2.id, title: 'Reading Candlestick Charts', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '18:45', order: 1 } });
  await prisma.lesson.upsert({ where: { id: 4 }, update: {}, create: { id: 4, moduleId: mod2.id, title: 'Hammer & Doji Patterns', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '22:10', order: 2 } });

  // Postgres: the seed inserts explicit primary-key ids (1..4), which does NOT
  // advance the auto-increment sequences. Reset each sequence to MAX(id)+1 so the
  // admin can create new courses/modules/lessons/quizzes without id collisions.
  for (const table of ['Course', 'Module', 'Lesson', 'Quiz', 'User']) {
    try {
      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`
      );
    } catch (e) { /* sequence reset is best-effort (e.g. on SQLite) */ }
  }

  console.log('\n✅ Seed complete!');
  console.log('  Admin:   admin@afrifx.com / admin123');
  console.log('  Student: student@afrifx.com / student123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
