import { useState } from 'react';

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(value) ? '#c9a84c' : 'rgba(255,255,255,0.2)' }}>★</span>
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, size = 28 }: { value: number; onChange: (v: number) => void; size?: number }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button" onClick={() => onChange(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: size, lineHeight: 1, color: i <= (hover || value) ? '#c9a84c' : 'rgba(255,255,255,0.25)', transition: 'color 0.15s' }}>★</button>
      ))}
    </span>
  );
}
