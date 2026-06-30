import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import MeetingForm from '../../components/MeetingForm';
function fmt(d) {
    return new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export default function AdminMeetings() {
    const [meetings, setMeetings] = useState([]);
    const [google, setGoogle] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const load = () => Promise.all([api.meetings(), api.googleStatus()])
        .then(([m, g]) => { setMeetings(m); setGoogle(g); })
        .finally(() => setLoading(false));
    useEffect(() => { load(); }, []);
    async function connectGoogle() {
        try {
            const { url } = await api.googleAuthUrl();
            window.open(url, '_blank', 'width=520,height=640');
        }
        catch (e) {
            alert(e.message);
        }
    }
    async function disconnectGoogle() {
        if (!confirm('Disconnect Google Calendar? New meetings will need manual links.'))
            return;
        await api.googleDisconnect();
        load();
    }
    async function remove(id) {
        if (!confirm('Delete this meeting?'))
            return;
        await api.deleteMeeting(id);
        load();
    }
    return (_jsxs(DashboardLayout, { title: "Meetings Management", subtitle: "Schedule Google Meet sessions and manage the connection.", actions: _jsx("button", { className: "btn btn-gold btn-sm", onClick: () => setShowForm(true), children: "\uFF0B Schedule" }), children: [_jsxs("div", { className: "card card-premium", style: { marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 14 }, children: [_jsx("div", { style: { width: 46, height: 46, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }, children: "\uD83D\uDCF9" }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700 }, children: "Google Meet / Calendar" }), !google ? _jsx("div", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: "Checking..." })
                                        : !google.configured ? _jsx("div", { style: { fontSize: '0.82rem', color: '#e0a030' }, children: "\u26A0 Not configured \u2014 add Google credentials to server .env (see setup guide)" })
                                            : google.connected ? _jsx("div", { style: { fontSize: '0.82rem', color: '#4caf50' }, children: "\u2705 Connected \u2014 Meet links auto-generate" })
                                                : _jsx("div", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: "Configured but not connected yet" })] })] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [google?.configured && !google?.connected && _jsx("button", { className: "btn btn-primary btn-sm", onClick: connectGoogle, children: "Connect Google" }), google?.connected && _jsx("button", { className: "btn btn-outline btn-sm", onClick: disconnectGoogle, children: "Disconnect" }), google?.connected && _jsx("button", { className: "btn btn-outline btn-sm", onClick: load, children: "Refresh" }), google?.configured && !google?.connected && _jsx("button", { className: "btn btn-outline btn-sm", onClick: load, children: "I've connected \u2014 Refresh" })] })] }), loading ? _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) : (_jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Title" }), _jsx("th", { children: "When" }), _jsx("th", { children: "Host" }), _jsx("th", { children: "Link" }), _jsx("th", {})] }) }), _jsxs("tbody", { children: [meetings.length === 0 && _jsx("tr", { children: _jsx("td", { colSpan: 5, style: { textAlign: 'center', color: '#9a9a9a', padding: 32 }, children: "No meetings scheduled." }) }), meetings.map(m => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 600 }, children: m.title }), _jsx("td", { style: { fontSize: '0.84rem', color: '#9a9a9a' }, children: fmt(m.startTime) }), _jsx("td", { style: { fontSize: '0.84rem' }, children: m.hostName }), _jsx("td", { children: _jsx("a", { href: m.meetLink, target: "_blank", rel: "noopener", style: { color: '#c9a84c', fontSize: '0.82rem' }, children: "Open \u2197" }) }), _jsx("td", { children: _jsx("button", { className: "btn btn-sm", style: { background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ef5350' }, onClick: () => remove(m.id), children: "Delete" }) })] }, m.id)))] })] }) })), showForm && _jsx(MeetingForm, { onClose: () => setShowForm(false), onSaved: () => { setShowForm(false); load(); } })] }));
}
