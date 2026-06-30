import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
export default function AdminStudent() {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [issuing, setIssuing] = useState(null);
    const [newPw, setNewPw] = useState('');
    const [pwMsg, setPwMsg] = useState('');
    useEffect(() => { api.adminStudent(Number(id)).then(setStudent); }, [id]);
    async function issue(courseId) {
        setIssuing(courseId);
        try {
            await api.issueCert({ userId: id, courseId });
            alert('Certificate issued!');
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setIssuing(null);
        }
    }
    async function resetPw() {
        if (newPw.length < 6) {
            setPwMsg('Password must be at least 6 characters');
            return;
        }
        try {
            await api.resetStudentPassword(Number(id), newPw);
            setPwMsg('Password reset successfully!');
            setNewPw('');
        }
        catch (e) {
            setPwMsg(e.message);
        }
    }
    async function toggleRole() {
        const next = student.role === 'instructor' ? 'student' : 'instructor';
        if (!confirm(next === 'instructor' ? 'Promote this member to Instructor? They will be able to host meetings.' : 'Demote this instructor back to Student?'))
            return;
        try {
            await api.setStudentRole(Number(id), next);
            setStudent({ ...student, role: next });
        }
        catch (e) {
            alert(e.message);
        }
    }
    if (!student)
        return _jsx(DashboardLayout, { title: "Student", children: _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) });
    return (_jsxs(DashboardLayout, { title: student.name, subtitle: "Student profile, progress and account actions.", children: [_jsx(Link, { to: "/admin/students", style: { color: '#9a9a9a', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }, children: "\u2190 Back to Students" }), _jsxs("div", { className: "card card-premium", style: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }, children: [_jsx("div", { style: { width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, flexShrink: 0 }, children: student.name[0] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h1", { style: { fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }, children: student.name }), _jsxs("p", { style: { color: '#9a9a9a', fontSize: '0.88rem' }, children: [student.email, " ", student.phone && `· ${student.phone}`] }), _jsxs("div", { style: { marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '5px 12px' }, children: [_jsx("span", { style: { fontSize: '0.7rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }, children: "Student ID" }), _jsx("span", { style: { fontFamily: 'monospace', fontWeight: 700, color: '#c9a84c' }, children: student.studentId || '—' })] }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }, children: [student.role === 'instructor' && _jsx("span", { className: "badge", style: { background: 'rgba(34,158,217,0.15)', color: '#4aa3d4', border: '1px solid rgba(34,158,217,0.4)' }, children: "\uD83C\uDFA4 Instructor" }), _jsxs("span", { className: "badge badge-gold", children: [student.enrollments.length, " courses"] }), _jsxs("span", { className: "badge badge-green", children: [student.certificates.length, " certs"] }), _jsxs("span", { className: "badge badge-gray", children: [student.progress.length, " lessons watched"] }), _jsx("button", { className: "btn btn-outline btn-sm", onClick: toggleRole, children: student.role === 'instructor' ? '↓ Demote to Student' : '↑ Make Instructor' })] })] }), _jsxs("div", { style: { fontSize: '0.8rem', color: '#9a9a9a' }, children: ["Joined ", new Date(student.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })] })] }), _jsxs("div", { className: "card", style: { marginBottom: 24 }, children: [_jsx("h2", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 16 }, children: "Enrolled Courses" }), student.enrollments.length === 0 ? _jsx("p", { style: { color: '#9a9a9a' }, children: "No enrollments yet." }) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: student.enrollments.map((en) => {
                            const allLessons = en.course.modules.flatMap((m) => m.lessons);
                            const watched = student.progress.filter((p) => allLessons.some((l) => l.id === p.lessonId)).length;
                            const pct = allLessons.length ? Math.round(watched / allLessons.length * 100) : 0;
                            const hasCert = student.certificates.some((c) => c.courseId === en.courseId);
                            return (_jsxs("div", { style: { padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }, children: [_jsxs("div", { children: [_jsx("h3", { style: { fontWeight: 600, fontSize: '0.95rem' }, children: en.course.title }), _jsxs("p", { style: { fontSize: '0.78rem', color: '#9a9a9a', marginTop: 2 }, children: [watched, "/", allLessons.length, " lessons \u00B7 ", pct, "% complete"] })] }), _jsxs("div", { style: { display: 'flex', gap: 8, alignItems: 'center' }, children: [en.completedAt && _jsx("span", { className: "badge badge-green", children: "Completed" }), !hasCert && en.completedAt && (_jsx("button", { className: "btn btn-gold btn-sm", onClick: () => issue(en.courseId), disabled: issuing === en.courseId, children: issuing === en.courseId ? 'Issuing...' : '🎓 Issue Cert' })), hasCert && _jsx("span", { className: "badge badge-gold", children: "\uD83C\uDF93 Cert Issued" })] })] }), _jsx("div", { className: "progress-bar-wrap", children: _jsx("div", { className: "progress-bar-fill", style: { width: `${pct}%` } }) })] }, en.id));
                        }) }))] }), _jsxs("div", { className: "card", style: { marginBottom: 24 }, children: [_jsx("h2", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 12 }, children: "\uD83D\uDD11 Reset Student Password" }), pwMsg && _jsx("div", { className: `alert ${pwMsg.includes('success') ? 'alert-success' : 'alert-error'}`, children: pwMsg }), _jsxs("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx("input", { type: "text", value: newPw, onChange: e => setNewPw(e.target.value), placeholder: "New password (min. 6 chars)", style: { flex: 1, minWidth: 220, padding: '11px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: '0.9rem', outline: 'none' } }), _jsx("button", { className: "btn btn-outline", onClick: resetPw, children: "Reset Password" })] })] }), student.quizResults.length > 0 && (_jsxs("div", { className: "card", children: [_jsx("h2", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 16 }, children: "Quiz Results" }), _jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Module" }), _jsx("th", { children: "Score" }), _jsx("th", { children: "Date" })] }) }), _jsx("tbody", { children: student.quizResults.map((r) => (_jsxs("tr", { children: [_jsx("td", { children: r.quiz.module.title }), _jsx("td", { children: _jsxs("span", { className: `badge ${r.score >= 60 ? 'badge-green' : 'badge-gray'}`, children: [r.score, "%"] }) }), _jsx("td", { style: { color: '#9a9a9a', fontSize: '0.82rem' }, children: new Date(r.takenAt).toLocaleDateString() })] }, r.id))) })] }) })] }))] }));
}
