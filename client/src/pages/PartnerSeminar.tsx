import { useState } from 'react';
import { api } from '../api';
import PageShell from '../components/PageShell';

const WAYS = [
  ['🎤', 'Host Seminars'],
  ['📚', 'Teach Strategies'],
  ['💎', 'Sponsor Events'],
  ['💻', 'Run Webinars'],
  ['📢', 'Educational Campaigns'],
];

const TYPES = ['Host a Seminar', 'Teach a Strategy', 'Sponsor an Event', 'Run a Webinar', 'Educational Campaign', 'Other'];

export default function PartnerSeminar() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', org: '', collabType: TYPES[0], message: '' });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      await api.submitApplication({
        type: 'seminar', name: form.name, email: form.email, phone: form.phone,
        data: { org: form.org, collabType: form.collabType, message: form.message },
      });
      setSent(true);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <PageShell title="Seminar & Event Collaboration" subtitle="Partner with AFRIFX to host seminars, webinars, and educational campaigns.">
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Ways to Collaborate</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {WAYS.map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 50, fontSize: '0.86rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{icon}</span>{label}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ maxWidth: 620 }}>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
            <h3 style={{ marginBottom: 8 }}>Proposal Received!</h3>
            <p style={{ color: '#9a9a9a' }}>Thanks for your interest in collaborating. We'll review and reach out.</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 18 }}>Submit a Collaboration Proposal</h2>
            {err && <div className="alert alert-error">{err}</div>}
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label>Your Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label>Organization / Brand</label><input value={form.org} onChange={e => setForm({ ...form, org: e.target.value })} /></div>
                <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              </div>
              <div className="form-group">
                <label>Type of Collaboration</label>
                <select value={form.collabType} onChange={e => setForm({ ...form, collabType: e.target.value })}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tell us more</label>
                <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Describe your seminar, event, or campaign idea..." style={{ resize: 'vertical' }} />
              </div>
              <button type="submit" className="btn btn-gold" disabled={busy}>{busy ? 'Submitting...' : 'Submit Proposal'}</button>
            </form>
          </>
        )}
      </div>
    </PageShell>
  );
}
