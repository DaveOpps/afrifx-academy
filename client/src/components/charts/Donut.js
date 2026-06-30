import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Donut({ segments, size = 180, thickness = 18, centerTop, centerBottom }) {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const r = (size - thickness) / 2;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }, children: [_jsxs("div", { style: { position: 'relative', width: size, height: size }, children: [_jsxs("svg", { width: size, height: size, style: { transform: 'rotate(-90deg)' }, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: "rgba(255,255,255,0.06)", strokeWidth: thickness }), segments.map((seg, i) => {
                                const len = (seg.value / total) * c;
                                const dash = `${len} ${c - len}`;
                                const el = (_jsx("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: seg.color, strokeWidth: thickness, strokeDasharray: dash, strokeDashoffset: -offset, strokeLinecap: "round", style: { transition: 'stroke-dasharray 0.6s ease' } }, i));
                                offset += len;
                                return el;
                            })] }), _jsxs("div", { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }, children: [centerTop && _jsx("div", { style: { fontSize: '0.72rem', color: '#9a9a9a' }, children: centerTop }), centerBottom && _jsx("div", { style: { fontSize: '1.8rem', fontWeight: 800, color: '#fff' }, children: centerBottom })] })] }), _jsx("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }, children: segments.map((seg, i) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#c8c8c8' }, children: [_jsx("span", { style: { width: 9, height: 9, borderRadius: '50%', background: seg.color } }), seg.label] }, i))) })] }));
}
