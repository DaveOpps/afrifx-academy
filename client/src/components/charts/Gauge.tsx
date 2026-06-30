export default function Gauge({ value, size = 200, label, sublabel, color = '#c9a84c' }: {
  value: number;       // 0-100
  size?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const thickness = 16;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  // Half circle: semicircle arc length
  const semi = Math.PI * r;
  const dash = (pct / 100) * semi;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size / 2 + 10 }}>
        <svg width={size} height={size / 2 + 10}>
          {/* track */}
          <path
            d={`M ${thickness / 2} ${cy} A ${r} ${r} 0 0 1 ${size - thickness / 2} ${cy}`}
            fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={thickness} strokeLinecap="round"
          />
          {/* value */}
          <path
            d={`M ${thickness / 2} ${cy} A ${r} ${r} 0 0 1 ${size - thickness / 2} ${cy}`}
            fill="none" stroke={color} strokeWidth={thickness} strokeLinecap="round"
            strokeDasharray={`${dash} ${semi}`}
            style={{ transition: 'stroke-dasharray 0.7s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{label ?? `${Math.round(pct)}%`}</div>
          {sublabel && <div style={{ fontSize: '0.74rem', color: '#9a9a9a', marginTop: 4 }}>{sublabel}</div>}
        </div>
      </div>
    </div>
  );
}
