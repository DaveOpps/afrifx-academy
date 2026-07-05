import { prisma } from './db.js';

// Generate a unique AFRIFX student ID: AFX-000126
//   AFX    = fixed prefix
//   0001   = sequential student number, zero-padded to 4 digits
//   26     = 2-digit year of joining
export async function generateStudentId() {
  const yy = String(new Date().getFullYear() % 100).padStart(2, '0');
  const existingCount = await prisma.user.count({ where: { studentId: { not: null } } });
  let seq = existingCount + 1;
  for (let i = 0; i < 25; i++) {
    const id = `AFX-${String(seq).padStart(4, '0')}${yy}`;
    const exists = await prisma.user.findUnique({ where: { studentId: id } });
    if (!exists) return id;
    seq++;
  }
  return `AFX-${Date.now().toString().slice(-6)}`;
}

// Ensure a user has a studentId; generates and persists one if missing. Returns the id.
export async function ensureStudentId(userId) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { studentId: true } });
  if (u?.studentId) return u.studentId;
  const studentId = await generateStudentId();
  await prisma.user.update({ where: { id: userId }, data: { studentId } });
  return studentId;
}
