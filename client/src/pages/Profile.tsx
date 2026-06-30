import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import PasswordInput from '../components/PasswordInput';

export default function Profile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => { api.myPayments().then(setPayments).catch(() => {}); }, []);

  const signalActive = user?.tier === 'vvip' || (!!user?.signalSubUntil && new Date(user.signalSubUntil) > new Date());
  const tierLabel = user?.tier === 'vvip' ? 'VVIP' : user?.tier === 'premium' ? 'Premium' : 'Free';
  const tierColor = user?.tier === 'vvip' ? '#c9a84c' : user?.tier === 'premium' ? '#4aa3d4' : '#9a9a9a';

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      await api.updateMe(form);
      refresh();
      setMsg('Profile updated!');
    } catch (e: any) { setMsg(e.message); }
    finally { setSaving(false); }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault(); setPwMsg('');
    if (pwForm.newPassword !== pwForm.confirm) { setPwMsg('New passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { setPwMsg('New password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      await api.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e: any) { setPwMsg(e.message); }
    finally { setPwSaving(false); }
  }

  return (
    <DashboardLayout title="My Profile" subtitle="Update your personal information.">
      <div style={{ maxWidth: 560 }}>
        <div className="card card-premium">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 700, flexShrink: 0 }}>
              {user?.name?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user?.name}</div>
              <div style={{ color: '#9a9a9a', fontSize: '0.88rem' }}>{user?.email}</div>
              <span className="badge badge-green" style={{ marginTop: 6 }}>Student</span>
            </div>
          </div>

          {msg && <div className={`alert ${msg.includes('updated') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email (cannot change)</label>
              <input value={user?.email} disabled style={{ opacity: 0.5 }} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+233 24 000 0000" />
            </div>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card" style={{ marginTop: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 18 }}>🔒 Change Password</h2>
          {pwMsg && <div className={`alert ${pwMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>{pwMsg}</div>}
          <form onSubmit={handlePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label>Current Password</label>
              <PasswordInput required value={pwForm.currentPassword} onChange={v => setPwForm({...pwForm, currentPassword: v})} placeholder="Your current password" autoComplete="current-password" />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <PasswordInput required value={pwForm.newPassword} onChange={v => setPwForm({...pwForm, newPassword: v})} placeholder="Min. 6 characters" autoComplete="new-password" />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <PasswordInput required value={pwForm.confirm} onChange={v => setPwForm({...pwForm, confirm: v})} placeholder="Re-enter new password" autoComplete="new-password" />
            </div>
            <button type="submit" className="btn btn-outline" disabled={pwSaving} style={{ alignSelf: 'flex-start' }}>
              {pwSaving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Membership & Billing */}
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>💳 Membership & Billing</h2>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: tierColor, background: `${tierColor}1a`, border: `1px solid ${tierColor}55`, padding: '3px 12px', borderRadius: 20 }}>{tierLabel}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#9a9a9a' }}>Signal Subscription</span>
              {signalActive
                ? <span style={{ color: '#4caf50', fontWeight: 600 }}>Active{user?.tier !== 'vvip' && user?.signalSubUntil ? ` until ${new Date(user.signalSubUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ' (lifetime)'}</span>
                : <span style={{ color: '#9a9a9a' }}>Not subscribed</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem' }}>
              <span style={{ color: '#9a9a9a' }}>Student ID</span>
              <span style={{ fontFamily: 'monospace', color: '#c9a84c' }}>{user?.studentId || '—'}</span>
            </div>
          </div>

          {user?.tier !== 'vvip' && <Link to="/pricing" className="btn btn-gold btn-sm" style={{ marginBottom: 18 }}>Upgrade Membership</Link>}

          <h3 style={{ fontWeight: 700, fontSize: '0.85rem', margin: '6px 0 10px', color: '#9a9a9a' }}>Payment History</h3>
          {payments.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>No payments yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {payments.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: '0.84rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{p.purpose.replace('_', ' ')}</div>
                    <div style={{ fontSize: '0.74rem', color: '#9a9a9a' }}>{new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {p.method}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: '#c9a84c' }}>${p.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
