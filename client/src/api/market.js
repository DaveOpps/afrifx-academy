// Free public market data from Binance (no API key, CORS-enabled).
// Every function returns null on failure so callers can fall back to demo data.
const BASE = 'https://api.binance.com/api/v3';
export const TICKER_PAIRS = [
    { sym: 'BTCUSDT', display: 'BTC/USDT', dp: 1 },
    { sym: 'ETHUSDT', display: 'ETH/USDT', dp: 2 },
    { sym: 'BNBUSDT', display: 'BNB/USDT', dp: 2 },
    { sym: 'SOLUSDT', display: 'SOL/USDT', dp: 2 },
    { sym: 'XRPUSDT', display: 'XRP/USDT', dp: 4 },
    { sym: 'DOGEUSDT', display: 'DOGE/USDT', dp: 5 },
    { sym: 'ADAUSDT', display: 'ADA/USDT', dp: 4 },
    { sym: 'PAXGUSDT', display: 'XAU/USDT', dp: 1 }, // PAX Gold ~ spot gold
];
export const SYMBOLS = [
    { sym: 'BTCUSDT', label: 'BTC/USDT', dp: 1 },
    { sym: 'ETHUSDT', label: 'ETH/USDT', dp: 2 },
    { sym: 'SOLUSDT', label: 'SOL/USDT', dp: 2 },
    { sym: 'BNBUSDT', label: 'BNB/USDT', dp: 2 },
    { sym: 'XRPUSDT', label: 'XRP/USDT', dp: 4 },
    { sym: 'PAXGUSDT', label: 'XAU/USDT', dp: 1 },
];
export const INTERVALS = [
    { label: '15m', v: '15m' },
    { label: '1H', v: '1h' },
    { label: '4H', v: '4h' },
    { label: '1D', v: '1d' },
    { label: '1W', v: '1w' },
];
export async function fetchTickers() {
    try {
        const syms = TICKER_PAIRS.map(p => p.sym);
        const url = `${BASE}/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(syms))}`;
        const res = await fetch(url);
        if (!res.ok)
            return null;
        const data = await res.json();
        const map = new Map(data.map((d) => [d.symbol, d]));
        return TICKER_PAIRS.map(p => {
            const d = map.get(p.sym);
            return { sym: p.sym, display: p.display, price: +(+d.lastPrice).toFixed(p.dp), change: +(+d.priceChangePercent).toFixed(2), dp: p.dp };
        });
    }
    catch {
        return null;
    }
}
export async function fetchTicker24h(symbol) {
    try {
        const res = await fetch(`${BASE}/ticker/24hr?symbol=${symbol}`);
        if (!res.ok)
            return null;
        return await res.json();
    }
    catch {
        return null;
    }
}
export async function fetchKlines(symbol = 'BTCUSDT', interval = '1h', limit = 60) {
    try {
        const res = await fetch(`${BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        if (!res.ok)
            return null;
        const data = await res.json();
        return data.map((k) => ({ t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5] }));
    }
    catch {
        return null;
    }
}
export async function fetchTrades(symbol = 'BTCUSDT', limit = 24) {
    try {
        const res = await fetch(`${BASE}/trades?symbol=${symbol}&limit=${limit}`);
        if (!res.ok)
            return null;
        const data = await res.json();
        return data.map((t) => ({ price: +t.price, qty: +t.qty, buyerMaker: t.isBuyerMaker, time: t.time })).reverse();
    }
    catch {
        return null;
    }
}
export async function fetchDepth(symbol = 'BTCUSDT', limit = 12) {
    try {
        const res = await fetch(`${BASE}/depth?symbol=${symbol}&limit=${limit}`);
        if (!res.ok)
            return null;
        const data = await res.json();
        return {
            bids: data.bids.map((b) => ({ price: +b[0], qty: +b[1] })),
            asks: data.asks.map((a) => ({ price: +a[0], qty: +a[1] })),
        };
    }
    catch {
        return null;
    }
}
