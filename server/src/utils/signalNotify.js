import { prisma } from './db.js';

// Post a notification-bell announcement for a signal event. Announcements are
// global (every student sees them; read-state is tracked per user), so this is
// how a signal reaches everyone's bell. Fire-and-forget — never blocks callers.
export function announceSignal(title, body) {
  prisma.announcement.create({ data: { title, body, pinned: false } }).catch(() => {});
}

export function signalSummary(s) {
  const tps = [s.tp1, s.tp2, s.tp3].filter(Boolean).join(' / ');
  const ot = s.orderType && s.orderType !== 'Market' ? ` ${s.orderType}` : '';
  return `${s.pair} ${s.direction}${ot} — Entry ${s.entry}, SL ${s.stopLoss}${tps ? `, TP ${tps}` : ''}`;
}
