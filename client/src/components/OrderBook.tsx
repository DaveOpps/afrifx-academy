import { useEffect, useRef, useState } from 'react';
import { fetchDepth, Depth, DepthLevel } from '../api/market';
import { streamDepth } from '../api/marketStream';

// Synthetic order book around a mid price (fallback when the feed is unreachable).
function synth(mid: number): Depth {
  const lv = (n: number, side: 1 | -1): DepthLevel[] =>
    Array.from({ length: n }).map((_, i) => ({
      price: +(mid + side * mid * 0.0002 * (i + 1)).toFixed(2),
      qty: +(Math.random() * 2 + 0.05).toFixed(4),
    }));
  return { asks: lv(10, 1), bids: lv(10, -1) };
}

export default function OrderBook({ symbol = 'BTCUSDT', rows = 10, dp = 1 }: { symbol?: string; rows?: number; dp?: number }) {
  const [depth, setDepth] = useState<Depth | null>(null);
  const [live, setLive] = useState(false);
  const midRef = useRef(60000);

  useEffect(() => {
    let active = true;
    // REST seed / fallback
    const load = async () => {
      const d = await fetchDepth(symbol, rows);
      if (!active) return;
      if (d && d.bids.length) {
        midRef.current = (d.bids[0].price + d.asks[0].price) / 2;
        setDepth(prev => prev && live ? prev : d);
      } else if (!live) {
        setDepth(synth(midRef.current));
      }
    };
    load();
    const t = setInterval(load, 4000);

    // Real-time stream (sub-second). Overrides REST when connected.
    const stop = streamDepth(symbol, (bids, asks) => {
      if (!active || !bids.length) return;
      midRef.current = (bids[0].price + asks[0].price) / 2;
      setDepth({ bids, asks }); setLive(true);
    });

    return () => { active = false; clearInterval(t); stop(); };
  }, [symbol, rows]); // eslint-disable-line

  if (!depth) return <div className="loading-center" style={{ minHeight: 120 }}><span className="spinner" /></div>;

  const asks = depth.asks.slice(0, rows).reverse();
  const bids = depth.bids.slice(0, rows);
  const maxQty = Math.max(...asks.map(a => a.qty), ...bids.map(b => b.qty), 0.0001);
  const spread = depth.asks[0] && depth.bids[0] ? depth.asks[0].price - depth.bids[0].price : 0;
  const mid = depth.asks[0] && depth.bids[0] ? (depth.asks[0].price + depth.bids[0].price) / 2 : midRef.current;
  const totBid = bids.reduce((s, b) => s + b.qty, 0);
  const totAsk = asks.reduce((s, a) => s + a.qty, 0);
  const buyPct = Math.round((totBid / (totBid + totAsk || 1)) * 100);

  const Row = (l: DepthLevel, side: 'ask' | 'bid') => {
    const pct = (l.qty / maxQty) * 100;
    const col = side === 'ask' ? 'var(--down)' : 'var(--up)';
    const bg = side === 'ask' ? 'rgba(246,70,93,0.12)' : 'rgba(14,203,129,0.12)';
    return (
      <div key={`${side}-${l.price}`} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '2px 8px', fontSize: '0.74rem' }}>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${pct}%`, background: bg }} />
        <span className="mono" style={{ position: 'relative', color: col }}>{l.price.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}</span>
        <span className="mono" style={{ position: 'relative', color: '#c8c8c8' }}>{l.qty.toFixed(4)}</span>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Order Book</h3>
        <span style={{ fontSize: '0.62rem', color: live ? 'var(--up)' : '#777', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: live ? 'var(--up)' : '#777', animation: live ? 'livePulse 1.8s infinite' : 'none' }} />
          {live ? 'LIVE' : 'demo'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#777', padding: '0 8px 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        <span>Price</span><span>Size</span>
      </div>
      <div>{asks.map(a => Row(a, 'ask'))}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 8px', margin: '3px 0', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="mono" style={{ fontWeight: 800, fontSize: '0.95rem' }}>{mid.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}</span>
        <span style={{ fontSize: '0.66rem', color: '#9a9a9a' }}>spread {spread.toFixed(dp)}</span>
      </div>
      <div>{bids.map(b => Row(b, 'bid'))}</div>

      {/* buy / sell pressure */}
      <div style={{ marginTop: 10, padding: '0 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.64rem', marginBottom: 4 }}>
          <span style={{ color: 'var(--up)', fontWeight: 700 }}>B {buyPct}%</span>
          <span style={{ color: '#777' }}>Buy / Sell</span>
          <span style={{ color: 'var(--down)', fontWeight: 700 }}>{100 - buyPct}% S</span>
        </div>
        <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ width: `${buyPct}%`, background: 'linear-gradient(90deg,#0ecb81,rgba(14,203,129,0.6))', transition: 'width 0.3s' }} />
          <div style={{ flex: 1, background: 'linear-gradient(90deg,rgba(246,70,93,0.6),#f6465d)' }} />
        </div>
      </div>
    </div>
  );
}
