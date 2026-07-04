import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

const money = (n: number | null | undefined) =>
  n == null ? '—' : (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const upDown = (n: number) => n >= 0 ? 'var(--up)' : 'var(--down)';
const medal = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

interface TradeRow { userId: number; name: string; netPnl: number; trades: number; wins: number; winRate: number; }
interface QuizRow { userId: number; name: string; avgScore: number; taken: number; perfect: number; }
interface Trade { id: number; display: string; side: string; lots: number; entryPrice: number; exitPrice: number; pnl: number; closeReason: string | null; closedAt: string; }

export default function AdminPerformance() {
  const [tradeBoard, setTradeBoard] = useState<TradeRow[]>([]);
  const [quizBoard, setQuizBoard] = useState<QuizRow[]>([]);
  const [tradeView, setTradeView] = useState<'top' | 'losers'>('top');
  const [loading, setLoading] = useState(true);
  const [openStudent, setOpenStudent] = useState<TradeRow | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.paperLeaderboard(), api.adminQuizPerformance()])
      .then(([t, q]) => { setTradeBoard(t); setQuizBoard(q); })
      .finally(() => setLoading(false));
  }, []);

  async function viewTrades(row: TradeRow) {
    setOpenStudent(row);
    setTradesLoading(true);
    try { setTrades(await api.adminStudentTrades(row.userId)); }
    finally { setTradesLoading(false); }
  }

  const tradeRows = tradeView === 'top' ? tradeBoard : [...tradeBoard].reverse();

  if (loading) return <DashboardLayout title="Performance"><div className="loading-center"><span className="spinner"></span></div></DashboardLayout>;

  return (
    <DashboardLayout title="Performance" subtitle="Paper-trading results and quiz scores across all students.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Trading performance */}
        <div className="card card-premium">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ margin: 0, fontWeight: 700 }}>📈 Trading Performance</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setTradeView('top')} className={`btn btn-sm ${tradeView === 'top' ? 'btn-gold' : 'btn-outline'}`}>Top Traders</button>
              <button onClick={() => setTradeView('losers')} className={`btn btn-sm ${tradeView === 'losers' ? 'btn-gold' : 'btn-outline'}`}>Top Losers</button>
            </div>
          </div>
          {tradeBoard.length === 0 ? (
            <p style={{ color: '#9a9a9a', margin: 0 }}>No students have closed a paper trade yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Rank</th><th>Student</th><th>Net P&L</th><th>Trades</th><th>Win Rate</th><th></th></tr></thead>
                <tbody>
                  {tradeRows.map((r, i) => (
                    <tr key={r.userId}>
                      <td style={{ fontWeight: 800 }}>{tradeView === 'top' ? medal(i) : `#${i + 1}`}</td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ color: upDown(r.netPnl), fontWeight: 700, fontFamily: 'monospace' }}>{money(r.netPnl)}</td>
                      <td>{r.trades}</td>
                      <td>{r.winRate}%</td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => viewTrades(r)}>View Trades</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quiz performance */}
        <div className="card card-premium">
          <h3 style={{ marginTop: 0, marginBottom: 14, fontWeight: 700 }}>📝 Best Quiz Students</h3>
          {quizBoard.length === 0 ? (
            <p style={{ color: '#9a9a9a', margin: 0 }}>No students have taken a quiz yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Rank</th><th>Student</th><th>Average Score</th><th>Quizzes Taken</th><th>Perfect Scores</th></tr></thead>
                <tbody>
                  {quizBoard.map((r, i) => (
                    <tr key={r.userId}>
                      <td style={{ fontWeight: 800 }}>{medal(i)}</td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td style={{ color: r.avgScore >= 60 ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{r.avgScore}%</td>
                      <td>{r.taken}</td>
                      <td>{r.perfect > 0 ? `💯 ${r.perfect}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Trade history drill-down modal */}
      {openStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setOpenStudent(null)}>
          <div className="card" style={{ width: '100%', maxWidth: 760, maxHeight: '85vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>{openStudent.name}'s Trade History</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setOpenStudent(null)}>Close</button>
            </div>
            {tradesLoading ? (
              <div className="loading-center"><span className="spinner"></span></div>
            ) : trades.length === 0 ? (
              <p style={{ color: '#9a9a9a' }}>No closed trades.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Instrument</th><th>Side</th><th>Lots</th><th>Entry</th><th>Exit</th><th>P&L</th><th>Reason</th><th>Closed</th></tr></thead>
                  <tbody>
                    {trades.map(t => (
                      <tr key={t.id}>
                        <td>{t.display}</td>
                        <td style={{ color: t.side === 'buy' ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{t.side.toUpperCase()}</td>
                        <td>{t.lots}</td>
                        <td style={{ fontFamily: 'monospace' }}>{t.entryPrice}</td>
                        <td style={{ fontFamily: 'monospace' }}>{t.exitPrice}</td>
                        <td style={{ color: upDown(t.pnl), fontWeight: 700, fontFamily: 'monospace' }}>{money(t.pnl)}</td>
                        <td style={{ fontSize: '0.78rem', color: '#9a9a9a', textTransform: 'capitalize' }}>{t.closeReason}</td>
                        <td style={{ fontSize: '0.78rem', color: '#9a9a9a' }}>{new Date(t.closedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
