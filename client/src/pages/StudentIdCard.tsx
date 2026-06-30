import { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function StudentIdCard() {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  function downloadCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 700;
    canvas.height = 420;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0, 0, 700, 420);

    // Gold border
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, 6, 688, 408);

    // Inner border
    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, 672, 392);

    // Left gold strip
    ctx.fillStyle = '#c9a84c';
    ctx.fillRect(6, 6, 8, 408);

    // Logo area
    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 36px serif';
    ctx.fillText('AfriFX', 50, 70);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText('A C A D E M Y', 50, 90);

    // Divider
    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 105);
    ctx.lineTo(300, 105);
    ctx.stroke();

    // Avatar circle
    ctx.fillStyle = 'rgba(201,168,76,0.2)';
    ctx.beginPath();
    ctx.arc(80, 180, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Initial
    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText((user?.name?.[0] || 'A').toUpperCase(), 80, 192);
    ctx.textAlign = 'left';

    // Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px serif';
    ctx.fillText(user?.name || '', 160, 165);

    // Role badge
    ctx.fillStyle = 'rgba(201,168,76,0.15)';
    ctx.roundRect(160, 175, 90, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#c9a84c';
    ctx.font = '11px sans-serif';
    ctx.fillText('● STUDENT', 170, 191);

    // Email
    ctx.fillStyle = '#9a9a9a';
    ctx.font = '13px sans-serif';
    ctx.fillText(user?.email || '', 160, 220);

    // Student ID label
    ctx.fillStyle = '#c9a84c';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('STUDENT ID', 40, 280);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(user?.studentId || 'AFX2026-00000', 40, 305);

    // Member since
    ctx.fillStyle = '#9a9a9a';
    ctx.font = '11px sans-serif';
    ctx.fillText('MEMBER SINCE', 40, 345);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    const since = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '';
    ctx.fillText(since, 40, 365);

    // Right side - white QR box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(500, 80, 150, 150);
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1;
    ctx.strokeRect(500, 80, 150, 150);

    // Bottom bar
    ctx.fillStyle = '#c9a84c';
    ctx.fillRect(6, 390, 688, 24);
    ctx.fillStyle = '#0d0d0d';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AFRIFX ACADEMY · EMPOWERING AFRICAN TRADERS · www.afrifxacademy.com', 350, 406);
    ctx.textAlign = 'left';

    // Load the real QR, draw it into the box, then export
    const finish = () => {
      const a = document.createElement('a');
      a.download = `AFRIFX_ID_${user?.studentId || 'card'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    const qrText = `AFRIFX ACADEMY | Student: ${user?.name || ''} | ID: ${user?.studentId || ''}`;
    const qr = new Image();
    qr.onload = () => { ctx.drawImage(qr, 507, 87, 136, 136); finish(); };
    qr.onerror = () => {
      ctx.fillStyle = '#9a9a9a'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('AFRIFX ID', 575, 158); ctx.textAlign = 'left'; finish();
    };
    qr.src = `/api/qr?text=${encodeURIComponent(qrText)}&size=300`;
  }

  return (
    <DashboardLayout title="Student ID Card" subtitle="Your official AfriFX Academy student identity card.">
      <div style={{ maxWidth: 760 }}>
        {/* ID Card Preview */}
        <div ref={cardRef} style={{
          background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)',
          border: '2px solid #c9a84c',
          borderRadius: 16,
          padding: '32px 36px',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 28,
          boxShadow: '0 0 40px rgba(201,168,76,0.15)'
        }}>
          {/* Gold left strip */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: '#c9a84c' }} />

          <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Left: logo + avatar + name */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.6rem', color: '#c9a84c' }}>AfriFX</span>
                <div style={{ fontSize: '0.65rem', letterSpacing: 4, color: '#9a9a9a', textTransform: 'uppercase' }}>Academy</div>
              </div>
              <div style={{ width: 1, height: 1, borderTop: '1px solid rgba(201,168,76,0.3)', marginBottom: 20 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, border: '2px solid #c9a84c', flexShrink: 0 }}>
                  {user?.name?.[0]}
                </div>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: '1.15rem' }}>{user?.name}</div>
                  <span className="badge badge-green" style={{ marginTop: 4 }}>Student</span>
                  <div style={{ fontSize: '0.78rem', color: '#9a9a9a', marginTop: 4 }}>{user?.email}</div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                <div style={{ fontSize: '0.65rem', letterSpacing: 2, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 4 }}>Student ID</div>
                <div style={{ fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700, letterSpacing: 1 }}>{user?.studentId || '—'}</div>
              </div>

              {user?.createdAt && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: '0.65rem', letterSpacing: 2, color: '#9a9a9a', textTransform: 'uppercase', marginBottom: 2 }}>Member Since</div>
                  <div style={{ fontSize: '0.88rem' }}>{new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                </div>
              )}
            </div>

            {/* Right: real QR code */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 110, height: 110, borderRadius: 8, background: '#fff', padding: 7, flexShrink: 0 }}>
                <img
                  src={`/api/qr?text=${encodeURIComponent(`AFRIFX ACADEMY | Student: ${user?.name || ''} | ID: ${user?.studentId || ''}`)}&size=200`}
                  alt="Student QR" width={96} height={96} style={{ display: 'block' }} />
              </div>
              <span style={{ fontSize: '0.62rem', color: '#9a9a9a', textAlign: 'center' }}>Scan to verify</span>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ background: '#c9a84c', borderRadius: 8, padding: '8px 16px', marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#0d0d0d', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 1 }}>AFRIFX ACADEMY</span>
            <span style={{ color: '#0d0d0d', fontSize: '0.68rem' }}>EMPOWERING AFRICAN TRADERS</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-gold" onClick={downloadCard}>Download ID Card (PNG)</button>
          <button className="btn btn-outline" onClick={() => window.print()}>Print Card</button>
        </div>

        <div className="card" style={{ marginTop: 28, background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)' }}>
          <p style={{ fontSize: '0.85rem', color: '#9a9a9a' }}>
            Your Student ID <strong style={{ color: '#c9a84c' }}>{user?.studentId}</strong> is your unique AfriFX Academy identifier.
            Use it when contacting support or attending seminars and events.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
