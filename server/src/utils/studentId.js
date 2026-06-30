import { prisma } from './db.js';

// Generate a unique AFRIFX student ID (collision-safe).
export async function generateStudentId() {
  const year = new Date().getFullYear();
  for (let i = 0; i < 25; i++) {
    const id = `AFX${year}-${Math.floor(10000 + Math.random() * 90000)}`;
    const exists = await prisma.user.findUnique({ where: { studentId: id } });
    if (!exists) return id;
  }
  return `AFX${year}-${Date.now().toString().slice(-6)}`;
}

// Ensure a user has a studentId; generates and persists one if missing. Returns the id.
export async function ensureStudentId(userId) {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { studentId: true } });
  if (u?.studentId) return u.studentId;
  const studentId = await generateStudentId();
  await prisma.user.update({ where: { id: userId }, data: { studentId } });
  return studentId;
}
