import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
const TABS = [
    { id: 'all', label: 'All' },
    { id: 'ib', label: 'IB Partnership' },
    { id: 'seminar', label: 'Seminar / Event' },
];
const STATUS_COLOR = {
    new: '#c9a84c', reviewed: '#4aa3d4', approved: '#4caf50', declined: '#ef5350',
};
export default function AdminApplications() {
    const [apps, setApps] = useState([]);
    const [tab, setTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(null);
    const load = () => api.listApplications().then(setApps).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);
    async function setStatus(id, status) {
        await api.setApplicationStatus(id, status);
        load();
    }
    async function remove(id) {
        if (!confirm('Delete this application?'))
            return;
        await api.deleteApplication(id);
        load();
    }
    const filtered = tab === 'all' ? apps : apps.filter(a => a.type === tab);
    const newCount = apps.filter(a => a.status === 'new').length;
    return (_jsxs(DashboardLayout, { title: "Applications", subtitle: `${newCount} new submission${newCount === 1 ? '' : 's'} from partnership forms.`, children: [_jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }, children: TABS.map(t => (_jsxs("button", { onClick: () => setTab(t.id), className: `btn btn-sm ${tab === t.id ? 'btn-gold' : 'btn-outline'}`, children: [t.label, " ", t.id !== 'all' && `(${apps.filter(a => a.type === t.id).length})`] }, t.id))) }), loading ? _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) : filtered.length === 0 ? (_jsx("div", { className: "card", style: { textAlign: 'center', padding: 40 }, children: _jsxs("p", { style: { color: '#9a9a9a' }, children: ["No applications ", tab !== 'all' ? 'in this category' : 'yet', "."] }) })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: filtered.map(a => (_jsxs("div", { className: "card", style: { borderLeft: `3px solid ${STATUS_COLOR[a.status] || '#9a9a9a'}` }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("span", { style: { fontSize: '1.4rem' }, children: a.type === 'ib' ? '🤝' : '🎤' }), _jsxs("div", { children: [_jsxs("div", { style: { fontWeight: 700 }, children: [a.name, " ", _jsx("span", { style: { fontSize: '0.72rem', color: '#9a9a9a', textTransform: 'uppercase', marginLeft: 6 }, children: a.type === 'ib' ? 'IB' : 'Seminar' })] }), _jsxs("div", { style: { fontSize: '0.8rem', color: '#9a9a9a' }, children: [a.email, a.phone ? ` · ${a.phone}` : '', " \u00B7 ", new Date(a.createdAt).toLocaleDateString('en-GB')] })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: STATUS_COLOR[a.status], background: `${STATUS_COLOR[a.status]}1a`, border: `1px solid ${STATUS_COLOR[a.status]}55`, padding: '3px 10px', borderRadius: 20 }, children: a.status }), _jsx("button", { className: "btn btn-sm btn-outline", onClick: () => setOpen(open === a.id ? null : a.id), children: open === a.id ? 'Hide' : 'View' })] })] }), open === a.id && (_jsxs("div", { style: { marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }, children: [_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 16 }, children: Object.entries(a.data || {}).map(([k, v]) => (_jsxs("div", { style: { background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }, children: [_jsx("div", { style: { fontSize: '0.7rem', color: '#9a9a9a', textTransform: 'capitalize', marginBottom: 2 }, children: k.replace(/([A-Z])/g, ' $1') }), _jsx("div", { style: { fontSize: '0.88rem', fontWeight: 600 }, children: String(v) || '—' })] }, k))) }), _jsxs("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: [_jsx("button", { className: "btn btn-sm btn-outline", onClick: () => setStatus(a.id, 'reviewed'), children: "Mark Reviewed" }), _jsx("button", { className: "btn btn-sm", style: { background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.4)', color: '#4caf50' }, onClick: () => setStatus(a.id, 'approved'), children: "Approve" }), _jsx("button", { className: "btn btn-sm", style: { background: 'rgba(239,83,80,0.12)', border: '1px solid rgba(239,83,80,0.3)', color: '#ef5350' }, onClick: () => setStatus(a.id, 'declined'), children: "Decline" }), _jsx("a", { href: `mailto:${a.email}`, className: "btn btn-sm btn-gold", children: "Reply" }), _jsx("button", { className: "btn btn-sm btn-outline", style: { marginLeft: 'auto', color: '#ef5350', borderColor: '#ef5350' }, onClick: () => remove(a.id), children: "Delete" })] })] }))] }, a.id))) }))] }));
}
