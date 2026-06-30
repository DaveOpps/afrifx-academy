import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import CandleChart from '../components/charts/CandleChart';
import OrderBook from '../components/OrderBook';
import TradesFeed from '../components/TradesFeed';
import { fetchKlines, fetchTicker24h, SYMBOLS, INTERVALS } from '../api/market';
import { streamKline } from '../api/marketStream';
export default function Markets() {
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [interval, setIntervalV] = useState('1h');
    const [candles, setCandles] = useState(null);
    const [stats, setStats] = useState(null);
    const [live, setLive] = useState(false);
    const meta = SYMBOLS.find(s => s.sym === symbol);
    const dp = meta.dp;
    useEffect(() => {
        let active = true;
        const loadKlines = async () => {
            const k = await fetchKlines(symbol, interval, 60);
            if (!active)
                return;
            if (k && k.length) {
                setCandles(k);
                setLive(true);
            }
            else {
                setCandles(null);
                setLive(false);
            }
        };
        loadKlines();
        const t = setInterval(loadKlines, 30000); // periodic resync
        // Live: update the forming candle tick-by-tick
        const stop = streamKline(symbol, interval, (c) => {
            if (!active)
                return;
            setLive(true);
            setCandles(prev => {
                if (!prev || !prev.length)
                    return prev;
                const arr = prev.slice();
                if (arr[arr.length - 1].t === c.t)
                    arr[arr.length - 1] = c;
                else {
                    arr.push(c);
                    if (arr.length > 60)
                        arr.shift();
                }
                return arr;
            });
        });
        return () => { active = false; clearInterval(t); stop(); };
    }, [symbol, interval]);
    useEffect(() => {
        let active = true;
        const loadStats = async () => { const s = await fetchTicker24h(symbol); if (active)
            setStats(s); };
        loadStats();
        const t = setInterval(loadStats, 5000);
        return () => { active = false; clearInterval(t); };
    }, [symbol]);
    const fmt = (v) => v == null ? '—' : (+v).toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
    const change = stats ? +stats.priceChangePercent : 0;
    return (_jsxs(PageShell, { title: "Live Markets", subtitle: "Real-time crypto prices, charts and order book \u2014 powered by live market data.", children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsxs("div", { className: "card card-premium", children: [_jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }, children: SYMBOLS.map(s => (_jsx("button", { onClick: () => setSymbol(s.sym), className: `btn btn-sm ${symbol === s.sym ? 'btn-gold' : 'btn-outline'}`, children: s.label }, s.sym))) }), _jsxs("div", { style: { display: 'flex', gap: 'clamp(16px,4vw,44px)', flexWrap: 'wrap', alignItems: 'baseline' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.7rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }, children: meta.label }), _jsx("div", { className: "mono", style: { fontSize: '1.9rem', fontWeight: 800, color: change >= 0 ? 'var(--up)' : 'var(--down)' }, children: fmt(stats?.lastPrice) })] }), _jsx(Stat, { label: "24h Change", value: stats ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—', color: change >= 0 ? 'var(--up)' : 'var(--down)' }), _jsx(Stat, { label: "24h High", value: fmt(stats?.highPrice) }), _jsx(Stat, { label: "24h Low", value: fmt(stats?.lowPrice) }), _jsx(Stat, { label: "24h Volume", value: stats ? (+stats.volume).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—' })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20 }, className: "mk-grid", children: [_jsxs("div", { className: "card card-premium", children: [_jsx("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, justifyContent: 'flex-end' }, children: INTERVALS.map(iv => (_jsx("button", { onClick: () => setIntervalV(iv.v), className: `btn btn-sm ${interval === iv.v ? 'btn-gold' : 'btn-outline'}`, style: { padding: '5px 13px' }, children: iv.label }, iv.v))) }), _jsx(CandleChart, { data: candles ?? undefined, pair: meta.label, live: live, width: 760, height: 420 })] }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsx("div", { className: "card card-premium", children: _jsx(OrderBook, { symbol: symbol, rows: 11, dp: dp }) }), _jsx("div", { className: "card card-premium", children: _jsx(TradesFeed, { symbol: symbol, rows: 16, dp: dp }) })] })] }), _jsx("p", { style: { textAlign: 'center', color: '#666', fontSize: '0.76rem' }, children: "Live data via Binance public market API. For education only \u2014 not financial advice." })] }), _jsx("style", { children: `@media (max-width: 820px){ .mk-grid { grid-template-columns: 1fr !important; } }` })] }));
}
function Stat({ label, value, color }) {
    return (_jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.7rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }, children: label }), _jsx("div", { className: "mono", style: { fontSize: '1rem', fontWeight: 700, color: color || '#fff' }, children: value })] }));
}
