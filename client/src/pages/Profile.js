import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import PasswordInput from '../components/PasswordInput';
export default function Profile() {
    const { user, refresh } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [payments, setPayments] = useState([]);
    useEffect(() => { api.myPayments().then(setPayments).catch(() => { }); }, []);
    const signalActive = user?.tier === 'vvip' || (!!user?.signalSubUntil && new Date(user.signalSubUntil) > new Date());
    const tierLabel = user?.tier === 'vvip' ? 'VVIP' : user?.tier === 'premium' ? 'Premium' : 'Free';
    const tierColor = user?.tier === 'vvip' ? '#c9a84c' : user?.tier === 'premium' ? '#4aa3d4' : '#9a9a9a';
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState('');
    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            await api.updateMe(form);
            refresh();
            setMsg('Profile updated!');
        }
        catch (e) {
            setMsg(e.message);
        }
        finally {
            setSaving(false);
        }
    }
    async function handlePassword(e) {
        e.preventDefault();
        setPwMsg('');
        if (pwForm.newPassword !== pwForm.confirm) {
            setPwMsg('New passwords do not match');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwMsg('New password must be at least 6 characters');
            return;
        }
        setPwSaving(true);
        try {
            await api.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            setPwMsg('Password changed successfully!');
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
        }
        catch (e) {
            setPwMsg(e.message);
        }
        finally {
            setPwSaving(false);
        }
    }
    return (_jsx(DashboardLayout, { title: "My Profile", subtitle: "Update your personal information.", children: _jsxs("div", { style: { maxWidth: 560 }, children: [_jsxs("div", { className: "card card-premium", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }, children: [_jsx("div", { style: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 700, flexShrink: 0 }, children: user?.name?.[0] }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, fontSize: '1.05rem' }, children: user?.name }), _jsx("div", { style: { color: '#9a9a9a', fontSize: '0.88rem' }, children: user?.email }), _jsx("span", { className: "badge badge-green", style: { marginTop: 6 }, children: "Student" })] })] }), msg && _jsx("div", { className: `alert ${msg.includes('updated') ? 'alert-success' : 'alert-error'}`, children: msg }), _jsxs("form", { onSubmit: handleSave, style: { display: 'flex', flexDirection: 'column', gap: 18 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Full Name" }), _jsx("input", { value: form.name, onChange: e => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email (cannot change)" }), _jsx("input", { value: user?.email, disabled: true, style: { opacity: 0.5 } })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Phone" }), _jsx("input", { value: form.phone, onChange: e => setForm({ ...form, phone: e.target.value }), placeholder: "+233 24 000 0000" })] }), _jsx("button", { type: "submit", className: "btn btn-gold", disabled: saving, children: saving ? 'Saving...' : 'Save Changes' })] })] }), _jsxs("div", { className: "card", style: { marginTop: 24 }, children: [_jsx("h2", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 18 }, children: "\uD83D\uDD12 Change Password" }), pwMsg && _jsx("div", { className: `alert ${pwMsg.includes('success') ? 'alert-success' : 'alert-error'}`, children: pwMsg }), _jsxs("form", { onSubmit: handlePassword, style: { display: 'flex', flexDirection: 'column', gap: 18 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Current Password" }), _jsx(PasswordInput, { required: true, value: pwForm.currentPassword, onChange: v => setPwForm({ ...pwForm, currentPassword: v }), placeholder: "Your current password", autoComplete: "current-password" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "New Password" }), _jsx(PasswordInput, { required: true, value: pwForm.newPassword, onChange: v => setPwForm({ ...pwForm, newPassword: v }), placeholder: "Min. 6 characters", autoComplete: "new-password" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Confirm New Password" }), _jsx(PasswordInput, { required: true, value: pwForm.confirm, onChange: v => setPwForm({ ...pwForm, confirm: v }), placeholder: "Re-enter new password", autoComplete: "new-password" })] }), _jsx("button", { type: "submit", className: "btn btn-outline", disabled: pwSaving, style: { alignSelf: 'flex-start' }, children: pwSaving ? 'Updating...' : 'Update Password' })] })] }), _jsxs("div", { className: "card", style: { marginTop: 24 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }, children: [_jsx("h2", { style: { fontWeight: 700, fontSize: '1rem' }, children: "\uD83D\uDCB3 Membership & Billing" }), _jsx("span", { style: { fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: tierColor, background: `${tierColor}1a`, border: `1px solid ${tierColor}55`, padding: '3px 12px', borderRadius: 20 }, children: tierLabel })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }, children: [_jsx("span", { style: { color: '#9a9a9a' }, children: "Signal Subscription" }), signalActive
                                            ? _jsxs("span", { style: { color: '#4caf50', fontWeight: 600 }, children: ["Active", user?.tier !== 'vvip' && user?.signalSubUntil ? ` until ${new Date(user.signalSubUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ' (lifetime)'] })
                                            : _jsx("span", { style: { color: '#9a9a9a' }, children: "Not subscribed" })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }, children: [_jsx("span", { style: { color: '#9a9a9a' }, children: "Student ID" }), _jsx("span", { style: { fontFamily: 'monospace', color: '#c9a84c' }, children: user?.studentId || '—' })] })] }), user?.tier !== 'vvip' && _jsx(Link, { to: "/pricing", className: "btn btn-gold btn-sm", style: { marginBottom: 18 }, children: "Upgrade Membership" }), _jsx("h3", { style: { fontWeight: 700, fontSize: '0.85rem', margin: '6px 0 10px', color: '#9a9a9a' }, children: "Payment History" }), payments.length === 0 ? (_jsx("p", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: "No payments yet." })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: payments.map(p => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.84rem' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, textTransform: 'capitalize' }, children: p.purpose.replace('_', ' ') }), _jsxs("div", { style: { fontSize: '0.74rem', color: '#9a9a9a' }, children: [new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }), " \u00B7 ", p.method] })] }), _jsxs("span", { style: { fontWeight: 700, color: '#c9a84c' }, children: ["$", p.amount] })] }, p.id))) }))] })] }) }));
}
