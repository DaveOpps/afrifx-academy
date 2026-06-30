import { useState } from 'react';
import { api } from '../api';
import PageShell from '../components/PageShell';

const BENEFITS = [
  ['💰', 'Revenue Sharing', 'Earn competitive commissions on referred trading volume.'],
  ['📣', 'Marketing Support', 'Get branded materials and campaign support.'],
  ['🎓', 'Training', 'Access partner training and onboarding resources.'],
  ['🤝', 'Partnership Opportunities', 'Grow with joint ventures and exclusive deals.'],
  ['🎤', 'Joint Seminars', 'Co-host events and webinars with AFRIFX.'],
  ['📈', 'Business Growth Support', 'Scale your IB business with our backing.'],
];

export default function PartnerIB() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    isIB: 'Yes', brokers: '', activeClients: '', africanClients: '', intlClients: '', volume: '',
  });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      await api.submitApplication({
        type: 'ib', name: form.name, email: form.email, phone: form.phone,
        data: {
          isIB: form.isIB, brokers: form.brokers, activeClients: form.activeClients,
          africanClients: form.africanClients, intlClients: form.intlClients, volume: form.volume,
        },
      });
      setSent(true);
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <PageShell title="Introducing Broker (IB) Partnership" subtitle="Partner with AFRIFX and grow your brokerage business.">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }} className="ib-grid">
        {/* Benefits */}
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>Partner Benefits</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {BENEFITS.map(([icon, title, desc]) => (
              <div key={title} className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: 16 }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#9a9a9a', marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card">
          {sent ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
              <h3 style={{ marginBottom: 8 }}>Application Received!</h3>
              <p style={{ color: '#9a9a9a' }}>Thank you. Our partnerships team will be in touch soon.</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 18 }}>Apply to Become a Partner</h2>
              {err && <div className="alert alert-error">{err}</div>}
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group"><label>Full Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label>Email *</label><input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+233 ..." /></div>
                <div className="form-group">
                  <label>Are you currently an IB?</label>
                  <select value={form.isIB} onChange={e => setForm({ ...form, isIB: e.target.value })}>
                    <option>Yes</option><option>No</option>
                  </select>
                </div>
                <div className="form-group"><label>Which broker(s) do you represent?</label><input value={form.brokers} onChange={e => setForm({ ...form, brokers: e.target.value })} placeholder="e.g. Exness, XM" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group"><label>Active Clients</label><input type="number" value={form.activeClients} onChange={e => setForm({ ...form, activeClients: e.target.value })} /></div>
                  <div className="form-group"><label>Monthly Volume (optional)</label><input value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} placeholder="e.g. $2M" /></div>
                  <div className="form-group"><label>African Clients</label><input type="number" value={form.africanClients} onChange={e => setForm({ ...form, africanClients: e.target.value })} /></div>
                  <div className="form-group"><label>International Clients</label><input type="number" value={form.intlClients} onChange={e => setForm({ ...form, intlClients: e.target.value })} /></div>
                </div>
                <button type="submit" className="btn btn-gold" disabled={busy}>{busy ? 'Submitting...' : 'Submit Application'}</button>
              </form>
            </>
          )}
        </div>
      </div>
      <style>{`@media (max-width: 820px){ .ib-grid { grid-template-columns: 1fr !important; } }`}</style>
    </PageShell>
  );
}
