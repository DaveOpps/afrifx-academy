import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [devUrl, setDevUrl] = useState('');
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.forgotPassword(email);
            setSent(true);
            if (res.devResetUrl)
                setDevUrl(res.devResetUrl);
        }
        catch { }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { style: { minHeight: '100vh', background: '#0d0d0d' }, children: [_jsx(Navbar, {}), _jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }, children: _jsxs("div", { style: { width: '100%', maxWidth: 400 }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 36 }, children: [_jsx("h1", { style: { fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }, children: "Forgot Password?" }), _jsx("p", { style: { color: '#9a9a9a', fontSize: '0.9rem' }, children: "Enter your email to receive a reset link." })] }), _jsx("div", { className: "card", style: { padding: 32 }, children: sent ? (_jsxs("div", { children: [_jsx("div", { className: "alert alert-success", children: "If that email exists, a reset link has been sent. Check your inbox." }), devUrl && (_jsxs("div", { style: { marginTop: 12, padding: 12, background: 'rgba(201,168,76,0.08)', borderRadius: 8, border: '1px solid rgba(201,168,76,0.25)' }, children: [_jsx("p", { style: { fontSize: '0.78rem', color: '#c9a84c', marginBottom: 6 }, children: "\uD83D\uDCDD Dev mode (email not configured) \u2014 use this link:" }), _jsx(Link, { to: devUrl.replace('http://localhost:5173', ''), style: { color: '#c9a84c', fontSize: '0.8rem', wordBreak: 'break-all' }, children: devUrl })] })), _jsx(Link, { to: "/login", className: "btn btn-outline", style: { width: '100%', marginTop: 16 }, children: "Back to Login" })] })) : (_jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: 18 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email Address" }), _jsx("input", { type: "email", required: true, value: email, onChange: e => setEmail(e.target.value), placeholder: "you@example.com" })] }), _jsx("button", { type: "submit", className: "btn btn-gold", disabled: loading, children: loading ? 'Sending...' : 'Send Reset Link →' }), _jsx(Link, { to: "/login", style: { textAlign: 'center', color: '#9a9a9a', fontSize: '0.85rem' }, children: "Back to Login" })] })) })] }) })] }));
}
