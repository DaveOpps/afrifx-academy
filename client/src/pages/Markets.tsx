import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import CandleChart from '../components/charts/CandleChart';
import OrderBook from '../components/OrderBook';
import TradesFeed from '../components/TradesFeed';
import { fetchKlines, fetchTicker24h, SYMBOLS, INTERVALS, Candle } from '../api/market';
import { streamKline } from '../api/marketStream';

export default function Markets() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setIntervalV] = useState('1h');
  const [candles, setCandles] = useState<Candle[] | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [live, setLive] = useState(false);

  const meta = SYMBOLS.find(s => s.sym === symbol)!;
  const dp = meta.dp;

  useEffect(() => {
    let active = true;
    const loadKlines = async () => {
      const k = await fetchKlines(symbol, interval, 60);
      if (!active) return;
      if (k && k.length) { setCandles(k); setLive(true); } else { setCandles(null); setLive(false); }
    };
    loadKlines();
    const t = setInterval(loadKlines, 30000); // periodic resync

    // Live: update the forming candle tick-by-tick
    const stop = streamKline(symbol, interval, (c) => {
      if (!active) return;
      setLive(true);
      setCandles(prev => {
        if (!prev || !prev.length) return prev;
        const arr = prev.slice();
        if (arr[arr.length - 1].t === c.t) arr[arr.length - 1] = c;
        else { arr.push(c); if (arr.length > 60) arr.shift(); }
        return arr;
      });
    });

    return () => { active = false; clearInterval(t); stop(); };
  }, [symbol, interval]);

  useEffect(() => {
    let active = true;
    const loadStats = async () => { const s = await fetchTicker24h(symbol); if (active) setStats(s); };
    loadStats();
    const t = setInterval(loadStats, 5000);
    return () => { active = false; clearInterval(t); };
  }, [symbol]);

  const fmt = (v: any) => v == null ? '—' : (+v).toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const change = stats ? +stats.priceChangePercent : 0;

  return (
    <PageShell title="Live Markets" subtitle="Real-time crypto prices, charts and order book — powered by live market data.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Symbol tabs + 24h stats */}
        <div className="card card-premium">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {SYMBOLS.map(s => (
              <button key={s.sym} onClick={() => setSymbol(s.sym)}
                className={`btn btn-sm ${symbol === s.sym ? 'btn-gold' : 'btn-outline'}`}>{s.label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'clamp(16px,4vw,44px)', flexWrap: 'wrap', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>{meta.label}</div>
              <div className="mono" style={{ fontSize: '1.9rem', fontWeight: 800, color: change >= 0 ? 'var(--up)' : 'var(--down)' }}>{fmt(stats?.lastPrice)}</div>
            </div>
            <Stat label="24h Change" value={stats ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%` : '—'} color={change >= 0 ? 'var(--up)' : 'var(--down)'} />
            <Stat label="24h High" value={fmt(stats?.highPrice)} />
            <Stat label="24h Low" value={fmt(stats?.lowPrice)} />
            <Stat label="24h Volume" value={stats ? (+stats.volume).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—'} />
          </div>
        </div>

        {/* Chart + order book */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20 }} className="mk-grid">
          <div className="card card-premium">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, justifyContent: 'flex-end' }}>
              {INTERVALS.map(iv => (
                <button key={iv.v} onClick={() => setIntervalV(iv.v)}
                  className={`btn btn-sm ${interval === iv.v ? 'btn-gold' : 'btn-outline'}`} style={{ padding: '5px 13px' }}>{iv.label}</button>
              ))}
            </div>
            <CandleChart data={candles ?? undefined} pair={meta.label} live={live} width={760} height={420} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card card-premium"><OrderBook symbol={symbol} rows={11} dp={dp} /></div>
            <div className="card card-premium"><TradesFeed symbol={symbol} rows={16} dp={dp} /></div>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.76rem' }}>
          Live data via Binance public market API. For education only — not financial advice.
        </p>
      </div>

      <style>{`@media (max-width: 820px){ .mk-grid { grid-template-columns: 1fr !important; } }`}</style>
    </PageShell>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.7rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: color || '#fff' }}>{value}</div>
    </div>
  );
}
