import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../api';
import PageShell from '../components/PageShell';
const WAYS = [
    ['🎤', 'Host Seminars'],
    ['📚', 'Teach Strategies'],
    ['💎', 'Sponsor Events'],
    ['💻', 'Run Webinars'],
    ['📢', 'Educational Campaigns'],
];
const TYPES = ['Host a Seminar', 'Teach a Strategy', 'Sponsor an Event', 'Run a Webinar', 'Educational Campaign', 'Other'];
export default function PartnerSeminar() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', org: '', collabType: TYPES[0], message: '' });
    const [sent, setSent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    async function submit(e) {
        e.preventDefault();
        setErr('');
        setBusy(true);
        try {
            await api.submitApplication({
                type: 'seminar', name: form.name, email: form.email, phone: form.phone,
                data: { org: form.org, collabType: form.collabType, message: form.message },
            });
            setSent(true);
        }
        catch (e) {
            setErr(e.message);
        }
        finally {
            setBusy(false);
        }
    }
    return (_jsxs(PageShell, { title: "Seminar & Event Collaboration", subtitle: "Partner with AFRIFX to host seminars, webinars, and educational campaigns.", children: [_jsxs("div", { className: "card", style: { marginBottom: 24 }, children: [_jsx("h2", { style: { fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }, children: "Ways to Collaborate" }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 12 }, children: WAYS.map(([icon, label]) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 50, fontSize: '0.86rem' }, children: [_jsx("span", { style: { fontSize: '1.2rem' }, children: icon }), label] }, label))) })] }), _jsx("div", { className: "card", style: { maxWidth: 620 }, children: sent ? (_jsxs("div", { style: { textAlign: 'center', padding: '32px 0' }, children: [_jsx("div", { style: { fontSize: '3rem', marginBottom: 12 }, children: "\u2705" }), _jsx("h3", { style: { marginBottom: 8 }, children: "Proposal Received!" }), _jsx("p", { style: { color: '#9a9a9a' }, children: "Thanks for your interest in collaborating. We'll review and reach out." })] })) : (_jsxs(_Fragment, { children: [_jsx("h2", { style: { fontSize: '1.05rem', fontWeight: 700, marginBottom: 18 }, children: "Submit a Collaboration Proposal" }), err && _jsx("div", { className: "alert alert-error", children: err }), _jsxs("form", { onSubmit: submit, style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Your Name *" }), _jsx("input", { required: true, value: form.name, onChange: e => setForm({ ...form, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Organization / Brand" }), _jsx("input", { value: form.org, onChange: e => setForm({ ...form, org: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email *" }), _jsx("input", { type: "email", required: true, value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Phone" }), _jsx("input", { value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Type of Collaboration" }), _jsx("select", { value: form.collabType, onChange: e => setForm({ ...form, collabType: e.target.value }), children: TYPES.map(t => _jsx("option", { children: t }, t)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Tell us more" }), _jsx("textarea", { rows: 4, value: form.message, onChange: e => setForm({ ...form, message: e.target.value }), placeholder: "Describe your seminar, event, or campaign idea...", style: { resize: 'vertical' } })] }), _jsx("button", { type: "submit", className: "btn btn-gold", disabled: busy, children: busy ? 'Submitting...' : 'Submit Proposal' })] })] })) })] }));
}
