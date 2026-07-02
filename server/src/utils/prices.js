// Live price feed for the paper-trading simulator.
// Uses Yahoo Finance's public chart endpoint (works globally + from the server,
// unlike Binance which is geo-blocked). Prices are cached briefly to avoid
// hammering the source when many positions are open.

// Instruments offered for paper trading.
//   contract = units per 1.00 lot (forex standard lot = 100,000; gold = 100 oz; crypto = 1 coin)
//   usdBase  = true when USD is the BASE currency (USD/JPY, USD/CAD) — P&L must be
//              converted from the quote currency back into USD.
// pip = smallest quoted move used to measure distance (0.0001 for most FX,
// 0.01 for JPY pairs, 0.1 for gold; crypto uses 1 "point" = $1).
export const INSTRUMENTS = {
  EURUSD: { display: 'EUR/USD', yahoo: 'EURUSD=X', dp: 5, contract: 100000, pip: 0.0001 },
  GBPUSD: { display: 'GBP/USD', yahoo: 'GBPUSD=X', dp: 5, contract: 100000, pip: 0.0001 },
  USDJPY: { display: 'USD/JPY', yahoo: 'JPY=X',    dp: 3, contract: 100000, usdBase: true, pip: 0.01 },
  AUDUSD: { display: 'AUD/USD', yahoo: 'AUDUSD=X', dp: 5, contract: 100000, pip: 0.0001 },
  USDCAD: { display: 'USD/CAD', yahoo: 'CAD=X',    dp: 5, contract: 100000, usdBase: true, pip: 0.0001 },
  XAUUSD: { display: 'Gold',    yahoo: 'GC=F',     dp: 2, contract: 100, pip: 0.1 },
  BTCUSD: { display: 'BTC/USD', yahoo: 'BTC-USD',  dp: 2, contract: 1, pip: 1 },
  ETHUSD: { display: 'ETH/USD', yahoo: 'ETH-USD',  dp: 2, contract: 1, pip: 1 },
};

// Demo account default leverage, used only to size the margin requirement.
export const MARGIN_LEVERAGE = 100; // 1:100

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

// Profit/loss (in USD) for a lot-based position at a given price.
export function computePnl(trade, price) {
  const inst = INSTRUMENTS[trade.symbol];
  const units = trade.lots * inst.contract;
  const dir = trade.side === 'buy' ? 1 : -1;
  let pnl = (price - trade.entryPrice) * units * dir;
  if (inst.usdBase) pnl = pnl / price; // convert quote-currency P&L into USD
  return pnl;
}

// Margin (USD) required to open `lots` of `symbol` at `price`, at 1:MARGIN_LEVERAGE.
export function marginRequired(symbol, lots, price) {
  const inst = INSTRUMENTS[symbol];
  const units = lots * inst.contract;
  const notionalUSD = inst.usdBase ? units : units * price;
  return notionalUSD / MARGIN_LEVERAGE;
}
