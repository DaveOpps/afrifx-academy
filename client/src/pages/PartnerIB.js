import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../api';
import PageShell from '../components/PageShell';
const BENEFITS = [
    ['💰', 'Revenue Sharing', 'Earn competitive commissions on referred trading volume.'],
    ['📣', 'Marketing Support', 'Get branded materials and campaign support.'],
    ['🎓', 'Training', 'Access partner training and onboarding resources.'],
    ['🤝', 'Partnership Opportunities', 'Grow with joint ventures and exclusive deals.'],
    ['🎤', 'Joint Seminars', 'Co-host events and webinars with AFRIFX.'],
    ['📈', 'Business Growth Support', 'Scale your IB business with our backing.'],
];
export default function PartnerIB() {
    const [form, setForm] = useState({
        name: '', email: '', phone: '',
        isIB: 'Yes', brokers: '', activeClients: '', africanClients: '', intlClients: '', volume: '',
    });
    const [sent, setSent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState('');
    async function submit(e) {
        e.preventDefault();
        setErr('');
        setBusy(true);
        try {
            await api.submitApplication({
                type: 'ib', name: form.name, email: form.email, phone: form.phone,
                data: {
                    isIB: form.isIB, brokers: form.brokers, activeClients: form.activeClients,
                    africanClients: form.africanClients, intlClients: form.intlClients, volume: form.volume,
                },
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
    return (_jsxs(PageShell, { title: "Introducing Broker (IB) Partnership", subtitle: "Partner with AFRIFX and grow your brokerage business.", children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }, className: "ib-grid", children: [_jsxs("div", { children: [_jsx("h2", { style: { fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }, children: "Partner Benefits" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: BENEFITS.map(([icon, title, desc]) => (_jsxs("div", { className: "card", style: { display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16 }, children: [_jsx("span", { style: { fontSize: '1.5rem', flexShrink: 0 }, children: icon }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, fontSize: '0.92rem' }, children: title }), _jsx("div", { style: { fontSize: '0.82rem', color: '#9a9a9a', marginTop: 2 }, children: desc })] })] }, title))) })] }), _jsx("div", { className: "card", children: sent ? (_jsxs("div", { style: { textAlign: 'center', padding: '32px 0' }, children: [_jsx("div", { style: { fontSize: '3rem', marginBottom: 12 }, children: "\u2705" }), _jsx("h3", { style: { marginBottom: 8 }, children: "Application Received!" }), _jsx("p", { style: { color: '#9a9a9a' }, children: "Thank you. Our partnerships team will be in touch soon." })] })) : (_jsxs(_Fragment, { children: [_jsx("h2", { style: { fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }, children: "Apply to Become a Partner" }), err && _jsx("div", { className: "alert alert-error", children: err }), _jsxs("form", { onSubmit: submit, style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Full Name *" }), _jsx("input", { required: true, value: form.name, onChange: e => setForm({ ...form, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email *" }), _jsx("input", { type: "email", required: true, value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Phone" }), _jsx("input", { value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), placeholder: "+233 ..." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Are you currently an IB?" }), _jsxs("select", { value: form.isIB, onChange: e => setForm({ ...form, isIB: e.target.value }), children: [_jsx("option", { children: "Yes" }), _jsx("option", { children: "No" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Which broker(s) do you represent?" }), _jsx("input", { value: form.brokers, onChange: e => setForm({ ...form, brokers: e.target.value }), placeholder: "e.g. Exness, XM" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Active Clients" }), _jsx("input", { type: "number", value: form.activeClients, onChange: e => setForm({ ...form, activeClients: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Monthly Volume (optional)" }), _jsx("input", { value: form.volume, onChange: e => setForm({ ...form, volume: e.target.value }), placeholder: "e.g. $2M" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "African Clients" }), _jsx("input", { type: "number", value: form.africanClients, onChange: e => setForm({ ...form, africanClients: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "International Clients" }), _jsx("input", { type: "number", value: form.intlClients, onChange: e => setForm({ ...form, intlClients: e.target.value }) })] })] }), _jsx("button", { type: "submit", className: "btn btn-gold", disabled: busy, children: busy ? 'Submitting...' : 'Submit Application' })] })] })) })] }), _jsx("style", { children: `@media (max-width: 820px){ .ib-grid { grid-template-columns: 1fr !important; } }` })] }));
}
