import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, Fragment } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
const ROLE_STYLE = {
    admin: { bg: 'rgba(201,168,76,0.15)', color: '#c9a84c' },
    instructor: { bg: 'rgba(58,134,201,0.15)', color: '#3a86c9' },
    student: { bg: 'rgba(154,154,154,0.15)', color: '#9a9a9a' },
};
export default function AdminAccounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [openId, setOpenId] = useState(null);
    const [newPw, setNewPw] = useState('');
    const [msg, setMsg] = useState(null);
    const [saving, setSaving] = useState(false);
    const load = () => api.adminAccounts().then(setAccounts).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);
    const filtered = accounts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.email.toLowerCase().includes(search.toLowerCase()) ||
        a.role.toLowerCase().includes(search.toLowerCase()));
    function toggleRow(id) {
        setOpenId(openId === id ? null : id);
        setNewPw('');
        setMsg(null);
    }
    async function overridePassword(a) {
        if (newPw.length < 6) {
            setMsg({ id: a.id, text: 'Password must be at least 6 characters', ok: false });
            return;
        }
        if (!confirm(`Override the password for ${a.name} (${a.email})? They will need to use this new password to log in.`))
            return;
        setSaving(true);
        try {
            await api.resetStudentPassword(a.id, newPw);
            setMsg({ id: a.id, text: 'Password overridden successfully', ok: true });
            setNewPw('');
        }
        catch (e) {
            setMsg({ id: a.id, text: e.message, ok: false });
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsx(DashboardLayout, { title: `Accounts (${accounts.length})`, subtitle: "Every account on the platform \u2014 override any password if a student, instructor, or admin is locked out.", actions: _jsx("input", { placeholder: "Search name, email or role...", value: search, onChange: e => setSearch(e.target.value), style: { padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: '0.84rem', outline: 'none', width: 240 } }), children: loading ? _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) : (_jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Account" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Phone" }), _jsx("th", { children: "Joined" }), _jsx("th", {})] }) }), _jsxs("tbody", { children: [filtered.map(a => {
                                const rs = ROLE_STYLE[a.role] || ROLE_STYLE.student;
                                return (_jsxs(Fragment, { children: [_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }, children: a.name[0] }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, fontSize: '0.9rem' }, children: a.name }), _jsx("div", { style: { color: '#9a9a9a', fontSize: '0.78rem' }, children: a.email })] })] }) }), _jsx("td", { children: _jsx("span", { style: { background: rs.bg, color: rs.color, padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }, children: a.role }) }), _jsx("td", { style: { color: '#9a9a9a', fontSize: '0.84rem' }, children: a.phone || '—' }), _jsx("td", { style: { color: '#9a9a9a', fontSize: '0.82rem' }, children: new Date(a.createdAt).toLocaleDateString() }), _jsx("td", { children: _jsx("button", { className: "btn btn-outline btn-sm", onClick: () => toggleRow(a.id), children: openId === a.id ? 'Close' : '🔑 Override Password' }) })] }), openId === a.id && (_jsx("tr", { children: _jsx("td", { colSpan: 5, style: { padding: 0 }, children: _jsxs("div", { style: { padding: '14px 16px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsxs("div", { style: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }, children: [_jsx("input", { type: "text", value: newPw, onChange: e => setNewPw(e.target.value), placeholder: "New password (min. 6 chars)", style: { flex: 1, minWidth: 200, padding: '9px 12px', background: '#141418', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' } }), _jsx("button", { className: "btn btn-gold btn-sm", onClick: () => overridePassword(a), disabled: saving, children: saving ? 'Saving...' : 'Set New Password' })] }), msg && msg.id === a.id && _jsx("div", { style: { fontSize: '0.8rem', color: msg.ok ? 'var(--up)' : 'var(--down)' }, children: msg.text })] }) }) }))] }, a.id));
                            }), filtered.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 5, style: { textAlign: 'center', color: '#9a9a9a', padding: 32 }, children: "No accounts match your search." }) })] })] }) })) }));
}
