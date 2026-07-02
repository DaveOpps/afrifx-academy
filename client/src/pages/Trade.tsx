import { useEffect, useState, useCallback } from 'react';
import PageShell from '../components/PageShell';
import TradingViewWidget from '../components/TradingViewWidget';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

// Our instrument key -> TradingView chart symbol.
const TV: Record<string, string> = {
  EURUSD: 'OANDA:EURUSD', GBPUSD: 'OANDA:GBPUSD', USDJPY: 'OANDA:USDJPY',
  AUDUSD: 'OANDA:AUDUSD', USDCAD: 'OANDA:USDCAD', XAUUSD: 'OANDA:XAUUSD',
  BTCUSD: 'BINANCE:BTCUSDT', ETHUSD: 'BINANCE:ETHUSDT',
};

interface Inst { symbol: string; display: string; dp: number; contract: number; usdBase: boolean; pip: number; price: number | null; }
interface Acct { balance: number; usedMargin: number; available: number; openPnl: number; equity: number; openCount: number; }
interface Pos { id: number; symbol: string; display: string; side: string; lots: number; stake: number; entryPrice: number; sl: number | null; tp: number | null; price: number | null; pnl: number | null; openedAt: string; }
interface Pending { id: number; symbol: string; display: string; side: string; orderType: string; lots: number; stake: number; entryPrice: number; sl: number | null; tp: number | null; openedAt: string; }
interface Hist { id: number; display: string; side: string; lots: number; entryPrice: number; exitPrice: number; pnl: number; closeReason: string | null; closedAt: string; }

// MT5-style order-kind picker. "market" fills instantly; the rest are pending
// orders that wait for price to reach a level the trader sets.
type OrderKind = 'market' | 'buy_limit' | 'sell_limit' | 'buy_stop' | 'sell_stop';
const ORDER_KINDS: { value: OrderKind; label: string }[] = [
  { value: 'market',     label: 'Market Execution' },
  { value: 'buy_limit',  label: 'Buy Limit' },
  { value: 'sell_limit', label: 'Sell Limit' },
  { value: 'buy_stop',   label: 'Buy Stop' },
  { value: 'sell_stop',  label: 'Sell Stop' },
];

const money = (n: number | null | undefined) =>
  n == null ? '—' : (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Trade() {
  const { user } = useAuth();
  const [insts, setInsts] = useState<Inst[]>([]);
  const [symbol, setSymbol] = useState('EURUSD');
  const [lots, setLots] = useState(0.1);
  const [expanded, setExpanded] = useState(false);
  const [orderKind, setOrderKind] = useState<OrderKind>('market');
  const [orderPrice, setOrderPrice] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [acct, setAcct] = useState<Acct | null>(null);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [history, setHistory] = useState<Hist[]>([]);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
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
  const cashAt = (level: number) => {
    if (!meta || refPrice == null) return 0;
    let p = Math.abs(level - refPrice) * units;
    if (meta.usdBase) p = p / level;
    return p;
  };
  const pipsAway = (level: number) => meta ? Math.abs(level - (refPrice ?? 0)) / meta.pip : 0;
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

  useEffect(() => {
    if (!user) return;
    refresh(); loadHistory();
    const t = setInterval(() => { refresh(); loadHistory(); }, 5000); // live P&L + catch SL/TP auto-closes
    return () => clearInterval(t);
  }, [user, refresh, loadHistory]);

  function selectOrderKind(kind: OrderKind) {
    setOrderKind(kind);
    if (kind !== 'market' && orderPrice === '' && price != null && meta) {
      // Sensible default: 10 pips away from market, on the correct side of the kind.
      const dir = kind.startsWith('buy_limit') || kind === 'sell_stop' ? -1 : 1;
      setOrderPrice((price + dir * meta.pip * 10).toFixed(dp));
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
    const [side, orderType] = orderKind.split('_') as ['buy' | 'sell', 'limit' | 'stop'];
    setMsg(null); setBusy(true);
    try {
      await api.paperOpen({ symbol, side, lots, orderType, price: Number(orderPrice), sl: sl === '' ? null : Number(sl), tp: tp === '' ? null : Number(tp) });
      setMsg({ t: 'ok', m: `${ORDER_KINDS.find(k => k.value === orderKind)?.label} order placed` });
      setOrderPrice(''); setSl(''); setTp('');
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

  async function modify(p: Pos | Pending) {
    const nsl = prompt(`Stop Loss price for ${p.display} (leave blank for none):`, p.sl != null ? String(p.sl) : '');
    if (nsl === null) return;
    const ntp = prompt(`Take Profit price for ${p.display} (leave blank for none):`, p.tp != null ? String(p.tp) : '');
    if (ntp === null) return;
    setBusy(true); setMsg(null);
    try {
      await api.paperModify(p.id, { sl: nsl === '' ? null : Number(nsl), tp: ntp === '' ? null : Number(ntp) });
      await refresh();
    } catch (e: any) { setMsg({ t: 'err', m: e.message }); }
    finally { setBusy(false); }
  }

  async function close(id: number) {
    setBusy(true);
    try { await api.paperClose(id); await refresh(); await loadHistory(); }
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
          <Kpi label="Open Trades" value={String(acct?.openCount ?? 0)} />
        </div>

        {/* Chart + trade panel */}
        <div style={{ display: 'grid', gridTemplateColumns: expanded ? '1fr' : 'minmax(0,1fr) 320px', gap: 20 }} className="tr-grid">
          <div className="card card-premium" style={{ padding: 8, position: 'relative' }}>
            <button onClick={() => setExpanded(v => !v)} className="btn btn-outline btn-sm"
              style={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
              {expanded ? '⤡ Collapse' : '⤢ Enlarge chart'}
            </button>
            <TradingViewWidget
              key={expanded ? 'big' : 'small'}
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
              height={expanded ? 780 : 480}
              config={{ width: '100%', height: expanded ? 780 : 480, symbol: TV[symbol], interval: '60', timezone: 'Etc/UTC', theme: 'dark', style: '1', locale: 'en', hide_side_toolbar: false, allow_symbol_change: false, calendar: false, support_host: 'https://www.tradingview.com' }}
            />
          </div>

          {/* Order ticket */}
          <div className="card card-premium" style={{ display: expanded ? 'grid' : 'flex', flexDirection: 'column', gridTemplateColumns: expanded ? 'repeat(auto-fit,minmax(220px,1fr))' : undefined, gap: 14 }}>
            <div>
              <label style={lbl}>Instrument</label>
              <select value={symbol} onChange={e => setSymbol(e.target.value)} style={inp}>
                {insts.map(i => <option key={i.symbol} value={i.symbol}>{i.display}</option>)}
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
                <label style={lbl}>Order price (trigger)</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <StepBtn onClick={() => stepPrice(orderPrice, setOrderPrice, -1)}>–</StepBtn>
                  <input type="number" step="any" placeholder={fmtP(price)} value={orderPrice} onChange={e => setOrderPrice(e.target.value)} style={{ ...inp, textAlign: 'center', padding: '9px 4px' }} />
                  <StepBtn onClick={() => stepPrice(orderPrice, setOrderPrice, 1)}>+</StepBtn>
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
                  <StepBtn onClick={() => stepPrice(sl, setSl, -1)}>–</StepBtn>
                  <input type="number" step="any" placeholder="—" value={sl} onChange={e => setSl(e.target.value)} style={{ ...inp, textAlign: 'center', padding: '9px 4px' }} />
                  <StepBtn onClick={() => stepPrice(sl, setSl, 1)}>+</StepBtn>
                </div>
              </div>
              <div>
                <label style={lbl}>Take Profit</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  <StepBtn onClick={() => stepPrice(tp, setTp, -1)}>–</StepBtn>
                  <input type="number" step="any" placeholder="—" value={tp} onChange={e => setTp(e.target.value)} style={{ ...inp, textAlign: 'center', padding: '9px 4px' }} />
                  <StepBtn onClick={() => stepPrice(tp, setTp, 1)}>+</StepBtn>
                </div>
              </div>
            </div>

            {(risk != null || reward != null) && (
              <div style={{ fontSize: '0.74rem', display: 'flex', flexDirection: 'column', gap: 3, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                {risk != null && <span style={{ color: 'var(--down)' }}>SL: {pipsAway(slNum!).toFixed(1)} pips · risk {money(risk)}</span>}
                {reward != null && <span style={{ color: 'var(--up)' }}>TP: {pipsAway(tpNum!).toFixed(1)} pips · reward {money(reward)}</span>}
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
              <button onClick={placePending} disabled={busy || price == null || orderPrice === ''}
                className="btn btn-gold" style={{ width: '100%', fontWeight: 800 }}>
                {busy ? '…' : `Place ${ORDER_KINDS.find(k => k.value === orderKind)?.label}`}
              </button>
            )}

            {msg && <div style={{ fontSize: '0.78rem', color: msg.t === 'ok' ? 'var(--up)' : 'var(--down)', textAlign: 'center' }}>{msg.m}</div>}
          </div>
        </div>

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
                    <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={td}>{p.display}</td>
                      <td style={{ ...td, color: p.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{p.side.toUpperCase()}</td>
                      <td style={td}>{p.lots}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{p.entryPrice}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{p.price ?? '—'}</td>
                      <td style={{ ...td, fontFamily: 'monospace', color: '#ef7a7a' }}>{sltpCell(p, p.sl, measureLevel)}</td>
                      <td style={{ ...td, fontFamily: 'monospace', color: '#5bbf7b' }}>{sltpCell(p, p.tp, measureLevel)}</td>
                      <td style={{ ...td, color: upDown(p.pnl), fontWeight: 700, fontFamily: 'monospace' }}>{money(p.pnl)}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <button onClick={() => modify(p)} disabled={busy} className="btn btn-outline btn-sm" style={{ marginRight: 6 }}>SL/TP</button>
                        <button onClick={() => close(p.id)} disabled={busy} className="btn btn-outline btn-sm">Close</button>
                      </td>
                    </tr>
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
                    <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={td}>{p.display}</td>
                      <td style={{ ...td, color: p.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{p.side === 'buy' ? 'Buy' : 'Sell'} {p.orderType === 'limit' ? 'Limit' : 'Stop'}</td>
                      <td style={td}>{p.lots}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{p.entryPrice}</td>
                      <td style={{ ...td, fontFamily: 'monospace', color: '#ef7a7a' }}>{sltpCell(p, p.sl, measureLevel)}</td>
                      <td style={{ ...td, fontFamily: 'monospace', color: '#5bbf7b' }}>{sltpCell(p, p.tp, measureLevel)}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        <button onClick={() => modify(p)} disabled={busy} className="btn btn-outline btn-sm" style={{ marginRight: 6 }}>SL/TP</button>
                        <button onClick={() => cancelPending(p.id)} disabled={busy} className="btn btn-outline btn-sm">Cancel</button>
                      </td>
                    </tr>
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
                <thead><tr>{['Instrument', 'Side', 'Lots', 'Entry', 'Exit', 'P&L', 'Closed'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={td}>{h.display}</td>
                      <td style={{ ...td, color: h.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{h.side.toUpperCase()}</td>
                      <td style={td}>{h.lots}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{h.entryPrice}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{h.exitPrice}</td>
                      <td style={{ ...td, color: upDown(h.pnl), fontWeight: 700, fontFamily: 'monospace' }}>{money(h.pnl)}</td>
                      <td style={{ ...td, color: '#9a9a9a', fontSize: '0.75rem' }}>{new Date(h.closedAt).toLocaleString()}</td>
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

      <style>{`@media (max-width: 820px){ .tr-grid { grid-template-columns: 1fr !important; } }`}</style>
    </PageShell>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.68rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 };
const inp: React.CSSProperties = { width: '100%', padding: '9px 11px', background: '#141418', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, color: '#fff', fontSize: '0.9rem' };
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

function StepBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: '7px 8px', minWidth: 40, background: '#141418', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, color: '#e6e6e6', fontSize: '0.8rem', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.35 : 1 }}>
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
