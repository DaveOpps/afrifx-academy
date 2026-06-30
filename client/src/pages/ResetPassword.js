import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import PasswordInput from '../components/PasswordInput';
export default function ResetPassword() {
    const { token } = useParams();
    const nav = useNavigate();
    const [pw, setPw] = useState('');
    const [pw2, setPw2] = useState('');
    const [err, setErr] = useState('');
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setErr('');
        if (pw !== pw2)
            return setErr('Passwords do not match');
        if (pw.length < 6)
            return setErr('Password must be at least 6 characters');
        setLoading(true);
        try {
            await api.resetPassword(token, pw);
            setDone(true);
            setTimeout(() => nav('/login'), 2000);
        }
        catch (e) {
            setErr(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { style: { minHeight: '100vh', background: '#0d0d0d' }, children: [_jsx(Navbar, {}), _jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }, children: _jsxs("div", { style: { width: '100%', maxWidth: 400 }, children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: 36 }, children: [_jsx("h1", { style: { fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }, children: "Reset Password" }), _jsx("p", { style: { color: '#9a9a9a', fontSize: '0.9rem' }, children: "Choose a new password for your account." })] }), _jsx("div", { className: "card", style: { padding: 32 }, children: done ? (_jsx("div", { className: "alert alert-success", children: "\u2713 Password reset! Redirecting to login..." })) : (_jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: 18 }, children: [err && _jsx("div", { className: "alert alert-error", children: err }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "New Password" }), _jsx(PasswordInput, { required: true, value: pw, onChange: setPw, placeholder: "Min. 6 characters", autoComplete: "new-password" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Confirm Password" }), _jsx(PasswordInput, { required: true, value: pw2, onChange: setPw2, placeholder: "Re-enter password", autoComplete: "new-password" })] }), _jsx("button", { type: "submit", className: "btn btn-gold", disabled: loading, children: loading ? 'Resetting...' : 'Reset Password →' }), _jsx(Link, { to: "/login", style: { textAlign: 'center', color: '#9a9a9a', fontSize: '0.85rem' }, children: "Back to Login" })] })) })] }) })] }));
}
