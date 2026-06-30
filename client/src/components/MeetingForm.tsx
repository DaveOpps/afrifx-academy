import { useEffect, useState } from 'react';
import { api } from '../api';

export default function MeetingForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<any>({ title: '', description: '', date: '', startTime: '', endTime: '', meetLink: '', emailMembers: true, notifyBell: true });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [manualLink, setManualLink] = useState(false);

  useEffect(() => {
    // Only admins can read google status; ignore failure for instructors
    api.googleStatus().then(s => setGoogleConnected(s.connected)).catch(() => setGoogleConnected(null));
  }, []);

  async function save() {
    setErr('');
    if (!form.title || !form.date || !form.startTime || !form.endTime) { setErr('Please fill title, date, start and end time.'); return; }
    const start = new Date(`${form.date}T${form.startTime}`);
    const end = new Date(`${form.date}T${form.endTime}`);
    if (end <= start) { setErr('End time must be after start time.'); return; }

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
    } catch (e: any) {
      if (e.message === 'GOOGLE_NOT_CONNECTED') {
        setErr('Google isn\'t connected yet. Paste a Meet link manually below, or ask an admin to connect Google Calendar.');
        setManualLink(true);
      } else setErr(e.message);
    } finally { setSaving(false); }
  }

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 6 }}>📹 Schedule a Meeting</h3>
        <p style={{ fontSize: '0.82rem', color: '#9a9a9a', marginBottom: 18 }}>
          {manualLink ? 'Paste an existing Google Meet link.'
            : googleConnected ? '✅ A Google Meet link will be generated automatically.'
            : googleConnected === false ? '⚠ Google not connected — a link will be auto-generated once connected, or paste one manually.'
            : 'A Google Meet link will be generated automatically.'}
        </p>

        {err && <div className="alert alert-error" style={{ marginBottom: 14 }}>{err}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Live Market Analysis Session" /></div>
          <div className="form-group"><label>Description (optional)</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What's this meeting about?" style={{ resize: 'vertical' }} /></div>
          <div className="form-group"><label>Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}><label>Start</label><input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
            <div className="form-group" style={{ flex: 1 }}><label>End</label><input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#d0d0d0', cursor: 'pointer' }}>
            <input type="checkbox" checked={manualLink} onChange={e => setManualLink(e.target.checked)} style={{ accentColor: '#c9a84c' }} /> Paste a Meet link manually instead
          </label>
          {manualLink && (
            <div className="form-group"><label>Google Meet Link</label><input value={form.meetLink} onChange={e => setForm({ ...form, meetLink: e.target.value })} placeholder="https://meet.google.com/abc-defg-hij" /></div>
          )}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>Notify members</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#d0d0d0', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.notifyBell} onChange={e => setForm({ ...form, notifyBell: e.target.checked })} style={{ accentColor: '#c9a84c' }} /> 🔔 Notification bell
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: '#d0d0d0', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.emailMembers} onChange={e => setForm({ ...form, emailMembers: e.target.checked })} style={{ accentColor: '#c9a84c' }} /> 📧 Email all members
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-gold" onClick={save} disabled={saving}>{saving ? 'Scheduling...' : 'Schedule Meeting'}</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
