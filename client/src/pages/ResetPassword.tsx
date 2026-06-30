import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
import PasswordInput from '../components/PasswordInput';

export default function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (pw !== pw2) return setErr('Passwords do not match');
    if (pw.length < 6) return setErr('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.resetPassword(token!, pw);
      setDone(true);
      setTimeout(() => nav('/login'), 2000);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Reset Password</h1>
            <p style={{ color: '#9a9a9a', fontSize: '0.9rem' }}>Choose a new password for your account.</p>
          </div>
          <div className="card" style={{ padding: 32 }}>
            {done ? (
              <div className="alert alert-success">✓ Password reset! Redirecting to login...</div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {err && <div className="alert alert-error">{err}</div>}
                <div className="form-group">
                  <label>New Password</label>
                  <PasswordInput required value={pw} onChange={setPw} placeholder="Min. 6 characters" autoComplete="new-password" />
                </div>
                <div className="form-group">
                  <label>Confirm Password</label>
                  <PasswordInput required value={pw2} onChange={setPw2} placeholder="Re-enter password" autoComplete="new-password" />
                </div>
                <button type="submit" className="btn btn-gold" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password →'}</button>
                <Link to="/login" style={{ textAlign: 'center', color: '#9a9a9a', fontSize: '0.85rem' }}>Back to Login</Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
