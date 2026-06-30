import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Creative-Commons placeholder video (Big Buck Bunny) — replace per-lesson in the admin panel.
const V = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';

const COURSES = [
  {
    title: 'Beginner Forex Course',
    category: 'Beginner',
    description: 'Start from zero. Learn what Forex is, set up your trading platform, read candlesticks, and build the discipline every profitable trader needs.',
    thumbnail: null,
    modules: [
      {
        title: 'Module 1 — Foundations',
        lessons: [
          ['Introduction to Forex', 'What the Forex market is, how it works, and who the major players are.', '10:00'],
          ['MT4 / MT5 Setup', 'Install and configure MetaTrader, place your first demo trade.', '12:30'],
          ['Candlestick Patterns', 'Read price action through candlesticks and key reversal patterns.', '15:00'],
        ],
      },
      {
        title: 'Module 2 — Trading Basics',
        lessons: [
          ['Support & Resistance', 'Identify the levels where price reacts and how to trade them.', '13:20'],
          ['Risk Management', 'Position sizing, stop losses, and protecting your capital.', '14:10'],
          ['Trading Psychology', 'Master the mindset and emotional discipline of a trader.', '11:45'],
        ],
        quiz: [
          { question: 'What does a stop loss do?', options: ['Locks in profit automatically', 'Closes a trade at a set loss to limit risk', 'Increases your leverage', 'Doubles your position'], answer: 1 },
          { question: 'A support level is best described as…', options: ['Where selling pressure halts a price rise', 'Where buying interest tends to stop a price fall', 'The spread on a pair', 'The broker commission'], answer: 1 },
          { question: 'Risking 1% per trade is an example of…', options: ['Trading psychology', 'Risk management', 'Candlestick analysis', 'Leverage abuse'], answer: 1 },
        ],
      },
    ],
  },
  {
    title: 'Intermediate Forex Course',
    category: 'Intermediate',
    description: 'Level up. Read market structure, trade with the trend, understand supply & demand and liquidity, and refine your entries and session timing.',
    thumbnail: null,
    modules: [
      {
        title: 'Module 1 — Reading the Market',
        lessons: [
          ['Market Structure', 'Higher highs, lower lows, and identifying the trend context.', '14:00'],
          ['Trend Trading', 'Strategies to trade with momentum and ride moves.', '13:30'],
          ['Supply & Demand', 'Spot institutional zones where price is likely to react.', '15:40'],
        ],
      },
      {
        title: 'Module 2 — Execution',
        lessons: [
          ['Liquidity Concepts', 'How liquidity pools drive price and stop hunts.', '16:00'],
          ['Entry Techniques', 'Precision entries, confirmations, and timing.', '12:50'],
          ['Session Trading', 'Trade the London, New York and Asian sessions effectively.', '11:20'],
        ],
        quiz: [
          { question: 'An uptrend is defined by…', options: ['Lower highs and lower lows', 'Higher highs and higher lows', 'Flat price', 'Random movement'], answer: 1 },
          { question: 'A supply zone is an area where…', options: ['Buyers overwhelm sellers', 'Sellers are likely to push price down', 'Spreads widen', 'No trading occurs'], answer: 1 },
          { question: 'Which session typically has the highest volatility for major pairs?', options: ['Asian session', 'London / New York overlap', 'Weekend', 'Midnight GMT'], answer: 1 },
        ],
      },
    ],
  },
  {
    title: 'Advanced Forex Course',
    category: 'Advanced',
    description: 'Trade like the institutions. Smart Money Concepts, market manipulation, position building, portfolio management, and writing a professional trading plan.',
    thumbnail: null,
    modules: [
      {
        title: 'Module 1 — The Institutional Edge',
        lessons: [
          ['Institutional Trading', 'How banks and funds move the market.', '17:00'],
          ['Smart Money Concepts', 'Order blocks, fair value gaps, and SMC entries.', '18:30'],
          ['Market Manipulation', 'Recognise stop hunts, fakeouts and engineered moves.', '15:10'],
        ],
      },
      {
        title: 'Module 2 — Portfolio Mastery',
        lessons: [
          ['Position Building', 'Scaling in and out and pyramiding into winners.', '14:40'],
          ['Portfolio Management', 'Diversification, correlation and capital allocation.', '16:20'],
          ['Professional Trading Plans', 'Build a complete, rule-based trading plan.', '13:00'],
        ],
        quiz: [
          { question: 'An order block is…', options: ['A broker outage', 'A zone of institutional orders that can drive price', 'A type of candlestick', 'A losing trade'], answer: 1 },
          { question: 'Pyramiding refers to…', options: ['Adding to a winning position as it moves in your favour', 'Closing all trades at once', 'Trading only pyramids schemes', 'Doubling losses'], answer: 0 },
          { question: 'A professional trading plan should include…', options: ['Only gut feelings', 'Clear rules for entries, exits and risk', 'No risk limits', 'Random position sizes'], answer: 1 },
        ],
      },
    ],
  },
];

async function main() {
  for (const c of COURSES) {
    const existing = await prisma.course.findFirst({ where: { title: c.title } });
    if (existing) { console.log(`• Skipping (exists): ${c.title}`); continue; }

    const course = await prisma.course.create({
      data: { title: c.title, description: c.description, category: c.category, thumbnail: c.thumbnail },
    });

    let mOrder = 0;
    for (const m of c.modules) {
      const mod = await prisma.module.create({
        data: { courseId: course.id, title: m.title, order: mOrder++ },
      });
      let lOrder = 0;
      for (const [title, description, duration] of m.lessons) {
        await prisma.lesson.create({
          data: { moduleId: mod.id, title, description, duration, videoUrl: V, order: lOrder++ },
        });
      }
      if (m.quiz) {
        await prisma.quiz.create({
          data: { moduleId: mod.id, questions: JSON.stringify(m.quiz) },
        });
      }
    }
    console.log(`✓ Created: ${c.title} (${c.modules.length} modules)`);
  }
  console.log('\nDone seeding courses.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
