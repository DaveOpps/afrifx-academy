import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../api';
import DashboardLayout from '../components/DashboardLayout';
const TYPES = ['All', 'Forex', 'Gold', 'Crypto', 'Indices'];
const STATUSES = ['All', 'active', 'closed', 'cancelled'];
const DIRECTION_STYLE = {
    BUY: { background: 'rgba(76,175,80,0.15)', color: '#0ecb81', border: '1px solid rgba(76,175,80,0.4)' },
    SELL: { background: 'rgba(239,83,80,0.15)', color: '#f6465d', border: '1px solid rgba(239,83,80,0.4)' },
};
const RESULT_BADGE = {
    win: '#0ecb81',
    loss: '#f6465d',
    breakeven: '#9a9a9a',
};
export default function Signals() {
    const [signals, setSignals] = useState([]);
    const [type, setType] = useState('All');
    const [status, setStatus] = useState('active');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (type !== 'All')
            params.set('type', type);
        if (status !== 'All')
            params.set('status', status);
        api.getSignals(params.toString())
            .then(s => setSignals(s))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [type, status]);
    return (_jsxs(DashboardLayout, { title: "Trading Signals", subtitle: "Daily Forex, Gold, Crypto and Indices signals from our expert analysts.", children: [_jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }, children: TYPES.map(t => (_jsx("button", { onClick: () => setType(t), className: `btn btn-sm ${type === t ? 'btn-gold' : 'btn-outline'}`, children: t }, t))) }), _jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }, children: STATUSES.map(s => (_jsx("button", { onClick: () => setStatus(s), className: `btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`, style: { textTransform: 'capitalize' }, children: s === 'All' ? 'All Status' : s }, s))) }), loading ? (_jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) })) : signals.length === 0 ? (_jsxs("div", { className: "card", style: { textAlign: 'center', padding: 48 }, children: [_jsx("p", { style: { fontSize: '2.5rem', marginBottom: 12 }, children: "\uD83D\uDCE1" }), _jsx("h3", { children: "No signals yet" }), _jsx("p", { style: { color: '#9a9a9a', marginTop: 8 }, children: "Check back soon \u2014 our analysts post signals daily." })] })) : (_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }, children: signals.map(s => (_jsxs("div", { className: "card", style: { position: 'relative', overflow: 'hidden' }, children: [_jsx("div", { style: { height: 3, background: s.direction === 'BUY' ? '#0ecb81' : '#f6465d', margin: '-24px -24px 20px' } }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, children: [_jsxs("div", { children: [_jsx("span", { style: { fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 800 }, children: s.pair }), _jsx("span", { style: { marginLeft: 8, fontSize: '0.72rem', color: '#9a9a9a', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 20 }, children: s.type })] }), _jsx("span", { style: { ...DIRECTION_STYLE[s.direction] || {}, padding: '4px 14px', borderRadius: 20, fontWeight: 700, fontSize: '0.85rem' }, children: s.direction })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }, children: [
                                ['Entry', s.entry],
                                ['Stop Loss', s.stopLoss],
                                ['TP 1', s.tp1],
                                ...(s.tp2 ? [['TP 2', s.tp2]] : []),
                                ...(s.tp3 ? [['TP 3', s.tp3]] : []),
                            ].map(([label, value]) => (_jsxs("div", { style: { background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: '8px 12px' }, children: [_jsx("div", { style: { fontSize: '0.7rem', color: '#9a9a9a', marginBottom: 2 }, children: label }), _jsx("div", { style: { fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }, children: value })] }, label))) }), s.notes && (_jsx("p", { style: { fontSize: '0.8rem', color: '#9a9a9a', marginBottom: 14, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }, children: s.notes })), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontSize: '0.72rem', color: '#666' }, children: new Date(s.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }), _jsxs("div", { style: { display: 'flex', gap: 6, alignItems: 'center' }, children: [s.status === 'active' && (_jsx("span", { style: { background: 'rgba(201,168,76,0.15)', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }, children: "\u25CF ACTIVE" })), s.status === 'cancelled' && (_jsx("span", { style: { background: 'rgba(154,154,154,0.15)', color: '#9a9a9a', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem' }, children: "CANCELLED" })), s.status === 'closed' && s.result && (_jsxs(_Fragment, { children: [_jsx("span", { style: { background: `rgba(${s.result === 'win' ? '76,175,80' : s.result === 'loss' ? '239,83,80' : '154,154,154'},0.15)`, color: RESULT_BADGE[s.result] || '#9a9a9a', padding: '2px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }, children: s.result }), s.pips != null && (_jsxs("span", { style: { color: s.result === 'win' ? '#0ecb81' : '#f6465d', fontWeight: 700, fontSize: '0.82rem' }, children: [s.result === 'win' ? '+' : '-', Math.abs(s.pips), " pips"] }))] }))] })] })] }, s.id))) }))] }));
}
