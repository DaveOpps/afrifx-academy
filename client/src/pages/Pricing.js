import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import PageShell from '../components/PageShell';
const TIERS = [
    {
        id: 'free', name: 'Free', price: '$0', period: 'forever', tint: '#9a9a9a',
        features: [
            'Free account registration',
            'Selected educational articles',
            'Market updates & announcements',
            'Newsletters & trading tips',
        ],
        cta: 'Current Plan',
    },
    {
        id: 'premium', name: 'Premium', price: 'Per Course', period: 'paid courses', tint: '#4aa3d4', popular: true,
        features: [
            'Everything in Free',
            'Official AFRIFX Student ID Card',
            'Unique certificate number',
            'Personal dashboard & progress tracking',
            'Course completion certificates',
            'Lifetime access to purchased courses',
        ],
        cta: 'Get Premium',
    },
    {
        id: 'vvip', name: 'VVIP', price: '$50', period: 'one-time · lifetime', tint: '#c9a84c',
        features: [
            'Lifetime trading signals',
            'Lifetime course access',
            'Lifetime live trading sessions',
            'Exclusive strategies & weekly reviews',
            'VIP mentorship & trade challenges',
            'Priority support & private community',
            'Early access to new products',
        ],
        cta: 'Go VVIP — $50',
    },
];
export default function Pricing() {
    const { user, refresh } = useAuth();
    const nav = useNavigate();
    const [busy, setBusy] = useState('');
    const [msg, setMsg] = useState('');
    async function choose(tierId) {
        if (tierId === 'free')
            return;
        if (!user) {
            nav('/register');
            return;
        }
        if (!confirm(`Confirm upgrade to ${tierId.toUpperCase()}? (demo checkout — no real charge)`))
            return;
        setBusy(tierId);
        setMsg('');
        try {
            await api.upgradeTier(tierId);
            refresh();
            setMsg(`🎉 You are now on the ${tierId.toUpperCase()} plan!`);
        }
        catch (e) {
            setMsg(e.message);
        }
        finally {
            setBusy('');
        }
    }
    const currentTier = user?.tier || 'free';
    return (_jsxs(PageShell, { title: "Membership Plans", subtitle: "Choose the plan that fits your trading journey.", children: [msg && _jsx("div", { className: "alert alert-success", style: { marginBottom: 20 }, children: msg }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, alignItems: 'stretch' }, children: TIERS.map(t => {
                    const isCurrent = currentTier === t.id;
                    return (_jsxs("div", { className: `card ${t.popular ? 'card-premium' : ''}`, style: {
                            display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
                            border: t.popular ? '1.5px solid rgba(201,168,76,0.5)' : '1px solid rgba(255,255,255,0.07)',
                            boxShadow: t.popular ? '0 0 40px rgba(201,168,76,0.12)' : undefined,
                        }, children: [t.popular && _jsx("div", { style: { position: 'absolute', top: 0, right: 0, background: 'linear-gradient(135deg,#c9a84c,#a07828)', color: '#0d0d0d', fontSize: '0.68rem', fontWeight: 800, padding: '4px 14px', borderRadius: '0 0 0 10px', letterSpacing: 1 }, children: "POPULAR" }), _jsx("div", { style: { fontSize: '0.8rem', letterSpacing: 2, textTransform: 'uppercase', color: t.tint, fontWeight: 700, marginBottom: 10 }, children: t.name }), _jsx("div", { style: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }, children: _jsx("span", { style: { fontSize: '2.2rem', fontWeight: 800 }, children: t.price }) }), _jsx("div", { style: { fontSize: '0.8rem', color: '#9a9a9a', marginBottom: 20 }, children: t.period }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 10, flex: 1, marginBottom: 24 }, children: t.features.map(f => (_jsxs("div", { style: { display: 'flex', gap: 10, fontSize: '0.86rem', color: '#d0d0d0' }, children: [_jsx("span", { style: { color: t.tint, flexShrink: 0 }, children: "\u2713" }), f] }, f))) }), _jsx("button", { onClick: () => choose(t.id), disabled: isCurrent || busy === t.id, className: `btn ${t.popular || t.id === 'vvip' ? 'btn-gold' : 'btn-outline'}`, style: { width: '100%', opacity: isCurrent ? 0.5 : 1 }, children: isCurrent ? '✓ Current Plan' : busy === t.id ? 'Processing...' : t.cta })] }, t.id));
                }) }), _jsx("p", { style: { textAlign: 'center', color: '#666', fontSize: '0.8rem', marginTop: 28 }, children: "Payments are in demo mode. Mobile Money, Visa, Mastercard, PayPal & Stripe integrate here when you add your keys." })] }));
}
