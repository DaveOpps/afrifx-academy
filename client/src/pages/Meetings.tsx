import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import MeetingForm from '../components/MeetingForm';

function meetingStatus(m: any): 'live' | 'upcoming' | 'past' {
  const now = Date.now();
  const start = new Date(m.startTime).getTime();
  const end = new Date(m.endTime).getTime();
  if (now >= start && now <= end) return 'live';
  if (now < start) return 'upcoming';
  return 'past';
}

function fmt(d: string) {
  return new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function Meetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const isHost = user?.role === 'admin' || user?.role === 'instructor';

  const load = () => api.meetings().then(setMeetings).finally(() => setLoading(false));
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  async function remove(id: number) {
    if (!confirm('Delete this meeting?')) return;
    await api.deleteMeeting(id); load();
  }

  const live = meetings.filter(m => meetingStatus(m) === 'live');
  const upcoming = meetings.filter(m => meetingStatus(m) === 'upcoming');
  const past = meetings.filter(m => meetingStatus(m) === 'past').reverse();

  function Card({ m, status }: { m: any; status: string }) {
    return (
      <div className="card" style={{ borderColor: status === 'live' ? 'rgba(76,175,80,0.5)' : undefined, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {status === 'live' && <span className="badge" style={{ background: 'rgba(76,175,80,0.15)', color: '#4caf50', border: '1px solid rgba(76,175,80,0.4)', display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span> LIVE NOW</span>}
            {status === 'upcoming' && <span className="badge badge-gold">Upcoming</span>}
            {status === 'past' && <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#9a9a9a' }}>Ended</span>}
          </div>
          {(user?.role === 'admin' || m.hostId === user?.id) && (
            <button onClick={() => remove(m.id)} title="Delete" style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: '0.9rem' }}>✕</button>
          )}
        </div>
        <h3 style={{ fontSize: '1.02rem', fontWeight: 700 }}>{m.title}</h3>
        {m.description && <p style={{ fontSize: '0.86rem', color: '#9a9a9a', lineHeight: 1.6 }}>{m.description}</p>}
        <div style={{ fontSize: '0.82rem', color: '#9a9a9a', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span>🕒 {fmt(m.startTime)} – {new Date(m.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          <span>👤 Hosted by {m.hostName}</span>
        </div>
        {status !== 'past' ? (
          <a href={m.meetLink} target="_blank" rel="noopener" className={`btn ${status === 'live' ? 'btn-primary' : 'btn-gold'}`} style={{ marginTop: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>📹 {status === 'live' ? 'Join Now' : 'Join Meeting'}</span>
          </a>
        ) : (
          m.meetLink && <a href={m.meetLink} target="_blank" rel="noopener" className="btn btn-outline btn-sm" style={{ marginTop: 4 }}>View Link</a>
        )}
      </div>
    );
  }

  return (
    <DashboardLayout
      title="📹 Live Sessions"
      subtitle="All AfriFX live sessions, webinars, and Q&As — powered by Google Meet."
      actions={isHost ? <button className="btn btn-gold btn-sm" onClick={() => setShowForm(true)}>＋ Schedule</button> : undefined}
    >
        {loading ? <div className="loading-center"><span className="spinner"></span></div> : (
          <>
            {meetings.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📅</div>
                <p style={{ color: '#9a9a9a' }}>No meetings scheduled yet. {isHost ? 'Schedule one to get started!' : 'Check back soon!'}</p>
              </div>
            )}

            {live.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, color: '#4caf50' }}>🔴 Live Now</h2>
                <div className="grid-3">{live.map(m => <Card key={m.id} m={m} status="live" />)}</div>
              </section>
            )}
            {upcoming.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>📆 Upcoming</h2>
                <div className="grid-3">{upcoming.map(m => <Card key={m.id} m={m} status="upcoming" />)}</div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, color: '#9a9a9a' }}>🗂 Past Meetings</h2>
                <div className="grid-3">{past.map(m => <Card key={m.id} m={m} status="past" />)}</div>
              </section>
            )}
          </>
        )}

      {showForm && <MeetingForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </DashboardLayout>
  );
}
