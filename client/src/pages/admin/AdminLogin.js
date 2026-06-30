import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import AuthShell from '../../components/AuthShell';
import PasswordInput from '../../components/PasswordInput';
export default function AdminLogin() {
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
            if (res.user.role !== 'admin') {
                setErr('Not an admin account');
                return;
            }
            login(res.token, res.user);
            nav('/admin');
        }
        catch (e) {
            setErr(e.message);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs(AuthShell, { heading: "Admin Portal", sub: "Sign in to manage AfriFX Academy.", children: [err && _jsx("div", { className: "alert alert-error", children: err }), _jsxs("form", { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: 18 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email" }), _jsx("input", { type: "email", required: true, value: form.email, onChange: e => setForm({ ...form, email: e.target.value }), placeholder: "admin@afrifx.com" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password" }), _jsx(PasswordInput, { required: true, value: form.password, onChange: v => setForm({ ...form, password: v }), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", autoComplete: "current-password" })] }), _jsx("button", { type: "submit", className: "btn btn-gold", disabled: loading, children: loading ? 'Logging in...' : 'Login as Admin →' })] })] }));
}
