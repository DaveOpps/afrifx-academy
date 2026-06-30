import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
export default function AdminCerts() {
    const [certs, setCerts] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ userId: '', courseId: '' });
    const [issuing, setIssuing] = useState(false);
    const load = () => Promise.all([api.adminCerts(), api.adminStudents(), api.getCourses()])
        .then(([c, s, co]) => { setCerts(c); setStudents(s); setCourses(co); })
        .finally(() => setLoading(false));
    useEffect(() => { load(); }, []);
    async function issue() {
        if (!form.userId || !form.courseId)
            return alert('Select student and course');
        setIssuing(true);
        try {
            await api.issueCert(form);
            load();
            setForm({ userId: '', courseId: '' });
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setIssuing(false);
        }
    }
    return (_jsxs(DashboardLayout, { title: "Certificate Management", subtitle: "Issue and track all certificates.", children: [_jsxs("div", { className: "card card-premium", style: { marginBottom: 28 }, children: [_jsx("h2", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 16 }, children: "Issue Certificate Manually" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Student" }), _jsxs("select", { value: form.userId, onChange: e => setForm({ ...form, userId: e.target.value }), children: [_jsx("option", { value: "", children: "Select student..." }), students.map(s => _jsxs("option", { value: s.id, children: [s.name, " (", s.email, ")"] }, s.id))] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Course" }), _jsxs("select", { value: form.courseId, onChange: e => setForm({ ...form, courseId: e.target.value }), children: [_jsx("option", { value: "", children: "Select course..." }), courses.map(c => _jsx("option", { value: c.id, children: c.title }, c.id))] })] }), _jsx("button", { className: "btn btn-gold", onClick: issue, disabled: issuing, children: issuing ? 'Issuing...' : '🎓 Issue' })] })] }), loading ? _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) : (_jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Student" }), _jsx("th", { children: "Course" }), _jsx("th", { children: "Issued" }), _jsx("th", { children: "PDF" })] }) }), _jsxs("tbody", { children: [certs.map(c => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { style: { fontWeight: 600 }, children: c.user.name }), _jsx("div", { style: { fontSize: '0.78rem', color: '#9a9a9a' }, children: c.user.email })] }), _jsx("td", { style: { fontSize: '0.88rem' }, children: c.course.title }), _jsx("td", { style: { color: '#9a9a9a', fontSize: '0.82rem' }, children: new Date(c.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }), _jsx("td", { children: c.fileUrl ? _jsx("a", { href: c.fileUrl, download: true, className: "btn btn-outline btn-sm", children: "\u2B07 PDF" }) : _jsx("span", { style: { color: '#666' }, children: "\u2014" }) })] }, c.id))), certs.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 4, style: { textAlign: 'center', color: '#9a9a9a', padding: 32 }, children: "No certificates issued yet." }) })] })] }) }))] }));
}
