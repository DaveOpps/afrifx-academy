import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
export default function AdminAnnouncements() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: '', body: '', pinned: false, emailAll: false });
    const [saving, setSaving] = useState(false);
    const load = () => api.allAnnouncements().then(setList).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);
    async function create() {
        if (!form.title || !form.body)
            return alert('Title and message required');
        setSaving(true);
        try {
            await api.createAnnouncement(form);
            setForm({ title: '', body: '', pinned: false, emailAll: false });
            load();
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setSaving(false);
        }
    }
    async function remove(id) {
        if (!confirm('Delete this announcement?'))
            return;
        await api.deleteAnnouncement(id);
        load();
    }
    return (_jsx(DashboardLayout, { title: "Announcements & Notifications", subtitle: "Post updates that appear in every student's notification bell.", children: _jsxs("div", { style: { maxWidth: 820 }, children: [_jsxs("div", { className: "card card-premium", style: { marginBottom: 28 }, children: [_jsx("h2", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 16 }, children: "New Announcement" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Title" }), _jsx("input", { value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "e.g. New Crypto Course Launched!" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Message" }), _jsx("textarea", { value: form.body, onChange: e => setForm({ ...form, body: e.target.value }), rows: 3, placeholder: "Write your announcement...", style: { resize: 'vertical' } })] }), _jsxs("div", { style: { display: 'flex', gap: 24, flexWrap: 'wrap' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem', color: '#d0d0d0' }, children: [_jsx("input", { type: "checkbox", checked: form.pinned, onChange: e => setForm({ ...form, pinned: e.target.checked }), style: { accentColor: '#c9a84c' } }), " \uD83D\uDCCC Pin to top"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem', color: '#d0d0d0' }, children: [_jsx("input", { type: "checkbox", checked: form.emailAll, onChange: e => setForm({ ...form, emailAll: e.target.checked }), style: { accentColor: '#c9a84c' } }), " \uD83D\uDCE7 Also email all students"] })] }), _jsx("button", { className: "btn btn-gold", onClick: create, disabled: saving, style: { alignSelf: 'flex-start' }, children: saving ? 'Posting...' : '📢 Post Announcement' })] })] }), loading ? _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) : (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [list.length === 0 && _jsx("p", { style: { color: '#9a9a9a', textAlign: 'center', padding: 24 }, children: "No announcements yet." }), list.map(a => (_jsxs("div", { className: "card", style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }, children: [a.pinned && _jsx("span", { className: "badge badge-gold", children: "\uD83D\uDCCC Pinned" }), _jsx("h3", { style: { fontWeight: 700, fontSize: '0.95rem' }, children: a.title })] }), _jsx("p", { style: { fontSize: '0.86rem', color: '#b0b0b0', lineHeight: 1.6, marginBottom: 8 }, children: a.body }), _jsxs("div", { style: { fontSize: '0.75rem', color: '#777' }, children: [new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), " \u00B7 \uD83D\uDC41 Read by ", a._count.reads, " students"] })] }), _jsx("button", { className: "btn btn-sm", style: { background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ef5350' }, onClick: () => remove(a.id), children: "Delete" })] }, a.id)))] }))] }) }));
}
