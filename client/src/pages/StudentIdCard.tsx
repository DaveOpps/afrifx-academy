import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../api';

const GREEN = '#0d4d2e';
const GOLD = '#c9a84c';
const SEAL_DARK = '#0d1f12';

function SealBadge({ size = 100 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
      <defs>
        <path id="sealTopArc" d="M 22 92 A 78 78 0 0 1 178 92" fill="none" />
        <path id="sealBottomArc" d="M 178 118 A 78 78 0 0 1 22 118" fill="none" />
      </defs>
      <circle cx="100" cy="100" r="95" fill={SEAL_DARK} stroke={GOLD} strokeWidth="4" />
      <circle cx="100" cy="100" r="80" fill="none" stroke={GOLD} strokeWidth="1.2" opacity="0.8" />
      <path d="M100 58c10 0 17 6 19 15 6 2 10 8 9 15 5 4 7 11 4 18 4 7 3 16-3 21 1 7-2 14-9 16-1 6-8 10-14 8-3 5-10 5-13 0-7 1-13-3-14-9-6-1-10-7-8-13-5-4-6-11-3-17-4-6-3-14 2-19-1-7 3-13 9-15 1-6 6-10 12-10z" fill={GREEN} />
      <polyline points="72,126 86,110 98,118 126,80" fill="none" stroke={GOLD} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="126,80 114,83 123,93" fill={GOLD} />
      <circle cx="126" cy="116" r="11" fill={GOLD} />
      <text x="126" y="120.5" fontSize="12" fontWeight="800" fill={SEAL_DARK} textAnchor="middle">₿</text>
      <text fontSize="12.5" fontWeight="800" fill={GOLD} letterSpacing="1.5">
        <textPath href="#sealTopArc" startOffset="50%" textAnchor="middle">AFRIFX ACADEMY</textPath>
      </text>
      <text fontSize="8.5" fontWeight="700" fill="#fff" letterSpacing="1">
        <textPath href="#sealBottomArc" startOffset="50%" textAnchor="middle">EMPOWERING AFRICAN TRADERS</textPath>
      </text>
    </svg>
  );
}

function IconShieldCheck({ size = 20, color = GREEN }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3z" />
      <path d="M8.5 12l2.3 2.3L15.5 9.5" />
    </svg>
  );
}

function IconGavel({ size = 20, color = GREEN }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="12.5" y="1.5" width="4.5" height="9" rx="1" transform="rotate(45 14.75 6)" />
      <line x1="11.5" y1="8" x2="4" y2="15.5" />
      <line x1="2" y1="21" x2="10" y2="21" />
      <line x1="6" y1="21" x2="6" y2="17.5" />
    </svg>
  );
}

function IconGradCap({ size = 20, color = GREEN }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4L2 9l10 5 10-5-10-5z" />
      <path d="M6 11.5v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M22 9v6" />
    </svg>
  );
}

function IconRefresh({ size = 20, color = GREEN }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11A8 8 0 106.3 17.7" />
      <polyline points="20 5 20 11 14 11" />
    </svg>
  );
}

function IconPerson({ size = 60, color = '#b7b7b7' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="8" r="4.2" />
      <path d="M4 21c0-4.5 3.6-7.5 8-7.5s8 3 8 7.5" />
    </svg>
  );
}

function FlourishIcon({ size = 14, color = GOLD }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
    </svg>
  );
}

function SocialIcon({ type }: { type: 'facebook' | 'instagram' | 'youtube' | 'telegram' }) {
  const glyphs: Record<string, JSX.Element> = {
    facebook: <path d="M13.5 9H15V6.5h-1.8c-1.9 0-3 1.1-3 3.1V11H8.5v2.5H10.2V19h2.5v-5.5h1.9l.3-2.5h-2.2V9.8c0-.6.2-.8.8-.8z" />,
    instagram: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke={SEAL_DARK} strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.4" fill="none" stroke={SEAL_DARK} strokeWidth="1.6" />
        <circle cx="16.3" cy="7.7" r="1" />
      </>
    ),
    youtube: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3" fill="none" stroke={SEAL_DARK} strokeWidth="1.6" />
        <polygon points="10,9 16,12 10,15" />
      </>
    ),
    telegram: <path d="M4 12l16-7-3 15-5-4-3 3-1-5z" fill="none" stroke={SEAL_DARK} strokeWidth="1.4" strokeLinejoin="round" />,
  };
  return (
    <div style={{ width: 22, height: 22, borderRadius: '50%', background: GOLD, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={14} height={14} viewBox="0 0 24 24" fill={SEAL_DARK}>{glyphs[type]}</svg>
    </div>
  );
}

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

    // Logo wordmark (green candle bar in place of the "i")
    ctx.fillStyle = '#111'; ctx.font = 'bold 40px Georgia, serif';
    ctx.fillText('Afr', 42, 74);
    const afrWidth = ctx.measureText('Afr').width;
    ctx.fillStyle = GREEN; ctx.fillRect(42 + afrWidth + 4, 38, 7, 32);
    ctx.fillStyle = '#111';
    ctx.fillText('FX', 42 + afrWidth + 18, 74);
    ctx.fillStyle = GOLD; ctx.font = 'bold 13px Arial'; ctx.textAlign = 'left';
    ctx.fillText('A C A D E M Y', 42, 96);

    // Seal badge (simplified — no arched text on canvas)
    ctx.beginPath(); ctx.arc(340, 78, 40, 0, Math.PI * 2);
    ctx.fillStyle = SEAL_DARK; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = GOLD; ctx.stroke();
    ctx.beginPath(); ctx.arc(340, 78, 32, 0, Math.PI * 2);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.globalAlpha = 0.7; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillStyle = GOLD; ctx.font = 'bold 9px Arial'; ctx.textAlign = 'center';
    ctx.fillText('AFRIFX ACADEMY', 340, 60);
    ctx.fillText('EMPOWERING', 340, 100);
    ctx.fillText('AFRICAN TRADERS', 340, 110);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(325, 88); ctx.lineTo(332, 78); ctx.lineTo(338, 82); ctx.lineTo(352, 66); ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.textAlign = 'left';

    // "STUDENT ID" banner
    ctx.fillStyle = GREEN; ctx.beginPath(); ctx.roundRect(42, 140, 340, 44, 6); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText('STUDENT ID', 212, 170);
    ctx.textAlign = 'left';
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(140, 194); ctx.lineTo(285, 194); ctx.stroke();

    // Identifies text
    ctx.fillStyle = '#222'; ctx.font = '14px Arial';
    wrapText(ctx, 'This ID card identifies that the bearer is a registered student of', 42, 225, 360, 19);
    ctx.font = 'bold 14px Arial'; ctx.fillStyle = GREEN;
    ctx.fillText('AfriFX Academy', 42, 244);
    ctx.font = '14px Arial'; ctx.fillStyle = '#222';
    ctx.fillText('and is enrolled in the', 172, 244);
    ctx.font = 'bold 14px Arial'; ctx.fillStyle = GREEN;
    wrapText(ctx, courseName + '.', 42, 263, 360, 19);

    // Footnote columns with simple icon marks
    const notes = [
      'This ID is non-transferable.',
      'Use of this ID is subject to AfriFX Academy rules and regulations.',
      'Carry this ID during all academy activities and sessions.',
      'If found, please return to AfriFX Academy.',
    ];
    notes.forEach((n, i) => {
      const x = 42 + i * 92;
      if (i > 0) { ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 8, 300); ctx.lineTo(x - 8, 430); ctx.stroke(); }
      // simple icon glyph
      ctx.strokeStyle = GREEN; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const cx = x + 34, cy = 312;
      ctx.beginPath();
      if (i === 0) { ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.moveTo(cx - 4, cy); ctx.lineTo(cx - 1, cy + 3); ctx.lineTo(cx + 4, cy - 4); }
      else if (i === 1) { ctx.moveTo(cx - 8, cy + 8); ctx.lineTo(cx + 4, cy - 4); ctx.moveTo(cx - 2, cy - 8); ctx.lineTo(cx + 8, cy + 2); }
      else if (i === 2) { ctx.moveTo(cx - 9, cy - 2); ctx.lineTo(cx, cy - 7); ctx.lineTo(cx + 9, cy - 2); ctx.lineTo(cx, cy + 3); ctx.closePath(); }
      else { ctx.arc(cx, cy, 8, 0.3, Math.PI * 1.8); ctx.moveTo(cx + 8, cy - 6); ctx.lineTo(cx + 8, cy); ctx.lineTo(cx + 2, cy); }
      ctx.stroke();
      ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
      ctx.font = '9.5px Arial'; ctx.fillStyle = '#444'; ctx.textAlign = 'center';
      wrapText(ctx, n, x + 34, 335, 82, 12, 'center');
      ctx.textAlign = 'left';
    });

    // Photo box — person silhouette placeholder
    ctx.fillStyle = '#eee'; ctx.strokeStyle = '#999'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(510, 40, 150, 175, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#b7b7b7';
    ctx.beginPath(); ctx.arc(585, 100, 26, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(585, 175, 48, Math.PI, Math.PI * 2); ctx.fill();

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

    // Ornate divider
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(510, 232); ctx.lineTo(660, 232); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(690, 232); ctx.lineTo(850, 232); ctx.stroke();
    ctx.fillStyle = GOLD;
    ctx.beginPath(); ctx.moveTo(675, 224); ctx.lineTo(680, 232); ctx.lineTo(675, 240); ctx.lineTo(670, 232); ctx.closePath(); ctx.fill();

    // Signature
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(510, 300); ctx.lineTo(660, 300); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.font = 'italic bold 24px Georgia, serif';
    ctx.fillText('Nana K. Owoahene', 512, 292);
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Nana Kwaku Owoahene', 510, 318);
    ctx.font = '10px Arial'; ctx.fillStyle = '#666';
    ctx.fillText('CEO, AFRIFX ACADEMY', 510, 332);

    // QR code (replaces barcode) + caption
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(750, 240, 100, 100, 6); ctx.stroke();
    ctx.fillStyle = '#555'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
    ctx.fillText('Scan To Verify', 800, 356);
    ctx.textAlign = 'left';

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
    // small gold social dots
    ['f', 'ig', 'yt', 'tg'].forEach((_, i) => {
      const sx = 866 - 110 - i * 22;
      ctx.beginPath(); ctx.arc(sx, 508, 8, 0, Math.PI * 2);
      ctx.fillStyle = GOLD; ctx.fill();
    });
    ctx.font = 'bold 11px Arial'; ctx.fillStyle = GOLD; ctx.textAlign = 'center';
    ctx.fillText('EMPOWERING AFRICAN TRADERS', 450, 540);
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.9rem', color: '#111' }}>Afr</span>
                    <span style={{ display: 'inline-block', width: 7, height: '0.78em', background: GREEN, borderRadius: 1, margin: '0 3px' }} />
                    <span style={{ fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.9rem', color: '#111' }}>FX</span>
                  </div>
                  <div style={{ fontSize: '0.68rem', letterSpacing: 4, color: GOLD, fontWeight: 700, marginTop: 2 }}>A C A D E M Y</div>
                </div>
                <SealBadge size={92} />
              </div>

              <div style={{ background: GREEN, borderRadius: 6, padding: '10px 0', textAlign: 'center', maxWidth: 320 }}>
                <span style={{ color: '#fff', fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.25rem', letterSpacing: 1 }}>STUDENT ID</span>
              </div>
              <div style={{ borderBottom: `3px solid ${GOLD}`, width: 160, margin: '6px auto 16px' }} />

              <p style={{ fontSize: '0.86rem', color: '#333', lineHeight: 1.6, maxWidth: 340 }}>
                This ID card identifies that the bearer is a registered student of <b style={{ color: GREEN }}>AfriFX Academy</b> and is enrolled in the <b style={{ color: GREEN }}>{courseName}</b>.
              </p>

              <div style={{ display: 'flex', gap: 0, marginTop: 20, maxWidth: 380 }}>
                {[
                  { icon: <IconShieldCheck />, text: 'This ID is non-transferable.' },
                  { icon: <IconGavel />, text: 'Use of this ID is subject to AfriFX Academy rules and regulations.' },
                  { icon: <IconGradCap />, text: 'Carry this ID during all academy activities and sessions.' },
                  { icon: <IconRefresh />, text: 'If found, please return to AfriFX Academy.' },
                ].map((n, i) => (
                  <div key={i} style={{ flex: 1, padding: '0 8px', borderLeft: i > 0 ? '1px solid #ccc' : 'none', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>{n.icon}</div>
                    <div style={{ fontSize: '0.6rem', color: '#555', lineHeight: 1.4 }}>{n.text}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagonal sash divider */}
            <div style={{ width: 3, background: GREEN, alignSelf: 'stretch', transform: 'skewX(-8deg)', boxShadow: `0 0 0 1px ${GOLD}` }} />

            {/* Right column */}
            <div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 100, height: 118, borderRadius: 8, background: '#eee', border: '1.5px solid #999', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <IconPerson size={64} color="#b7b7b7" />
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

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0' }}>
                <div style={{ flex: 1, borderTop: `1.5px solid ${GOLD}` }} />
                <FlourishIcon />
                <div style={{ flex: 1, borderTop: `1.5px solid ${GOLD}` }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontWeight: 700, fontSize: '1.1rem', color: '#111' }}>Nana K. Owoahene</div>
                  <div style={{ borderTop: '1px solid #333', width: 140, margin: '4px 0 6px' }} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#111' }}>Nana Kwaku Owoahene</div>
                  <div style={{ fontSize: '0.64rem', color: '#666' }}>CEO, AFRIFX ACADEMY</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 88, height: 88, border: `1.5px solid ${GOLD}`, borderRadius: 8, padding: 4, background: '#fff' }}>
                    <img src={`/api/qr?text=${encodeURIComponent(`AFRIFX ACADEMY | Student: ${user?.name || ''} | ID: ${user?.studentId || ''}`)}&size=200`}
                      alt="Student QR" width={78} height={78} style={{ display: 'block' }} />
                  </div>
                  <div style={{ fontSize: '0.6rem', color: '#555', fontWeight: 700, marginTop: 4, letterSpacing: 0.5 }}>Scan To Verify</div>
                </div>
              </div>
            </div>
          </div>

          {/* Green footer bar */}
          <div style={{ background: GREEN, borderRadius: 8, padding: '10px 20px', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, color: '#fff', fontSize: '0.72rem', fontWeight: 600, alignItems: 'center' }}>
              <span>🌐 www.afrifxacademy.com &nbsp; 📧 afrifxacademy@gmail.com</span>
              <span>💬 WhatsApp: +233 24 529 9949 / +233 55 312 8733</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <SocialIcon type="facebook" />
                <SocialIcon type="instagram" />
                <SocialIcon type="youtube" />
                <SocialIcon type="telegram" />
                <span>@afrifxacademy</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', color: GOLD, fontSize: '0.68rem', fontWeight: 700, letterSpacing: 1 }}>EMPOWERING AFRICAN TRADERS</div>
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

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, align: 'left' | 'center' = 'left') {
  const words = text.split(' ');
  let line = '';
  let curY = y;
  const lines: string[] = [];
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line !== '') {
      lines.push(line);
      line = word + ' ';
    } else {
      line = test;
    }
  }
  lines.push(line);
  lines.forEach((l) => { ctx.fillText(align === 'center' ? l.trim() : l, x, curY); curY += lineHeight; });
}
