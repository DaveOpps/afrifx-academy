import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function uniqueId() {
  const year = new Date().getFullYear();
  for (let i = 0; i < 25; i++) {
    const id = `AFX${year}-${Math.floor(10000 + Math.random() * 90000)}`;
    if (!(await prisma.user.findUnique({ where: { studentId: id } }))) return id;
  }
  return `AFX${year}-${Date.now().toString().slice(-6)}`;
}

const missing = await prisma.user.findMany({
  where: { role: { in: ['student', 'instructor'] }, studentId: null },
  select: { id: true, name: true },
});

if (missing.length === 0) { console.log('All students already have IDs.'); }
for (const u of missing) {
  const studentId = await uniqueId();
  await prisma.user.update({ where: { id: u.id }, data: { studentId } });
  console.log(`✓ ${u.name} → ${studentId}`);
}
console.log(`\nBackfilled ${missing.length} student(s).`);
await prisma.$disconnect();
