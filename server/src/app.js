import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import lessonRoutes from './routes/lessons.js';
import enrollRoutes from './routes/enrollments.js';
import progressRoutes from './routes/progress.js';
import quizRoutes from './routes/quizzes.js';
import certRoutes from './routes/certificates.js';
import adminRoutes from './routes/admin.js';
import reviewRoutes from './routes/reviews.js';
import announcementRoutes from './routes/announcements.js';
import gamificationRoutes from './routes/gamification.js';
import resourceRoutes from './routes/resources.js';
import meetingRoutes from './routes/meetings.js';
import signalRoutes from './routes/signals.js';
import membershipRoutes from './routes/membership.js';
import applicationRoutes from './routes/applications.js';
import qrRoutes from './routes/qr.js';
import assignmentRoutes from './routes/assignments.js';
import fileRoutes from './routes/files.js';

// The Express app with all API routes. Exported so it can run both as a
// persistent server (index.js, for Render/local) and as a Vercel serverless
// function (api/[...path].js).
const app = express();

// Token-based auth (Authorization header), so any origin is safe to allow.
app.use(cors());
app.use(express.json());

app.use('/api/auth',          authRoutes);
app.use('/api/courses',       courseRoutes);
app.use('/api/lessons',       lessonRoutes);
app.use('/api/enrollments',   enrollRoutes);
app.use('/api/progress',      progressRoutes);
app.use('/api/quizzes',       quizRoutes);
app.use('/api/certificates',  certRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/reviews',       reviewRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/gamification',  gamificationRoutes);
app.use('/api/resources',     resourceRoutes);
app.use('/api/meetings',      meetingRoutes);
app.use('/api/signals',       signalRoutes);
app.use('/api/membership',    membershipRoutes);
app.use('/api/applications',  applicationRoutes);
app.use('/api/qr',            qrRoutes);
app.use('/api/assignments',   assignmentRoutes);
app.use('/api/files',         fileRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

export default app;
