import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
export default function Certificates() {
    const { user } = useAuth();
    const [certs, setCerts] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(null);
    useEffect(() => {
        Promise.all([api.myCerts(), api.myEnrollments()])
            .then(([c, e]) => { setCerts(c); setEnrollments(e); })
            .finally(() => setLoading(false));
    }, []);
    async function claim(courseId) {
        setClaiming(courseId);
        try {
            const c = await api.claimCert(courseId);
            setCerts(prev => [...prev.filter(x => x.courseId !== courseId), c]);
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setClaiming(null);
        }
    }
    const completed = enrollments.filter(e => e.completedAt);
    const certCourseIds = certs.map(c => c.courseId);
    return (_jsx(DashboardLayout, { title: "My Certificates", subtitle: "Download your certificates for completed courses.", children: loading ? (_jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) })) : (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 24 }, children: [completed.filter(e => !certCourseIds.includes(e.courseId)).map(e => (_jsxs("div", { className: "card", style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: 'rgba(26,107,60,0.08)', border: '1px solid rgba(26,107,60,0.3)' }, children: [_jsxs("div", { children: [_jsx("span", { className: "badge badge-green", style: { marginBottom: 8 }, children: "\u2705 Course Completed" }), _jsx("h3", { style: { fontSize: '1rem', fontWeight: 700 }, children: e.course.title }), _jsx("p", { style: { fontSize: '0.82rem', color: '#9a9a9a', marginTop: 4 }, children: "Certificate ready to claim!" })] }), _jsx("button", { className: "btn btn-gold", onClick: () => claim(e.courseId), disabled: claiming === e.courseId, children: claiming === e.courseId ? _jsxs(_Fragment, { children: [_jsx("span", { className: "spinner" }), " Generating..."] }) : '🎓 Claim Certificate' })] }, e.id))), certs.length === 0 && completed.length === 0 && (_jsxs("div", { className: "card", style: { textAlign: 'center', padding: 48 }, children: [_jsx("p", { style: { fontSize: '2.5rem', marginBottom: 12 }, children: "\uD83C\uDF93" }), _jsx("h3", { style: { marginBottom: 8 }, children: "No certificates yet" }), _jsx("p", { style: { color: '#9a9a9a' }, children: "Complete a course to earn your certificate" })] })), certs.map(cert => (_jsxs("div", { className: "card", style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx("div", { style: { width: 60, height: 60, borderRadius: 12, background: 'linear-gradient(135deg,#c9a84c,#a07828)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }, children: "\uD83C\uDF93" }), _jsxs("div", { children: [_jsx("h3", { style: { fontWeight: 700, marginBottom: 4 }, children: cert.course.title }), _jsxs("p", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: ["Issued ", new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })] }), _jsxs("p", { style: { fontSize: '0.78rem', color: '#666', marginTop: 2 }, children: ["Recipient: ", user?.name] })] })] }), cert.fileUrl && (_jsx("a", { href: cert.fileUrl, download: true, className: "btn btn-gold btn-sm", children: "\u2B07 Download PDF" }))] }, cert.id)))] })) }));
}
