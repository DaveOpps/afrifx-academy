import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Gauge({ value, size = 200, label, sublabel, color = '#c9a84c' }) {
    const pct = Math.max(0, Math.min(100, value));
    const thickness = 16;
    const r = (size - thickness) / 2;
    const cx = size / 2;
    const cy = size / 2;
    // Half circle: semicircle arc length
    const semi = Math.PI * r;
    const dash = (pct / 100) * semi;
    return (_jsx("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' }, children: _jsxs("div", { style: { position: 'relative', width: size, height: size / 2 + 10 }, children: [_jsxs("svg", { width: size, height: size / 2 + 10, children: [_jsx("path", { d: `M ${thickness / 2} ${cy} A ${r} ${r} 0 0 1 ${size - thickness / 2} ${cy}`, fill: "none", stroke: "rgba(255,255,255,0.08)", strokeWidth: thickness, strokeLinecap: "round" }), _jsx("path", { d: `M ${thickness / 2} ${cy} A ${r} ${r} 0 0 1 ${size - thickness / 2} ${cy}`, fill: "none", stroke: color, strokeWidth: thickness, strokeLinecap: "round", strokeDasharray: `${dash} ${semi}`, style: { transition: 'stroke-dasharray 0.7s ease' } })] }), _jsxs("div", { style: { position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1 }, children: label ?? `${Math.round(pct)}%` }), sublabel && _jsx("div", { style: { fontSize: '0.74rem', color: '#9a9a9a', marginTop: 4 }, children: sublabel })] })] }) }));
}
