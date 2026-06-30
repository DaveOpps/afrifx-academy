// Binance public WebSocket streams (free, no key). Each opener returns a cleanup fn.
// Components keep their REST polling as a fallback; these just make updates real-time.

const WS_BASE = 'wss://stream.binance.com:9443';

function open(url: string, onMessage: (data: any) => void, onOpen?: () => void): () => void {
  let ws: WebSocket | null = null;
  try {
    ws = new WebSocket(url);
    ws.onopen = () => onOpen?.();
    ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch { /* ignore */ } };
    ws.onerror = () => { /* fallback handled by REST polling */ };
  } catch { /* ignore */ }
  return () => { try { ws?.close(); } catch { /* ignore */ } };
}

export function streamTickers(symbols: string[], onTick: (sym: string, price: number, change: number) => void, onOpen?: () => void): () => void {
  const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
  return open(`${WS_BASE}/stream?streams=${streams}`, (msg) => {
    const d = msg.data;
    if (d && d.s) onTick(d.s, +d.c, +d.P);
  }, onOpen);
}

export function streamDepth(symbol: string, onDepth: (bids: { price: number; qty: number }[], asks: { price: number; qty: number }[]) => void, onOpen?: () => void): () => void {
  return open(`${WS_BASE}/ws/${symbol.toLowerCase()}@depth10@100ms`, (d) => {
    if (d.bids && d.asks) {
      onDepth(
        d.bids.map((b: any) => ({ price: +b[0], qty: +b[1] })),
        d.asks.map((a: any) => ({ price: +a[0], qty: +a[1] })),
      );
    }
  }, onOpen);
}

export function streamKline(symbol: string, interval: string, onCandle: (c: { t: number; o: number; h: number; l: number; c: number; v: number }, isFinal: boolean) => void, onOpen?: () => void): () => void {
  return open(`${WS_BASE}/ws/${symbol.toLowerCase()}@kline_${interval}`, (d) => {
    const k = d.k;
    if (k) onCandle({ t: k.t, o: +k.o, h: +k.h, l: +k.l, c: +k.c, v: +k.v }, k.x);
  }, onOpen);
}

export function streamTrades(symbol: string, onTrade: (t: { price: number; qty: number; buyerMaker: boolean; time: number }) => void, onOpen?: () => void): () => void {
  return open(`${WS_BASE}/ws/${symbol.toLowerCase()}@aggTrade`, (d) => {
    if (d.p) onTrade({ price: +d.p, qty: +d.q, buyerMaker: !!d.m, time: d.T });
  }, onOpen);
}
