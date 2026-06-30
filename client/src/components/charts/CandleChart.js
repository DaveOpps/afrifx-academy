import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
// Generate plausible demo candles via a seeded-ish random walk.
function genCandles(n, start) {
    const out = [];
    let price = start;
    for (let i = 0; i < n; i++) {
        const o = price;
        const drift = (Math.random() - 0.48) * start * 0.012;
        const c = Math.max(start * 0.9, o + drift);
        const h = Math.max(o, c) + Math.random() * start * 0.006;
        const l = Math.min(o, c) - Math.random() * start * 0.006;
        out.push({ o, h, l, c, v: Math.random() * 800 + 120 });
        price = c;
    }
    return out;
}
const MAS = [{ p: 7, color: '#c9a84c' }, { p: 25, color: '#4aa3d4' }];
export default function CandleChart({ data, width = 560, height = 260, pair = 'XAU/USD', live = false, showMA = true, }) {
    const candles = useMemo(() => data ?? genCandles(34, 2340), [data]);
    const [hover, setHover] = useState(null);
    const pad = { top: 16, right: 8, bottom: 16, left: 44 };
    const cw = width - pad.left - pad.right;
    const chTotal = height - pad.top - pad.bottom;
    const volH = chTotal * 0.22;
    const gap = 10;
    const priceCh = chTotal - volH - gap;
    const volBase = pad.top + priceCh + gap + volH;
    const max = Math.max(...candles.map(c => c.h));
    const min = Math.min(...candles.map(c => c.l));
    const range = max - min || 1;
    const maxVol = Math.max(...candles.map(c => c.v ?? 0), 1);
    const hasVol = candles.some(c => (c.v ?? 0) > 0);
    const dp = max >= 1000 ? 0 : max >= 100 ? 1 : max >= 1 ? 2 : 4;
    const fmt = (v) => v.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
    const y = (v) => pad.top + ((max - v) / range) * priceCh;
    const slot = cw / candles.length;
    const bw = Math.max(3, slot * 0.6);
    const last = candles[candles.length - 1];
    const first = candles[0];
    const up = last.c >= first.o;
    const gridVals = [max, max - range / 2, min];
    const maLine = (period) => {
        const pts = [];
        for (let i = period - 1; i < candles.length; i++) {
            let sum = 0;
            for (let j = i - period + 1; j <= i; j++)
                sum += candles[j].c;
            pts.push(`${pad.left + i * slot + slot / 2},${y(sum / period)}`);
        }
        return pts.join(' ');
    };
    function onMove(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        const vbX = relX * width;
        const vbY = Math.max(pad.top, Math.min(pad.top + priceCh, relY * height));
        let idx = Math.round((vbX - pad.left) / slot - 0.5);
        idx = Math.max(0, Math.min(candles.length - 1, idx));
        setHover({ idx, relX, vbY });
    }
    const hc = hover ? candles[hover.idx] : null;
    const hoverPrice = hover ? max - ((hover.vbY - pad.top) / priceCh) * range : 0;
    const crossX = hover ? pad.left + (hover.idx + 0.5) * slot : 0;
    return (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 10 }, children: [_jsx("span", { style: { fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.15rem' }, children: pair }), _jsx("span", { className: "mono", style: { fontSize: '1rem', color: up ? '#0ecb81' : '#f6465d' }, children: fmt(last.c) }), _jsxs("span", { style: { fontSize: '0.74rem', fontWeight: 700, color: up ? '#0ecb81' : '#f6465d' }, children: [up ? '▲' : '▼', " ", Math.abs(((last.c - first.o) / first.o) * 100).toFixed(2), "%"] })] }), _jsxs("span", { style: { fontSize: '0.62rem', color: live ? 'var(--up)' : '#666', background: 'rgba(255,255,255,0.05)', padding: '2px 9px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5 }, children: [live && _jsx("span", { style: { width: 5, height: 5, borderRadius: '50%', background: 'var(--up)', animation: 'livePulse 1.8s infinite' } }), live ? 'LIVE' : 'demo data'] })] }), _jsxs("div", { style: { position: 'relative' }, onMouseMove: onMove, onMouseLeave: () => setHover(null), children: [showMA && (_jsx("div", { style: { position: 'absolute', top: 4, left: 48, display: 'flex', gap: 12, fontSize: '0.64rem', pointerEvents: 'none', zIndex: 1 }, children: MAS.filter(m => candles.length > m.p).map(m => _jsxs("span", { className: "mono", style: { color: m.color }, children: ["MA", m.p] }, m.p)) })), _jsxs("svg", { width: "100%", viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: "none", style: { display: 'block' }, children: [gridVals.map((v, i) => (_jsxs("g", { children: [_jsx("line", { x1: pad.left, x2: width - pad.right, y1: y(v), y2: y(v), stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }), _jsx("text", { x: 4, y: y(v) + 3, fill: "#777", fontSize: 9, fontFamily: "monospace", children: fmt(v) })] }, i))), hasVol && candles.map((c, i) => {
                                const cx = pad.left + i * slot + slot / 2;
                                const h = ((c.v ?? 0) / maxVol) * volH;
                                const bull = c.c >= c.o;
                                return _jsx("rect", { x: cx - bw / 2, y: volBase - h, width: bw, height: Math.max(0.5, h), fill: bull ? '#0ecb81' : '#f6465d', opacity: hover && hover.idx !== i ? 0.25 : 0.45, rx: 1 }, `v${i}`);
                            }), candles.map((c, i) => {
                                const cx = pad.left + i * slot + slot / 2;
                                const bull = c.c >= c.o;
                                const col = bull ? '#0ecb81' : '#f6465d';
                                const yO = y(c.o), yC = y(c.c);
                                const top = Math.min(yO, yC);
                                const bodyH = Math.max(1.5, Math.abs(yC - yO));
                                return (_jsxs("g", { opacity: hover && hover.idx !== i ? 0.7 : 1, children: [_jsx("line", { x1: cx, x2: cx, y1: y(c.h), y2: y(c.l), stroke: col, strokeWidth: 1 }), _jsx("rect", { x: cx - bw / 2, y: top, width: bw, height: bodyH, fill: col, rx: 1 })] }, i));
                            }), showMA && MAS.filter(m => candles.length > m.p).map(m => (_jsx("polyline", { points: maLine(m.p), fill: "none", stroke: m.color, strokeWidth: 1.3, opacity: 0.85, strokeLinejoin: "round" }, m.p))), hover && (_jsxs("g", { children: [_jsx("line", { x1: crossX, x2: crossX, y1: pad.top, y2: volBase, stroke: "rgba(201,168,76,0.55)", strokeWidth: 1, strokeDasharray: "3 3" }), _jsx("line", { x1: pad.left, x2: width - pad.right, y1: hover.vbY, y2: hover.vbY, stroke: "rgba(201,168,76,0.55)", strokeWidth: 1, strokeDasharray: "3 3" }), _jsx("rect", { x: 0, y: hover.vbY - 8, width: pad.left - 2, height: 16, fill: "#c9a84c", rx: 2 }), _jsx("text", { x: 4, y: hover.vbY + 3, fill: "#0d0d0d", fontSize: 9, fontWeight: 700, fontFamily: "monospace", children: fmt(hoverPrice) })] }))] }), hc && (_jsxs("div", { style: {
                            position: 'absolute', top: 6, left: `${hover.relX > 0.6 ? hover.relX * 100 - 2 : hover.relX * 100 + 2}%`,
                            transform: hover.relX > 0.6 ? 'translateX(-100%)' : 'none',
                            background: 'rgba(12,12,14,0.95)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                            padding: '8px 10px', pointerEvents: 'none', fontSize: '0.72rem', display: 'flex', gap: 10, whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        }, children: [[['O', hc.o], ['H', hc.h], ['L', hc.l], ['C', hc.c]].map(([k, v]) => (_jsxs("span", { style: { color: '#9a9a9a' }, children: [k, " ", _jsx("b", { className: "mono", style: { color: hc.c >= hc.o ? '#0ecb81' : '#f6465d' }, children: fmt(v) })] }, k))), hc.v != null && _jsxs("span", { style: { color: '#9a9a9a' }, children: ["Vol ", _jsx("b", { className: "mono", style: { color: '#c8c8c8' }, children: hc.v.toLocaleString(undefined, { maximumFractionDigits: 0 }) })] })] }))] })] }));
}
