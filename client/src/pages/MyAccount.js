import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
export default function MyAccount() {
    const { user: authUser } = useAuth();
    const [data, setData] = useState(null);
    const [tab, setTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [settingsForm, setSettingsForm] = useState({ name: '', phone: '' });
    const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    useEffect(() => {
        api.meFull().then(d => { setData(d); setSettingsForm({ name: d.user.name, phone: d.user.phone || '' }); }).finally(() => setLoading(false));
    }, []);
    const reload = () => api.meFull().then(setData);
    async function saveProfile(e) {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            await api.updateMe(settingsForm);
            await reload();
            setMsg({ ok: true, text: 'Profile updated.' });
        }
        catch {
            setMsg({ ok: false, text: 'Failed to save.' });
        }
        finally {
            setSaving(false);
        }
    }
    async function changePassword(e) {
        e.preventDefault();
        setMsg(null);
        if (pwForm.next !== pwForm.confirm) {
            setMsg({ ok: false, text: 'Passwords do not match.' });
            return;
        }
        if (pwForm.next.length < 6) {
            setMsg({ ok: false, text: 'Password must be at least 6 characters.' });
            return;
        }
        setSaving(true);
        try {
            await api.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
            setPwForm({ current: '', next: '', confirm: '' });
            setMsg({ ok: true, text: 'Password changed.' });
        }
        catch (err) {
            setMsg({ ok: false, text: err.message || 'Failed.' });
        }
        finally {
            setSaving(false);
        }
    }
    if (loading || !data)
        return _jsx(DashboardLayout, { title: "My Account", children: _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) });
    const { user, enrollments, certificates, payments, quizResults, isPremium, signalActive } = data;
    const TABS = [
        { id: 'overview', label: 'Overview', icon: '🏠' },
        { id: 'courses', label: 'My Courses', icon: '📚' },
        { id: 'quizzes', label: 'Quiz Scores', icon: '📝' },
        { id: 'certificates', label: 'Certificates', icon: '🎓' },
        { id: 'payments', label: 'Payments', icon: '💳' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];
    const tierColor = user.tier === 'vvip' ? '#c9a84c' : user.tier === 'premium' ? '#4aa3d4' : '#9a9a9a';
    const tierLabel = user.tier === 'vvip' ? 'VVIP' : user.tier === 'premium' ? 'Premium' : 'Free';
    return (_jsx(DashboardLayout, { title: "My Account", subtitle: "Personal dashboard \u2014 your progress, certs, and settings in one place.", children: _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 24 }, children: [_jsxs("div", { className: "card card-premium", style: { display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg,rgba(26,107,60,0.22),rgba(20,20,24,0.6) 55%,rgba(201,168,76,0.14))' }, children: [_jsx("div", { style: { position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '22px 22px', pointerEvents: 'none' } }), _jsx("div", { style: { position: 'relative', width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, flexShrink: 0 }, children: user.name[0] }), _jsxs("div", { style: { position: 'relative', flex: 1, minWidth: 0 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }, children: [_jsx("h2", { style: { fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 800 }, children: user.name }), _jsx("span", { style: { fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: tierColor, background: `${tierColor}18`, border: `1px solid ${tierColor}44`, textTransform: 'uppercase', letterSpacing: 1 }, children: tierLabel })] }), _jsx("div", { style: { fontSize: '0.82rem', color: '#9a9a9a', marginTop: 4 }, children: user.email }), user.studentId && _jsxs("div", { className: "mono", style: { fontSize: '0.78rem', color: '#c9a84c', marginTop: 4 }, children: ["\uD83E\uDEAA ", user.studentId] })] }), _jsxs("div", { style: { position: 'relative', display: 'flex', gap: 24, flexWrap: 'wrap' }, children: [_jsx(StatPill, { icon: "\uD83D\uDCDA", value: enrollments.length, label: "Courses" }), _jsx(StatPill, { icon: "\uD83C\uDF93", value: certificates.length, label: "Certs" }), _jsx(StatPill, { icon: "\uD83D\uDCDD", value: quizResults.length, label: "Quizzes" }), _jsx(StatPill, { icon: "\u2B50", value: user.points, label: "Points" })] })] }), !isPremium && (_jsxs("div", { className: "card", style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: 'linear-gradient(120deg,rgba(201,168,76,0.08),rgba(26,107,60,0.08))', border: '1px solid rgba(201,168,76,0.25)' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }, children: "\uD83D\uDD13 You have Free membership" }), _jsx("div", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: "Enroll in any course to unlock Premium \u2014 Student ID, certificates, progress tracking & more." })] }), _jsx(Link, { to: "/courses", className: "btn btn-gold btn-sm", children: "Browse Courses \u2192" })] })), _jsx("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 16 }, children: TABS.map(t => (_jsxs("button", { onClick: () => { setTab(t.id); setMsg(null); }, className: `btn btn-sm ${tab === t.id ? 'btn-gold' : 'btn-outline'}`, children: [t.icon, " ", t.label] }, t.id))) }), tab === 'overview' && _jsx(OverviewTab, { user: user, enrollments: enrollments, certificates: certificates, quizResults: quizResults, payments: payments, signalActive: signalActive, isPremium: isPremium }), tab === 'courses' && _jsx(CoursesTab, { enrollments: enrollments }), tab === 'quizzes' && _jsx(QuizzesTab, { quizResults: quizResults }), tab === 'certificates' && _jsx(CertsTab, { certificates: certificates }), tab === 'payments' && _jsx(PaymentsTab, { payments: payments }), tab === 'settings' && (_jsx(SettingsTab, { form: settingsForm, setForm: setSettingsForm, onSave: saveProfile, pwForm: pwForm, setPwForm: setPwForm, onPw: changePassword, saving: saving, msg: msg }))] }) }));
}
/* ---- Overview ---- */
function OverviewTab({ user, enrollments, certificates, quizResults, payments, signalActive, isPremium }) {
    const avgScore = quizResults.length ? Math.round(quizResults.reduce((s, q) => s + q.score, 0) / quizResults.length) : null;
    const active = user.signalSubUntil ? new Date(user.signalSubUntil) > new Date() : false;
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }, children: [_jsx(InfoCard, { icon: "\uD83D\uDCDA", title: "Enrolled Courses", value: enrollments.length, sub: `${enrollments.filter((e) => e.pct === 100).length} completed`, tint: "#c9a84c" }), _jsx(InfoCard, { icon: "\uD83C\uDF93", title: "Certificates", value: certificates.length, sub: "earned so far", tint: "#4caf50" }), _jsx(InfoCard, { icon: "\uD83D\uDCDD", title: "Avg Quiz Score", value: avgScore !== null ? `${avgScore}%` : '—', sub: `${quizResults.length} quizzes taken`, tint: "#4aa3d4" }), _jsx(InfoCard, { icon: "\uD83D\uDCE1", title: "Signal Access", value: signalActive ? 'Active' : 'Inactive', sub: active ? `Until ${new Date(user.signalSubUntil).toLocaleDateString('en-GB')}` : user.tier === 'vvip' ? 'VVIP lifetime' : 'Subscribe for $5/mo', tint: signalActive ? '#0ecb81' : '#f6465d' })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }, className: "mem-grid", children: [_jsx(MembershipCard, { tier: "free", active: true }), _jsx(MembershipCard, { tier: "premium", active: isPremium })] }), enrollments.length > 0 && (_jsxs("div", { className: "card", children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 16 }, children: "Course Progress" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: enrollments.slice(0, 4).map((e) => (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.84rem' }, children: [_jsx("span", { children: e.title }), _jsxs("span", { style: { color: e.pct === 100 ? 'var(--up)' : '#c9a84c', fontWeight: 700 }, children: [e.pct, "%"] })] }), _jsx("div", { className: "progress-bar-wrap", children: _jsx("div", { className: "progress-bar-fill", style: { width: `${e.pct}%` } }) })] }, e.courseId))) })] }))] }));
}
/* ---- Courses tab ---- */
function CoursesTab({ enrollments }) {
    if (!enrollments.length)
        return _jsx(Empty, { icon: "\uD83D\uDCDA", text: "You haven't enrolled in any courses yet.", action: _jsx(Link, { to: "/courses", className: "btn btn-gold btn-sm", children: "Browse Courses" }) });
    return (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: enrollments.map((e) => (_jsxs("div", { className: "card", style: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }, children: [_jsx("div", { style: { width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,rgba(26,107,60,0.3),rgba(201,168,76,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }, children: "\uD83D\uDCDA" }), _jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [_jsx("div", { style: { fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: e.title }), _jsxs("div", { style: { fontSize: '0.78rem', color: '#9a9a9a', marginBottom: 8 }, children: [e.watched, "/", e.totalLessons, " lessons \u00B7 enrolled ", new Date(e.enrolledAt).toLocaleDateString('en-GB')] }), _jsx("div", { className: "progress-bar-wrap", style: { height: 7 }, children: _jsx("div", { className: "progress-bar-fill", style: { width: `${e.pct}%` } }) })] }), _jsxs("div", { style: { textAlign: 'right', flexShrink: 0 }, children: [_jsxs("div", { style: { fontSize: '1.4rem', fontWeight: 800, color: e.pct === 100 ? 'var(--up)' : '#c9a84c' }, children: [e.pct, "%"] }), _jsx("div", { style: { fontSize: '0.72rem', color: '#9a9a9a' }, children: e.pct === 100 ? '✅ Done' : 'In progress' })] }), _jsx(Link, { to: `/courses/${e.courseId}`, className: "btn btn-outline btn-sm", children: "Continue \u2192" })] }, e.courseId))) }));
}
/* ---- Quiz scores ---- */
function QuizzesTab({ quizResults }) {
    if (!quizResults.length)
        return _jsx(Empty, { icon: "\uD83D\uDCDD", text: "No quiz attempts yet.", action: _jsx(Link, { to: "/courses", className: "btn btn-gold btn-sm", children: "Start Learning" }) });
    const avg = Math.round(quizResults.reduce((s, q) => s + q.score, 0) / quizResults.length);
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs("div", { style: { display: 'flex', gap: 16, flexWrap: 'wrap' }, children: [_jsx(InfoCard, { icon: "\uD83D\uDCCA", title: "Average Score", value: `${avg}%`, sub: `${quizResults.length} attempts`, tint: "#c9a84c" }), _jsx(InfoCard, { icon: "\uD83C\uDFC6", title: "Best Score", value: `${Math.max(...quizResults.map((q) => q.score))}%`, sub: "highest attempt", tint: "#0ecb81" }), _jsx(InfoCard, { icon: "\uD83D\uDCDD", title: "Total Quizzes", value: quizResults.length, sub: "completed", tint: "#4aa3d4" })] }), _jsxs("div", { className: "card card-premium", children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 16 }, children: "All Quiz Attempts" }), _jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Quiz" }), _jsx("th", { children: "Score" }), _jsx("th", { children: "Grade" }), _jsx("th", { children: "Date" })] }) }), _jsx("tbody", { children: quizResults.map((q) => {
                                        const grade = q.score >= 80 ? 'Excellent' : q.score >= 60 ? 'Pass' : 'Retry';
                                        const col = q.score >= 80 ? 'var(--up)' : q.score >= 60 ? '#c9a84c' : 'var(--down)';
                                        return (_jsxs("tr", { children: [_jsxs("td", { children: ["Quiz #", q.quizId] }), _jsxs("td", { className: "mono", style: { color: col, fontWeight: 700 }, children: [q.score, "%"] }), _jsx("td", { children: _jsx("span", { style: { fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20, color: col, background: `${col}18`, border: `1px solid ${col}33` }, children: grade }) }), _jsx("td", { style: { color: '#9a9a9a', fontSize: '0.82rem' }, children: new Date(q.createdAt).toLocaleDateString('en-GB') })] }, q.id));
                                    }) })] }) })] })] }));
}
/* ---- Certificates ---- */
function CertsTab({ certificates }) {
    if (!certificates.length)
        return _jsx(Empty, { icon: "\uD83C\uDF93", text: "No certificates yet. Complete a course to earn one.", action: _jsx(Link, { to: "/courses", className: "btn btn-gold btn-sm", children: "Browse Courses" }) });
    return (_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }, children: certificates.map((c) => (_jsxs("div", { className: "card card-premium", style: { background: 'linear-gradient(135deg,rgba(201,168,76,0.1),rgba(26,107,60,0.08))' }, children: [_jsx("div", { style: { fontSize: '2.5rem', marginBottom: 10 }, children: "\uD83C\uDF93" }), _jsx("div", { style: { fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }, children: c.courseName || 'Course Certificate' }), _jsx("div", { className: "mono", style: { fontSize: '0.74rem', color: '#c9a84c', marginBottom: 10 }, children: c.certCode }), _jsxs("div", { style: { fontSize: '0.76rem', color: '#9a9a9a', marginBottom: 14 }, children: ["Issued ", new Date(c.createdAt).toLocaleDateString('en-GB')] }), _jsx("a", { href: `/certs/${c.filename}`, target: "_blank", rel: "noreferrer", className: "btn btn-gold btn-sm", style: { width: '100%', textAlign: 'center' }, children: "Download PDF" })] }, c.id))) }));
}
/* ---- Payments ---- */
function PaymentsTab({ payments }) {
    if (!payments.length)
        return _jsx(Empty, { icon: "\uD83D\uDCB3", text: "No payment history yet." });
    const purposeLabel = { premium: 'Premium Membership', vvip: 'VVIP Membership', signal_sub: 'Signal Subscription', course: 'Course Enrollment' };
    return (_jsxs("div", { className: "card card-premium", children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 16 }, children: "Payment History" }), _jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Description" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Status" })] }) }), _jsx("tbody", { children: payments.map((p) => (_jsxs("tr", { children: [_jsx("td", { style: { color: '#9a9a9a', fontSize: '0.82rem' }, children: new Date(p.createdAt).toLocaleDateString('en-GB') }), _jsx("td", { children: purposeLabel[p.purpose] || p.purpose }), _jsxs("td", { className: "mono", style: { color: 'var(--up)', fontWeight: 700 }, children: ["$", p.amount.toFixed(2)] }), _jsx("td", { children: _jsx("span", { style: { fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, color: 'var(--up)', background: 'rgba(14,203,129,0.1)', border: '1px solid rgba(14,203,129,0.25)' }, children: p.status || 'completed' }) })] }, p.id))) })] }) })] }));
}
/* ---- Settings ---- */
function SettingsTab({ form, setForm, onSave, pwForm, setPwForm, onPw, saving, msg }) {
    return (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }, className: "settings-grid", children: [_jsxs("div", { className: "card card-premium", children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 20 }, children: "Profile Information" }), _jsxs("form", { onSubmit: onSave, style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("label", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: ["Full Name", _jsx("input", { className: "form-input", style: { marginTop: 6, width: '100%' }, value: form.name, onChange: e => setForm((f) => ({ ...f, name: e.target.value })), required: true })] }), _jsxs("label", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: ["Phone Number", _jsx("input", { className: "form-input", style: { marginTop: 6, width: '100%' }, value: form.phone, onChange: e => setForm((f) => ({ ...f, phone: e.target.value })), placeholder: "Optional" })] }), msg && _jsx("div", { style: { fontSize: '0.82rem', color: msg.ok ? 'var(--up)' : 'var(--down)', padding: '8px 12px', borderRadius: 8, background: msg.ok ? 'rgba(14,203,129,0.08)' : 'rgba(246,70,93,0.08)' }, children: msg.text }), _jsx("button", { type: "submit", className: "btn btn-gold", disabled: saving, children: saving ? 'Saving…' : 'Save Changes' })] })] }), _jsxs("div", { className: "card card-premium", children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 20 }, children: "Change Password" }), _jsxs("form", { onSubmit: onPw, style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("label", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: ["Current Password", _jsx("input", { type: "password", className: "form-input", style: { marginTop: 6, width: '100%' }, value: pwForm.current, onChange: e => setPwForm((f) => ({ ...f, current: e.target.value })), required: true })] }), _jsxs("label", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: ["New Password", _jsx("input", { type: "password", className: "form-input", style: { marginTop: 6, width: '100%' }, value: pwForm.next, onChange: e => setPwForm((f) => ({ ...f, next: e.target.value })), required: true })] }), _jsxs("label", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: ["Confirm New Password", _jsx("input", { type: "password", className: "form-input", style: { marginTop: 6, width: '100%' }, value: pwForm.confirm, onChange: e => setPwForm((f) => ({ ...f, confirm: e.target.value })), required: true })] }), _jsx("button", { type: "submit", className: "btn btn-outline", disabled: saving, children: saving ? 'Saving…' : 'Change Password' })] })] }), _jsx("style", { children: `@media(max-width:700px){.settings-grid{grid-template-columns:1fr!important}}` })] }));
}
/* ---- Membership feature cards ---- */
function MembershipCard({ tier, active }) {
    const isPrem = tier === 'premium';
    const features = isPrem
        ? ['Official AFRIFX Student ID Card', 'Unique Certificate Number', 'Personal Student Dashboard', 'Progress Tracking', 'Course Completion Certificate', 'Lifetime access to courses']
        : ['Free account registration', 'Selected educational articles', 'Community announcements', 'Newsletters & trading tips'];
    return (_jsxs("div", { className: "card", style: { border: active && isPrem ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.08)', opacity: !active && isPrem ? 0.7 : 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 800, fontSize: '1rem' }, children: isPrem ? '⭐ Premium' : '🔓 Free' }), _jsx("div", { style: { fontSize: '0.74rem', color: '#9a9a9a' }, children: isPrem ? 'Enrolled students' : 'All registered users' })] }), active && _jsx("span", { style: { fontSize: '0.66rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: isPrem ? '#c9a84c' : 'var(--up)', background: isPrem ? 'rgba(201,168,76,0.12)' : 'rgba(14,203,129,0.12)', border: isPrem ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(14,203,129,0.3)' }, children: "ACTIVE" })] }), _jsx("ul", { style: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }, children: features.map(f => (_jsxs("li", { style: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: '#c8c8c8' }, children: [_jsx("span", { style: { color: isPrem ? '#c9a84c' : 'var(--up)', flexShrink: 0 }, children: "\u2713" }), f] }, f))) }), isPrem && !active && (_jsx(Link, { to: "/courses", className: "btn btn-gold btn-sm", style: { marginTop: 14, width: '100%', textAlign: 'center' }, children: "Enroll in a Course \u2192" }))] }));
}
/* ---- Helpers ---- */
function StatPill({ icon, value, label }) {
    return (_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '0.8rem' }, children: icon }), _jsx("div", { style: { fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1 }, children: value }), _jsx("div", { style: { fontSize: '0.68rem', color: '#9a9a9a' }, children: label })] }));
}
function InfoCard({ icon, title, value, sub, tint }) {
    return (_jsxs("div", { className: "card card-hover", style: { position: 'relative', overflow: 'hidden' }, children: [_jsx("div", { style: { position: 'absolute', right: -16, top: -16, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle,${tint}22,transparent 70%)` } }), _jsx("div", { style: { width: 42, height: 42, borderRadius: 12, background: `${tint}1a`, border: `1px solid ${tint}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }, children: icon }), _jsx("div", { style: { fontSize: '1.7rem', fontWeight: 800, lineHeight: 1 }, children: value }), _jsx("div", { style: { fontSize: '0.76rem', color: tint, fontWeight: 600, marginTop: 4 }, children: title }), _jsx("div", { style: { fontSize: '0.72rem', color: '#9a9a9a', marginTop: 2 }, children: sub })] }));
}
function Empty({ icon, text, action }) {
    return (_jsxs("div", { className: "card", style: { textAlign: 'center', padding: '48px 24px' }, children: [_jsx("div", { style: { fontSize: '3rem', marginBottom: 12 }, children: icon }), _jsx("p", { style: { color: '#9a9a9a', marginBottom: action ? 16 : 0 }, children: text }), action] }));
}
