import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import MeetingForm from '../../components/MeetingForm';

function fmt(d: string) {
  return new Date(d).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminMeetings() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [google, setGoogle] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => Promise.all([api.meetings(), api.googleStatus()])
    .then(([m, g]) => { setMeetings(m); setGoogle(g); })
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function connectGoogle() {
    try { const { url } = await api.googleAuthUrl(); window.open(url, '_blank', 'width=520,height=640'); }
    catch (e: any) { alert(e.message); }
  }
  async function disconnectGoogle() {
    if (!confirm('Disconnect Google Calendar? New meetings will need manual links.')) return;
    await api.googleDisconnect(); load();
  }
  async function remove(id: number) {
    if (!confirm('Delete this meeting?')) return;
    await api.deleteMeeting(id); load();
  }

  return (
    <DashboardLayout
      title="Meetings Management"
      subtitle="Schedule Google Meet sessions and manage the connection."
      actions={<button className="btn btn-gold btn-sm" onClick={() => setShowForm(true)}>＋ Schedule</button>}
    >
        {/* Google connection panel */}
        <div className="card card-premium" style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>📹</div>
            <div>
              <div style={{ fontWeight: 700 }}>Google Meet / Calendar</div>
              {!google ? <div style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Checking...</div>
                : !google.configured ? <div style={{ fontSize: '0.82rem', color: '#e0a030' }}>⚠ Not configured — add Google credentials to server .env (see setup guide)</div>
                : google.connected ? <div style={{ fontSize: '0.82rem', color: '#4caf50' }}>✅ Connected — Meet links auto-generate</div>
                : <div style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Configured but not connected yet</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {google?.configured && !google?.connected && <button className="btn btn-primary btn-sm" onClick={connectGoogle}>Connect Google</button>}
            {google?.connected && <button className="btn btn-outline btn-sm" onClick={disconnectGoogle}>Disconnect</button>}
            {google?.connected && <button className="btn btn-outline btn-sm" onClick={load}>Refresh</button>}
            {google?.configured && !google?.connected && <button className="btn btn-outline btn-sm" onClick={load}>I've connected — Refresh</button>}
          </div>
        </div>

        {/* Meetings table */}
        {loading ? <div className="loading-center"><span className="spinner"></span></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>When</th><th>Host</th><th>Link</th><th></th></tr></thead>
              <tbody>
                {meetings.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9a9a9a', padding: 32 }}>No meetings scheduled.</td></tr>}
                {meetings.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.title}</td>
                    <td style={{ fontSize: '0.84rem', color: '#9a9a9a' }}>{fmt(m.startTime)}</td>
                    <td style={{ fontSize: '0.84rem' }}>{m.hostName}</td>
                    <td><a href={m.meetLink} target="_blank" rel="noopener" style={{ color: '#c9a84c', fontSize: '0.82rem' }}>Open ↗</a></td>
                    <td><button className="btn btn-sm" style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ef5350' }} onClick={() => remove(m.id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      {showForm && <MeetingForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </DashboardLayout>
  );
}
