import { useEffect, useState, useCallback, Fragment } from 'react';
import PageShell from '../components/PageShell';
import TradingViewWidget from '../components/TradingViewWidget';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

// Available chart data sources (providers) per instrument, for the "Chart source"
// picker. The chart is for analysis only — trade execution always uses our own
// (Yahoo Finance) price feed regardless of which chart provider is shown.
function providerOptions(instSym: string): { label: string; tv: string }[] {
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

interface Inst { symbol: string; display: string; dp: number; contract: number; usdBase: boolean; pip: number; price: number | null; }
interface Acct { balance: number; usedMargin: number; available: number; openPnl: number; equity: number; openCount: number; pendingCount: number; marginLevel: number | null; marginCall: boolean; }
interface Pos { id: number; symbol: string; display: string; side: string; lots: number; stake: number; entryPrice: number; sl: number | null; tp: number | null; price: number | null; pnl: number | null; openedAt: string; }
interface Pending { id: number; symbol: string; display: string; side: string; orderType: string; lots: number; stake: number; entryPrice: number; limitPrice: number | null; sl: number | null; tp: number | null; openedAt: string; }

// Human label for a pending order's type — "Buy Stop Limit" etc.
const pendingTypeLabel = (p: { side: string; orderType: string }) =>
  `${p.side === 'buy' ? 'Buy' : 'Sell'} ${p.orderType === 'limit' ? 'Limit' : p.orderType === 'stop_limit' ? 'Stop Limit' : 'Stop'}`;
interface Hist { id: number; display: string; side: string; lots: number; entryPrice: number; exitPrice: number; pnl: number; closeReason: string | null; closedAt: string; }
interface LBRow { userId: number; name: string; netPnl: number; trades: number; wins: number; winRate: number; }

// MT5-style order-kind picker. "market" fills instantly; the rest are pending
// orders that wait for price to reach a level the trader sets. Stop Limit needs
// two prices: the Stop trigger and the Limit price it converts into once hit.
type OrderKind = 'market' | 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop' | 'buy_stoplimit' | 'sell_stoplimit';
const ORDER_KINDS: { value: OrderKind; label: string }[] = [
  { value: 'market',        label: 'Market Execution' },
  { value: 'buy_limit',     label: 'Buy Limit' },
  { value: 'sell_limit',    label: 'Sell Limit' },
  { value: 'buy_stop',      label: 'Buy Stop' },
  { value: 'sell_stop',     label: 'Sell Stop' },
  { value: 'buy_stoplimit', label: 'Buy Stop Limit' },
  { value: 'sell_stoplimit',label: 'Sell Stop Limit' },
];
const isStopLimitKind = (k: OrderKind) => k === 'buy_stoplimit' || k === 'sell_stoplimit';

const money = (n: number | null | undefined) =>
  n == null ? '—' : (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Trade() {
  const { user } = useAuth();
  const [insts, setInsts] = useState<Inst[]>([]);
  const [symbol, setSymbol] = useState('EURUSD');
  const [lots, setLots] = useState(0.1);
  const [expanded, setExpanded] = useState(false);
  const [chartTheme, setChartTheme] = useState<'dark' | 'light'>('dark');
  const [chartTv, setChartTv] = useState(providerOptions('EURUSD')[0].tv);
  // Remembers the last chart source picked for each instrument, so switching
  // back to one shows the SAME symbol string you were drawing on (TradingView
  // saves drawings per-symbol in the browser, so this keeps your analysis intact).
  const [sourceBySymbol, setSourceBySymbol] = useState<Record<string, string>>({});
  const [orderKind, setOrderKind] = useState<OrderKind>('market');
  const [orderPrice, setOrderPrice] = useState('');
  const [limitPriceInput, setLimitPriceInput] = useState(''); // Stop Limit only: the fill price once the stop triggers
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [acct, setAcct] = useState<Acct | null>(null);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [history, setHistory] = useState<Hist[]>([]);
  const [leaderboard, setLeaderboard] = useState<LBRow[]>([]);
  const [lbView, setLbView] = useState<'top' | 'losers'>('top');
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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
  const cashAt = (level: number) => {
    if (!meta || refPrice == null) return 0;
    let p = Math.abs(level - refPrice) * units;
    if (meta.usdBase) p = p / level;
    return p;
  };
  const pipsAway = (level: number) => meta ? Math.abs(level - (refPrice ?? 0)) / meta.pip : 0;
  const pointsAway = (level: number) => meta ? Math.round(Math.abs(level - (refPrice ?? 0)) * Math.pow(10, dp)) : 0;
  const slNum = sl === '' ? null : Number(sl);
  const tpNum = tp === '' ? null : Number(tp);
  const risk = slNum != null && !isNaN(slNum) ? cashAt(slNum) : null;
  const reward = tpNum != null && !isNaN(tpNum) ? cashAt(tpNum) : null;
  const rr = risk && reward ? reward / risk : null;

  const fmtP = (p: number | null) => p == null ? '—' : p.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const stepLot = (d: number) => setLots(Math.max(0.01, Math.round((lots + d) * 100) / 100));

  // Pip distance + $ value of an SL/TP level on an existing position/order, measured from its entry price.
  const measureLevel = (row: { symbol: string; lots: number; entryPrice: number }, level: number) => {
    const m = insts.find(i => i.symbol === row.symbol);
    if (!m) return null;
    const units = row.lots * m.contract;
    let cash = Math.abs(level - row.entryPrice) * units;
    if (m.usdBase) cash = cash / level;
    return { pips: Math.abs(level - row.entryPrice) / m.pip, cash };
  };
  const stepPrice = (cur: string, set: (v: string) => void, dir: number) => {
    if (refPrice == null || !meta) return;
    const base = cur === '' ? refPrice : Number(cur);
    set((base + dir * meta.pip).toFixed(dp));
  };

  const refresh = useCallback(async () => {
    try {
      const [a, p, pend, i] = await Promise.all([api.paperAccount(), api.paperPositions(), api.paperPending(), api.paperInstruments()]);
      setAcct(a); setPositions(p); setPending(pend); setInsts(i);
    } catch { /* ignore transient */ }
  }, []);

  const loadHistory = useCallback(async () => {
    try { setHistory(await api.paperHistory()); } catch { /* ignore */ }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try { setLeaderboard(await api.paperLeaderboard()); } catch { /* ignore */ }
  }, []);

  // When the instrument changes, reset the chart to its first available source.
  useEffect(() => { setChartTv(sourceBySymbol[symbol] ?? providerOptions(symbol)[0].tv); }, [symbol]);

  useEffect(() => {
    if (!user) return;
    refresh(); loadHistory(); loadLeaderboard();
    const t = setInterval(() => { refresh(); loadHistory(); }, 5000); // live P&L + catch SL/TP auto-closes
    const lbT = setInterval(loadLeaderboard, 20000); // leaderboard changes less often
    return () => { clearInterval(t); clearInterval(lbT); };
  }, [user, refresh, loadHistory, loadLeaderboard]);

  function selectOrderKind(kind: OrderKind) {
    setOrderKind(kind);
    if (kind === 'market' || price == null || !meta) return;
    // Sensible defaults: 15 pips away from market (clear of the 10-pip stop level),
    // on the correct side for the kind (below market for buy-limit/sell-stop-like,
    // above for sell-limit/buy-stop-like).
    const belowMarket = kind === 'buy_limit' || kind === 'sell_stop' || kind === 'sell_stoplimit';
    const dir = belowMarket ? -1 : 1;
    if (orderPrice === '') setOrderPrice((price + dir * meta.pip * 15).toFixed(dp));
    if (isStopLimitKind(kind) && limitPriceInput === '') {
      // The limit fill sits a further 5 pips beyond the stop, in the OPPOSITE
      // direction (a Buy Stop Limit's limit price must be at/below its stop).
      const stopVal = orderPrice === '' ? price + dir * meta.pip * 15 : Number(orderPrice);
      setLimitPriceInput((stopVal - dir * meta.pip * 5).toFixed(dp));
    }
  }

  async function openTrade(side: 'buy' | 'sell') {
    setMsg(null); setBusy(true);
    try {
      await api.paperOpen({ symbol, side, lots, sl: sl === '' ? null : Number(sl), tp: tp === '' ? null : Number(tp) });
      setMsg({ t: 'ok', m: `${side.toUpperCase()} ${lots} lot ${meta?.display} opened` });
      setSl(''); setTp('');
      await refresh();
    } catch (e: any) { setMsg({ t: 'err', m: e.message }); }
    finally { setBusy(false); }
  }

  async function placePending() {
    if (orderKind === 'market') return;
    const [side, kindPart] = orderKind.split('_') as ['buy' | 'sell', 'limit' | 'stop' | 'stoplimit'];
    const orderType = kindPart === 'stoplimit' ? 'stop_limit' : kindPart;
    setMsg(null); setBusy(true);
    try {
      await api.paperOpen({
        symbol, side, lots, orderType, price: Number(orderPrice),
        limitPrice: orderType === 'stop_limit' ? Number(limitPriceInput) : undefined,
        sl: sl === '' ? null : Number(sl), tp: tp === '' ? null : Number(tp),
      });
      setMsg({ t: 'ok', m: `${ORDER_KINDS.find(k => k.value === orderKind)?.label} order placed` });
      setOrderPrice(''); setLimitPriceInput(''); setSl(''); setTp('');
      await refresh();
    } catch (e: any) { setMsg({ t: 'err', m: e.message }); }
    finally { setBusy(false); }
  }

  async function cancelPending(id: number) {
    setBusy(true);
    try { await api.paperCancel(id); await refresh(); }
    catch (e: any) { setMsg({ t: 'err', m: e.message }); }
    finally { setBusy(false); }
  }

  // Open the inline SL/TP editor for a position/order (switching to its instrument
  // so the overlay — where the editor renders — is showing that market).
  function startEdit(p: Pos | Pending) {
    setSymbol(p.symbol);
    setEditingId(p.id);
    setMsg(null);
  }
  async function saveEdit(id: number, nsl: string, ntp: string) {
    setBusy(true); setMsg(null);
    try {
      await api.paperModify(id, { sl: nsl === '' ? null : Number(nsl), tp: ntp === '' ? null : Number(ntp) });
      setEditingId(null);
      await refresh();
    } catch (e: any) { setMsg({ t: 'err', m: e.message }); }
    finally { setBusy(false); }
  }

  async function close(id: number) {
    setBusy(true);
    try { await api.paperClose(id); await refresh(); await loadHistory(); await loadLeaderboard(); }
    catch (e: any) { setMsg({ t: 'err', m: e.message }); }
    finally { setBusy(false); }
  }

  async function reset() {
    if (!confirm('Reset your demo account to $10,000 and clear all trades?')) return;
    setBusy(true);
    try { await api.paperReset(); await refresh(); await loadHistory(); setMsg({ t: 'ok', m: 'Demo account reset to $10,000' }); }
    finally { setBusy(false); }
  }

  if (!user) {
    return <PageShell title="Paper Trading" subtitle="Practice trading with a demo balance.">
      <div className="card card-premium" style={{ textAlign: 'center', padding: 40 }}>Please log in to use the trading simulator.</div>
    </PageShell>;
  }

  const upDown = (n: number | null | undefined) => (n ?? 0) >= 0 ? 'var(--up)' : 'var(--down)';

  return (
    <PageShell title="Paper Trading" subtitle="Practice trading real markets with a demo balance — no real money, no risk.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Account summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14 }}>
          <Kpi label="Balance" value={money(acct?.balance)} />
          <Kpi label="Equity" value={money(acct?.equity)} tint="#c9a84c" />
          <Kpi label="Available" value={money(acct?.available)} />
          <Kpi label="Open P&L" value={money(acct?.openPnl)} color={upDown(acct?.openPnl)} />
          <Kpi label="Margin Level" value={acct?.marginLevel == null ? '—' : `${acct.marginLevel.toFixed(0)}%`}
            color={acct?.marginCall ? 'var(--down)' : undefined} />
          <Kpi label="Open Trades" value={String(acct?.openCount ?? 0)} />
        </div>

        {acct?.marginCall && (
          <div className="card" style={{ padding: '12px 16px', background: 'rgba(217,83,79,0.12)', border: '1px solid rgba(217,83,79,0.4)', color: '#ef7a7a', fontWeight: 700, fontSize: '0.85rem' }}>
            ⚠ Margin Call — your margin level is below 100%. Close positions or your worst-losing trade will be force-closed (Stop Out) if it drops below 50%.
          </div>
        )}

        {/* Chart + trade panel */}
        <div style={{ display: 'grid', gridTemplateColumns: expanded ? '1fr' : 'minmax(0,1fr) 320px', gap: 20 }} className="tr-grid">
          <div className="card card-premium" style={{ padding: 8, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 3, display: 'flex', gap: 6 }}>
              <button onClick={() => setChartTheme(t => t === 'dark' ? 'light' : 'dark')} className="btn btn-outline btn-sm">
                {chartTheme === 'dark' ? '☀ Light' : '🌙 Dark'}
              </button>
              <button onClick={() => setExpanded(v => !v)} className="btn btn-outline btn-sm">
                {expanded ? '⤡ Collapse' : '⤢ Enlarge chart'}
              </button>
            </div>
            <div style={{ height: expanded ? 780 : 480, transition: 'height 0.15s' }}>
              <TradingViewWidget
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                height="100%"
                config={{ width: '100%', height: '100%', symbol: chartTv, interval: '60', timezone: 'Etc/UTC', theme: chartTheme, style: '1', locale: 'en', hide_side_toolbar: false, allow_symbol_change: false, calendar: false, support_host: 'https://www.tradingview.com' }}
              />
            </div>
          </div>

          {/* Order ticket */}
          <div className="card card-premium" style={{ display: expanded ? 'grid' : 'flex', flexDirection: 'column', gridTemplateColumns: expanded ? 'repeat(auto-fit,minmax(220px,1fr))' : undefined, gap: 14 }}>
            <div>
              <label style={lbl}>Instrument</label>
              <select value={symbol} onChange={e => setSymbol(e.target.value)} style={inp}>
                {insts.map(i => <option key={i.symbol} value={i.symbol}>{i.display}</option>)}
              </select>
            </div>

            <div>
              <label style={lbl}>Chart source</label>
              <select value={chartTv} onChange={e => { setChartTv(e.target.value); setSourceBySymbol(s => ({ ...s, [symbol]: e.target.value })); }} style={inp}>
                {providerOptions(symbol).map(o => <option key={o.tv} value={o.tv}>{o.label}</option>)}
              </select>
            </div>

            {/* Order type: Market Execution or a pending order (Buy/Sell Limit/Stop) */}
            <div>
              <label style={lbl}>Order type</label>
              <select value={orderKind} onChange={e => selectOrderKind(e.target.value as OrderKind)} style={inp}>
                {ORDER_KINDS.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
              </select>
            </div>

            {orderKind !== 'market' && (
              <div>
                <label style={lbl}>{isStopLimitKind(orderKind) ? 'Stop price (trigger)' : 'Order price (trigger)'}</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <StepBtn onClick={() => stepPrice(orderPrice, setOrderPrice, -1)} narrow>–</StepBtn>
                  <input type="number" step="any" placeholder={fmtP(price)} value={orderPrice} onChange={e => setOrderPrice(e.target.value)} className="no-spin" style={priceInp} />
                  <StepBtn onClick={() => stepPrice(orderPrice, setOrderPrice, 1)} narrow>+</StepBtn>
                </div>
              </div>
            )}

            {isStopLimitKind(orderKind) && (
              <div>
                <label style={lbl}>Limit price (fill once triggered)</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <StepBtn onClick={() => stepPrice(limitPriceInput, setLimitPriceInput, -1)} narrow>–</StepBtn>
                  <input type="number" step="any" placeholder={fmtP(price)} value={limitPriceInput} onChange={e => setLimitPriceInput(e.target.value)} className="no-spin" style={priceInp} />
                  <StepBtn onClick={() => stepPrice(limitPriceInput, setLimitPriceInput, 1)} narrow>+</StepBtn>
                </div>
              </div>
            )}

            {/* Volume / lot stepper (MT5 style) */}
            <div>
              <label style={lbl}>Volume (lots)</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                {[-0.5, -0.1, -0.01].map(d => (
                  <StepBtn key={d} onClick={() => stepLot(d)} disabled={lots + d < 0.01}>{d}</StepBtn>
                ))}
                <div className="mono" style={{ minWidth: 66, textAlign: 'center', fontSize: '1.35rem', fontWeight: 800, color: '#c9a84c' }}>{lots.toFixed(2)}</div>
                {[0.01, 0.1, 0.5].map(d => (
                  <StepBtn key={d} onClick={() => stepLot(d)}>+{d}</StepBtn>
                ))}
              </div>
            </div>

            {/* SL / TP steppers (step = 1 pip) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <label style={lbl}>Stop Loss</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <StepBtn onClick={() => stepPrice(sl, setSl, -1)} narrow>–</StepBtn>
                  <input type="number" step="any" placeholder="—" value={sl} onChange={e => setSl(e.target.value)} className="no-spin" style={priceInp} />
                  <StepBtn onClick={() => stepPrice(sl, setSl, 1)} narrow>+</StepBtn>
                </div>
              </div>
              <div>
                <label style={lbl}>Take Profit</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <StepBtn onClick={() => stepPrice(tp, setTp, -1)} narrow>–</StepBtn>
                  <input type="number" step="any" placeholder="—" value={tp} onChange={e => setTp(e.target.value)} className="no-spin" style={priceInp} />
                  <StepBtn onClick={() => stepPrice(tp, setTp, 1)} narrow>+</StepBtn>
                </div>
              </div>
            </div>

            {(risk != null || reward != null) && (
              <div style={{ fontSize: '0.74rem', display: 'flex', flexDirection: 'column', gap: 4, padding: '9px 11px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                {reward != null && <span style={{ color: 'var(--up)' }}>TP · {pipsAway(tpNum!).toFixed(1)} pips · {pointsAway(tpNum!).toLocaleString()} pts · <b>reward +{money(reward)}</b></span>}
                {risk != null && <span style={{ color: 'var(--down)' }}>SL · {pipsAway(slNum!).toFixed(1)} pips · {pointsAway(slNum!).toLocaleString()} pts · <b>risk -{money(risk)}</b></span>}
                {rr != null && <span style={{ color: '#c9a84c' }}>Risk : Reward = 1 : {rr.toFixed(2)}</span>}
              </div>
            )}

            <div style={{ fontSize: '0.74rem', color: '#9a9a9a', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span>Units: <b style={{ color: '#e6e6e6' }}>{units.toLocaleString()}</b></span>
              <span>Position value: <b style={{ color: '#e6e6e6' }}>{money(notional)}</b></span>
              <span>Margin required: <b style={{ color: '#c9a84c' }}>{money(marginReq)}</b></span>
            </div>

            {orderKind === 'market' ? (
              /* SELL / BUY by market */
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <button onClick={() => openTrade('sell')} disabled={busy || price == null} className="btn"
                  style={{ background: 'var(--down)', color: '#fff', fontWeight: 800, flexDirection: 'column', lineHeight: 1.2, padding: '10px 6px' }}>
                  <span>SELL</span><span className="mono" style={{ fontSize: '0.95rem' }}>{fmtP(price)}</span>
                </button>
                <button onClick={() => openTrade('buy')} disabled={busy || price == null} className="btn"
                  style={{ background: '#3a86c9', color: '#fff', fontWeight: 800, flexDirection: 'column', lineHeight: 1.2, padding: '10px 6px' }}>
                  <span>BUY</span><span className="mono" style={{ fontSize: '0.95rem' }}>{fmtP(price)}</span>
                </button>
              </div>
            ) : (
              /* Place pending order */
              <button onClick={placePending} disabled={busy || price == null || orderPrice === '' || (isStopLimitKind(orderKind) && limitPriceInput === '')}
                className="btn btn-gold" style={{ width: '100%', fontWeight: 800 }}>
                {busy ? '…' : `Place ${ORDER_KINDS.find(k => k.value === orderKind)?.label}`}
              </button>
            )}

            {msg && <div style={{ fontSize: '0.78rem', color: msg.t === 'ok' ? 'var(--up)' : 'var(--down)', textAlign: 'center' }}>{msg.m}</div>}
          </div>
        </div>

        {/* MT5-style position/order overlay for the selected instrument */}
        {(positions.some(p => p.symbol === symbol) || pending.some(p => p.symbol === symbol)) && (
          <div className="card card-premium" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.72rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>
              Position overlay · {meta?.display}
            </div>

            {/* Open positions */}
            {positions.filter(p => p.symbol === symbol).map(p => {
              const pts = (level: number) => Math.round(Math.abs(level - p.entryPrice) * Math.pow(10, dp));
              const cash = (level: number) => measureLevel(p, level)?.cash ?? 0;
              return (
                <div key={`o${p.id}`} style={{ padding: '4px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {p.tp != null && (
                    <OverlayLine color="#2e9e5b" bg="rgba(46,158,91,0.10)"
                      left={`TP  ·  +${money(cash(p.tp))}  ·  ${pts(p.tp).toLocaleString()} pts`} right={String(p.tp)} />
                  )}
                  <OverlayLine color="#3a86c9" bg="rgba(58,134,201,0.12)"
                    left={`${p.side.toUpperCase()} ${p.lots}  ·  `}
                    leftExtra={<b style={{ color: upDown(p.pnl) }}>{money(p.pnl)}</b>} right={String(p.entryPrice)} />
                  {p.sl != null && (
                    <OverlayLine color="#d9534f" bg="rgba(217,83,79,0.10)"
                      left={`SL  ·  -${money(cash(p.sl))}  ·  ${pts(p.sl).toLocaleString()} pts`} right={String(p.sl)} />
                  )}
                  {editingId === p.id ? (
                    <ModifyEditor trade={p} inst={insts.find(i => i.symbol === p.symbol)} busy={busy}
                      onSave={(s, t) => saveEdit(p.id, s, t)} onCancel={() => setEditingId(null)} />
                  ) : (
                    <div style={{ display: 'flex', gap: 8, padding: '8px 16px' }}>
                      <button onClick={() => startEdit(p)} disabled={busy} className="btn btn-outline btn-sm">Modify SL/TP</button>
                      <button onClick={() => close(p.id)} disabled={busy} className="btn btn-sm" style={{ background: '#d9534f', color: '#fff', fontWeight: 700 }}>Close position</button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pending orders */}
            {pending.filter(p => p.symbol === symbol).map(p => {
              const pts = (level: number) => Math.round(Math.abs(level - p.entryPrice) * Math.pow(10, dp));
              const cash = (level: number) => measureLevel(p, level)?.cash ?? 0;
              return (
                <div key={`p${p.id}`} style={{ padding: '4px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  {p.tp != null && (
                    <OverlayLine color="#2e9e5b" bg="rgba(46,158,91,0.07)" dashed
                      left={`TP  ·  +${money(cash(p.tp))}  ·  ${pts(p.tp).toLocaleString()} pts`} right={String(p.tp)} />
                  )}
                  <OverlayLine color="#c9a84c" bg="rgba(201,168,76,0.10)" dashed
                    left={`${pendingTypeLabel(p)} ${p.lots}  ·  `}
                    leftExtra={<b style={{ color: '#c9a84c' }}>pending</b>}
                    right={p.orderType === 'stop_limit' ? `${p.entryPrice} → ${p.limitPrice}` : String(p.entryPrice)} />
                  {p.sl != null && (
                    <OverlayLine color="#d9534f" bg="rgba(217,83,79,0.07)" dashed
                      left={`SL  ·  -${money(cash(p.sl))}  ·  ${pts(p.sl).toLocaleString()} pts`} right={String(p.sl)} />
                  )}
                  {editingId === p.id ? (
                    <ModifyEditor trade={p} inst={insts.find(i => i.symbol === p.symbol)} busy={busy}
                      onSave={(s, t) => saveEdit(p.id, s, t)} onCancel={() => setEditingId(null)} />
                  ) : (
                    <div style={{ display: 'flex', gap: 8, padding: '8px 16px' }}>
                      <button onClick={() => startEdit(p)} disabled={busy} className="btn btn-outline btn-sm">Modify SL/TP</button>
                      <button onClick={() => cancelPending(p.id)} disabled={busy} className="btn btn-outline btn-sm">Cancel order</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Open positions */}
        <div className="card card-premium">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Open Positions</h3>
            <button onClick={reset} className="btn btn-outline btn-sm" disabled={busy}>Reset demo</button>
          </div>
          {positions.length === 0 ? <p style={{ color: '#9a9a9a', margin: 0 }}>No open positions. Place a trade above to get started.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table style={tbl}>
                <thead><tr>{['Instrument', 'Side', 'Lots', 'Entry', 'Current', 'SL', 'TP', 'P&L', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {positions.map(p => (
                    <Fragment key={p.id}>
                      <tr style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={td}>{p.display}</td>
                        <td style={{ ...td, color: p.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{p.side.toUpperCase()}</td>
                        <td style={td}>{p.lots}</td>
                        <td style={{ ...td, fontFamily: 'monospace' }}>{p.entryPrice}</td>
                        <td style={{ ...td, fontFamily: 'monospace' }}>{p.price ?? '—'}</td>
                        <td style={{ ...td, fontFamily: 'monospace', color: '#ef7a7a' }}>{sltpCell(p, p.sl, measureLevel)}</td>
                        <td style={{ ...td, fontFamily: 'monospace', color: '#5bbf7b' }}>{sltpCell(p, p.tp, measureLevel)}</td>
                        <td style={{ ...td, color: upDown(p.pnl), fontWeight: 700, fontFamily: 'monospace' }}>{money(p.pnl)}</td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          <button onClick={() => editingId === p.id ? setEditingId(null) : startEdit(p)} disabled={busy} className="btn btn-outline btn-sm" style={{ marginRight: 6 }}>SL/TP</button>
                          <button onClick={() => close(p.id)} disabled={busy} className="btn btn-outline btn-sm">Close</button>
                        </td>
                      </tr>
                      {editingId === p.id && (
                        <tr>
                          <td colSpan={9} style={{ padding: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <ModifyEditor trade={p} inst={insts.find(i => i.symbol === p.symbol)} busy={busy}
                              onSave={(s, t) => saveEdit(p.id, s, t)} onCancel={() => setEditingId(null)} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending orders */}
        {pending.length > 0 && (
          <div className="card card-premium">
            <h3 style={{ marginTop: 0 }}>Pending Orders</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={tbl}>
                <thead><tr>{['Instrument', 'Type', 'Lots', 'Trigger Price', 'SL', 'TP', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {pending.map(p => (
                    <Fragment key={p.id}>
                      <tr style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <td style={td}>{p.display}</td>
                        <td style={{ ...td, color: p.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{pendingTypeLabel(p)}</td>
                        <td style={td}>{p.lots}</td>
                        <td style={{ ...td, fontFamily: 'monospace' }}>{p.orderType === 'stop_limit' ? `${p.entryPrice} → ${p.limitPrice}` : p.entryPrice}</td>
                        <td style={{ ...td, fontFamily: 'monospace', color: '#ef7a7a' }}>{sltpCell(p, p.sl, measureLevel)}</td>
                        <td style={{ ...td, fontFamily: 'monospace', color: '#5bbf7b' }}>{sltpCell(p, p.tp, measureLevel)}</td>
                        <td style={{ ...td, whiteSpace: 'nowrap' }}>
                          <button onClick={() => editingId === p.id ? setEditingId(null) : startEdit(p)} disabled={busy} className="btn btn-outline btn-sm" style={{ marginRight: 6 }}>SL/TP</button>
                          <button onClick={() => cancelPending(p.id)} disabled={busy} className="btn btn-outline btn-sm">Cancel</button>
                        </td>
                      </tr>
                      {editingId === p.id && (
                        <tr>
                          <td colSpan={7} style={{ padding: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            <ModifyEditor trade={p} inst={insts.find(i => i.symbol === p.symbol)} busy={busy}
                              onSave={(s, t) => saveEdit(p.id, s, t)} onCancel={() => setEditingId(null)} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="card card-premium">
            <h3 style={{ marginTop: 0 }}>Trade History</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={tbl}>
                <thead><tr>{['Instrument', 'Side', 'Lots', 'Entry', 'Exit', 'P&L', 'Reason', 'Closed'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={td}>{h.display}</td>
                      <td style={{ ...td, color: h.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{h.side.toUpperCase()}</td>
                      <td style={td}>{h.lots}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{h.entryPrice}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{h.exitPrice}</td>
                      <td style={{ ...td, color: upDown(h.pnl), fontWeight: 700, fontFamily: 'monospace' }}>{money(h.pnl)}</td>
                      <td style={td}><ReasonBadge reason={h.closeReason} /></td>
                      <td style={{ ...td, color: '#9a9a9a', fontSize: '0.75rem' }}>{new Date(h.closedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Trading leaderboard */}
        {leaderboard.length > 0 && (
          <div className="card card-premium">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <h3 style={{ margin: 0 }}>🏆 Trading Leaderboard</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setLbView('top')} className={`btn btn-sm ${lbView === 'top' ? 'btn-gold' : 'btn-outline'}`}>Top Traders</button>
                <button onClick={() => setLbView('losers')} className={`btn btn-sm ${lbView === 'losers' ? 'btn-gold' : 'btn-outline'}`}>Top Losers</button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={tbl}>
                <thead><tr>{['Rank', 'Trader', 'Net P&L', 'Trades', 'Win Rate'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {(lbView === 'top' ? leaderboard : [...leaderboard].reverse()).map((r, i) => (
                    <tr key={r.userId} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: r.userId === user.id ? 'rgba(201,168,76,0.08)' : undefined }}>
                      <td style={{ ...td, fontWeight: 800, fontSize: '1rem' }}>{lbView === 'top' && i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}</td>
                      <td style={{ ...td, fontWeight: r.userId === user.id ? 800 : 400 }}>{r.name}{r.userId === user.id ? ' (you)' : ''}</td>
                      <td style={{ ...td, color: upDown(r.netPnl), fontWeight: 700, fontFamily: 'monospace' }}>{money(r.netPnl)}</td>
                      <td style={td}>{r.trades}</td>
                      <td style={td}>{r.winRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.76rem' }}>
          Demo trading with virtual funds. Prices via Yahoo Finance. For education only — not financial advice.
        </p>
      </div>

      <style>{`
        @media (max-width: 820px){ .tr-grid { grid-template-columns: 1fr !important; } }
        input.no-spin::-webkit-outer-spin-button, input.no-spin::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input.no-spin { -moz-appearance: textfield; }
      `}</style>
    </PageShell>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.68rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 };
const inp: React.CSSProperties = { width: '100%', padding: '9px 11px', background: '#141418', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.9rem' };
// Wider price field for the SL/TP/order-price steppers — flexes to fill the space
// between the –/+ buttons instead of the cramped fixed-width box the native
// number input's spinner arrows used to leave.
const priceInp: React.CSSProperties = { ...inp, flex: 1, minWidth: 0, textAlign: 'center', padding: '9px 6px', fontSize: '0.95rem', fontWeight: 700 };
const tbl: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' };
const th: React.CSSProperties = { textAlign: 'left', padding: '6px 10px', color: '#9a9a9a', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: 1 };
const td: React.CSSProperties = { padding: '9px 10px', color: '#e6e6e6' };

// Renders an SL/TP table cell: the price, plus its pip distance and $ value
// measured from the trade's entry price (so you can see the real risk/reward
// on a position you've already opened, not just while setting it up).
function sltpCell(
  row: { symbol: string; lots: number; entryPrice: number },
  level: number | null,
  measure: (row: { symbol: string; lots: number; entryPrice: number }, level: number) => { pips: number; cash: number } | null
) {
  if (level == null) return '—';
  const m = measure(row, level);
  return (
    <div>
      <div>{level}</div>
      {m && <div style={{ fontSize: '0.64rem', color: '#9a9a9a', fontFamily: 'inherit' }}>{m.pips.toFixed(1)}p · {money(m.cash)}</div>}
    </div>
  );
}

// One horizontal "line" row in the MT5-style position overlay: a coloured label
// on the left and the price (in a coloured tag) pinned to the right.
function OverlayLine({ color, bg, left, leftExtra, right, dashed }: { color: string; bg: string; left: string; leftExtra?: React.ReactNode; right: string; dashed?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '7px 16px', background: bg, borderLeft: `3px ${dashed ? 'dashed' : 'solid'} ${color}` }}>
      <span style={{ fontSize: '0.8rem', color, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{left}{leftExtra}</span>
      <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', background: color, padding: '2px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>{right}</span>
    </div>
  );
}

// Inline SL/TP editor for an open position or pending order — calculates the pip,
// point and $ distance from the trade's entry price live as you type/step.
function ModifyEditor({ trade, inst, busy, onSave, onCancel }: {
  trade: { id: number; side: string; lots: number; entryPrice: number; sl: number | null; tp: number | null };
  inst: Inst | undefined;
  busy: boolean;
  onSave: (sl: string, tp: string) => void;
  onCancel: () => void;
}) {
  const [sl, setSl] = useState(trade.sl != null ? String(trade.sl) : '');
  const [tp, setTp] = useState(trade.tp != null ? String(trade.tp) : '');
  const dp = inst?.dp ?? 4, pip = inst?.pip ?? 0.0001, contract = inst?.contract ?? 1, usdBase = inst?.usdBase ?? false;
  const measure = (lvl: number) => {
    const units = trade.lots * contract;
    let cash = Math.abs(lvl - trade.entryPrice) * units;
    if (usdBase) cash = cash / lvl;
    return { pips: Math.abs(lvl - trade.entryPrice) / pip, pts: Math.round(Math.abs(lvl - trade.entryPrice) * Math.pow(10, dp)), cash };
  };
  const step = (cur: string, set: (v: string) => void, dir: number) => {
    const base = cur === '' ? trade.entryPrice : Number(cur);
    set((base + dir * pip).toFixed(dp));
  };
  const slNum = sl === '' ? null : Number(sl), tpNum = tp === '' ? null : Number(tp);
  return (
    <div style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div>
          <label style={lbl}>Stop Loss</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <StepBtn onClick={() => step(sl, setSl, -1)} narrow>–</StepBtn>
            <input type="number" step="any" placeholder="—" value={sl} onChange={e => setSl(e.target.value)} className="no-spin" style={priceInp} />
            <StepBtn onClick={() => step(sl, setSl, 1)} narrow>+</StepBtn>
          </div>
        </div>
        <div>
          <label style={lbl}>Take Profit</label>
          <div style={{ display: 'flex', gap: 4 }}>
            <StepBtn onClick={() => step(tp, setTp, -1)} narrow>–</StepBtn>
            <input type="number" step="any" placeholder="—" value={tp} onChange={e => setTp(e.target.value)} className="no-spin" style={priceInp} />
            <StepBtn onClick={() => step(tp, setTp, 1)} narrow>+</StepBtn>
          </div>
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tpNum != null && !isNaN(tpNum) && <span style={{ color: 'var(--up)' }}>TP · {measure(tpNum).pips.toFixed(1)} pips · {measure(tpNum).pts.toLocaleString()} pts · +{money(measure(tpNum).cash)}</span>}
        {slNum != null && !isNaN(slNum) && <span style={{ color: 'var(--down)' }}>SL · {measure(slNum).pips.toFixed(1)} pips · {measure(slNum).pts.toLocaleString()} pts · -{money(measure(slNum).cash)}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onSave(sl, tp)} disabled={busy} className="btn btn-gold btn-sm" style={{ fontWeight: 700 }}>Save SL/TP</button>
        <button onClick={onCancel} disabled={busy} className="btn btn-outline btn-sm">Cancel</button>
      </div>
    </div>
  );
}

const REASON_STYLE: Record<string, { label: string; color: string }> = {
  manual:    { label: 'Manual', color: '#9a9a9a' },
  sl:        { label: 'Stop Loss', color: '#ef7a7a' },
  tp:        { label: 'Take Profit', color: '#5bbf7b' },
  cancelled: { label: 'Cancelled', color: '#9a9a9a' },
  stopout:   { label: 'Stop Out', color: '#ff4d4d' },
};
function ReasonBadge({ reason }: { reason: string | null }) {
  const r = reason ? REASON_STYLE[reason] ?? { label: reason, color: '#9a9a9a' } : { label: '—', color: '#9a9a9a' };
  return <span style={{ fontSize: '0.7rem', fontWeight: 700, color: r.color, padding: '2px 8px', borderRadius: 5, background: `${r.color}22`, whiteSpace: 'nowrap' }}>{r.label}</span>;
}

function StepBtn({ children, onClick, disabled, narrow }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; narrow?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: narrow ? '7px 10px' : '7px 8px', minWidth: narrow ? 30 : 40, flexShrink: 0, background: '#141418', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, color: '#e6e6e6', fontSize: narrow ? '1rem' : '0.8rem', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1 }}>
      {children}
    </button>
  );
}

function Kpi({ label, value, color, tint }: { label: string; value: string; color?: string; tint?: string }) {
  return (
    <div className="card" style={{ padding: '14px 16px', borderTop: tint ? `2px solid ${tint}` : undefined }}>
      <div style={{ fontSize: '0.66rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: color || '#fff', marginTop: 3 }}>{value}</div>
    </div>
  );
}
