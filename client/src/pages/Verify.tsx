import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function Verify() {
  const { code } = useParams();
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) { setError('No verification code provided.'); setLoading(false); return; }
    api.verifyCert(code)
      .then(setResult)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Logo */}
      <Link to="/" style={{ marginBottom: 40, textDecoration: 'none' }}>
        <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.8rem' }}>
          <span style={{ color: '#fff' }}>Afri</span><span style={{ color: '#c9a84c' }}>FX</span>
        </span>
        <span style={{ fontSize: '0.65rem', color: '#9a9a9a', letterSpacing: 3, display: 'block', textTransform: 'uppercase', textAlign: 'center' }}>Academy</span>
      </Link>

      <div style={{ width: '100%', maxWidth: 520 }}>
        {loading ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <span className="spinner" style={{ width: 40, height: 40 }}></span>
            <p style={{ color: '#9a9a9a', marginTop: 16 }}>Verifying certificate...</p>
          </div>
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>❌</div>
            <h2 style={{ color: '#ef5350', marginBottom: 8 }}>Certificate Not Found</h2>
            <p style={{ color: '#9a9a9a', marginBottom: 24 }}>The verification code <strong style={{ color: '#fff', fontFamily: 'monospace' }}>{code}</strong> does not match any AfriFX Academy certificate.</p>
            <p style={{ color: '#666', fontSize: '0.85rem' }}>If you believe this is an error, please contact us.</p>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: 48, border: '1px solid rgba(76,175,80,0.4)', background: 'rgba(76,175,80,0.04)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>✅</div>
            <h2 style={{ color: '#4caf50', marginBottom: 4 }}>Certificate Verified</h2>
            <p style={{ color: '#9a9a9a', marginBottom: 32, fontSize: '0.9rem' }}>This is an authentic AfriFX Academy certificate.</p>

            <div style={{ background: '#0d0d0d', borderRadius: 12, padding: 24, textAlign: 'left', marginBottom: 24 }}>
              {[
                ['Certificate Holder', result.holderName],
                ['Course Completed', result.course],
                ['Date Issued', new Date(result.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Verification Code', result.verifyCode],
                ['Issued By', 'AfriFX Academy'],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 12 }}>
                  <span style={{ fontSize: '0.82rem', color: '#9a9a9a', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', textAlign: 'right', fontFamily: label === 'Verification Code' ? 'monospace' : undefined, color: label === 'Verification Code' ? '#c9a84c' : '#fff' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ background: '#fff', padding: 10, borderRadius: 10 }}>
                <img src={`/api/qr?text=${encodeURIComponent(window.location.href)}&size=160`} alt="Verification QR" width={140} height={140} style={{ display: 'block' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#9a9a9a' }}>Scan to re-verify this certificate</span>
            </div>

            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: '0.82rem', color: '#9a9a9a' }}>
              Verified on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.78rem', marginTop: 24 }}>
          Certificate verification powered by <span style={{ color: '#c9a84c' }}>AfriFX Academy</span>
        </p>
      </div>
    </div>
  );
}
