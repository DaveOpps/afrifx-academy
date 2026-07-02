import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import PageShell from '../components/PageShell';
import TradingViewWidget from '../components/TradingViewWidget';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
// Our instrument key -> TradingView chart symbol.
const TV = {
    EURUSD: 'OANDA:EURUSD', GBPUSD: 'OANDA:GBPUSD', USDJPY: 'OANDA:USDJPY',
    AUDUSD: 'OANDA:AUDUSD', USDCAD: 'OANDA:USDCAD', XAUUSD: 'OANDA:XAUUSD',
    BTCUSD: 'BINANCE:BTCUSDT', ETHUSD: 'BINANCE:ETHUSDT',
};
const money = (n) => n == null ? '—' : (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export default function Trade() {
    const { user } = useAuth();
    const [insts, setInsts] = useState([]);
    const [symbol, setSymbol] = useState('EURUSD');
    const [side, setSide] = useState('buy');
    const [stake, setStake] = useState('100');
    const [leverage, setLeverage] = useState(10);
    const [acct, setAcct] = useState(null);
    const [positions, setPositions] = useState([]);
    const [history, setHistory] = useState([]);
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    const meta = insts.find(i => i.symbol === symbol);
    const price = meta?.price ?? null;
    const dp = meta?.dp ?? 4;
    const refresh = useCallback(async () => {
        try {
            const [a, p, i] = await Promise.all([api.paperAccount(), api.paperPositions(), api.paperInstruments()]);
            setAcct(a);
            setPositions(p);
            setInsts(i);
        }
        catch { /* ignore transient */ }
    }, []);
    const loadHistory = useCallback(async () => {
        try {
            setHistory(await api.paperHistory());
        }
        catch { /* ignore */ }
    }, []);
    useEffect(() => {
        if (!user)
            return;
        refresh();
        loadHistory();
        const t = setInterval(refresh, 5000); // live P&L
        return () => clearInterval(t);
    }, [user, refresh, loadHistory]);
    async function openTrade() {
        setMsg(null);
        setBusy(true);
        try {
            await api.paperOpen({ symbol, side, stake: Number(stake), leverage });
            setMsg({ t: 'ok', m: `${side.toUpperCase()} ${meta?.display} opened` });
            await refresh();
        }
        catch (e) {
            setMsg({ t: 'err', m: e.message });
        }
        finally {
            setBusy(false);
        }
    }
    async function close(id) {
        setBusy(true);
        try {
            await api.paperClose(id);
            await refresh();
            await loadHistory();
        }
        catch (e) {
            setMsg({ t: 'err', m: e.message });
        }
        finally {
            setBusy(false);
        }
    }
    async function reset() {
        if (!confirm('Reset your demo account to $10,000 and clear all trades?'))
            return;
        setBusy(true);
        try {
            await api.paperReset();
            await refresh();
            await loadHistory();
            setMsg({ t: 'ok', m: 'Demo account reset to $10,000' });
        }
        finally {
            setBusy(false);
        }
    }
    if (!user) {
        return _jsx(PageShell, { title: "Paper Trading", subtitle: "Practice trading with a demo balance.", children: _jsx("div", { className: "card card-premium", style: { textAlign: 'center', padding: 40 }, children: "Please log in to use the trading simulator." }) });
    }
    const upDown = (n) => (n ?? 0) >= 0 ? 'var(--up)' : 'var(--down)';
    return (_jsxs(PageShell, { title: "Paper Trading", subtitle: "Practice trading real markets with a demo balance \u2014 no real money, no risk.", children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }, children: [_jsx(Kpi, { label: "Balance", value: money(acct?.balance) }), _jsx(Kpi, { label: "Equity", value: money(acct?.equity), tint: "#c9a84c" }), _jsx(Kpi, { label: "Available", value: money(acct?.available) }), _jsx(Kpi, { label: "Open P&L", value: money(acct?.openPnl), color: upDown(acct?.openPnl) }), _jsx(Kpi, { label: "Open Trades", value: String(acct?.openCount ?? 0) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20 }, className: "tr-grid", children: [_jsx("div", { className: "card card-premium", style: { padding: 8 }, children: _jsx(TradingViewWidget, { scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js", height: 480, config: { width: '100%', height: 480, symbol: TV[symbol], interval: '60', timezone: 'Etc/UTC', theme: 'dark', style: '1', locale: 'en', hide_side_toolbar: true, allow_symbol_change: false, calendar: false, support_host: 'https://www.tradingview.com' } }) }), _jsxs("div", { className: "card card-premium", style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [_jsxs("div", { children: [_jsx("label", { style: lbl, children: "Instrument" }), _jsx("select", { value: symbol, onChange: e => setSymbol(e.target.value), style: inp, children: insts.map(i => _jsx("option", { value: i.symbol, children: i.display }, i.symbol)) })] }), _jsxs("div", { style: { textAlign: 'center', padding: '6px 0' }, children: [_jsx("div", { style: { fontSize: '0.68rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }, children: "Live Price" }), _jsx("div", { className: "mono", style: { fontSize: '1.7rem', fontWeight: 800, color: '#fff' }, children: price == null ? '—' : price.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp }) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }, children: [_jsx("button", { onClick: () => setSide('buy'), className: `btn btn-sm ${side === 'buy' ? '' : 'btn-outline'}`, style: side === 'buy' ? { background: 'var(--up)', color: '#04150b', fontWeight: 800 } : {}, children: "\u25B2 BUY" }), _jsx("button", { onClick: () => setSide('sell'), className: `btn btn-sm ${side === 'sell' ? '' : 'btn-outline'}`, style: side === 'sell' ? { background: 'var(--down)', color: '#fff', fontWeight: 800 } : {}, children: "\u25BC SELL" })] }), _jsxs("div", { children: [_jsx("label", { style: lbl, children: "Stake (margin, $)" }), _jsx("input", { type: "number", min: 1, value: stake, onChange: e => setStake(e.target.value), style: inp })] }), _jsxs("div", { children: [_jsx("label", { style: lbl, children: "Leverage" }), _jsx("select", { value: leverage, onChange: e => setLeverage(Number(e.target.value)), style: inp, children: [1, 5, 10, 20, 50, 100].map(l => _jsxs("option", { value: l, children: [l, "x"] }, l)) })] }), _jsxs("div", { style: { fontSize: '0.72rem', color: '#9a9a9a' }, children: ["Position size: ", _jsx("b", { style: { color: '#c9a84c' }, children: money(Number(stake) * leverage) })] }), _jsx("button", { onClick: openTrade, disabled: busy || price == null, className: "btn btn-gold", style: { width: '100%', fontWeight: 800 }, children: busy ? '…' : `Open ${side.toUpperCase()} Trade` }), msg && _jsx("div", { style: { fontSize: '0.78rem', color: msg.t === 'ok' ? 'var(--up)' : 'var(--down)', textAlign: 'center' }, children: msg.m })] })] }), _jsxs("div", { className: "card card-premium", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0 }, children: "Open Positions" }), _jsx("button", { onClick: reset, className: "btn btn-outline btn-sm", disabled: busy, children: "Reset demo" })] }), positions.length === 0 ? _jsx("p", { style: { color: '#9a9a9a', margin: 0 }, children: "No open positions. Place a trade above to get started." }) : (_jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: tbl, children: [_jsx("thead", { children: _jsx("tr", { children: ['Instrument', 'Side', 'Stake', 'Lev', 'Entry', 'Current', 'P&L', ''].map(h => _jsx("th", { style: th, children: h }, h)) }) }), _jsx("tbody", { children: positions.map(p => (_jsxs("tr", { style: { borderTop: '1px solid rgba(255,255,255,0.06)' }, children: [_jsx("td", { style: td, children: p.display }), _jsx("td", { style: { ...td, color: p.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }, children: p.side.toUpperCase() }), _jsx("td", { style: td, children: money(p.stake) }), _jsxs("td", { style: td, children: [p.leverage, "x"] }), _jsx("td", { style: { ...td, fontFamily: 'monospace' }, children: p.entryPrice }), _jsx("td", { style: { ...td, fontFamily: 'monospace' }, children: p.price ?? '—' }), _jsx("td", { style: { ...td, color: upDown(p.pnl), fontWeight: 700, fontFamily: 'monospace' }, children: money(p.pnl) }), _jsx("td", { style: td, children: _jsx("button", { onClick: () => close(p.id), disabled: busy, className: "btn btn-outline btn-sm", children: "Close" }) })] }, p.id))) })] }) }))] }), history.length > 0 && (_jsxs("div", { className: "card card-premium", children: [_jsx("h3", { style: { marginTop: 0 }, children: "Trade History" }), _jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: tbl, children: [_jsx("thead", { children: _jsx("tr", { children: ['Instrument', 'Side', 'Stake', 'Entry', 'Exit', 'P&L', 'Closed'].map(h => _jsx("th", { style: th, children: h }, h)) }) }), _jsx("tbody", { children: history.map(h => (_jsxs("tr", { style: { borderTop: '1px solid rgba(255,255,255,0.06)' }, children: [_jsx("td", { style: td, children: h.display }), _jsx("td", { style: { ...td, color: h.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }, children: h.side.toUpperCase() }), _jsx("td", { style: td, children: money(h.stake) }), _jsx("td", { style: { ...td, fontFamily: 'monospace' }, children: h.entryPrice }), _jsx("td", { style: { ...td, fontFamily: 'monospace' }, children: h.exitPrice }), _jsx("td", { style: { ...td, color: upDown(h.pnl), fontWeight: 700, fontFamily: 'monospace' }, children: money(h.pnl) }), _jsx("td", { style: { ...td, color: '#9a9a9a', fontSize: '0.75rem' }, children: new Date(h.closedAt).toLocaleString() })] }, h.id))) })] }) })] })), _jsx("p", { style: { textAlign: 'center', color: '#666', fontSize: '0.76rem' }, children: "Demo trading with virtual funds. Prices via Yahoo Finance. For education only \u2014 not financial advice." })] }), _jsx("style", { children: `@media (max-width: 820px){ .tr-grid { grid-template-columns: 1fr !important; } }` })] }));
}
const lbl = { display: 'block', fontSize: '0.68rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 };
const inp = { width: '100%', padding: '9px 11px', background: '#141418', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.9rem' };
const tbl = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' };
const th = { textAlign: 'left', padding: '6px 10px', color: '#9a9a9a', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1 };
const td = { padding: '9px 10px', color: '#e6e6e6' };
function Kpi({ label, value, color, tint }) {
    return (_jsxs("div", { className: "card", style: { padding: '14px 16px', borderTop: tint ? `2px solid ${tint}` : undefined }, children: [_jsx("div", { style: { fontSize: '0.66rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }, children: label }), _jsx("div", { className: "mono", style: { fontSize: '1.25rem', fontWeight: 800, color: color || '#fff', marginTop: 3 }, children: value })] }));
}
