import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import PasswordInput from '../components/PasswordInput';
export default function Register() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [err, setErr] = useState('');
    const [loading, setLoading] = useState(false);
    async function handleSubmit(e) {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            const res = await api.register(form);
            login(res.token, res.user);
            nav('/dashboard');
        }
        catch (e) {
            setErr(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs(AuthShell, { heading: "Create your account", sub: "Join thousands of African traders \u2014 it's free.", children: [err && _jsx("div", { className: "alert alert-error", children: err }), _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Full Name" }), _jsx("input", { required: true, placeholder: "Kofi Mensah Asante", value: form.name, onChange: e => setForm({ ...form, name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email Address" }), _jsx("input", { type: "email", required: true, placeholder: "you@example.com", value: form.email, onChange: e => setForm({ ...form, email: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password" }), _jsx(PasswordInput, { required: true, placeholder: "Min. 6 characters", value: form.password, onChange: v => setForm({ ...form, password: v }), autoComplete: "new-password" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Phone" }), _jsx("input", { required: true, placeholder: "+233 24 000 0000", value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }) })] }), _jsx("button", { type: "submit", className: "btn btn-gold", style: { marginTop: 4 }, disabled: loading, children: loading ? _jsxs(_Fragment, { children: [_jsx("span", { className: "spinner" }), " Creating account..."] }) : 'Create Account →' })] }), _jsxs("p", { style: { textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: '#9a9a9a' }, children: ["Already have an account? ", _jsx(Link, { to: "/login", style: { color: '#c9a84c', fontWeight: 600 }, children: "Login" })] })] }));
}
