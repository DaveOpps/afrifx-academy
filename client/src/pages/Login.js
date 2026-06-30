import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import PasswordInput from '../components/PasswordInput';
export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            const res = await api.login(form);
            login(res.token, res.user);
            nav(res.user.role === 'admin' ? '/admin' : '/dashboard');
        }
        catch (e) {
            setErr(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs(AuthShell, { heading: "Welcome back", sub: "Login to continue your trading journey.", children: [err && _jsx("div", { className: "alert alert-error", children: err }), _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: 18 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email Address" }), _jsx("input", { type: "email", required: true, placeholder: "you@example.com", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password" }), _jsx(PasswordInput, { required: true, placeholder: "Your password", value: form.password, onChange: v => setForm({ ...form, password: v }), autoComplete: "current-password" })] }), _jsx("div", { style: { textAlign: 'right', marginTop: -6 }, children: _jsx(Link, { to: "/forgot", style: { color: '#9a9a9a', fontSize: '0.83rem' }, children: "Forgot password?" }) }), _jsx("button", { type: "submit", className: "btn btn-gold", disabled: loading, children: loading ? _jsxs(_Fragment, { children: [_jsx("span", { className: "spinner" }), " Logging in..."] }) : 'Login →' })] }), _jsxs("p", { style: { textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: '#9a9a9a' }, children: ["No account? ", _jsx(Link, { to: "/register", style: { color: '#c9a84c', fontWeight: 600 }, children: "Register free" })] }), _jsx("p", { style: { textAlign: 'center', marginTop: 10, fontSize: '0.82rem' }, children: _jsx(Link, { to: "/admin/login", style: { color: '#666' }, children: "Admin login \u2192" }) })] }));
}
