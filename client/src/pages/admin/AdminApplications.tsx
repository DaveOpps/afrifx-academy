import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'ib', label: 'IB Partnership' },
  { id: 'seminar', label: 'Seminar / Event' },
];

const STATUS_COLOR: Record<string, string> = {
  new: '#c9a84c', reviewed: '#4aa3d4', approved: '#4caf50', declined: '#ef5350',
};

export default function AdminApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  const load = () => api.listApplications().then(setApps).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function setStatus(id: number, status: string) {
    await api.setApplicationStatus(id, status); load();
  }
  async function remove(id: number) {
    if (!confirm('Delete this application?')) return;
    await api.deleteApplication(id); load();
  }

  const filtered = tab === 'all' ? apps : apps.filter(a => a.type === tab);
  const newCount = apps.filter(a => a.status === 'new').length;

  return (
    <DashboardLayout title="Applications" subtitle={`${newCount} new submission${newCount === 1 ? '' : 's'} from partnership forms.`}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`btn btn-sm ${tab === t.id ? 'btn-gold' : 'btn-outline'}`}>
            {t.label} {t.id !== 'all' && `(${apps.filter(a => a.type === t.id).length})`}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-center"><span className="spinner"></span></div> : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: '#9a9a9a' }}>No applications {tab !== 'all' ? 'in this category' : 'yet'}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => (
            <div key={a.id} className="card" style={{ borderLeft: `3px solid ${STATUS_COLOR[a.status] || '#9a9a9a'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.4rem' }}>{a.type === 'ib' ? '🤝' : '🎤'}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.name} <span style={{ fontSize: '0.72rem', color: '#9a9a9a', textTransform: 'uppercase', marginLeft: 6 }}>{a.type === 'ib' ? 'IB' : 'Seminar'}</span></div>
                    <div style={{ fontSize: '0.8rem', color: '#9a9a9a' }}>{a.email}{a.phone ? ` · ${a.phone}` : ''} · {new Date(a.createdAt).toLocaleDateString('en-GB')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: STATUS_COLOR[a.status], background: `${STATUS_COLOR[a.status]}1a`, border: `1px solid ${STATUS_COLOR[a.status]}55`, padding: '3px 10px', borderRadius: 20 }}>{a.status}</span>
                  <button className="btn btn-sm btn-outline" onClick={() => setOpen(open === a.id ? null : a.id)}>{open === a.id ? 'Hide' : 'View'}</button>
                </div>
              </div>

              {open === a.id && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 16 }}>
                    {Object.entries(a.data || {}).map(([k, v]) => (
                      <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#9a9a9a', textTransform: 'capitalize', marginBottom: 2 }}>{k.replace(/([A-Z])/g, ' $1')}</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{String(v) || '—'}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => setStatus(a.id, 'reviewed')}>Mark Reviewed</button>
                    <button className="btn btn-sm" style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.4)', color: '#4caf50' }} onClick={() => setStatus(a.id, 'approved')}>Approve</button>
                    <button className="btn btn-sm" style={{ background: 'rgba(239,83,80,0.12)', border: '1px solid rgba(239,83,80,0.3)', color: '#ef5350' }} onClick={() => setStatus(a.id, 'declined')}>Decline</button>
                    <a href={`mailto:${a.email}`} className="btn btn-sm btn-gold">Reply</a>
                    <button className="btn btn-sm btn-outline" style={{ marginLeft: 'auto', color: '#ef5350', borderColor: '#ef5350' }} onClick={() => remove(a.id)}>Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
