import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setSent(true);
      if (res.devResetUrl) setDevUrl(res.devResetUrl);
    } catch {}
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Forgot Password?</h1>
            <p style={{ color: '#9a9a9a', fontSize: '0.9rem' }}>Enter your email to receive a reset link.</p>
          </div>
          <div className="card" style={{ padding: 32 }}>
            {sent ? (
              <div>
                <div className="alert alert-success">If that email exists, a reset link has been sent. Check your inbox.</div>
                {devUrl && (
                  <div style={{ marginTop: 12, padding: 12, background: 'rgba(201,168,76,0.08)', borderRadius: 8, border: '1px solid rgba(201,168,76,0.25)' }}>
                    <p style={{ fontSize: '0.78rem', color: '#c9a84c', marginBottom: 6 }}>📝 Dev mode (email not configured) — use this link:</p>
                    <Link to={devUrl.replace('http://localhost:5173', '')} style={{ color: '#c9a84c', fontSize: '0.8rem', wordBreak: 'break-all' }}>{devUrl}</Link>
                  </div>
                )}
                <Link to="/login" className="btn btn-outline" style={{ width: '100%', marginTop: 16 }}>Back to Login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <button type="submit" className="btn btn-gold" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link →'}</button>
                <Link to="/login" style={{ textAlign: 'center', color: '#9a9a9a', fontSize: '0.85rem' }}>Back to Login</Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
