import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import AuthShell from '../../components/AuthShell';
import PasswordInput from '../../components/PasswordInput';

export default function AdminLogin() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const res = await api.login(form);
      if (res.user.role !== 'admin') { setErr('Not an admin account'); return; }
      login(res.token, res.user);
      nav('/admin');
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell heading="Admin Portal" sub="Sign in to manage AfriFX Academy.">
      {err && <div className="alert alert-error">{err}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@afrifx.com" />
        </div>
        <div className="form-group">
          <label>Password</label>
          <PasswordInput required value={form.password} onChange={v => setForm({...form, password: v})} placeholder="••••••••" autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-gold" disabled={loading}>
          {loading ? 'Logging in...' : 'Login as Admin →'}
        </button>
      </form>
    </AuthShell>
  );
}
