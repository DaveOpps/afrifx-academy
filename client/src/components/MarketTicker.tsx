import { useEffect, useRef, useState } from 'react';
import { fetchTickers, TICKER_PAIRS, Tick } from '../api/market';
import { streamTickers } from '../api/marketStream';

type Row = Tick & { dir: number };

// Demo fallback (random walk) if the live feed is unreachable.
const SEED: Row[] = TICKER_PAIRS.map(p => ({
  sym: p.sym, display: p.display, dp: p.dp, change: 0, dir: 0,
  price: { BTCUSDT: 64120, ETHUSDT: 3410, BNBUSDT: 585, SOLUSDT: 168, XRPUSDT: 0.52, DOGEUSDT: 0.14, ADAUSDT: 0.45, PAXGUSDT: 2342 }[p.sym] || 100,
}));

export default function MarketTicker() {
  const [rows, setRows] = useState<Row[]>(SEED);
  const [live, setLive] = useState(false);
  const prev = useRef<Record<string, number>>({});

  useEffect(() => {
    let active = true;
    let demoTimer: ReturnType<typeof setInterval> | null = null;

    const applyDir = (next: Tick[]): Row[] => next.map(t => {
      const before = prev.current[t.sym];
      prev.current[t.sym] = t.price;
      return { ...t, dir: before === undefined ? 0 : t.price > before ? 1 : t.price < before ? -1 : 0 };
    });

    const poll = async () => {
      const data = await fetchTickers();
      if (!active) return;
      if (data) { setLive(true); setRows(applyDir(data)); }
      else if (!live) startDemo();
    };

    const startDemo = () => {
      if (demoTimer) return;
      demoTimer = setInterval(() => {
        setRows(rs => rs.map(r => {
          const seed = SEED.find(s => s.sym === r.sym)!;
          const drift = (Math.random() - 0.5) * (r.price * 0.001);
          const np = +(r.price + drift).toFixed(r.dp);
          return { ...r, price: np, change: +(((np - seed.price) / seed.price) * 100).toFixed(2), dir: drift >= 0 ? 1 : -1 };
        }));
      }, 1600);
    };

    poll();
    const liveTimer = setInterval(poll, 5000);

    // Real-time tick stream (sub-second). Updates each pair as trades print.
    const stop = streamTickers(TICKER_PAIRS.map(p => p.sym), (sym, price, change) => {
      if (!active) return;
      setLive(true);
      if (demoTimer) { clearInterval(demoTimer); demoTimer = null; }
      setRows(rs => rs.map(r => {
        if (r.sym !== sym) return r;
        const before = prev.current[sym]; prev.current[sym] = price;
        const np = +price.toFixed(r.dp);
        return { ...r, price: np, change: +change.toFixed(2), dir: before === undefined ? 0 : np > before ? 1 : np < before ? -1 : 0 };
      }));
    }, () => active && setLive(true));

    return () => { active = false; clearInterval(liveTimer); if (demoTimer) clearInterval(demoTimer); stop(); };
  }, []); // eslint-disable-line

  const item = (r: Row, i: number) => {
    const up = r.change >= 0;
    return (
      <span key={`${r.sym}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 20px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#eaeaea' }}>{r.display}</span>
        <span key={r.price} className="mono" style={{
          fontSize: '0.8rem', color: r.dir === 0 ? '#c8c8c8' : r.dir > 0 ? 'var(--up)' : 'var(--down)',
          padding: '1px 5px', borderRadius: 4,
          animation: r.dir === 0 ? 'none' : `${r.dir > 0 ? 'flashUp' : 'flashDown'} 0.7s ease`,
        }}>
          {r.price.toLocaleString(undefined, { minimumFractionDigits: r.dp, maximumFractionDigits: r.dp })}
        </span>
        <span className="mono" style={{ fontSize: '0.72rem', fontWeight: 700, color: up ? 'var(--up)' : 'var(--down)' }}>
          {up ? '▲' : '▼'} {Math.abs(r.change)}%
        </span>
      </span>
    );
  };

  return (
    <div style={{ overflow: 'hidden', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(160deg,#15151a,#101013)', boxShadow: '0 6px 24px rgba(0,0,0,0.3)', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 2, display: 'flex', alignItems: 'center', padding: '0 16px', background: '#141418', boxShadow: '18px 0 22px 10px #141418', fontSize: '0.64rem', fontWeight: 800, letterSpacing: 1.5, color: '#c9a84c' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: live ? 'var(--up)' : '#777', animation: live ? 'livePulse 1.8s infinite' : 'none' }} />
          {live ? 'LIVE MARKETS' : 'MARKETS'}
        </span>
      </div>
      <div style={{ display: 'flex', whiteSpace: 'nowrap', padding: '10px 0 10px 160px', animation: 'afx-marquee 38s linear infinite', width: 'max-content' }}>
        {rows.map(item)}
        {rows.map((r, i) => item(r, i + 100))}
      </div>
      <style>{`@keyframes afx-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
