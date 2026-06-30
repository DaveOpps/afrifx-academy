import { Router } from 'express';
import { prisma } from '../utils/db.js';
import { requireAuth, requireHost, requireAdmin } from '../middleware/auth.js';
import { createMeetEvent, getAuthUrl, handleCallback, isGoogleConnected, disconnectGoogle, googleConfigured } from '../utils/google.js';
import { sendMeetingScheduled } from '../utils/email.js';

const router = Router();

// ---- Google connection management (admin only) ----
router.get('/google/status', requireAdmin, async (req, res) => {
  res.json({ configured: googleConfigured, connected: await isGoogleConnected() });
});

router.get('/google/auth', requireAdmin, async (req, res) => {
  if (!googleConfigured) return res.status(400).json({ error: 'Google credentials not set in server .env' });
  res.json({ url: getAuthUrl() });
});

// OAuth redirect target — Google sends the user here after consent.
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).send('Missing code');
    await handleCallback(code);
    res.send(`<html><body style="font-family:sans-serif;background:#0d0d0d;color:#fff;text-align:center;padding:80px;">
      <h2 style="color:#c9a84c;">✅ Google Meet Connected!</h2>
      <p>AfriFX can now auto-generate Meet links. You can close this tab.</p>
      <a href="http://localhost:5173/admin/meetings" style="color:#c9a84c;">← Back to AfriFX</a>
      </body></html>`);
  } catch (e) {
    res.status(500).send('OAuth error: ' + e.message);
  }
});

router.post('/google/disconnect', requireAdmin, async (req, res) => {
  await disconnectGoogle();
  res.json({ ok: true });
});

// ---- Meetings ----

// List all meetings (any authenticated member)
router.get('/', requireAuth, async (req, res) => {
  const meetings = await prisma.meeting.findMany({ orderBy: { startTime: 'asc' } });
  res.json(meetings);
});

// Next/live meeting — for the dashboard banner
router.get('/next', requireAuth, async (req, res) => {
  const now = new Date();
  // Live = started, not yet ended
  const live = await prisma.meeting.findFirst({
    where: { startTime: { lte: now }, endTime: { gte: now } },
    orderBy: { startTime: 'asc' }
  });
  if (live) return res.json({ meeting: live, status: 'live' });
  const upcoming = await prisma.meeting.findFirst({
    where: { startTime: { gt: now } },
    orderBy: { startTime: 'asc' }
  });
  res.json({ meeting: upcoming || null, status: upcoming ? 'upcoming' : 'none' });
});

// Create a meeting (admin or instructor)
router.post('/', requireHost, async (req, res) => {
  try {
    const { title, description, startTime, endTime, meetLink, courseId, emailMembers, notifyBell } = req.body;
    if (!title || !startTime || !endTime) return res.status(400).json({ error: 'Title, start and end time are required' });

    let finalLink = meetLink || '';
    let eventId = null;

    // Try to auto-generate a Meet link via Google Calendar API
    if (!finalLink) {
      try {
        const students = await prisma.user.findMany({ where: { role: 'student' }, select: { email: true } });
        const result = await createMeetEvent({
          title, description, startTime, endTime,
          attendees: students.map(s => s.email)
        });
        finalLink = result.meetLink;
        eventId = result.eventId;
      } catch (e) {
        if (e.message === 'GOOGLE_NOT_CONNECTED') {
          return res.status(400).json({ error: 'GOOGLE_NOT_CONNECTED', message: 'Google is not connected. Either connect Google Calendar (admin) or paste a Meet link manually.' });
        }
        return res.status(500).json({ error: 'Failed to create Meet link: ' + e.message });
      }
    }

    const meeting = await prisma.meeting.create({
      data: {
        title, description, meetLink: finalLink, calendarEventId: eventId,
        startTime: new Date(startTime), endTime: new Date(endTime),
        hostId: req.user.id, hostName: req.user.name,
        courseId: courseId ? Number(courseId) : null
      }
    });

    // ---- Reminders ----
    const students = await prisma.user.findMany({ where: { role: 'student' } });

    // Notification bell (reuse announcements)
    if (notifyBell !== false) {
      const when = new Date(startTime).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      await prisma.announcement.create({
        data: {
          title: `📅 New Meeting: ${title}`,
          body: `${description ? description + ' — ' : ''}Scheduled for ${when}. Hosted by ${req.user.name}. Join from the Meetings hub.`,
          pinned: false
        }
      });
    }

    // Email reminders
    if (emailMembers) {
      students.forEach(s => sendMeetingScheduled(s.email, s.name, meeting).catch(() => {}));
    }

    res.json(meeting);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Delete (host who created it, or any admin)
router.delete('/:id', requireHost, async (req, res) => {
  const meeting = await prisma.meeting.findUnique({ where: { id: Number(req.params.id) } });
  if (!meeting) return res.status(404).json({ error: 'Not found' });
  if (req.user.role !== 'admin' && meeting.hostId !== req.user.id)
    return res.status(403).json({ error: 'You can only delete your own meetings' });
  await prisma.meeting.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
