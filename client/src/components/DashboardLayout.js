import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
/* ---- Inline line icons (stroke) ---- */
const Icon = ({ d, fill }) => (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: fill ? 'currentColor' : 'none', stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: d }) }));
const ICONS = {
    dashboard: _jsx(Icon, { d: "M3 13h8V3H3zM13 21h8V3h-8zM3 21h8v-6H3z" }),
    courses: _jsx(Icon, { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5z" }),
    signals: _jsx(Icon, { d: "M23 6l-9.5 9.5-5-5L1 18" }),
    meetings: _jsx(Icon, { d: "M23 7l-7 5 7 5zM1 5h15v14H1z" }),
    trophy: _jsx(Icon, { d: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M6 4h12v5a6 6 0 0 1-12 0zM9 18h6M10 18v-3m4 3v-3" }),
    cert: _jsx(Icon, { d: "M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8.5 13.5L7 22l5-3 5 3-1.5-8.5" }),
    resources: _jsx(Icon, { d: "M4 4h16v16H4zM4 9h16M9 4v16" }),
    id: _jsx(Icon, { d: "M3 5h18v14H3zM7 10h4M7 14h6m3-4a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" }),
    users: _jsx(Icon, { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" }),
    announce: _jsx(Icon, { d: "M3 11l18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" }),
    analytics: _jsx(Icon, { d: "M3 3v18h18M7 16l4-4 3 3 5-6" }),
    profile: _jsx(Icon, { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" }),
    logout: _jsx(Icon, { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5-5-5m5 5H9" }),
    search: _jsx(Icon, { d: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35" }),
};
const STUDENT_NAV = [
    { to: '/dashboard', label: 'Omni Dashboard', icon: 'dashboard' },
    { to: '/courses', label: 'Courses', icon: 'courses' },
    { to: '/markets', label: 'Live Markets', icon: 'signals' },
    { to: '/signals', label: 'Signals', icon: 'signals' },
    { to: '/performance', label: 'Performance', icon: 'analytics' },
    { to: '/meetings', label: 'Live Sessions', icon: 'meetings' },
    { to: '/leaderboard', label: 'Leaderboard', icon: 'trophy' },
    { to: '/certificates', label: 'Certificates', icon: 'cert' },
    { to: '/resources', label: 'Resources', icon: 'resources' },
    { to: '/student-id', label: 'Student ID', icon: 'id' },
    { to: '/my-account', label: 'My Account', icon: 'profile' },
    { to: '/pricing', label: 'Membership', icon: 'trophy' },
];
const ADMIN_NAV = [
    { to: '/admin', label: 'Omni Dashboard', icon: 'dashboard' },
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/students', label: 'Students', icon: 'users' },
    { to: '/admin/courses', label: 'Courses', icon: 'courses' },
    { to: '/admin/signals', label: 'Signals', icon: 'signals' },
    { to: '/admin/meetings', label: 'Meetings', icon: 'meetings' },
    { to: '/admin/announcements', label: 'Announcements', icon: 'announce' },
    { to: '/admin/applications', label: 'Applications', icon: 'users' },
    { to: '/admin/analytics', label: 'Analytics', icon: 'analytics' },
    { to: '/admin/certificates', label: 'Certificates', icon: 'cert' },
];
export default function DashboardLayout({ title, subtitle, children, actions }) {
    const { user, logout } = useAuth();
    const loc = useLocation();
    const nav = useNavigate();
    const [open, setOpen] = useState(false);
    const isAdmin = user?.role === 'admin';
    const items = isAdmin ? ADMIN_NAV : STUDENT_NAV;
    const isActive = (to) => to === '/admin' || to === '/dashboard' ? loc.pathname === to : loc.pathname.startsWith(to);
    function handleLogout() { logout(); nav('/'); }
    return (_jsxs("div", { style: { minHeight: '100vh', background: '#0a0a0a' }, children: [_jsxs("aside", { className: `afx-sidebar ${open ? 'afx-open' : ''}`, children: [_jsx("div", { style: { padding: '22px 22px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }, children: _jsxs(Link, { to: isAdmin ? '/admin' : '/dashboard', style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: { width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontFamily: "'Playfair Display',serif", fontSize: '1.1rem' }, children: "A" }), _jsxs("div", { children: [_jsxs("div", { style: { fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.15rem', lineHeight: 1 }, children: [_jsx("span", { style: { color: '#fff' }, children: "Afri" }), _jsx("span", { style: { color: '#c9a84c' }, children: "FX" })] }), _jsx("div", { style: { fontSize: '0.6rem', color: '#9a9a9a', letterSpacing: 2, textTransform: 'uppercase' }, children: isAdmin ? 'Admin Panel' : 'Academy' })] })] }) }), _jsx("nav", { style: { flex: 1, overflowY: 'auto', padding: '16px 12px' }, children: items.map(it => {
                            const active = isActive(it.to);
                            return (_jsxs(Link, { to: it.to, onClick: () => setOpen(false), style: {
                                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 11, marginBottom: 4,
                                    color: active ? '#1a1206' : '#b0b0b0',
                                    background: active ? 'linear-gradient(135deg,#e2c070,#a07828)' : 'transparent',
                                    fontWeight: active ? 700 : 500, fontSize: '0.88rem', transition: 'all 0.15s',
                                    boxShadow: active ? '0 6px 18px rgba(201,168,76,0.35)' : 'none',
                                }, className: "afx-navlink", children: [_jsx("span", { style: { display: 'flex', flexShrink: 0 }, children: ICONS[it.icon] }), it.label] }, it.to));
                        }) }), !isAdmin && (_jsxs("div", { style: { margin: '0 14px 12px', padding: 16, borderRadius: 14, background: 'linear-gradient(135deg,rgba(201,168,76,0.18),rgba(26,107,60,0.12))', border: '1px solid rgba(201,168,76,0.3)' }, children: [_jsx("div", { style: { fontSize: '1.4rem', marginBottom: 6 }, children: "\uD83D\uDC51" }), _jsx("div", { style: { fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }, children: "Go VVIP" }), _jsx("div", { style: { fontSize: '0.72rem', color: '#9a9a9a', marginBottom: 10 }, children: "Lifetime signals, courses & mentorship." }), _jsx(Link, { to: "/pricing", className: "btn btn-gold btn-sm", style: { width: '100%', padding: '7px' }, children: "Upgrade" })] })), _jsxs("div", { style: { padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsxs(Link, { to: isAdmin ? '/admin' : '/profile', style: { display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }, children: [_jsx("span", { style: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }, children: user?.name?.[0] }), _jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { style: { fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: user?.name }), _jsx("div", { style: { fontSize: '0.68rem', color: '#9a9a9a' }, children: isAdmin ? 'Administrator' : 'Student' })] })] }), _jsx("button", { onClick: handleLogout, title: "Logout", style: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 7, color: '#9a9a9a', display: 'flex' }, children: ICONS.logout })] })] }), open && _jsx("div", { onClick: () => setOpen(false), style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }, className: "afx-overlay" }), _jsxs("div", { className: "afx-main", children: [_jsxs("header", { className: "afx-topbar", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }, children: [_jsx("button", { onClick: () => setOpen(true), className: "afx-burger", style: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, color: '#fff', display: 'none' }, children: _jsx(Icon, { d: "M3 12h18M3 6h18M3 18h18" }) }), _jsxs("div", { style: { minWidth: 0 }, children: [_jsx("h1", { style: { fontFamily: "'Playfair Display',serif", fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }, children: title }), subtitle && _jsx("p", { style: { fontSize: '0.8rem', color: '#9a9a9a', marginTop: 2 }, children: subtitle })] })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsxs("div", { className: "afx-search", style: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 50, padding: '8px 16px', color: '#9a9a9a' }, children: [ICONS.search, _jsx("input", { placeholder: "Search...", style: { background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.85rem', width: 140 } })] }), actions, !isAdmin && _jsx(NotificationBell, {}), _jsx(Link, { to: isAdmin ? '/admin' : '/profile', style: { width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }, children: user?.name?.[0] })] })] }), _jsx("main", { className: "afx-fade", style: { padding: '28px 32px 60px' }, children: children }, loc.pathname)] }), _jsx("style", { children: `
        .afx-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: 250px; z-index: 50;
          background: linear-gradient(180deg, #141417 0%, #101012 100%);
          border-right: 1px solid rgba(255,255,255,0.07);
          box-shadow: 2px 0 24px rgba(0,0,0,0.35);
          display: flex; flex-direction: column; transition: transform 0.25s ease;
        }
        .afx-navlink:hover { background: rgba(255,255,255,0.06) !important; color: #fff !important; }
        .afx-main { margin-left: 250px; min-height: 100vh; }
        .afx-topbar {
          position: sticky; top: 0; z-index: 30;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 16px 32px; background: rgba(12,12,14,0.72); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        @media (max-width: 900px) {
          .afx-sidebar { transform: translateX(-100%); }
          .afx-sidebar.afx-open { transform: translateX(0); }
          .afx-main { margin-left: 0; }
          .afx-burger { display: flex !important; }
          .afx-search { display: none !important; }
          .afx-topbar { padding: 14px 18px; }
          .afx-main main { padding: 20px 18px 50px !important; }
        }
      ` })] }));
}
