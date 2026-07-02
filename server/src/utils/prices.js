// Live price feed for the paper-trading simulator.
// Uses Yahoo Finance's public chart endpoint (works globally + from the server,
// unlike Binance which is geo-blocked). Prices are cached briefly to avoid
// hammering the source when many positions are open.

// Instruments offered for paper trading -> their Yahoo Finance tickers.
export const INSTRUMENTS = {
  EURUSD: { display: 'EUR/USD', yahoo: 'EURUSD=X', dp: 5 },
  GBPUSD: { display: 'GBP/USD', yahoo: 'GBPUSD=X', dp: 5 },
  USDJPY: { display: 'USD/JPY', yahoo: 'JPY=X',    dp: 3 },
  AUDUSD: { display: 'AUD/USD', yahoo: 'AUDUSD=X', dp: 5 },
  USDCAD: { display: 'USD/CAD', yahoo: 'CAD=X',    dp: 5 },
  XAUUSD: { display: 'Gold',    yahoo: 'GC=F',     dp: 2 },
  BTCUSD: { display: 'BTC/USD', yahoo: 'BTC-USD',  dp: 2 },
  ETHUSD: { display: 'ETH/USD', yahoo: 'ETH-USD',  dp: 2 },
};

const cache = new Map(); // symbol -> { price, ts }
const TTL = 5000;        // 5s cache

export async function getPrice(symbol) {
  const inst = INSTRUMENTS[symbol];
  if (!inst) throw new Error('Unknown instrument');

  const hit = cache.get(symbol);
  if (hit && Date.now() - hit.ts < TTL) return hit.price;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(inst.yahoo)}?interval=1m&range=1d`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error('Price feed unavailable');
  const data = await res.json();
  const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (typeof price !== 'number') throw new Error('Price unavailable');

  cache.set(symbol, { price, ts: Date.now() });
  return price;
}

// Compute profit/loss for a position given a current/exit price.
export function computePnl({ side, stake, leverage, entryPrice }, price) {
  const pct = (price - entryPrice) / entryPrice;      // fractional move
  const dir = side === 'buy' ? 1 : -1;
  return stake * leverage * pct * dir;
}
