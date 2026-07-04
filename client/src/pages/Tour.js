import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
const ADMIN_STEPS = [
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
const STUDENT_STEPS = [
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
    const [track, setTrack] = useState('admin');
    const [step, setStep] = useState(0);
    const [fade, setFade] = useState(true);
    const steps = track === 'admin' ? ADMIN_STEPS : STUDENT_STEPS;
    const s = steps[step];
    const isLast = step === steps.length - 1;
    function switchTrack(t) {
        setTrack(t);
        setStep(0);
        setFade(true);
    }
    function go(dir) {
        setFade(false);
        setTimeout(() => {
            setStep(v => Math.max(0, Math.min(steps.length - 1, v + dir)));
            setFade(true);
        }, 150);
    }
    return (_jsxs("div", { style: { minHeight: '100vh', background: '#0d0d0d' }, children: [_jsx(Navbar, {}), _jsx("div", { style: { background: 'linear-gradient(135deg,rgba(26,107,60,0.15),rgba(201,168,76,0.08))', borderBottom: '1px solid rgba(201,168,76,0.1)', padding: '60px 24px 40px' }, children: _jsxs("div", { style: { maxWidth: 640, margin: '0 auto', textAlign: 'center' }, children: [_jsx("span", { style: { display: 'inline-block', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', padding: '4px 16px', borderRadius: 20, fontSize: '0.75rem', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }, children: "Platform Walkthrough" }), _jsxs("h1", { style: { fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.8rem,4.5vw,2.6rem)', fontWeight: 800, marginBottom: 12 }, children: ["See how ", _jsx("span", { style: { color: '#c9a84c' }, children: "AfriFX Academy" }), " works"] }), _jsx("p", { style: { color: '#c8c8c8', fontSize: '0.95rem' }, children: "A quick step-by-step tour for admins and students." })] }) }), _jsxs("div", { className: "container", style: { maxWidth: 640, margin: '0 auto', padding: '40px 24px 80px' }, children: [_jsxs("div", { style: { display: 'flex', gap: 10, marginBottom: 24 }, children: [_jsx("button", { onClick: () => switchTrack('admin'), className: `btn ${track === 'admin' ? 'btn-gold' : 'btn-outline'}`, style: { flex: 1 }, children: "For admins" }), _jsx("button", { onClick: () => switchTrack('student'), className: `btn ${track === 'student' ? 'btn-gold' : 'btn-outline'}`, style: { flex: 1 }, children: "For students" })] }), _jsx("div", { style: { display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }, children: steps.map((_, i) => (_jsx("div", { style: { width: i === step ? 20 : 7, height: 7, borderRadius: 4, transition: 'all 0.25s ease', background: i === step ? '#c9a84c' : 'rgba(255,255,255,0.15)' } }, i))) }), _jsxs("div", { className: "card card-premium", style: { minHeight: 180, opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.2s ease, transform 0.2s ease' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }, children: [_jsx("div", { style: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }, children: s.icon }), _jsxs("div", { children: [_jsxs("div", { style: { fontSize: '0.75rem', color: '#9a9a9a', marginBottom: 2 }, children: ["Step ", step + 1, " of ", steps.length] }), _jsx("div", { style: { fontWeight: 700, fontSize: '1.05rem' }, children: s.title })] })] }), _jsx("p", { style: { color: '#c8c8c8', fontSize: '0.92rem', lineHeight: 1.7, marginLeft: 62 }, children: s.desc })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: 20 }, children: [_jsx("button", { onClick: () => go(-1), disabled: step === 0, className: "btn btn-outline", style: { opacity: step === 0 ? 0.4 : 1 }, children: "\u2190 Back" }), !isLast && _jsx("button", { onClick: () => go(1), className: "btn btn-outline", children: "Next \u2192" })] }), isLast && (_jsx("div", { style: { textAlign: 'center', marginTop: 24 }, children: _jsx(Link, { to: track === 'admin' ? '/admin/login' : '/register', className: "btn btn-gold", style: { width: '100%' }, children: track === 'admin' ? 'Go to admin login' : 'Create your free account' }) }))] })] }));
}
