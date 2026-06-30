import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const isAdmin = user?.role === 'admin';

  function handleLogout() { logout(); nav('/'); }

  const links = isAdmin
    ? [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/students', label: 'Students' }, { to: '/admin/courses', label: 'Courses' }, { to: '/admin/signals', label: 'Signals' }, { to: '/admin/meetings', label: 'Meetings' }, { to: '/admin/announcements', label: 'Announce' }, { to: '/admin/analytics', label: 'Analytics' }, { to: '/admin/certificates', label: 'Certs' }]
    : [{ to: '/courses', label: 'Courses' }, { to: '/signals', label: 'Signals' }, { to: '/dashboard', label: 'My Learning' }, { to: '/meetings', label: 'Meetings' }, { to: '/leaderboard', label: 'Leaderboard' }, { to: '/resources', label: 'Resources' }, { to: '/about', label: 'About' }];

  return (
    <nav style={{ background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(201,168,76,0.15)', position: 'sticky', top: 0, zIndex: 1000, padding: '0 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.3rem' }}>
            <span style={{ color: '#fff' }}>Afri</span><span style={{ color: '#c9a84c' }}>FX</span>
          </span>
          <span style={{ fontSize: '0.65rem', color: '#9a9a9a', letterSpacing: 2, textTransform: 'uppercase', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 10 }}>Academy</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {user && links.map(l => (
            <Link key={l.to} to={l.to} style={{ padding: '6px 14px', borderRadius: 8, fontSize: '0.84rem', color: loc.pathname === l.to ? '#c9a84c' : '#9a9a9a', background: loc.pathname === l.to ? 'rgba(201,168,76,0.1)' : 'transparent', transition: 'all 0.2s', fontWeight: loc.pathname === l.to ? 600 : 400 }}>{l.label}</Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {user ? (
            <>
              {!isAdmin && <NotificationBell />}
              {!isAdmin && <Link to="/student-id" style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', color: '#c9a84c', border: '1px solid rgba(201,168,76,0.3)', background: 'rgba(201,168,76,0.05)' }}>🪪 ID</Link>}
              <Link to={isAdmin ? '/admin' : '/profile'} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: 50, fontSize: '0.84rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{user.name[0]}</span>
                <span style={{ color: '#fff', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-gold btn-sm">Enroll Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
