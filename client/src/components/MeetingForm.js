import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../api';
export default function MeetingForm({ onClose, onSaved }) {
    const [form, setForm] = useState({ title: '', description: '', date: '', startTime: '', endTime: '', meetLink: '', emailMembers: true, notifyBell: true });
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState('');
    const [googleConnected, setGoogleConnected] = useState(null);
    const [manualLink, setManualLink] = useState(false);
    useEffect(() => {
        // Only admins can read google status; ignore failure for instructors
        api.googleStatus().then(s => setGoogleConnected(s.connected)).catch(() => setGoogleConnected(null));
    }, []);
    async function save() {
        setErr('');
        if (!form.title || !form.date || !form.startTime || !form.endTime) {
            setErr('Please fill title, date, start and end time.');
            return;
        }
        const start = new Date(`${form.date}T${form.startTime}`);
        const end = new Date(`${form.date}T${form.endTime}`);
        if (end <= start) {
            setErr('End time must be after start time.');
            return;
        }
        setSaving(true);
        try {
            await api.createMeeting({
                title: form.title,
                description: form.description,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                meetLink: manualLink ? form.meetLink : '',
                emailMembers: form.emailMembers,
                notifyBell: form.notifyBell
            });
            onSaved();
        }
        catch (e) {
            if (e.message === 'GOOGLE_NOT_CONNECTED') {
                setErr('Google isn\'t connected yet. Paste a Meet link manually below, or ask an admin to connect Google Calendar.');
                setManualLink(true);
            }
            else
                setErr(e.message);
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsx("div", { onClick: e => { if (e.target === e.currentTarget)
            onClose(); }, style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }, children: _jsxs("div", { className: "card", style: { width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }, children: [_jsx("h3", { style: { fontWeight: 700, marginBottom: 6 }, children: "\uD83D\uDCF9 Schedule a Meeting" }), _jsx("p", { style: { fontSize: '0.82rem', color: '#9a9a9a', marginBottom: 18 }, children: manualLink ? 'Paste an existing Google Meet link.'
                        : googleConnected ? '✅ A Google Meet link will be generated automatically.'
                            : googleConnected === false ? '⚠ Google not connected — a link will be auto-generated once connected, or paste one manually.'
                                : 'A Google Meet link will be generated automatically.' }), err && _jsx("div", { className: "alert alert-error", style: { marginBottom: 14 }, children: err }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Title" }), _jsx("input", { value: form.title, onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "e.g. Live Market Analysis Session" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description (optional)" }), _jsx("textarea", { value: form.description, onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, placeholder: "What's this meeting about?", style: { resize: 'vertical' } })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Date" }), _jsx("input", { type: "date", value: form.date, onChange: e => setForm({ ...form, date: e.target.value }) })] }), _jsxs("div", { style: { display: 'flex', gap: 12 }, children: [_jsxs("div", { className: "form-group", style: { flex: 1 }, children: [_jsx("label", { children: "Start" }), _jsx("input", { type: "time", value: form.startTime, onChange: e => setForm({ ...form, startTime: e.target.value }) })] }), _jsxs("div", { className: "form-group", style: { flex: 1 }, children: [_jsx("label", { children: "End" }), _jsx("input", { type: "time", value: form.endTime, onChange: e => setForm({ ...form, endTime: e.target.value }) })] })] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#d0d0d0', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: manualLink, onChange: e => setManualLink(e.target.checked), style: { accentColor: '#c9a84c' } }), " Paste a Meet link manually instead"] }), manualLink && (_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Google Meet Link" }), _jsx("input", { value: form.meetLink, onChange: e => setForm({ ...form, meetLink: e.target.value }), placeholder: "https://meet.google.com/abc-defg-hij" })] })), _jsxs("div", { style: { borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }, children: [_jsx("span", { style: { fontSize: '0.78rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }, children: "Notify members" }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#d0d0d0', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: form.notifyBell, onChange: e => setForm({ ...form, notifyBell: e.target.checked }), style: { accentColor: '#c9a84c' } }), " \uD83D\uDD14 Notification bell"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#d0d0d0', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox", checked: form.emailMembers, onChange: e => setForm({ ...form, emailMembers: e.target.checked }), style: { accentColor: '#c9a84c' } }), " \uD83D\uDCE7 Email all members"] })] })] }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 20 }, children: [_jsx("button", { className: "btn btn-gold", onClick: save, disabled: saving, children: saving ? 'Scheduling...' : 'Schedule Meeting' }), _jsx("button", { className: "btn btn-outline", onClick: onClose, children: "Cancel" })] })] }) }));
}
