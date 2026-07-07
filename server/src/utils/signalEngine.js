// Live price engine for trading signals.
//
// Every tick it pulls the pending + active signals, prices each instrument via
// the same cached Yahoo feed the simulator uses, and:
//   • auto-TRIGGERS a pending order (pending -> active) once price reaches entry,
//     per the order type (Buy/Sell Limit & Stop);
//   • auto-CLOSES an active signal (-> closed) when price hits its Stop Loss
//     (loss) or first Take Profit (win), recording the pip result.
// Each action posts to the student notification bell. Signals whose pair can't
// be matched to a known instrument are left untouched for manual admin control.
//
// Note: on Render's free tier the web service sleeps after ~15 min idle, so the
// engine only runs while the server is awake.

import { prisma } from './db.js';
import { getPrice, INSTRUMENTS } from './prices.js';
import { announceSignal, signalSummary } from './signalNotify.js';

const POLL_MS = 30000; // 30s

// Common admin spellings -> instrument key used by the price feed.
const ALIASES = {
  GOLD: 'XAUUSD', XAU: 'XAUUSD', XAUUSD: 'XAUUSD',
  BTC: 'BTCUSD', BTCUSDT: 'BTCUSD',
  ETH: 'ETHUSD', ETHUSDT: 'ETHUSD',
};

// Map a free-text signal pair (e.g. "EURUSD", "GOLD", "BTC/USD") to a known
// instrument key, or null if we can't price it.
export function resolveSymbol(pair) {
  if (!pair) return null;
  const key = String(pair).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (INSTRUMENTS[key]) return key;
  return ALIASES[key] || null;
}

// Has a pending order at `entry` been reached by current price `p`?
export function pendingTriggered(orderType, entry, p) {
  switch (orderType) {
    case 'Buy Limit':  return p <= entry; // buy on a dip down to entry
    case 'Sell Limit': return p >= entry; // sell on a rally up to entry
    case 'Buy Stop':   return p >= entry; // buy on a breakout up through entry
    case 'Sell Stop':  return p <= entry; // sell on a breakdown through entry
    default: return false;                // Market orders never sit pending here
  }
}

let running = false;

async function tick() {
  if (running) return; // never overlap a slow tick
  running = true;
  try {
    const signals = await prisma.signal.findMany({ where: { status: { in: ['pending', 'active'] }, autoManage: true } });
    if (signals.length === 0) return;

    // Price each needed instrument once (getPrice also caches ~5s internally).
    const symbols = [...new Set(signals.map(s => resolveSymbol(s.pair)).filter(Boolean))];
    const prices = {};
    for (const sym of symbols) {
      try { prices[sym] = await getPrice(sym); } catch { /* skip this instrument this tick */ }
    }

    for (const s of signals) {
      const sym = resolveSymbol(s.pair);
      const p = sym ? prices[sym] : undefined;
      if (typeof p !== 'number') continue;
      const inst = INSTRUMENTS[sym];
      const entry = parseFloat(s.entry);
      const sl = parseFloat(s.stopLoss);
      const tp1 = parseFloat(s.tp1);

      // Pending -> active when the entry (trigger) price is reached.
      if (s.status === 'pending') {
        if (Number.isFinite(entry) && pendingTriggered(s.orderType, entry, p)) {
          const u = await prisma.signal.update({ where: { id: s.id }, data: { status: 'active' } });
          announceSignal(`🎯 Signal Triggered: ${u.pair} ${u.direction}`,
            `${signalSummary(u)} — entry hit at ${p.toFixed(inst.dp)}, now active.`);
        }
        continue;
      }

      // Active -> closed when Stop Loss (loss) or first Take Profit (win) is hit.
      const isBuy = s.direction === 'BUY';
      let result = null;      // 'win' | 'loss'
      let closePrice = null;
      if (isBuy) {
        if (Number.isFinite(sl) && p <= sl) { result = 'loss'; closePrice = sl; }
        else if (Number.isFinite(tp1) && p >= tp1) { result = 'win'; closePrice = tp1; }
      } else {
        if (Number.isFinite(sl) && p >= sl) { result = 'loss'; closePrice = sl; }
        else if (Number.isFinite(tp1) && p <= tp1) { result = 'win'; closePrice = tp1; }
      }
      if (result) {
        const pips = Number.isFinite(entry)
          ? Math.round(((closePrice - entry) * (isBuy ? 1 : -1) / inst.pip) * 10) / 10
          : null;
        const u = await prisma.signal.update({ where: { id: s.id }, data: { status: 'closed', result, pips } });
        announceSignal(`✅ Signal Closed: ${u.pair} ${u.direction}`,
          `${result.toUpperCase()} — ${result === 'win' ? 'TP' : 'SL'} hit at ${closePrice.toFixed(inst.dp)}${pips != null ? ` · ${pips > 0 ? '+' : ''}${pips} pips` : ''}.`);
      }
    }
  } catch (e) {
    console.error('[signalEngine] tick error:', e.message);
  } finally {
    running = false;
  }
}

export function startSignalEngine() {
  setInterval(tick, POLL_MS);
  console.log(`[signalEngine] started — polling live prices every ${POLL_MS / 1000}s`);
}
