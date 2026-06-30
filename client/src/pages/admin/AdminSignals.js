import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
const TYPES = ['Forex', 'Gold', 'Crypto', 'Indices'];
const EMPTY = { pair: '', type: 'Forex', direction: 'BUY', entry: '', stopLoss: '', tp1: '', tp2: '', tp3: '', notes: '' };
export default function AdminSignals() {
    const [signals, setSignals] = useState([]);
    const [form, setForm] = useState({ ...EMPTY });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [closing, setClosing] = useState({});
    const load = () => api.getSignals().then(setSignals).catch(() => { });
    useEffect(() => { load(); }, []);
    async function handleCreate(e) {
        e.preventDefault();
        setMsg('');
        setSaving(true);
        try {
            await api.createSignal(form);
            setForm({ ...EMPTY });
            setShowForm(false);
            load();
            setMsg('Signal posted!');
        }
        catch (err) {
            setMsg(err.message);
        }
        finally {
            setSaving(false);
        }
    }
    async function handleClose(id) {
        const d = closing[id] || {};
        try {
            await api.updateSignal(id, { status: 'closed', result: d.result || 'win', pips: d.pips || '' });
            load();
        }
        catch { }
    }
    async function handleCancel(id) {
        try {
            await api.updateSignal(id, { status: 'cancelled' });
            load();
        }
        catch { }
    }
    async function handleDelete(id) {
        if (!confirm('Delete this signal?'))
            return;
        try {
            await api.deleteSignal(id);
            load();
        }
        catch { }
    }
    return (_jsxs(DashboardLayout, { title: "Trading Signals", subtitle: `${signals.filter(s => s.status === 'active').length} active signals`, actions: _jsx("button", { className: "btn btn-gold btn-sm", onClick: () => setShowForm(!showForm), children: showForm ? 'Cancel' : '+ New Signal' }), children: [msg && _jsx("div", { className: "alert alert-success", style: { marginBottom: 20 }, children: msg }), showForm && (_jsxs("div", { className: "card", style: { marginBottom: 32 }, children: [_jsx("h2", { style: { fontWeight: 700, marginBottom: 20 }, children: "Post New Signal" }), _jsxs("form", { onSubmit: handleCreate, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 16 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Pair *" }), _jsx("input", { placeholder: "e.g. EURUSD, GOLD, BTCUSD", value: form.pair, onChange: e => setForm({ ...form, pair: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Type" }), _jsx("select", { value: form.type, onChange: e => setForm({ ...form, type: e.target.value }), style: { width: '100%', background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }, children: TYPES.map(t => _jsx("option", { children: t }, t)) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Direction" }), _jsxs("select", { value: form.direction, onChange: e => setForm({ ...form, direction: e.target.value }), style: { width: '100%', background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }, children: [_jsx("option", { children: "BUY" }), _jsx("option", { children: "SELL" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Entry *" }), _jsx("input", { placeholder: "1.0850", value: form.entry, onChange: e => setForm({ ...form, entry: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Stop Loss *" }), _jsx("input", { placeholder: "1.0800", value: form.stopLoss, onChange: e => setForm({ ...form, stopLoss: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "TP 1 *" }), _jsx("input", { placeholder: "1.0900", value: form.tp1, onChange: e => setForm({ ...form, tp1: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "TP 2" }), _jsx("input", { placeholder: "1.0950", value: form.tp2, onChange: e => setForm({ ...form, tp2: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "TP 3" }), _jsx("input", { placeholder: "1.1000", value: form.tp3, onChange: e => setForm({ ...form, tp3: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 20 }, children: [_jsx("label", { children: "Notes (optional)" }), _jsx("input", { placeholder: "e.g. Wait for London open confirmation", value: form.notes, onChange: e => setForm({ ...form, notes: e.target.value }) })] }), _jsx("button", { type: "submit", className: "btn btn-gold", disabled: saving, children: saving ? 'Posting...' : 'Post Signal' })] })] })), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: signals.length === 0 ? (_jsx("div", { className: "card", style: { textAlign: 'center', padding: 40 }, children: _jsx("p", { style: { color: '#9a9a9a' }, children: "No signals yet. Post your first signal above." }) })) : signals.map(s => (_jsxs("div", { className: "card", style: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', borderLeft: `3px solid ${s.direction === 'BUY' ? '#4caf50' : '#ef5350'}` }, children: [_jsxs("div", { style: { minWidth: 120 }, children: [_jsx("div", { style: { fontWeight: 800, fontSize: '1.05rem' }, children: s.pair }), _jsxs("div", { style: { fontSize: '0.75rem', color: '#9a9a9a' }, children: [s.type, " \u00B7 ", new Date(s.createdAt).toLocaleDateString('en-GB')] })] }), _jsx("span", { style: { padding: '3px 12px', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem', color: s.direction === 'BUY' ? '#4caf50' : '#ef5350', background: s.direction === 'BUY' ? 'rgba(76,175,80,0.12)' : 'rgba(239,83,80,0.12)' }, children: s.direction }), _jsxs("div", { style: { flex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.82rem' }, children: [_jsxs("span", { children: ["Entry: ", _jsx("b", { children: s.entry })] }), _jsxs("span", { children: ["SL: ", _jsx("b", { style: { color: '#ef5350' }, children: s.stopLoss })] }), _jsxs("span", { children: ["TP1: ", _jsx("b", { style: { color: '#4caf50' }, children: s.tp1 })] }), s.tp2 && _jsxs("span", { children: ["TP2: ", _jsx("b", { style: { color: '#4caf50' }, children: s.tp2 })] }), s.tp3 && _jsxs("span", { children: ["TP3: ", _jsx("b", { style: { color: '#4caf50' }, children: s.tp3 })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [s.status === 'active' && (_jsxs(_Fragment, { children: [_jsxs("select", { value: closing[s.id]?.result || 'win', onChange: e => setClosing(p => ({ ...p, [s.id]: { ...p[s.id], result: e.target.value } })), style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: '0.78rem' }, children: [_jsx("option", { value: "win", children: "Win" }), _jsx("option", { value: "loss", children: "Loss" }), _jsx("option", { value: "breakeven", children: "Breakeven" })] }), _jsx("input", { type: "number", placeholder: "pips", value: closing[s.id]?.pips || '', onChange: e => setClosing(p => ({ ...p, [s.id]: { ...p[s.id], pips: e.target.value } })), style: { width: 60, background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: '0.78rem' } }), _jsx("button", { className: "btn btn-sm btn-primary", onClick: () => handleClose(s.id), children: "Close" }), _jsx("button", { className: "btn btn-sm btn-outline", onClick: () => handleCancel(s.id), children: "Cancel" })] })), s.status !== 'active' && (_jsxs("span", { style: { fontSize: '0.8rem', color: s.status === 'closed' ? (s.result === 'win' ? '#4caf50' : '#ef5350') : '#9a9a9a', fontWeight: 600, textTransform: 'capitalize' }, children: [s.status, s.result ? ` · ${s.result}` : '', s.pips != null ? ` · ${s.pips}p` : ''] })), _jsx("button", { className: "btn btn-sm btn-outline", style: { color: '#ef5350', borderColor: '#ef5350' }, onClick: () => handleDelete(s.id), children: "Del" })] })] }, s.id))) })] }));
}
