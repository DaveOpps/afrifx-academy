import { google } from 'googleapis';
import { prisma } from './db.js';

// Configure via server/.env:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
// Default redirect points back to this API's callback route.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/meetings/google/callback';

const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export const googleConfigured = !!(CLIENT_ID && CLIENT_SECRET);

function oauthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

// ---- token persistence in the Setting table ----
async function saveRefreshToken(token) {
  await prisma.setting.upsert({
    where: { key: 'google_refresh_token' },
    update: { value: token },
    create: { key: 'google_refresh_token', value: token }
  });
}
async function loadRefreshToken() {
  const s = await prisma.setting.findUnique({ where: { key: 'google_refresh_token' } });
  return s?.value || null;
}

export async function isGoogleConnected() {
  if (!googleConfigured) return false;
  const t = await loadRefreshToken();
  return !!t;
}

export function getAuthUrl() {
  const client = oauthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES
  });
}

export async function handleCallback(code) {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);
  if (tokens.refresh_token) await saveRefreshToken(tokens.refresh_token);
  return tokens;
}

export async function disconnectGoogle() {
  await prisma.setting.deleteMany({ where: { key: 'google_refresh_token' } });
}

// Create a Google Calendar event with a Meet link.
// Returns { meetLink, eventId } or throws if not connected.
export async function createMeetEvent({ title, description, startTime, endTime, attendees = [] }) {
  const refresh = await loadRefreshToken();
  if (!googleConfigured || !refresh) {
    throw new Error('GOOGLE_NOT_CONNECTED');
  }
  const client = oauthClient();
  client.setCredentials({ refresh_token: refresh });
  const calendar = google.calendar({ version: 'v3', auth: client });

  const event = {
    summary: title,
    description: description || '',
    start: { dateTime: new Date(startTime).toISOString() },
    end: { dateTime: new Date(endTime).toISOString() },
    attendees: attendees.map(email => ({ email })),
    conferenceData: {
      createRequest: {
        requestId: `afrifx-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    sendUpdates: 'all',
    requestBody: event
  });

  const meetLink = res.data.hangoutLink
    || res.data.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri
    || '';
  return { meetLink, eventId: res.data.id };
}
