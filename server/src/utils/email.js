import nodemailer from 'nodemailer';

// Configure via .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
// If not configured, emails are logged to the console instead of being sent.
const configured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;
if (configured) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

const FROM = process.env.SMTP_FROM || 'AfriFX Academy <noreply@afrifx.com>';
const BRAND = '#c9a84c';
const GREEN = '#1a6b3c';

function wrap(title, bodyHtml) {
  return `
  <div style="background:#0d0d0d;padding:32px;font-family:Arial,sans-serif;color:#fff;border-radius:12px;max-width:560px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:1.6rem;font-weight:800;">Afri<span style="color:${BRAND};">FX</span></span>
      <div style="font-size:0.7rem;letter-spacing:2px;color:#9a9a9a;text-transform:uppercase;">Academy</div>
    </div>
    <h2 style="color:${BRAND};font-size:1.3rem;margin-bottom:16px;">${title}</h2>
    <div style="color:#d0d0d0;line-height:1.7;font-size:0.95rem;">${bodyHtml}</div>
    <div style="margin-top:28px;padding-top:18px;border-top:1px solid #2a2a2a;color:#777;font-size:0.78rem;text-align:center;">
      AfriFX Academy &middot; Empowering a Million African Traders
    </div>
  </div>`;
}

async function deliver(to, subject, html) {
  if (!configured) {
    console.log(`\n📧 [EMAIL — not sent, SMTP not configured]\n  To: ${to}\n  Subject: ${subject}\n`);
    return { logged: true };
  }
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    return { sent: true };
  } catch (e) {
    console.error('Email send failed:', e.message);
    return { error: e.message };
  }
}

export function sendWelcome(to, name) {
  return deliver(to, '🎉 Welcome to AfriFX Academy!', wrap(
    `Welcome, ${name}!`,
    `<p>Thank you for joining <strong>AfriFX Academy</strong> — we're thrilled to have you on board.</p>
     <p>You now have access to our structured Forex courses, video lessons, quizzes, and certificates. Start learning today and join the growing family of disciplined African traders.</p>
     <p style="margin-top:18px;"><a href="http://localhost:5173/courses" style="background:${GREEN};color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;">Browse Courses →</a></p>
     <p style="margin-top:20px;">💛 Keep learning. Keep growing. Keep winning.</p>`
  ));
}

export function sendCertReady(to, name, course) {
  return deliver(to, '🎓 Your AfriFX Certificate is Ready!', wrap(
    `Congratulations, ${name}! 🎓`,
    `<p>Thank you for successfully completing the <strong>${course}</strong>.</p>
     <p>Your dedication, commitment, and willingness to learn have been truly commendable. We are proud to be part of your trading journey.</p>
     <p>🏅 Welcome to the growing family of disciplined AFRIFX traders!</p>
     <p style="margin-top:18px;"><a href="http://localhost:5173/certificates" style="background:${BRAND};color:#000;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:700;">Download Your Certificate →</a></p>
     <p style="margin-top:20px;">💛 Keep learning. Keep growing. Keep winning.</p>
     <p style="color:#777;font-size:0.8rem;">#AFRIFXAcademy #TeamAFRIFX #CertifiedTrader #ForexEducation</p>`
  ));
}

export function sendCourseComplete(to, name, course) {
  return deliver(to, `✅ You completed ${course}!`, wrap(
    `Well done, ${name}!`,
    `<p>You've completed every lesson in <strong>${course}</strong>. That's a huge milestone!</p>
     <p>Head over to your certificates page to claim your official certificate of participation.</p>
     <p style="margin-top:18px;"><a href="http://localhost:5173/certificates" style="background:${GREEN};color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;">Claim Certificate →</a></p>`
  ));
}

export function sendPasswordReset(to, name, resetUrl) {
  return deliver(to, '🔑 Reset your AfriFX password', wrap(
    `Password Reset Request`,
    `<p>Hi ${name},</p>
     <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p>
     <p style="margin-top:18px;"><a href="${resetUrl}" style="background:${BRAND};color:#000;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:700;">Reset Password →</a></p>
     <p style="margin-top:18px;color:#999;font-size:0.85rem;">If you didn't request this, you can safely ignore this email.</p>
     <p style="color:#777;font-size:0.78rem;word-break:break-all;">Or paste this link: ${resetUrl}</p>`
  ));
}

export function sendMeetingScheduled(to, name, meeting) {
  const when = new Date(meeting.startTime).toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return deliver(to, `📅 New Meeting: ${meeting.title}`, wrap(
    `You're invited: ${meeting.title}`,
    `<p>Hi ${name},</p>
     <p>A new meeting has been scheduled on AfriFX Academy.</p>
     <div style="background:#161616;border:1px solid #2a2a2a;border-radius:10px;padding:16px;margin:16px 0;">
       <p style="margin:0 0 6px;"><strong style="color:${BRAND};">📌 ${meeting.title}</strong></p>
       ${meeting.description ? `<p style="margin:0 0 10px;color:#b0b0b0;font-size:0.88rem;">${meeting.description}</p>` : ''}
       <p style="margin:0;color:#b0b0b0;font-size:0.88rem;">🕒 ${when}</p>
       <p style="margin:6px 0 0;color:#b0b0b0;font-size:0.88rem;">👤 Hosted by ${meeting.hostName}</p>
     </div>
     <p style="margin-top:8px;"><a href="${meeting.meetLink}" style="background:${GREEN};color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;">Join on Google Meet →</a></p>
     <p style="margin-top:16px;font-size:0.85rem;color:#9a9a9a;">You can also find all meetings anytime in your <a href="http://localhost:5173/meetings" style="color:${BRAND};">AfriFX Meetings hub</a>.</p>`
  ));
}

export function sendAnnouncement(to, name, title, body) {
  return deliver(to, `📢 ${title}`, wrap(
    title,
    `<p>Hi ${name},</p><p>${body}</p>
     <p style="margin-top:18px;"><a href="http://localhost:5173/dashboard" style="background:${GREEN};color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;">Go to Dashboard →</a></p>`
  ));
}

export function sendSignalAlert(to, name, signal) {
  const dir = signal.direction === 'BUY' ? '🟢 BUY' : '🔴 SELL';
  const tps = [signal.tp1, signal.tp2, signal.tp3].filter(Boolean).map((t, i) => `TP${i+1}: ${t}`).join(' &nbsp;|&nbsp; ');
  return deliver(to, `📡 New AfriFX Signal: ${signal.pair} ${signal.direction}`, wrap(
    `New Signal Alert — ${signal.pair}`,
    `<p>Hi ${name}, a new trading signal has just been posted on AfriFX Academy.</p>
     <div style="background:#0a1f10;border:1px solid #1a6b3c;border-radius:12px;padding:20px;margin:16px 0;">
       <div style="font-size:1.5rem;font-weight:800;color:#fff;margin-bottom:12px;">${signal.pair} &nbsp; <span style="font-size:1.1rem;">${dir}</span></div>
       <table style="width:100%;border-collapse:collapse;font-size:0.9rem;color:#d0d0d0;">
         <tr><td style="padding:4px 0;color:#9a9a9a;">Entry</td><td style="text-align:right;font-weight:700;color:#fff;">${signal.entry}</td></tr>
         <tr><td style="padding:4px 0;color:#9a9a9a;">Stop Loss</td><td style="text-align:right;font-weight:700;color:#f6465d;">${signal.stopLoss}</td></tr>
         <tr><td style="padding:4px 0;color:#9a9a9a;">Targets</td><td style="text-align:right;font-weight:700;color:#0ecb81;">${tps}</td></tr>
         ${signal.type ? `<tr><td style="padding:4px 0;color:#9a9a9a;">Type</td><td style="text-align:right;">${signal.type}</td></tr>` : ''}
       </table>
       ${signal.notes ? `<p style="margin-top:12px;font-size:0.85rem;color:#b0b0b0;border-top:1px solid #1a3a1a;padding-top:10px;">📝 ${signal.notes}</p>` : ''}
     </div>
     <p style="font-size:0.82rem;color:#777;">⚠️ Always manage your risk. Never risk more than 1-2% per trade.</p>
     <p style="margin-top:18px;"><a href="http://localhost:5173/signals" style="background:${GREEN};color:#fff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:600;">View All Signals →</a></p>`
  ));
}

export const emailConfigured = configured;
