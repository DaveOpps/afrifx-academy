import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface Step { icon: string; title: string; desc: string; }

const ADMIN_STEPS: Step[] = [
  { icon: '🔒', title: 'Log in as admin', desc: 'Head to /admin/login and sign in with your admin account to reach the control center.' },
  { icon: '📚', title: 'Build a course', desc: "Create a course, add modules, then add lessons with a YouTube link, duration and description." },
  { icon: '📝', title: 'Add a module quiz', desc: "Add 2 to 4 answer options per question and mark the correct one. Students see it after the module's last lesson." },
  { icon: '📎', title: 'Attach a resource', desc: 'Upload a PDF or paste a link to any lesson so students can download extra reading material.' },
  { icon: '📡', title: 'Post a trading signal', desc: 'Pair, direction, entry, stop loss and up to three take-profits. Every logged-in student sees it free.' },
  { icon: '📅', title: 'Schedule a meeting', desc: 'Set a date and time for a live session. Connect Google Calendar to auto-generate the Meet link.' },
  { icon: '🔔', title: 'Send an announcement', desc: 'Post a message and every student gets a notification bell alert, and an email if configured.' },
  { icon: '📈', title: 'Check performance', desc: 'Rank students by trading profit and quiz scores. Open "View Trades" for a full trade-by-trade history.' },
  { icon: '📊', title: 'Review analytics', desc: 'See signup trends over six months, course completion rate, and your most popular courses.' },
  { icon: '👥', title: 'Manage students', desc: 'View progress, reset passwords, issue certificates and review applications, all from one place.' },
];

const STUDENT_STEPS: Step[] = [
  { icon: '📚', title: 'Enroll in a course', desc: 'Browse courses, enroll, and watch video lessons. Progress saves automatically as you go.' },
  { icon: '📝', title: 'Pass the module quiz', desc: 'Answer every question and submit. Score 60% to pass, 100% for a bonus badge. Retake anytime.' },
  { icon: '💹', title: 'Try paper trading', desc: 'Start with a virtual $10,000 balance. Pick an instrument, set your lot size, and place a trade — no real money involved.' },
  { icon: '🎯', title: 'Set stop loss & take profit', desc: 'A live calculator shows your exact risk and reward in pips and dollars before you commit.' },
  { icon: '🏆', title: 'Climb the leaderboard', desc: 'Every closed trade counts toward your permanent ranking against other students, win or lose.' },
  { icon: '📡', title: 'Follow trading signals', desc: 'Read daily entry, stop loss and take-profit calls from the academy analysts, free for every student.' },
  { icon: '📈', title: 'Watch the live markets', desc: 'Real-time Forex, Gold and Crypto charts for practicing your own technical analysis.' },
  { icon: '📅', title: 'Join a live meeting', desc: 'Hop into scheduled webinars and sessions from the Meetings page, right from your dashboard.' },
  { icon: '👑', title: 'Check membership tiers', desc: 'Compare Free, Premium and VVIP perks on the Pricing page and upgrade whenever you are ready.' },
  { icon: '🎓', title: 'Earn your certificate', desc: 'Finish a course to unlock a certificate with a QR code anyone can scan to verify it.' },
];

export default function Tour() {
  const [track, setTrack] = useState<'admin' | 'student'>('admin');
  const [step, setStep] = useState(0);
  const [fade, setFade] = useState(true);
  const steps = track === 'admin' ? ADMIN_STEPS : STUDENT_STEPS;
  const s = steps[step];
  const isLast = step === steps.length - 1;

  function switchTrack(t: 'admin' | 'student') {
    setTrack(t); setStep(0); setFade(true);
  }

  function go(dir: number) {
    setFade(false);
    setTimeout(() => {
      setStep(v => Math.max(0, Math.min(steps.length - 1, v + dir)));
      setFade(true);
    }, 150);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />

      <div style={{ background: 'linear-gradient(135deg,rgba(26,107,60,0.15),rgba(201,168,76,0.08))', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '60px 24px 40px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', padding: '4px 16px', borderRadius: 20, fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>Platform Walkthrough</span>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,4.5vw,2.6rem)', fontWeight: 800, marginBottom: 12 }}>
            See how <span style={{ color: '#c9a84c' }}>AfriFX Academy</span> works
          </h1>
          <p style={{ color: '#c8c8c8', fontSize: '0.95rem' }}>A quick step-by-step tour for admins and students.</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          <button onClick={() => switchTrack('admin')} className={`btn ${track === 'admin' ? 'btn-gold' : 'btn-outline'}`} style={{ flex: 1 }}>For admins</button>
          <button onClick={() => switchTrack('student')} className={`btn ${track === 'student' ? 'btn-gold' : 'btn-outline'}`} style={{ flex: 1 }}>For students</button>
        </div>

        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 20 : 7, height: 7, borderRadius: 4, transition: 'all 0.25s ease', background: i === step ? '#c9a84c' : 'rgba(255,255,255,0.15)' }} />
          ))}
        </div>

        <div className="card card-premium" style={{ minHeight: 180, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.2s ease, transform 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#9a9a9a', marginBottom: 2 }}>Step {step + 1} of {steps.length}</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{s.title}</div>
            </div>
          </div>
          <p style={{ color: '#c8c8c8', fontSize: '0.92rem', lineHeight: 1.7, marginLeft: 62 }}>{s.desc}</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
          <button onClick={() => go(-1)} disabled={step === 0} className="btn btn-outline" style={{ opacity: step === 0 ? 0.4 : 1 }}>← Back</button>
          {!isLast && <button onClick={() => go(1)} className="btn btn-outline">Next →</button>}
        </div>

        {isLast && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to={track === 'admin' ? '/admin/login' : '/register'} className="btn btn-gold" style={{ width: '100%' }}>
              {track === 'admin' ? 'Go to admin login' : 'Create your free account'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
