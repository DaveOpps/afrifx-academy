import { useEffect, useRef, useState } from 'react';
import { fetchTrades, Trade } from '../api/market';
import { streamTrades } from '../api/marketStream';

export default function TradesFeed({ symbol = 'BTCUSDT', rows = 18, dp = 1 }: { symbol?: string; rows?: number; dp?: number }) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [live, setLive] = useState(false);
  const cap = rows;
  const seeded = useRef(false);

  useEffect(() => {
    let active = true;
    seeded.current = false;
    setTrades([]);

    fetchTrades(symbol, cap).then(t => { if (active && t && !seeded.current) { setTrades(t.slice(-cap).reverse()); } });

    const stop = streamTrades(symbol, (tr) => {
      if (!active) return;
      seeded.current = true; setLive(true);
      setTrades(prev => [tr, ...prev].slice(0, cap));
    }, () => active && setLive(true));

    return () => { active = false; stop(); };
  }, [symbol, cap]);

  const time = (t: number) => new Date(t).toLocaleTimeString('en-GB', { hour12: false });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Recent Trades</h3>
        <span style={{ fontSize: '0.62rem', color: live ? 'var(--up)' : '#777', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: live ? 'var(--up)' : '#777', animation: live ? 'livePulse 1.8s infinite' : 'none' }} />
          {live ? 'LIVE' : 'demo'}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#777', padding: '0 4px 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        <span>Price</span><span>Size</span><span>Time</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {trades.length === 0 && <div className="loading-center" style={{ minHeight: 80 }}><span className="spinner" /></div>}
        {trades.map((t, i) => {
          const buy = !t.buyerMaker; // buyer is taker → aggressive buy
          return (
            <div key={`${t.time}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 4px', fontSize: '0.73rem', animation: i === 0 ? `${buy ? 'flashUp' : 'flashDown'} 0.8s ease` : 'none', borderRadius: 3 }}>
              <span className="mono" style={{ color: buy ? 'var(--up)' : 'var(--down)' }}>{t.price.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp })}</span>
              <span className="mono" style={{ color: '#c8c8c8' }}>{t.qty.toFixed(4)}</span>
              <span className="mono" style={{ color: '#777' }}>{time(t.time)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
