import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import MeetingForm from '../components/MeetingForm';
function meetingStatus(m) {
    const now = Date.now();
    const start = new Date(m.startTime).getTime();
    const end = new Date(m.endTime).getTime();
    if (now >= start && now <= end)
        return 'live';
    if (now < start)
        return 'upcoming';
    return 'past';
}
function fmt(d) {
    return new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
export default function Meetings() {
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const isHost = user?.role === 'admin' || user?.role === 'instructor';
    const load = () => api.meetings().then(setMeetings).finally(() => setLoading(false));
    useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
    async function remove(id) {
        if (!confirm('Delete this meeting?'))
            return;
        await api.deleteMeeting(id);
        load();
    }
    const live = meetings.filter(m => meetingStatus(m) === 'live');
    const upcoming = meetings.filter(m => meetingStatus(m) === 'upcoming');
    const past = meetings.filter(m => meetingStatus(m) === 'past').reverse();
    function Card({ m, status }) {
        return (_jsxs("div", { className: "card", style: { borderColor: status === 'live' ? 'rgba(76,175,80,0.5)' : undefined, display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [status === 'live' && _jsxs("span", { className: "badge", style: { background: 'rgba(76,175,80,0.15)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.4)', display: 'inline-flex', alignItems: 'center', gap: 5 }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: '50%', background: '#4caf50', display: 'inline-block', animation: 'pulse 1.5s infinite' } }), " LIVE NOW"] }), status === 'upcoming' && _jsx("span", { className: "badge badge-gold", children: "Upcoming" }), status === 'past' && _jsx("span", { className: "badge", style: { background: 'rgba(255,255,255,0.06)', color: '#9a9a9a' }, children: "Ended" })] }), (user?.role === 'admin' || m.hostId === user?.id) && (_jsx("button", { onClick: () => remove(m.id), title: "Delete", style: { background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: '0.9rem' }, children: "\u2715" }))] }), _jsx("h3", { style: { fontSize: '1.02rem', fontWeight: 700 }, children: m.title }), m.description && _jsx("p", { style: { fontSize: '0.86rem', color: '#9a9a9a', lineHeight: 1.6 }, children: m.description }), _jsxs("div", { style: { fontSize: '0.82rem', color: '#9a9a9a', display: 'flex', flexDirection: 'column', gap: 4 }, children: [_jsxs("span", { children: ["\uD83D\uDD52 ", fmt(m.startTime), " \u2013 ", new Date(m.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })] }), _jsxs("span", { children: ["\uD83D\uDC64 Hosted by ", m.hostName] })] }), status !== 'past' ? (_jsx("a", { href: m.meetLink, target: "_blank", rel: "noopener", className: `btn ${status === 'live' ? 'btn-primary' : 'btn-gold'}`, style: { marginTop: 4 }, children: _jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: 8 }, children: ["\uD83D\uDCF9 ", status === 'live' ? 'Join Now' : 'Join Meeting'] }) })) : (m.meetLink && _jsx("a", { href: m.meetLink, target: "_blank", rel: "noopener", className: "btn btn-outline btn-sm", style: { marginTop: 4 }, children: "View Link" }))] }));
    }
    return (_jsxs(DashboardLayout, { title: "\uD83D\uDCF9 Live Sessions", subtitle: "All AfriFX live sessions, webinars, and Q&As \u2014 powered by Google Meet.", actions: isHost ? _jsx("button", { className: "btn btn-gold btn-sm", onClick: () => setShowForm(true), children: "\uFF0B Schedule" }) : undefined, children: [loading ? _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) : (_jsxs(_Fragment, { children: [meetings.length === 0 && (_jsxs("div", { className: "card", style: { textAlign: 'center', padding: 48 }, children: [_jsx("div", { style: { fontSize: '2.5rem', marginBottom: 12 }, children: "\uD83D\uDCC5" }), _jsxs("p", { style: { color: '#9a9a9a' }, children: ["No meetings scheduled yet. ", isHost ? 'Schedule one to get started!' : 'Check back soon!'] })] })), live.length > 0 && (_jsxs("section", { style: { marginBottom: 36 }, children: [_jsx("h2", { style: { fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, color: '#4caf50' }, children: "\uD83D\uDD34 Live Now" }), _jsx("div", { className: "grid-3", children: live.map(m => _jsx(Card, { m: m, status: "live" }, m.id)) })] })), upcoming.length > 0 && (_jsxs("section", { style: { marginBottom: 36 }, children: [_jsx("h2", { style: { fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }, children: "\uD83D\uDCC6 Upcoming" }), _jsx("div", { className: "grid-3", children: upcoming.map(m => _jsx(Card, { m: m, status: "upcoming" }, m.id)) })] })), past.length > 0 && (_jsxs("section", { children: [_jsx("h2", { style: { fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, color: '#9a9a9a' }, children: "\uD83D\uDDC2 Past Meetings" }), _jsx("div", { className: "grid-3", children: past.map(m => _jsx(Card, { m: m, status: "past" }, m.id)) })] }))] })), showForm && _jsx(MeetingForm, { onClose: () => setShowForm(false), onSaved: () => { setShowForm(false); load(); } })] }));
}
