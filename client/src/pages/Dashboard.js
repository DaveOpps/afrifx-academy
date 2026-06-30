import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import MarketTicker from '../components/MarketTicker';
import CandleChart from '../components/charts/CandleChart';
import OrderBook from '../components/OrderBook';
import Donut from '../components/charts/Donut';
import { fetchKlines } from '../api/market';
const ECON_EVENTS = [
    { time: '08:30', cur: 'USD', title: 'Core CPI m/m', impact: 'high' },
    { time: '10:00', cur: 'EUR', title: 'ECB President Speech', impact: 'med' },
    { time: '13:30', cur: 'USD', title: 'Unemployment Claims', impact: 'high' },
    { time: '15:00', cur: 'GBP', title: 'BOE Gov Speech', impact: 'med' },
];
const IMPACT = { high: '#ef5350', med: '#c9a84c', low: '#9a9a9a' };
function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
function Countdown({ target }) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
    const diff = Math.max(0, new Date(target).getTime() - now);
    const h = Math.floor(diff / 3.6e6), m = Math.floor((diff % 3.6e6) / 6e4), s = Math.floor((diff % 6e4) / 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return _jsxs("span", { style: { fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: '#c9a84c' }, children: [pad(h), ":", pad(m), ":", pad(s)] });
}
export default function Dashboard() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [certs, setCerts] = useState([]);
    const [game, setGame] = useState(null);
    const [nextMeet, setNextMeet] = useState(null);
    const [signals, setSignals] = useState([]);
    const [activity, setActivity] = useState(null);
    const [board, setBoard] = useState([]);
    const [perf, setPerf] = useState(null);
    const [candles, setCandles] = useState(null);
    const [chartLive, setChartLive] = useState(false);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let active = true;
        const load = async () => {
            const k = await fetchKlines('BTCUSDT', '1h', 40);
            if (!active)
                return;
            if (k && k.length) {
                setCandles(k);
                setChartLive(true);
            }
            else {
                setChartLive(false);
            }
        };
        load();
        const t = setInterval(load, 20000);
        return () => { active = false; clearInterval(t); };
    }, []);
    useEffect(() => {
        Promise.all([
            api.myEnrollments(),
            api.myCerts(),
            api.myGamification(),
            api.nextMeeting().catch(() => null),
            api.getLatestSignals().catch(() => []),
            api.myActivity().catch(() => null),
            api.leaderboard().catch(() => []),
            api.signalPerformance().catch(() => null),
        ])
            .then(([e, c, g, nm, s, a, b, p]) => {
            setEnrollments(e);
            setCerts(c);
            setGame(g);
            setNextMeet(nm);
            setSignals(s || []);
            setActivity(a);
            setBoard(b || []);
            setPerf(p);
        })
            .finally(() => setLoading(false));
    }, []);
    const totalLessons = enrollments.reduce((s, e) => s + (e.totalLessons || 0), 0);
    const watchedTotal = enrollments.reduce((s, e) => s + (e.watchedCount || 0), 0);
    const overallPct = totalLessons ? Math.round((watchedTotal / totalLessons) * 100) : 0;
    const completedCount = enrollments.filter(e => e.completedAt).length;
    const inProgress = enrollments.filter(e => !e.completedAt && (e.watchedCount || 0) > 0).length;
    const notStarted = enrollments.filter(e => !e.completedAt && !(e.watchedCount || 0)).length;
    const signalActive = user?.tier === 'vvip' || (!!user?.signalSubUntil && new Date(user.signalSubUntil) > new Date());
    const firstName = user?.name?.split(' ')[0];
    // Resume target
    const resume = enrollments.find(e => !e.completedAt && (e.watchedCount || 0) > 0) || enrollments.find(e => !e.completedAt) || enrollments[0];
    const resumeLesson = resume?.course?.modules?.[0]?.lessons?.[0];
    const resumePct = resume ? (resume.completedAt ? 100 : resume.totalLessons ? Math.round((resume.watchedCount / resume.totalLessons) * 100) : 0) : 0;
    // Smart nudge
    const nudge = enrollments.length === 0
        ? { text: 'Enroll in your first course to begin', cta: 'Browse Courses', to: '/courses' }
        : !signalActive
            ? { text: 'Unlock daily trading signals', cta: 'Get Signals — $5/mo', to: '/signals' }
            : { text: 'Keep your streak alive — continue learning', cta: 'Resume', to: resumeLesson ? `/learn/${resume.course.id}/${resumeLesson.id}` : '/courses' };
    if (loading) {
        return _jsx(DashboardLayout, { title: "Dashboard", children: _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) });
    }
    return (_jsxs(DashboardLayout, { title: "Omni Dashboard", subtitle: `${greeting()}, ${firstName} 👋 · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`, actions: _jsx(Link, { to: "/courses", className: "btn btn-gold btn-sm", children: "+ Enroll" }), children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx(MarketTicker, {}), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }, className: "bento-2", children: [_jsxs("div", { className: "card card-premium", style: { overflow: 'hidden', position: 'relative', background: 'linear-gradient(120deg, rgba(26,107,60,0.28), rgba(20,20,24,0.6) 55%, rgba(201,168,76,0.18))', border: '1px solid rgba(201,168,76,0.25)' }, children: [_jsx("div", { style: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: 0.5, pointerEvents: 'none' } }), _jsx("div", { style: { position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.22), transparent 70%)' } }), _jsxs("div", { style: { position: 'relative' }, children: [_jsx("span", { style: { fontSize: '0.72rem', letterSpacing: 2, textTransform: 'uppercase', color: '#c9a84c' }, children: resume && !resume.completedAt ? 'Continue learning' : 'Your next step' }), _jsx("h2", { style: { fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 6px' }, children: resume ? resume.course.title : 'Start your trading journey' }), _jsx("p", { style: { color: '#c8c8c8', fontSize: '0.9rem', marginBottom: 16 }, children: nudge.text }), resume && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, maxWidth: 360 }, children: [_jsx("div", { className: "progress-bar-wrap", style: { flex: 1 }, children: _jsx("div", { className: "progress-bar-fill", style: { width: `${resumePct}%` } }) }), _jsxs("span", { style: { fontSize: '0.8rem', fontWeight: 700, color: '#c9a84c' }, children: [resumePct, "%"] })] })), _jsxs("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap' }, children: [_jsxs(Link, { to: nudge.to, className: "btn btn-gold btn-sm", children: [nudge.cta, " \u2192"] }), resume && resumeLesson && nudge.cta !== 'Resume' && _jsx(Link, { to: `/learn/${resume.course.id}/${resumeLesson.id}`, className: "btn btn-outline btn-sm", children: "Continue course" })] })] })] }), _jsxs("div", { className: "card", style: { display: 'flex', flexDirection: 'column', justifyContent: 'center' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }, children: [_jsx("span", { style: { fontSize: '2.4rem' }, children: "\uD83D\uDD25" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '2rem', fontWeight: 800, lineHeight: 1 }, children: activity?.streak ?? 0 }), _jsx("div", { style: { fontSize: '0.78rem', color: '#9a9a9a' }, children: "day streak" })] })] }), _jsx("div", { style: { display: 'flex', gap: 6, justifyContent: 'space-between' }, children: (activity?.days || []).map((d, i) => (_jsxs("div", { style: { flex: 1, textAlign: 'center' }, children: [_jsx("div", { title: `${d.count} lessons`, style: { height: 30, borderRadius: 6, background: d.count > 0 ? `rgba(201,168,76,${Math.min(1, 0.3 + d.count * 0.25)})` : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 } }), _jsx("span", { style: { fontSize: '0.62rem', color: '#777' }, children: d.label })] }, i))) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }, children: [_jsx(KpiCard, { icon: "\uD83D\uDCDA", value: enrollments.length, label: "Enrolled Courses", tint: "#c9a84c", pill: inProgress ? `${inProgress} active` : undefined }), _jsx(KpiCard, { icon: "\u2705", value: completedCount, label: "Completed", tint: "#4caf50", pill: enrollments.length ? `${Math.round((completedCount / enrollments.length) * 100)}%` : undefined }), _jsx(KpiCard, { icon: "\uD83C\uDF93", value: certs.length, label: "Certificates", tint: "#4aa3d4" }), _jsx(KpiCard, { icon: "\uD83C\uDFC6", value: game?.points ?? 0, label: `Points · Rank #${game?.rank ?? '—'}`, tint: "#e2c070", pillGold: true, pill: `${overallPct}% done` })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }, className: "bento-2", children: [_jsxs("div", { className: "card card-premium", children: [_jsx(CandleChart, { data: candles ?? undefined, pair: "BTC/USDT", live: chartLive }), _jsx("div", { style: { marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }, children: _jsx(Link, { to: "/markets", className: "btn btn-outline btn-sm", children: "Open full chart \u2192" }) })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx("div", { className: "card", children: _jsx(OrderBook, { symbol: "BTCUSDT", rows: 7, dp: 1 }) }), nextMeet?.meeting ? (_jsxs("div", { className: "card", style: { background: nextMeet.status === 'live' ? 'linear-gradient(135deg,rgba(76,175,80,0.18),rgba(20,20,24,0.4))' : 'linear-gradient(135deg,rgba(34,158,217,0.14),rgba(20,20,24,0.4))', border: nextMeet.status === 'live' ? '1px solid rgba(76,175,80,0.4)' : '1px solid rgba(34,158,217,0.3)' }, children: [nextMeet.status === 'live'
                                                ? _jsxs("span", { style: { color: '#4caf50', fontWeight: 700, fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: 5 }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: '50%', background: '#4caf50', display: 'inline-block', animation: 'pulse 1.5s infinite' } }), "LIVE NOW"] })
                                                : _jsx("span", { style: { color: '#4aa3d4', fontWeight: 700, fontSize: '0.74rem' }, children: "NEXT LIVE SESSION" }), _jsx("div", { style: { fontWeight: 700, margin: '6px 0 10px' }, children: nextMeet.meeting.title }), nextMeet.status !== 'live' && _jsx("div", { style: { marginBottom: 12 }, children: _jsx(Countdown, { target: nextMeet.meeting.startTime }) }), _jsx("a", { href: nextMeet.meeting.meetLink, target: "_blank", rel: "noopener", className: `btn btn-sm ${nextMeet.status === 'live' ? 'btn-primary' : 'btn-gold'}`, style: { width: '100%' }, children: nextMeet.status === 'live' ? 'Join Now' : 'Join Session' })] })) : (_jsx("div", { className: "card", style: { textAlign: 'center', color: '#9a9a9a', fontSize: '0.85rem' }, children: "\uD83D\uDCF9 No live sessions scheduled" })), _jsxs("div", { className: "card", style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '0.98rem' }, children: "Signal Scoreboard" }), _jsx(Link, { to: "/performance", style: { fontSize: '0.76rem', color: '#c9a84c' }, children: "Details \u2192" })] }), perf && perf.trades > 0 ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }, children: [_jsxs("span", { style: { fontSize: '2rem', fontWeight: 800, color: '#4caf50' }, children: [perf.winRate, "%"] }), _jsxs("span", { style: { fontSize: '0.78rem', color: '#9a9a9a' }, children: ["win rate \u00B7 ", perf.trades, " trades"] })] }), _jsx("div", { style: { display: 'flex', gap: 5, marginBottom: 8 }, children: perf.history.slice(0, 8).map((s, i) => (_jsx("span", { title: `${s.pair} · ${s.result}`, style: { width: 18, height: 18, borderRadius: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, background: s.result === 'win' ? 'rgba(76,175,80,0.2)' : s.result === 'loss' ? 'rgba(239,83,80,0.2)' : 'rgba(154,154,154,0.2)', color: s.result === 'win' ? '#4caf50' : s.result === 'loss' ? '#ef5350' : '#9a9a9a' }, children: s.result === 'win' ? 'W' : s.result === 'loss' ? 'L' : '–' }, i))) }), _jsxs("div", { style: { fontSize: '0.8rem', color: '#9a9a9a' }, children: ["Total: ", _jsxs("b", { style: { color: perf.totalPips >= 0 ? '#4caf50' : '#ef5350' }, children: [perf.totalPips >= 0 ? '+' : '', perf.totalPips, " pips"] })] })] })) : (_jsx("p", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: "No closed trades yet." }))] })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }, children: [_jsxs("div", { className: "card", children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '0.98rem', marginBottom: 16 }, children: "Course Statistics" }), enrollments.length === 0 ? _jsx("p", { style: { color: '#9a9a9a', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }, children: "Enroll to see stats." }) : (_jsx(Donut, { size: 150, centerTop: "Courses", centerBottom: String(enrollments.length), segments: [
                                            { label: `Completed (${completedCount})`, value: completedCount, color: '#4caf50' },
                                            { label: `In Progress (${inProgress})`, value: inProgress, color: '#c9a84c' },
                                            { label: `Not Started (${notStarted})`, value: notStarted, color: '#3a3a3a' },
                                        ] }))] }), _jsxs("div", { className: "card", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '0.98rem' }, children: "Top Traders" }), _jsx(Link, { to: "/leaderboard", style: { fontSize: '0.76rem', color: '#c9a84c' }, children: "All \u2192" })] }), board.slice(0, 3).map((u, i) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }, children: [_jsx("span", { style: { fontSize: '1.2rem', width: 24 }, children: ['🥇', '🥈', '🥉'][i] }), _jsx("span", { style: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem' }, children: u.name[0] }), _jsxs("span", { style: { flex: 1, fontWeight: 600, fontSize: '0.86rem' }, children: [u.name, u.isMe && _jsx("span", { style: { color: '#c9a84c' }, children: " (you)" })] }), _jsx("span", { style: { fontWeight: 700, color: '#c9a84c', fontSize: '0.85rem' }, children: u.points })] }, u.id))), board.length === 0 && _jsx("p", { style: { color: '#9a9a9a', fontSize: '0.82rem' }, children: "No rankings yet." })] }), _jsxs("div", { className: "card", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '0.98rem' }, children: "Today's Market Events" }), _jsx("span", { style: { fontSize: '0.68rem', color: '#666' }, children: "demo" })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 }, children: ECON_EVENTS.map((e, i) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }, children: [_jsx("span", { style: { fontFamily: 'monospace', color: '#9a9a9a', minWidth: 42 }, children: e.time }), _jsx("span", { style: { fontWeight: 700, color: '#fff', minWidth: 34 }, children: e.cur }), _jsx("span", { style: { flex: 1, color: '#c8c8c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: e.title }), _jsx("span", { style: { width: 8, height: 8, borderRadius: '50%', background: IMPACT[e.impact], flexShrink: 0 }, title: e.impact })] }, i))) })] })] }), _jsxs("div", { className: "card card-premium", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }, children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '1.05rem' }, children: "My Courses" }), _jsx(Link, { to: "/courses", style: { fontSize: '0.82rem', color: '#c9a84c' }, children: "Browse all \u2192" })] }), enrollments.length === 0 ? (_jsxs("div", { style: { textAlign: 'center', padding: '28px 0' }, children: [_jsx("p", { style: { fontSize: '2rem', marginBottom: 8 }, children: "\uD83D\uDCDA" }), _jsx("p", { style: { color: '#9a9a9a', marginBottom: 16 }, children: "You haven't enrolled in any courses yet." }), _jsx(Link, { to: "/courses", className: "btn btn-gold btn-sm", children: "Start Learning" })] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: enrollments.map(en => {
                                    const pct = en.completedAt ? 100 : en.totalLessons ? Math.round((en.watchedCount / en.totalLessons) * 100) : 0;
                                    const fl = en.course.modules[0]?.lessons[0];
                                    return (_jsxs("div", { style: { display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }, children: [_jsx("div", { style: { width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, children: "\uD83D\uDCC8" }), _jsxs("div", { style: { flex: 1, minWidth: 180 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '0.9rem' }, children: en.course.title }), en.completedAt && _jsx("span", { className: "badge badge-green", children: "Done" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { className: "progress-bar-wrap", style: { flex: 1 }, children: _jsx("div", { className: "progress-bar-fill", style: { width: `${pct}%` } }) }), _jsxs("span", { style: { fontSize: '0.76rem', color: '#c9a84c', fontWeight: 700, minWidth: 34, textAlign: 'right' }, children: [pct, "%"] })] })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [fl && _jsx(Link, { to: `/learn/${en.course.id}/${fl.id}`, className: "btn btn-primary btn-sm", children: pct > 0 ? 'Continue' : 'Start' }), en.completedAt && _jsx(Link, { to: "/certificates", className: "btn btn-gold btn-sm", children: "Cert" })] })] }, en.id));
                                }) }))] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: 20 }, className: "bento-2", children: [_jsxs("div", { className: "card", style: { background: 'linear-gradient(135deg,rgba(201,168,76,0.08),rgba(20,20,24,0.4))' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '0.98rem' }, children: "Membership" }), _jsx("span", { style: { fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: user?.tier === 'vvip' ? '#c9a84c' : user?.tier === 'premium' ? '#4aa3d4' : '#9a9a9a', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 12px', borderRadius: 20 }, children: user?.tier === 'vvip' ? 'VVIP' : user?.tier === 'premium' ? 'Premium' : 'Free' })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 16 }, children: [_jsx("span", { style: { color: '#9a9a9a' }, children: "Signals" }), signalActive ? _jsx("span", { style: { color: '#4caf50', fontWeight: 600 }, children: "\u25CF Active" }) : _jsx("span", { style: { color: '#9a9a9a' }, children: "\u25CB Off" })] }), user?.tier !== 'vvip' && _jsx(Link, { to: "/pricing", className: "btn btn-gold btn-sm", style: { width: '100%' }, children: "Upgrade" })] }), _jsx("div", { className: "card", children: game && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '0.98rem' }, children: "Achievements" }), _jsxs("span", { style: { fontSize: '0.8rem', color: '#9a9a9a' }, children: [game.earned, "/", game.total] })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 10 }, children: game.achievements.map((a) => (_jsxs("div", { title: a.desc, style: { textAlign: 'center', padding: '12px 6px', borderRadius: 10, background: a.earned ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)', border: a.earned ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.05)', opacity: a.earned ? 1 : 0.4 }, children: [_jsx("div", { style: { fontSize: '1.5rem', marginBottom: 4, filter: a.earned ? 'none' : 'grayscale(1)' }, children: a.icon }), _jsx("div", { style: { fontSize: '0.68rem', fontWeight: 600 }, children: a.title })] }, a.id))) })] })) })] })] }), _jsx("style", { children: `@media (max-width: 900px){ .bento-2 { grid-template-columns: 1fr !important; } }` })] }));
}
function KpiCard({ icon, value, label, tint, pill, pillGold }) {
    return (_jsxs("div", { className: "card card-hover", style: { position: 'relative', overflow: 'hidden' }, children: [_jsx("div", { style: { position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${tint}22, transparent 70%)` } }), _jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }, children: [_jsx("div", { style: { width: 46, height: 46, borderRadius: 12, background: `${tint}1a`, border: `1px solid ${tint}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }, children: icon }), pill && _jsx("span", { style: { fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: pillGold ? '#c9a84c' : '#4caf50', background: pillGold ? 'rgba(201,168,76,0.12)' : 'rgba(76,175,80,0.12)', border: `1px solid ${pillGold ? 'rgba(201,168,76,0.3)' : 'rgba(76,175,80,0.3)'}` }, children: pill })] }), _jsx("div", { style: { fontSize: '2rem', fontWeight: 800, lineHeight: 1 }, children: value }), _jsx("div", { style: { fontSize: '0.8rem', color: '#9a9a9a', marginTop: 6 }, children: label })] }));
}
