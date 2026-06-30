import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
export function Stars({ value, size = 16 }) {
    return (_jsx("span", { style: { display: 'inline-flex', gap: 1 }, children: [1, 2, 3, 4, 5].map(i => (_jsx("span", { style: { fontSize: size, color: i <= Math.round(value) ? '#c9a84c' : 'rgba(255,255,255,0.2)' }, children: "\u2605" }, i))) }));
}
export function StarInput({ value, onChange, size = 28 }) {
    const [hover, setHover] = useState(0);
    return (_jsx("span", { style: { display: 'inline-flex', gap: 4 }, children: [1, 2, 3, 4, 5].map(i => (_jsx("button", { type: "button", onClick: () => onChange(i), onMouseEnter: () => setHover(i), onMouseLeave: () => setHover(0), style: { background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: size, lineHeight: 1, color: i <= (hover || value) ? '#c9a84c' : 'rgba(255,255,255,0.25)', transition: 'color 0.15s' }, children: "\u2605" }, i))) }));
}
