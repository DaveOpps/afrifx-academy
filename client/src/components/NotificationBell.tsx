import { useState, useEffect, useRef } from 'react';
import { api } from '../api';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [anns, setAnns] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const data = await api.announcements();
      setAnns(data.announcements);
      setUnread(data.unread);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      await api.markAllAnnRead();
      setUnread(0);
      setAnns(a => a.map(x => ({ ...x, read: true })));
    }
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={toggleOpen} style={{ position: 'relative', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', cursor: 'pointer' }} title="Announcements">
        🔔
        {unread > 0 && (
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#e53935', color: '#fff', borderRadius: '50%', minWidth: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0d0d0d', padding: '0 4px' }}>{unread}</span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', top: 48, right: 0, width: 340, maxHeight: 420, overflowY: 'auto', background: '#1a1a1a', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 2000 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📢 Announcements</span>
          </div>
          {anns.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9a9a9a', fontSize: '0.86rem' }}>No announcements yet</div>
          ) : (
            anns.map(a => (
              <div key={a.id} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: a.read ? 'transparent' : 'rgba(201,168,76,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  {a.pinned && <span style={{ fontSize: '0.7rem' }}>📌</span>}
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{a.title}</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#b0b0b0', lineHeight: 1.6, marginBottom: 6 }}>{a.body}</p>
                <span style={{ fontSize: '0.72rem', color: '#777' }}>{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
