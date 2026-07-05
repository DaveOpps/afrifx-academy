import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import AuthShell from '../components/AuthShell';
import PasswordInput from '../components/PasswordInput';

export default function Register() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const res = await api.register(form);
      login(res.token, res.user);
      nav('/dashboard');
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthShell heading="Create your account" sub="Join thousands of African traders — it's free.">
      {err && <div className="alert alert-error">{err}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-group">
          <label>Full Name</label>
          <input required placeholder="Kofi Mensah Asante" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <PasswordInput required placeholder="Min. 6 characters" value={form.password} onChange={v => setForm({...form, password: v})} autoComplete="new-password" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input required placeholder="+233 24 000 0000" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <button type="submit" className="btn btn-gold" style={{ marginTop: 4 }} disabled={loading}>
          {loading ? <><span className="spinner"></span> Creating account...</> : 'Create Account →'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.88rem', color: '#9a9a9a' }}>
        Already have an account? <Link to="/login" style={{ color: '#c9a84c', fontWeight: 600 }}>Login</Link>
      </p>
    </AuthShell>
  );
}
