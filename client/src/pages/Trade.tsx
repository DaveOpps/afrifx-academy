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

interface Inst { symbol: string; display: string; dp: number; price: number | null; }
interface Acct { balance: number; usedMargin: number; available: number; openPnl: number; equity: number; openCount: number; }
interface Pos { id: number; symbol: string; display: string; side: string; stake: number; leverage: number; entryPrice: number; price: number | null; pnl: number | null; openedAt: string; }
interface Hist { id: number; display: string; side: string; stake: number; leverage: number; entryPrice: number; exitPrice: number; pnl: number; closedAt: string; }

const money = (n: number | null | undefined) =>
  n == null ? '—' : (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Trade() {
  const { user } = useAuth();
  const [insts, setInsts] = useState<Inst[]>([]);
  const [symbol, setSymbol] = useState('EURUSD');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [stake, setStake] = useState('100');
  const [leverage, setLeverage] = useState(10);
  const [acct, setAcct] = useState<Acct | null>(null);
  const [positions, setPositions] = useState<Pos[]>([]);
  const [history, setHistory] = useState<Hist[]>([]);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; m: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const meta = insts.find(i => i.symbol === symbol);
  const price = meta?.price ?? null;
  const dp = meta?.dp ?? 4;

  const refresh = useCallback(async () => {
    try {
      const [a, p, i] = await Promise.all([api.paperAccount(), api.paperPositions(), api.paperInstruments()]);
      setAcct(a); setPositions(p); setInsts(i);
    } catch { /* ignore transient */ }
  }, []);

  const loadHistory = useCallback(async () => {
    try { setHistory(await api.paperHistory()); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    refresh(); loadHistory();
    const t = setInterval(refresh, 5000); // live P&L
    return () => clearInterval(t);
  }, [user, refresh, loadHistory]);

  async function openTrade() {
    setMsg(null); setBusy(true);
    try {
      await api.paperOpen({ symbol, side, stake: Number(stake), leverage });
      setMsg({ t: 'ok', m: `${side.toUpperCase()} ${meta?.display} opened` });
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
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20 }} className="tr-grid">
          <div className="card card-premium" style={{ padding: 8 }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
              height={480}
              config={{ width: '100%', height: 480, symbol: TV[symbol], interval: '60', timezone: 'Etc/UTC', theme: 'dark', style: '1', locale: 'en', hide_side_toolbar: true, allow_symbol_change: false, calendar: false, support_host: 'https://www.tradingview.com' }}
            />
          </div>

          {/* Order ticket */}
          <div className="card card-premium" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={lbl}>Instrument</label>
              <select value={symbol} onChange={e => setSymbol(e.target.value)} style={inp}>
                {insts.map(i => <option key={i.symbol} value={i.symbol}>{i.display}</option>)}
              </select>
            </div>

            <div style={{ textAlign: 'center', padding: '6px 0' }}>
              <div style={{ fontSize: '0.68rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>Live Price</div>
              <div className="mono" style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff' }}>
                {price == null ? '—' : price.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => setSide('buy')} className={`btn btn-sm ${side === 'buy' ? '' : 'btn-outline'}`}
                style={side === 'buy' ? { background: 'var(--up)', color: '#04150b', fontWeight: 800 } : {}}>▲ BUY</button>
              <button onClick={() => setSide('sell')} className={`btn btn-sm ${side === 'sell' ? '' : 'btn-outline'}`}
                style={side === 'sell' ? { background: 'var(--down)', color: '#fff', fontWeight: 800 } : {}}>▼ SELL</button>
            </div>

            <div>
              <label style={lbl}>Stake (margin, $)</label>
              <input type="number" min={1} value={stake} onChange={e => setStake(e.target.value)} style={inp} />
            </div>

            <div>
              <label style={lbl}>Leverage</label>
              <select value={leverage} onChange={e => setLeverage(Number(e.target.value))} style={inp}>
                {[1, 5, 10, 20, 50, 100].map(l => <option key={l} value={l}>{l}x</option>)}
              </select>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#9a9a9a' }}>
              Position size: <b style={{ color: '#c9a84c' }}>{money(Number(stake) * leverage)}</b>
            </div>

            <button onClick={openTrade} disabled={busy || price == null}
              className="btn btn-gold" style={{ width: '100%', fontWeight: 800 }}>
              {busy ? '…' : `Open ${side.toUpperCase()} Trade`}
            </button>

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
                <thead><tr>{['Instrument', 'Side', 'Stake', 'Lev', 'Entry', 'Current', 'P&L', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {positions.map(p => (
                    <tr key={p.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={td}>{p.display}</td>
                      <td style={{ ...td, color: p.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{p.side.toUpperCase()}</td>
                      <td style={td}>{money(p.stake)}</td>
                      <td style={td}>{p.leverage}x</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{p.entryPrice}</td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{p.price ?? '—'}</td>
                      <td style={{ ...td, color: upDown(p.pnl), fontWeight: 700, fontFamily: 'monospace' }}>{money(p.pnl)}</td>
                      <td style={td}><button onClick={() => close(p.id)} disabled={busy} className="btn btn-outline btn-sm">Close</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="card card-premium">
            <h3 style={{ marginTop: 0 }}>Trade History</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={tbl}>
                <thead><tr>{['Instrument', 'Side', 'Stake', 'Entry', 'Exit', 'P&L', 'Closed'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={td}>{h.display}</td>
                      <td style={{ ...td, color: h.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{h.side.toUpperCase()}</td>
                      <td style={td}>{money(h.stake)}</td>
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

function Kpi({ label, value, color, tint }: { label: string; value: string; color?: string; tint?: string }) {
  return (
    <div className="card" style={{ padding: '14px 16px', borderTop: tint ? `2px solid ${tint}` : undefined }}>
      <div style={{ fontSize: '0.66rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 800, color: color || '#fff', marginTop: 3 }}>{value}</div>
    </div>
  );
}
