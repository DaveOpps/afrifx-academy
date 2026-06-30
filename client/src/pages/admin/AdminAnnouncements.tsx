import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminAnnouncements() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', body: '', pinned: false, emailAll: false });
  const [saving, setSaving] = useState(false);

  const load = () => api.allAnnouncements().then(setList).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function create() {
    if (!form.title || !form.body) return alert('Title and message required');
    setSaving(true);
    try {
      await api.createAnnouncement(form);
      setForm({ title: '', body: '', pinned: false, emailAll: false });
      load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function remove(id: number) {
    if (!confirm('Delete this announcement?')) return;
    await api.deleteAnnouncement(id); load();
  }

  return (
    <DashboardLayout title="Announcements & Notifications" subtitle="Post updates that appear in every student's notification bell.">
      <div style={{ maxWidth: 820 }}>
        {/* Create form */}
        <div className="card card-premium" style={{ marginBottom: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>New Announcement</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label>Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. New Crypto Course Launched!" />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} rows={3} placeholder="Write your announcement..." style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem', color: '#d0d0d0' }}>
                <input type="checkbox" checked={form.pinned} onChange={e => setForm({...form, pinned: e.target.checked})} style={{ accentColor: '#c9a84c' }} /> 📌 Pin to top
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem', color: '#d0d0d0' }}>
                <input type="checkbox" checked={form.emailAll} onChange={e => setForm({...form, emailAll: e.target.checked})} style={{ accentColor: '#c9a84c' }} /> 📧 Also email all students
              </label>
            </div>
            <button className="btn btn-gold" onClick={create} disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Posting...' : '📢 Post Announcement'}
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? <div className="loading-center"><span className="spinner"></span></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {list.length === 0 && <p style={{ color: '#9a9a9a', textAlign: 'center', padding: 24 }}>No announcements yet.</p>}
            {list.map(a => (
              <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {a.pinned && <span className="badge badge-gold">📌 Pinned</span>}
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.title}</h3>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#b0b0b0', lineHeight: 1.6, marginBottom: 8 }}>{a.body}</p>
                  <div style={{ fontSize: '0.75rem', color: '#777' }}>
                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · 👁 Read by {a._count.reads} students
                  </div>
                </div>
                <button className="btn btn-sm" style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ef5350' }} onClick={() => remove(a.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
