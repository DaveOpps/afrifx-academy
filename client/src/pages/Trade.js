import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import PageShell from '../components/PageShell';
import TradingViewWidget from '../components/TradingViewWidget';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
// Available chart data sources (providers) per instrument, for the "Chart source"
// picker. The chart is for analysis only — trade execution always uses our own
// (Yahoo Finance) price feed regardless of which chart provider is shown.
function providerOptions(instSym) {
    if (instSym === 'BTCUSD' || instSym === 'ETHUSD') {
        const base = instSym.replace('USD', '');
        return [
            { label: 'Binance', tv: `BINANCE:${base}USDT` },
            { label: 'Coinbase', tv: `COINBASE:${base}USD` },
            { label: 'Bitstamp', tv: `BITSTAMP:${base}USD` },
            { label: 'Kraken', tv: `KRAKEN:${base}USD` },
            { label: 'Bybit', tv: `BYBIT:${base}USDT` },
        ];
    }
    return [
        { label: 'OANDA', tv: `OANDA:${instSym}` },
        { label: 'Forex.com', tv: `FOREXCOM:${instSym}` },
        { label: 'Pepperstone', tv: `PEPPERSTONE:${instSym}` },
        { label: 'Saxo', tv: `SAXO:${instSym}` },
        { label: 'FXCM', tv: `FXCM:${instSym}` },
        { label: 'FX (IDC)', tv: `FX_IDC:${instSym}` },
    ];
}
const ORDER_KINDS = [
    { value: 'market', label: 'Market Execution' },
    { value: 'buy_limit', label: 'Buy Limit' },
    { value: 'sell_limit', label: 'Sell Limit' },
    { value: 'buy_stop', label: 'Buy Stop' },
    { value: 'sell_stop', label: 'Sell Stop' },
];
const money = (n) => n == null ? '—' : (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export default function Trade() {
    const { user } = useAuth();
    const [insts, setInsts] = useState([]);
    const [symbol, setSymbol] = useState('EURUSD');
    const [lots, setLots] = useState(0.1);
    const [expanded, setExpanded] = useState(false);
    const [chartTv, setChartTv] = useState(providerOptions('EURUSD')[0].tv);
    const [orderKind, setOrderKind] = useState('market');
    const [orderPrice, setOrderPrice] = useState('');
    const [sl, setSl] = useState('');
    const [tp, setTp] = useState('');
    const [acct, setAcct] = useState(null);
    const [positions, setPositions] = useState([]);
    const [pending, setPending] = useState([]);
    const [history, setHistory] = useState([]);
    const [msg, setMsg] = useState(null);
    const [busy, setBusy] = useState(false);
    const meta = insts.find(i => i.symbol === symbol);
    const price = meta?.price ?? null;
    const dp = meta?.dp ?? 4;
    const units = meta ? lots * meta.contract : 0;
    const notional = meta ? (meta.usdBase ? units : units * (price ?? 0)) : 0;
    const marginReq = notional / 100; // 1:100
    // Reference price for sizing SL/TP: live price for market orders, the pending
    // trigger price once one has been entered for a limit/stop order.
    const refPrice = orderKind === 'market' ? price : (orderPrice === '' ? price : Number(orderPrice));
    // Pip distance + $ risk/reward magnitude for the SL/TP being entered (side-independent).
    const cashAt = (level) => {
        if (!meta || refPrice == null)
            return 0;
        let p = Math.abs(level - refPrice) * units;
        if (meta.usdBase)
            p = p / level;
        return p;
    };
    const pipsAway = (level) => meta ? Math.abs(level - (refPrice ?? 0)) / meta.pip : 0;
    const slNum = sl === '' ? null : Number(sl);
    const tpNum = tp === '' ? null : Number(tp);
    const risk = slNum != null && !isNaN(slNum) ? cashAt(slNum) : null;
    const reward = tpNum != null && !isNaN(tpNum) ? cashAt(tpNum) : null;
    const rr = risk && reward ? reward / risk : null;
    const fmtP = (p) => p == null ? '—' : p.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
    const stepLot = (d) => setLots(Math.max(0.01, Math.round((lots + d) * 100) / 100));
    // Pip distance + $ value of an SL/TP level on an existing position/order, measured from its entry price.
    const measureLevel = (row, level) => {
        const m = insts.find(i => i.symbol === row.symbol);
        if (!m)
            return null;
        const units = row.lots * m.contract;
        let cash = Math.abs(level - row.entryPrice) * units;
        if (m.usdBase)
            cash = cash / level;
        return { pips: Math.abs(level - row.entryPrice) / m.pip, cash };
    };
    const stepPrice = (cur, set, dir) => {
        if (refPrice == null || !meta)
            return;
        const base = cur === '' ? refPrice : Number(cur);
        set((base + dir * meta.pip).toFixed(dp));
    };
    const refresh = useCallback(async () => {
        try {
            const [a, p, pend, i] = await Promise.all([api.paperAccount(), api.paperPositions(), api.paperPending(), api.paperInstruments()]);
            setAcct(a);
            setPositions(p);
            setPending(pend);
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
    // When the instrument changes, reset the chart to its first available source.
    useEffect(() => { setChartTv(providerOptions(symbol)[0].tv); }, [symbol]);
    useEffect(() => {
        if (!user)
            return;
        refresh();
        loadHistory();
        const t = setInterval(() => { refresh(); loadHistory(); }, 5000); // live P&L + catch SL/TP auto-closes
        return () => clearInterval(t);
    }, [user, refresh, loadHistory]);
    function selectOrderKind(kind) {
        setOrderKind(kind);
        if (kind !== 'market' && orderPrice === '' && price != null && meta) {
            // Sensible default: 10 pips away from market, on the correct side of the kind.
            const dir = kind.startsWith('buy_limit') || kind === 'sell_stop' ? -1 : 1;
            setOrderPrice((price + dir * meta.pip * 10).toFixed(dp));
        }
    }
    async function openTrade(side) {
        setMsg(null);
        setBusy(true);
        try {
            await api.paperOpen({ symbol, side, lots, sl: sl === '' ? null : Number(sl), tp: tp === '' ? null : Number(tp) });
            setMsg({ t: 'ok', m: `${side.toUpperCase()} ${lots} lot ${meta?.display} opened` });
            setSl('');
            setTp('');
            await refresh();
        }
        catch (e) {
            setMsg({ t: 'err', m: e.message });
        }
        finally {
            setBusy(false);
        }
    }
    async function placePending() {
        if (orderKind === 'market')
            return;
        const [side, orderType] = orderKind.split('_');
        setMsg(null);
        setBusy(true);
        try {
            await api.paperOpen({ symbol, side, lots, orderType, price: Number(orderPrice), sl: sl === '' ? null : Number(sl), tp: tp === '' ? null : Number(tp) });
            setMsg({ t: 'ok', m: `${ORDER_KINDS.find(k => k.value === orderKind)?.label} order placed` });
            setOrderPrice('');
            setSl('');
            setTp('');
            await refresh();
        }
        catch (e) {
            setMsg({ t: 'err', m: e.message });
        }
        finally {
            setBusy(false);
        }
    }
    async function cancelPending(id) {
        setBusy(true);
        try {
            await api.paperCancel(id);
            await refresh();
        }
        catch (e) {
            setMsg({ t: 'err', m: e.message });
        }
        finally {
            setBusy(false);
        }
    }
    async function modify(p) {
        const nsl = prompt(`Stop Loss price for ${p.display} (leave blank for none):`, p.sl != null ? String(p.sl) : '');
        if (nsl === null)
            return;
        const ntp = prompt(`Take Profit price for ${p.display} (leave blank for none):`, p.tp != null ? String(p.tp) : '');
        if (ntp === null)
            return;
        setBusy(true);
        setMsg(null);
        try {
            await api.paperModify(p.id, { sl: nsl === '' ? null : Number(nsl), tp: ntp === '' ? null : Number(ntp) });
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
    return (_jsxs(PageShell, { title: "Paper Trading", subtitle: "Practice trading real markets with a demo balance \u2014 no real money, no risk.", children: [_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }, children: [_jsx(Kpi, { label: "Balance", value: money(acct?.balance) }), _jsx(Kpi, { label: "Equity", value: money(acct?.equity), tint: "#c9a84c" }), _jsx(Kpi, { label: "Available", value: money(acct?.available) }), _jsx(Kpi, { label: "Open P&L", value: money(acct?.openPnl), color: upDown(acct?.openPnl) }), _jsx(Kpi, { label: "Open Trades", value: String(acct?.openCount ?? 0) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: expanded ? '1fr' : 'minmax(0,1fr) 320px', gap: 20 }, className: "tr-grid", children: [_jsxs("div", { className: "card card-premium", style: { padding: 8, position: 'relative' }, children: [_jsx("button", { onClick: () => setExpanded(v => !v), className: "btn btn-outline btn-sm", style: { position: 'absolute', top: 16, right: 16, zIndex: 3 }, children: expanded ? '⤡ Collapse' : '⤢ Enlarge chart' }), _jsx(TradingViewWidget, { scriptSrc: "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js", height: expanded ? 780 : 480, config: { width: '100%', height: expanded ? 780 : 480, symbol: chartTv, interval: '60', timezone: 'Etc/UTC', theme: 'dark', style: '1', locale: 'en', hide_side_toolbar: false, allow_symbol_change: true, calendar: false, support_host: 'https://www.tradingview.com' } }, `${chartTv}-${expanded ? 'big' : 'small'}`)] }), _jsxs("div", { className: "card card-premium", style: { display: expanded ? 'grid' : 'flex', flexDirection: 'column', gridTemplateColumns: expanded ? 'repeat(auto-fit,minmax(220px,1fr))' : undefined, gap: 14 }, children: [_jsxs("div", { children: [_jsx("label", { style: lbl, children: "Instrument" }), _jsx("select", { value: symbol, onChange: e => setSymbol(e.target.value), style: inp, children: insts.map(i => _jsx("option", { value: i.symbol, children: i.display }, i.symbol)) })] }), _jsxs("div", { children: [_jsx("label", { style: lbl, children: "Chart source" }), _jsx("select", { value: chartTv, onChange: e => setChartTv(e.target.value), style: inp, children: providerOptions(symbol).map(o => _jsx("option", { value: o.tv, children: o.label }, o.tv)) })] }), _jsxs("div", { children: [_jsx("label", { style: lbl, children: "Order type" }), _jsx("select", { value: orderKind, onChange: e => selectOrderKind(e.target.value), style: inp, children: ORDER_KINDS.map(k => _jsx("option", { value: k.value, children: k.label }, k.value)) })] }), orderKind !== 'market' && (_jsxs("div", { children: [_jsx("label", { style: lbl, children: "Order price (trigger)" }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx(StepBtn, { onClick: () => stepPrice(orderPrice, setOrderPrice, -1), narrow: true, children: "\u2013" }), _jsx("input", { type: "number", step: "any", placeholder: fmtP(price), value: orderPrice, onChange: e => setOrderPrice(e.target.value), className: "no-spin", style: priceInp }), _jsx(StepBtn, { onClick: () => stepPrice(orderPrice, setOrderPrice, 1), narrow: true, children: "+" })] })] })), _jsxs("div", { children: [_jsx("label", { style: lbl, children: "Volume (lots)" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }, children: [[-0.5, -0.1, -0.01].map(d => (_jsx(StepBtn, { onClick: () => stepLot(d), disabled: lots + d < 0.01, children: d }, d))), _jsx("div", { className: "mono", style: { minWidth: 66, textAlign: 'center', fontSize: '1.35rem', fontWeight: 800, color: '#c9a84c' }, children: lots.toFixed(2) }), [0.01, 0.1, 0.5].map(d => (_jsxs(StepBtn, { onClick: () => stepLot(d), children: ["+", d] }, d)))] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }, children: [_jsxs("div", { children: [_jsx("label", { style: lbl, children: "Stop Loss" }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx(StepBtn, { onClick: () => stepPrice(sl, setSl, -1), narrow: true, children: "\u2013" }), _jsx("input", { type: "number", step: "any", placeholder: "\u2014", value: sl, onChange: e => setSl(e.target.value), className: "no-spin", style: priceInp }), _jsx(StepBtn, { onClick: () => stepPrice(sl, setSl, 1), narrow: true, children: "+" })] })] }), _jsxs("div", { children: [_jsx("label", { style: lbl, children: "Take Profit" }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx(StepBtn, { onClick: () => stepPrice(tp, setTp, -1), narrow: true, children: "\u2013" }), _jsx("input", { type: "number", step: "any", placeholder: "\u2014", value: tp, onChange: e => setTp(e.target.value), className: "no-spin", style: priceInp }), _jsx(StepBtn, { onClick: () => stepPrice(tp, setTp, 1), narrow: true, children: "+" })] })] })] }), (risk != null || reward != null) && (_jsxs("div", { style: { fontSize: '0.74rem', display: 'flex', flexDirection: 'column', gap: 3, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }, children: [risk != null && _jsxs("span", { style: { color: 'var(--down)' }, children: ["SL: ", pipsAway(slNum).toFixed(1), " pips \u00B7 risk ", money(risk)] }), reward != null && _jsxs("span", { style: { color: 'var(--up)' }, children: ["TP: ", pipsAway(tpNum).toFixed(1), " pips \u00B7 reward ", money(reward)] }), rr != null && _jsxs("span", { style: { color: '#c9a84c' }, children: ["Risk : Reward = 1 : ", rr.toFixed(2)] })] })), _jsxs("div", { style: { fontSize: '0.74rem', color: '#9a9a9a', display: 'flex', flexDirection: 'column', gap: 3 }, children: [_jsxs("span", { children: ["Units: ", _jsx("b", { style: { color: '#e6e6e6' }, children: units.toLocaleString() })] }), _jsxs("span", { children: ["Position value: ", _jsx("b", { style: { color: '#e6e6e6' }, children: money(notional) })] }), _jsxs("span", { children: ["Margin required: ", _jsx("b", { style: { color: '#c9a84c' }, children: money(marginReq) })] })] }), orderKind === 'market' ? (
                                    /* SELL / BUY by market */
                                    _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }, children: [_jsxs("button", { onClick: () => openTrade('sell'), disabled: busy || price == null, className: "btn", style: { background: 'var(--down)', color: '#fff', fontWeight: 800, flexDirection: 'column', lineHeight: 1.2, padding: '10px 6px' }, children: [_jsx("span", { children: "SELL" }), _jsx("span", { className: "mono", style: { fontSize: '0.95rem' }, children: fmtP(price) })] }), _jsxs("button", { onClick: () => openTrade('buy'), disabled: busy || price == null, className: "btn", style: { background: '#3a86c9', color: '#fff', fontWeight: 800, flexDirection: 'column', lineHeight: 1.2, padding: '10px 6px' }, children: [_jsx("span", { children: "BUY" }), _jsx("span", { className: "mono", style: { fontSize: '0.95rem' }, children: fmtP(price) })] })] })) : (
                                    /* Place pending order */
                                    _jsx("button", { onClick: placePending, disabled: busy || price == null || orderPrice === '', className: "btn btn-gold", style: { width: '100%', fontWeight: 800 }, children: busy ? '…' : `Place ${ORDER_KINDS.find(k => k.value === orderKind)?.label}` })), msg && _jsx("div", { style: { fontSize: '0.78rem', color: msg.t === 'ok' ? 'var(--up)' : 'var(--down)', textAlign: 'center' }, children: msg.m })] })] }), _jsxs("div", { className: "card card-premium", children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, children: [_jsx("h3", { style: { margin: 0 }, children: "Open Positions" }), _jsx("button", { onClick: reset, className: "btn btn-outline btn-sm", disabled: busy, children: "Reset demo" })] }), positions.length === 0 ? _jsx("p", { style: { color: '#9a9a9a', margin: 0 }, children: "No open positions. Place a trade above to get started." }) : (_jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: tbl, children: [_jsx("thead", { children: _jsx("tr", { children: ['Instrument', 'Side', 'Lots', 'Entry', 'Current', 'SL', 'TP', 'P&L', ''].map(h => _jsx("th", { style: th, children: h }, h)) }) }), _jsx("tbody", { children: positions.map(p => (_jsxs("tr", { style: { borderTop: '1px solid rgba(255,255,255,0.06)' }, children: [_jsx("td", { style: td, children: p.display }), _jsx("td", { style: { ...td, color: p.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }, children: p.side.toUpperCase() }), _jsx("td", { style: td, children: p.lots }), _jsx("td", { style: { ...td, fontFamily: 'monospace' }, children: p.entryPrice }), _jsx("td", { style: { ...td, fontFamily: 'monospace' }, children: p.price ?? '—' }), _jsx("td", { style: { ...td, fontFamily: 'monospace', color: '#ef7a7a' }, children: sltpCell(p, p.sl, measureLevel) }), _jsx("td", { style: { ...td, fontFamily: 'monospace', color: '#5bbf7b' }, children: sltpCell(p, p.tp, measureLevel) }), _jsx("td", { style: { ...td, color: upDown(p.pnl), fontWeight: 700, fontFamily: 'monospace' }, children: money(p.pnl) }), _jsxs("td", { style: { ...td, whiteSpace: 'nowrap' }, children: [_jsx("button", { onClick: () => modify(p), disabled: busy, className: "btn btn-outline btn-sm", style: { marginRight: 6 }, children: "SL/TP" }), _jsx("button", { onClick: () => close(p.id), disabled: busy, className: "btn btn-outline btn-sm", children: "Close" })] })] }, p.id))) })] }) }))] }), pending.length > 0 && (_jsxs("div", { className: "card card-premium", children: [_jsx("h3", { style: { marginTop: 0 }, children: "Pending Orders" }), _jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: tbl, children: [_jsx("thead", { children: _jsx("tr", { children: ['Instrument', 'Type', 'Lots', 'Trigger Price', 'SL', 'TP', ''].map(h => _jsx("th", { style: th, children: h }, h)) }) }), _jsx("tbody", { children: pending.map(p => (_jsxs("tr", { style: { borderTop: '1px solid rgba(255,255,255,0.06)' }, children: [_jsx("td", { style: td, children: p.display }), _jsxs("td", { style: { ...td, color: p.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }, children: [p.side === 'buy' ? 'Buy' : 'Sell', " ", p.orderType === 'limit' ? 'Limit' : 'Stop'] }), _jsx("td", { style: td, children: p.lots }), _jsx("td", { style: { ...td, fontFamily: 'monospace' }, children: p.entryPrice }), _jsx("td", { style: { ...td, fontFamily: 'monospace', color: '#ef7a7a' }, children: sltpCell(p, p.sl, measureLevel) }), _jsx("td", { style: { ...td, fontFamily: 'monospace', color: '#5bbf7b' }, children: sltpCell(p, p.tp, measureLevel) }), _jsxs("td", { style: { ...td, whiteSpace: 'nowrap' }, children: [_jsx("button", { onClick: () => modify(p), disabled: busy, className: "btn btn-outline btn-sm", style: { marginRight: 6 }, children: "SL/TP" }), _jsx("button", { onClick: () => cancelPending(p.id), disabled: busy, className: "btn btn-outline btn-sm", children: "Cancel" })] })] }, p.id))) })] }) })] })), history.length > 0 && (_jsxs("div", { className: "card card-premium", children: [_jsx("h3", { style: { marginTop: 0 }, children: "Trade History" }), _jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: tbl, children: [_jsx("thead", { children: _jsx("tr", { children: ['Instrument', 'Side', 'Lots', 'Entry', 'Exit', 'P&L', 'Closed'].map(h => _jsx("th", { style: th, children: h }, h)) }) }), _jsx("tbody", { children: history.map(h => (_jsxs("tr", { style: { borderTop: '1px solid rgba(255,255,255,0.06)' }, children: [_jsx("td", { style: td, children: h.display }), _jsx("td", { style: { ...td, color: h.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }, children: h.side.toUpperCase() }), _jsx("td", { style: td, children: h.lots }), _jsx("td", { style: { ...td, fontFamily: 'monospace' }, children: h.entryPrice }), _jsx("td", { style: { ...td, fontFamily: 'monospace' }, children: h.exitPrice }), _jsx("td", { style: { ...td, color: upDown(h.pnl), fontWeight: 700, fontFamily: 'monospace' }, children: money(h.pnl) }), _jsx("td", { style: { ...td, color: '#9a9a9a', fontSize: '0.75rem' }, children: new Date(h.closedAt).toLocaleString() })] }, h.id))) })] }) })] })), _jsx("p", { style: { textAlign: 'center', color: '#666', fontSize: '0.76rem' }, children: "Demo trading with virtual funds. Prices via Yahoo Finance. For education only \u2014 not financial advice." })] }), _jsx("style", { children: `
        @media (max-width: 820px){ .tr-grid { grid-template-columns: 1fr !important; } }
        input.no-spin::-webkit-outer-spin-button, input.no-spin::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input.no-spin { -moz-appearance: textfield; }
      ` })] }));
}
const lbl = { display: 'block', fontSize: '0.68rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 };
const inp = { width: '100%', padding: '9px 11px', background: '#141418', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.9rem' };
// Wider price field for the SL/TP/order-price steppers — flexes to fill the space
// between the –/+ buttons instead of the cramped fixed-width box the native
// number input's spinner arrows used to leave.
const priceInp = { ...inp, flex: 1, minWidth: 0, textAlign: 'center', padding: '9px 6px', fontSize: '0.95rem', fontWeight: 700 };
const tbl = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' };
const th = { textAlign: 'left', padding: '6px 10px', color: '#9a9a9a', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1 };
const td = { padding: '9px 10px', color: '#e6e6e6' };
// Renders an SL/TP table cell: the price, plus its pip distance and $ value
// measured from the trade's entry price (so you can see the real risk/reward
// on a position you've already opened, not just while setting it up).
function sltpCell(row, level, measure) {
    if (level == null)
        return '—';
    const m = measure(row, level);
    return (_jsxs("div", { children: [_jsx("div", { children: level }), m && _jsxs("div", { style: { fontSize: '0.64rem', color: '#9a9a9a', fontFamily: 'inherit' }, children: [m.pips.toFixed(1), "p \u00B7 ", money(m.cash)] })] }));
}
function StepBtn({ children, onClick, disabled, narrow }) {
    return (_jsx("button", { onClick: onClick, disabled: disabled, style: { padding: narrow ? '7px 10px' : '7px 8px', minWidth: narrow ? 30 : 40, flexShrink: 0, background: '#141418', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, color: '#e6e6e6', fontSize: narrow ? '1rem' : '0.8rem', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1 }, children: children }));
}
function Kpi({ label, value, color, tint }) {
    return (_jsxs("div", { className: "card", style: { padding: '14px 16px', borderTop: tint ? `2px solid ${tint}` : undefined }, children: [_jsx("div", { style: { fontSize: '0.66rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }, children: label }), _jsx("div", { className: "mono", style: { fontSize: '1.25rem', fontWeight: 800, color: color || '#fff', marginTop: 3 }, children: value })] }));
}
