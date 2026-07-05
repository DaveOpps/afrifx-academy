import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';

const GREEN = '#0d4d2e';
const GOLD = '#c9a84c';

export default function StudentIdCard() {
  const { user } = useAuth();
  const [courseName, setCourseName] = useState('Not yet enrolled');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.myEnrollments().then((rows: any[]) => {
      if (rows && rows.length > 0) setCourseName(rows[0].course.title);
    }).catch(() => {});
  }, []);

  function downloadCard() {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 560;
    const ctx = canvas.getContext('2d')!;

    // Outer black border + white card body
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.roundRect(0, 0, 900, 560, 22); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.roundRect(8, 8, 884, 544, 16); ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(14, 14, 872, 532, 12); ctx.stroke();

    // Diagonal green sash separating left/right halves
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(470, 20); ctx.lineTo(510, 20); ctx.lineTo(450, 480); ctx.lineTo(410, 480);
    ctx.closePath();
    ctx.fillStyle = GREEN; ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();

    // Logo wordmark
    ctx.fillStyle = '#111'; ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('AfriFX', 42, 74);
    ctx.fillStyle = GREEN; ctx.fillRect(150, 40, 4, 26); // simplified "candle" accent
    ctx.fillStyle = GOLD; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left';
    ctx.fillText('A C A D E M Y', 42, 96);

    // Simplified seal badge
    ctx.beginPath(); ctx.arc(340, 78, 38, 0, Math.PI * 2);
    ctx.fillStyle = GREEN; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.stroke();
    ctx.fillStyle = GOLD; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
    ctx.fillText('AFRIFX', 340, 72);
    ctx.fillText('ACADEMY', 340, 86);
    ctx.textAlign = 'left';

    // "STUDENT ID" banner
    ctx.fillStyle = GREEN; ctx.beginPath(); ctx.roundRect(42, 140, 340, 44, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('STUDENT ID', 212, 170);
    ctx.textAlign = 'left';
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(140, 194); ctx.lineTo(285, 194); ctx.stroke();

    // Certifies text
    ctx.fillStyle = '#222'; ctx.font = '14px Arial';
    wrapText(ctx, 'This ID card certifies that the bearer is a registered student of', 42, 225, 360, 19);
    ctx.font = 'bold 14px Arial'; ctx.fillStyle = GREEN;
    ctx.fillText('AfriFX Academy', 42, 244);
    ctx.font = '14px Arial'; ctx.fillStyle = '#222';
    ctx.fillText('and is enrolled in the', 172, 244);
    ctx.font = 'bold 14px Arial'; ctx.fillStyle = GREEN;
    wrapText(ctx, courseName + '.', 42, 263, 360, 19);

    // Footnote columns
    const notes = [
      'This ID is non-transferable.',
      'Use of this ID is subject to AfriFX Academy rules and regulations.',
      'Carry this ID during all academy activities and sessions.',
      'If found, please return to AfriFX Academy.',
    ];
    ctx.font = '9.5px Arial'; ctx.fillStyle = '#444';
    notes.forEach((n, i) => {
      const x = 42 + i * 92;
      if (i > 0) { ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 8, 340); ctx.lineTo(x - 8, 430); ctx.stroke(); }
      wrapText(ctx, n, x, 350, 82, 12);
    });

    // Photo box
    ctx.fillStyle = '#eee'; ctx.strokeStyle = '#999'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(510, 40, 150, 175, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = GREEN; ctx.font = 'bold 60px Arial'; ctx.textAlign = 'center';
    ctx.fillText((user?.name?.[0] || 'A').toUpperCase(), 585, 145);
    ctx.textAlign = 'left';

    // Labeled fields
    const field = (label: string, value: string, y: number) => {
      ctx.fillStyle = GREEN; ctx.font = 'bold 11px Arial';
      ctx.fillText(label, 680, y);
      ctx.fillStyle = '#111'; ctx.font = '15px Arial';
      ctx.fillText(value || '—', 680, y + 22);
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(680, y + 28); ctx.lineTo(850, y + 28); ctx.stroke();
    };
    field('STUDENT NAME:', user?.name || '', 60);
    field('STUDENT ID:', user?.studentId || '—', 110);
    field('COURSE:', courseName, 160);

    // Signature
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(510, 300); ctx.lineTo(660, 300); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.font = 'italic bold 24px Georgia, serif';
    ctx.fillText('Nana K. Owoahene', 512, 292);
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Nana Kwaku Owoahene', 510, 318);
    ctx.font = '10px Arial'; ctx.fillStyle = '#666';
    ctx.fillText('CEO, AFRIFX ACADEMY', 510, 332);

    // QR code (replaces barcode)
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(750, 240, 100, 100, 6); ctx.stroke();

    // Green footer bar
    ctx.fillStyle = GREEN; ctx.beginPath(); ctx.roundRect(14, 480, 872, 66, [0, 0, 12, 12]); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'left';
    ctx.fillText('🌐 www.afrifxacademy.com', 34, 505);
    ctx.fillText('📧 afrifxacademy@gmail.com', 34, 524);
    ctx.textAlign = 'center';
    ctx.fillText('💬 WhatsApp: +233 24 529 9949', 450, 505);
    ctx.fillText('+233 55 312 8733', 450, 524);
    ctx.textAlign = 'right';
    ctx.fillText('@afrifxacademy', 866, 512);
    ctx.font = 'bold 11px Arial'; ctx.fillStyle = GOLD; ctx.textAlign = 'center';
    ctx.fillText('EMPOWERING A MILLION AFRICAN TRADERS', 450, 540);
    ctx.textAlign = 'left';

    const finish = () => {
      const a = document.createElement('a');
      a.download = `AFRIFX_ID_${user?.studentId || 'card'}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    const qrText = `AFRIFX ACADEMY | Student: ${user?.name || ''} | ID: ${user?.studentId || ''}`;
    const qr = new Image();
    qr.onload = () => { ctx.drawImage(qr, 755, 245, 90, 90); finish(); };
    qr.onerror = finish;
    qr.src = `/api/qr?text=${encodeURIComponent(qrText)}&size=300`;
  }

  return (
    <DashboardLayout title="Student ID Card" subtitle="Your official AfriFX Academy student identity card.">
      <div style={{ maxWidth: 900 }}>
        {/* ID Card Preview */}
        <div ref={cardRef} style={{
          background: '#fff', color: '#111', border: '3px solid #000', borderRadius: 18,
          padding: '22px 28px', position: 'relative', overflow: 'hidden', marginBottom: 28,
          boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        }}>
          <div style={{ position: 'absolute', inset: 3, border: `2px solid ${GOLD}`, borderRadius: 14, pointerEvents: 'none' }} />

          <div style={{ display: 'flex', gap: 24, position: 'relative' }}>
            {/* Left column */}
            <div style={{ flex: 1.15, minWidth: 260 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.9rem', color: '#111' }}>AfriFX</span>
                <div style={{ width: 62, height: 62, borderRadius: '50%', background: GREEN, border: `3px solid ${GOLD}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: GOLD, fontWeight: 800, fontSize: '0.55rem', letterSpacing: 1, textAlign: 'center', lineHeight: 1.3 }}>
                  <span>AFRIFX</span><span>ACADEMY</span>
                </div>
              </div>
              <div style={{ fontSize: '0.68rem', letterSpacing: 4, color: GOLD, fontWeight: 700, marginBottom: 14 }}>A C A D E M Y</div>

              <div style={{ background: GREEN, borderRadius: 6, padding: '10px 0', textAlign: 'center', maxWidth: 320 }}>
                <span style={{ color: '#fff', fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.25rem', letterSpacing: 1 }}>STUDENT ID</span>
              </div>
              <div style={{ borderBottom: `3px solid ${GOLD}`, width: 160, margin: '6px auto 16px' }} />

              <p style={{ fontSize: '0.86rem', color: '#333', lineHeight: 1.6, maxWidth: 340 }}>
                This ID card certifies that the bearer is a registered student of <b style={{ color: GREEN }}>AfriFX Academy</b> and is enrolled in the <b style={{ color: GREEN }}>{courseName}</b>.
              </p>

              <div style={{ display: 'flex', gap: 0, marginTop: 20, maxWidth: 360 }}>
                {[
                  'This ID is non-transferable.',
                  'Use of this ID is subject to AfriFX Academy rules and regulations.',
                  'Carry this ID during all academy activities and sessions.',
                  'If found, please return to AfriFX Academy.',
                ].map((n, i) => (
                  <div key={i} style={{ flex: 1, padding: '0 8px', borderLeft: i > 0 ? '1px solid #ccc' : 'none', fontSize: '0.62rem', color: '#555', lineHeight: 1.4 }}>{n}</div>
                ))}
              </div>
            </div>

            {/* Diagonal sash divider */}
            <div style={{ width: 3, background: GREEN, alignSelf: 'stretch', transform: 'skewX(-8deg)', boxShadow: `0 0 0 1px ${GOLD}` }} />

            {/* Right column */}
            <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 100, height: 118, borderRadius: 8, background: '#eee', border: '1.5px solid #999', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '2.6rem', fontWeight: 800, color: GREEN }}>{(user?.name?.[0] || 'A').toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: GREEN, letterSpacing: 1 }}>STUDENT NAME:</div>
                    <div style={{ fontSize: '0.95rem', borderBottom: '1px solid #333', paddingBottom: 2, minWidth: 150 }}>{user?.name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: GREEN, letterSpacing: 1 }}>STUDENT ID:</div>
                    <div style={{ fontSize: '0.95rem', fontFamily: 'monospace', borderBottom: '1px solid #333', paddingBottom: 2, minWidth: 150 }}>{user?.studentId || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: GREEN, letterSpacing: 1 }}>COURSE:</div>
                    <div style={{ fontSize: '0.95rem', borderBottom: '1px solid #333', paddingBottom: 2, minWidth: 150 }}>{courseName}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
                <div>
                  <div style={{ borderTop: '1px solid #333', width: 140, marginBottom: 6 }} />
                  <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 700, fontSize: '1rem', color: '#111' }}>Nana K. Owoahene</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#111' }}>Nana Kwaku Owoahene</div>
                  <div style={{ fontSize: '0.64rem', color: '#666' }}>CEO, AFRIFX ACADEMY</div>
                </div>
                <div style={{ width: 88, height: 88, border: `1.5px solid ${GOLD}`, borderRadius: 8, padding: 4, background: '#fff' }}>
                  <img src={`/api/qr?text=${encodeURIComponent(`AFRIFX ACADEMY | Student: ${user?.name || ''} | ID: ${user?.studentId || ''}`)}&size=200`}
                    alt="Student QR" width={78} height={78} style={{ display: 'block' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Green footer bar */}
          <div style={{ background: GREEN, borderRadius: 8, padding: '10px 20px', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, color: '#fff', fontSize: '0.72rem', fontWeight: 600 }}>
              <span>🌐 www.afrifxacademy.com &nbsp; 📧 afrifxacademy@gmail.com</span>
              <span>💬 WhatsApp: +233 24 529 9949 / +233 55 312 8733</span>
              <span>@afrifxacademy</span>
            </div>
            <div style={{ textAlign: 'center', color: GOLD, fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1 }}>EMPOWERING A MILLION AFRICAN TRADERS</div>
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      ctx.fillText(line, x, curY);
      line = word + ' ';
      curY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, curY);
}
