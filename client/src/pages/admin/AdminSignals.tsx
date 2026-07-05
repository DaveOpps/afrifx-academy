import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

const TYPES = ['Forex', 'Gold', 'Crypto', 'Indices'];
const EMPTY = { pair: '', type: 'Forex', direction: 'BUY', entry: '', stopLoss: '', tp1: '', tp2: '', tp3: '', notes: '', status: 'active' };

export default function AdminSignals() {
  const [signals, setSignals] = useState<any[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [closing, setClosing] = useState<Record<number, any>>({});

  const load = () => api.getSignals().then(setSignals).catch(() => {});

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setMsg(''); setSaving(true);
    try {
      await api.createSignal(form);
      setForm({ ...EMPTY });
      setShowForm(false);
      load();
      setMsg('Signal posted!');
    } catch (err: any) { setMsg(err.message); }
    finally { setSaving(false); }
  }

  async function handleClose(id: number) {
    const d = closing[id] || {};
    try {
      await api.updateSignal(id, { status: 'closed', result: d.result || 'win', pips: d.pips || '' });
      load();
    } catch {}
  }

  async function handleCancel(id: number) {
    try { await api.updateSignal(id, { status: 'cancelled' }); load(); } catch {}
  }

  async function handleActivate(id: number) {
    try { await api.updateSignal(id, { status: 'active' }); load(); } catch {}
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this signal?')) return;
    try { await api.deleteSignal(id); load(); } catch {}
  }

  return (
    <DashboardLayout
      title="Trading Signals"
      subtitle={`${signals.filter(s => s.status === 'active').length} active signals`}
      actions={<button className="btn btn-gold btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Signal'}</button>}
    >
        {msg && <div className="alert alert-success" style={{ marginBottom: 20 }}>{msg}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: 32 }}>
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Post New Signal</h2>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label>Pair *</label>
                  <input placeholder="e.g. EURUSD, GOLD, BTCUSD" value={form.pair} onChange={e => setForm({ ...form, pair: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: '100%', background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Direction</label>
                  <select value={form.direction} onChange={e => setForm({ ...form, direction: e.target.value })} style={{ width: '100%', background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                    <option>BUY</option>
                    <option>SELL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ width: '100%', background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
                    <option value="active">Active — post live now</option>
                    <option value="pending">Pending — waiting to trigger</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Entry *</label>
                  <input placeholder="1.0850" value={form.entry} onChange={e => setForm({ ...form, entry: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Stop Loss *</label>
                  <input placeholder="1.0800" value={form.stopLoss} onChange={e => setForm({ ...form, stopLoss: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>TP 1 *</label>
                  <input placeholder="1.0900" value={form.tp1} onChange={e => setForm({ ...form, tp1: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>TP 2</label>
                  <input placeholder="1.0950" value={form.tp2} onChange={e => setForm({ ...form, tp2: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>TP 3</label>
                  <input placeholder="1.1000" value={form.tp3} onChange={e => setForm({ ...form, tp3: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label>Notes (optional)</label>
                <input placeholder="e.g. Wait for London open confirmation" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Posting...' : 'Post Signal'}</button>
            </form>
          </div>
        )}

        {/* Signals table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {signals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: '#9a9a9a' }}>No signals yet. Post your first signal above.</p>
            </div>
          ) : signals.map(s => (
            <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', borderLeft: `3px solid ${s.direction === 'BUY' ? '#4caf50' : '#ef5350'}` }}>
              <div style={{ minWidth: 120 }}>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{s.pair}</div>
                <div style={{ fontSize: '0.75rem', color: '#9a9a9a' }}>{s.type} · {new Date(s.createdAt).toLocaleDateString('en-GB')}</div>
              </div>
              <span style={{ padding: '3px 12px', borderRadius: 20, fontWeight: 700, fontSize: '0.8rem', color: s.direction === 'BUY' ? '#4caf50' : '#ef5350', background: s.direction === 'BUY' ? 'rgba(76,175,80,0.12)' : 'rgba(239,83,80,0.12)' }}>{s.direction}</span>
              <div style={{ flex: 1, display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.82rem' }}>
                <span>Entry: <b>{s.entry}</b></span>
                <span>SL: <b style={{ color: '#ef5350' }}>{s.stopLoss}</b></span>
                <span>TP1: <b style={{ color: '#4caf50' }}>{s.tp1}</b></span>
                {s.tp2 && <span>TP2: <b style={{ color: '#4caf50' }}>{s.tp2}</b></span>}
                {s.tp3 && <span>TP3: <b style={{ color: '#4caf50' }}>{s.tp3}</b></span>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {s.status === 'active' && (
                  <>
                    <select value={closing[s.id]?.result || 'win'} onChange={e => setClosing(p => ({ ...p, [s.id]: { ...p[s.id], result: e.target.value } }))}
                      style={{ background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: '0.78rem' }}>
                      <option value="win">Win</option>
                      <option value="loss">Loss</option>
                      <option value="breakeven">Breakeven</option>
                    </select>
                    <input type="number" placeholder="pips" value={closing[s.id]?.pips || ''} onChange={e => setClosing(p => ({ ...p, [s.id]: { ...p[s.id], pips: e.target.value } }))}
                      style={{ width: 60, background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: '0.78rem' }} />
                    <button className="btn btn-sm btn-primary" onClick={() => handleClose(s.id)}>Close</button>
                    <button className="btn btn-sm btn-outline" onClick={() => handleCancel(s.id)}>Cancel</button>
                  </>
                )}
                {s.status === 'pending' && (
                  <>
                    <span style={{ fontSize: '0.8rem', color: '#c9a84c', fontWeight: 600 }}>⏳ Pending</span>
                    <button className="btn btn-sm btn-primary" onClick={() => handleActivate(s.id)}>Activate</button>
                    <button className="btn btn-sm btn-outline" onClick={() => handleCancel(s.id)}>Cancel</button>
                  </>
                )}
                {s.status !== 'active' && s.status !== 'pending' && (
                  <span style={{ fontSize: '0.8rem', color: s.status === 'closed' ? (s.result === 'win' ? '#4caf50' : '#ef5350') : '#9a9a9a', fontWeight: 600, textTransform: 'capitalize' }}>
                    {s.status}{s.result ? ` · ${s.result}` : ''}{s.pips != null ? ` · ${s.pips}p` : ''}
                  </span>
                )}
                <button className="btn btn-sm btn-outline" style={{ color: '#ef5350', borderColor: '#ef5350' }} onClick={() => handleDelete(s.id)}>Del</button>
              </div>
            </div>
          ))}
        </div>
    </DashboardLayout>
  );
}
