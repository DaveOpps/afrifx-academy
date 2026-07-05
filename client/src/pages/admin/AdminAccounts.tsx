import { useEffect, useState, Fragment } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  admin:      { bg: 'rgba(201,168,76,0.15)', color: '#c9a84c' },
  instructor: { bg: 'rgba(58,134,201,0.15)', color: '#3a86c9' },
  student:    { bg: 'rgba(154,154,154,0.15)', color: '#9a9a9a' },
};

interface Account { id: number; name: string; email: string; role: string; phone: string | null; studentId: string | null; createdAt: string; }

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState<{ id: number; text: string; ok: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.adminAccounts().then(setAccounts).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  function toggleRow(id: number) {
    setOpenId(openId === id ? null : id);
    setNewPw(''); setMsg(null);
  }

  async function overridePassword(a: Account) {
    if (newPw.length < 6) { setMsg({ id: a.id, text: 'Password must be at least 6 characters', ok: false }); return; }
    if (!confirm(`Override the password for ${a.name} (${a.email})? They will need to use this new password to log in.`)) return;
    setSaving(true);
    try {
      await api.resetStudentPassword(a.id, newPw);
      setMsg({ id: a.id, text: 'Password overridden successfully', ok: true });
      setNewPw('');
    } catch (e: any) {
      setMsg({ id: a.id, text: e.message, ok: false });
    } finally { setSaving(false); }
  }

  return (
    <DashboardLayout
      title={`Accounts (${accounts.length})`}
      subtitle="Every account on the platform — override any password if a student, instructor, or admin is locked out."
      actions={<input placeholder="Search name, email or role..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: '0.84rem', outline: 'none', width: 240 }} />}
    >
      {loading ? <div className="loading-center"><span className="spinner"></span></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Account</th><th>Role</th><th>Phone</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {filtered.map(a => {
                const rs = ROLE_STYLE[a.role] || ROLE_STYLE.student;
                return (
                  <Fragment key={a.id}>
                    <tr>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>{a.name[0]}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{a.name}</div>
                            <div style={{ color: '#9a9a9a', fontSize: '0.78rem' }}>{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span style={{ background: rs.bg, color: rs.color, padding: '3px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>{a.role}</span></td>
                      <td style={{ color: '#9a9a9a', fontSize: '0.84rem' }}>{a.phone || '—'}</td>
                      <td style={{ color: '#9a9a9a', fontSize: '0.82rem' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => toggleRow(a.id)}>{openId === a.id ? 'Close' : '🔑 Override Password'}</button></td>
                    </tr>
                    {openId === a.id && (
                      <tr>
                        <td colSpan={5} style={{ padding: 0 }}>
                          <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                              <input type="text" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min. 6 chars)"
                                style={{ flex: 1, minWidth: 200, padding: '9px 12px', background: '#141418', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.85rem' }} />
                              <button className="btn btn-gold btn-sm" onClick={() => overridePassword(a)} disabled={saving}>{saving ? 'Saving...' : 'Set New Password'}</button>
                            </div>
                            {msg && msg.id === a.id && <div style={{ fontSize: '0.8rem', color: msg.ok ? 'var(--up)' : 'var(--down)' }}>{msg.text}</div>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#9a9a9a', padding: 32 }}>No accounts match your search.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
