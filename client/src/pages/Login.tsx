import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await api.login(form);
      login(res.token, res.user);
      nav(res.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell heading="Welcome back" sub="Login to continue your trading journey.">
      {err && <div className="alert alert-error">{err}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <PasswordInput required placeholder="Your password" value={form.password} onChange={v => setForm({...form, password: v})} autoComplete="current-password" />
        </div>
        <div style={{ textAlign: 'right', marginTop: -6 }}>
          <Link to="/forgot" style={{ color: '#9a9a9a', fontSize: '0.83rem' }}>Forgot password?</Link>
        </div>
        <button type="submit" className="btn btn-gold" disabled={loading}>
          {loading ? <><span className="spinner"></span> Logging in...</> : 'Login →'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: '#9a9a9a' }}>
        No account? <Link to="/register" style={{ color: '#c9a84c', fontWeight: 600 }}>Register free</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: 10, fontSize: '0.82rem' }}>
        <Link to="/admin/login" style={{ color: '#666' }}>Admin login →</Link>
      </p>
    </AuthShell>
  );
}
