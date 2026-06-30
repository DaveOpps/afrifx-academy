import { useEffect, useState } from 'react';
import { api } from '../api';
import DashboardLayout from '../components/DashboardLayout';

export default function Leaderboard() {
  const [board, setBoard] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.leaderboard(), api.myGamification()])
      .then(([b, m]) => { setBoard(b); setMe(m); })
      .finally(() => setLoading(false));
  }, []);

  const medal = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  return (
    <DashboardLayout title="🏆 Leaderboard" subtitle="Earn points by watching lessons, passing quizzes, and completing courses.">
        {loading ? <div className="loading-center"><span className="spinner"></span></div> : (
          <>
            {/* My stats */}
            {me && (
              <div className="card card-premium" style={{ marginBottom: 28, background: 'linear-gradient(135deg,rgba(26,107,60,0.12),rgba(201,168,76,0.08))', border: '1px solid rgba(201,168,76,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>Your Rank</p>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#c9a84c' }}>#{me.rank}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>Points</p>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{me.points}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>Badges</p>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{me.earned}/{me.total}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Achievements */}
            {me && (
              <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Achievements</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
                  {me.achievements.map((a: any) => (
                    <div key={a.id} className="card" style={{ padding: 16, textAlign: 'center', opacity: a.earned ? 1 : 0.4, border: a.earned ? '1px solid rgba(201,168,76,0.35)' : '1px solid rgba(255,255,255,0.07)', filter: a.earned ? 'none' : 'grayscale(1)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>{a.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{a.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9a9a9a', lineHeight: 1.4 }}>{a.desc}</div>
                      {a.earned && <div style={{ marginTop: 8 }}><span className="badge badge-green">✓ Earned</span></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top students */}
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16 }}>Top Students</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th style={{ width: 70 }}>Rank</th><th>Student</th><th style={{ textAlign: 'right' }}>Points</th></tr></thead>
                <tbody>
                  {board.map(u => (
                    <tr key={u.id} style={{ background: u.isMe ? 'rgba(201,168,76,0.08)' : undefined }}>
                      <td style={{ fontSize: '1.1rem', fontWeight: 700 }}>{medal(u.rank)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>{u.name[0]}</div>
                          <span style={{ fontWeight: 600 }}>{u.name}{u.isMe && <span style={{ color: '#c9a84c', fontSize: '0.78rem' }}> (you)</span>}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#c9a84c' }}>{u.points}</td>
                    </tr>
                  ))}
                  {board.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: '#9a9a9a', padding: 32 }}>No rankings yet. Start learning to earn points!</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
    </DashboardLayout>
  );
}
