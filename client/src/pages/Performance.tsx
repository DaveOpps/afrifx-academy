import { useEffect, useState } from 'react';
import { api } from '../api';
import PageShell from '../components/PageShell';
import Donut from '../components/charts/Donut';

type View = 'weekly' | 'monthly';

export default function Performance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('monthly');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 15;

  useEffect(() => { api.signalPerformance().then(setData).finally(() => setLoading(false)); }, []);

  if (loading) return <PageShell title="Performance Dashboard" subtitle="Transparent, verifiable results from our published trading signals."><div className="loading-center"><span className="spinner" /></div></PageShell>;

  if (!data || data.trades === 0) return (
    <PageShell title="Performance Dashboard" subtitle="Transparent, verifiable results from our published trading signals.">
      <div className="card" style={{ textAlign: 'center', padding: 48 }}>
        <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📊</p>
        <h3>No closed trades yet</h3>
        <p style={{ color: '#9a9a9a', marginTop: 8 }}>Once signals are closed with results, full performance stats appear here.</p>
      </div>
    </PageShell>
  );

  const chartData = view === 'monthly' ? data.months : data.weeks;
  const maxAbs = Math.max(1, ...chartData.map((m: any) => Math.abs(m.pips)));
  const history: any[] = data.history || [];
  const pageSlice = history.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(history.length / PAGE_SIZE);

  return (
    <PageShell title="Performance Dashboard" subtitle="Transparent, verifiable results from our published trading signals.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Trust badge */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(120deg,rgba(14,203,129,0.08),rgba(26,107,60,0.06))', border: '1px solid rgba(14,203,129,0.2)', padding: '14px 20px' }}>
          <span style={{ fontSize: '1.6rem' }}>🔒</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>100% Transparent Performance</div>
            <div style={{ fontSize: '0.78rem', color: '#9a9a9a' }}>All results are from live, publicly published signals. Nothing is hidden or adjusted.</div>
          </div>
        </div>

        {/* KPI tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16 }}>
          <Kpi icon="🎯" value={`${data.winRate}%`} label="Win Rate" tint="#0ecb81" />
          <Kpi icon="📈" value={(data.totalPips >= 0 ? '+' : '') + data.totalPips} label="Total Pips" tint={data.totalPips >= 0 ? '#0ecb81' : '#f6465d'} />
          <Kpi icon="📊" value={data.trades} label="Total Trades" tint="#c9a84c" />
          <Kpi icon="✅" value={data.wins} label="Wins" tint="#0ecb81" />
          <Kpi icon="❌" value={data.losses} label="Losses" tint="#f6465d" />
          <Kpi icon="⚖️" value={data.rr ? `1:${data.rr}` : '—'} label="Risk : Reward" tint="#4aa3d4" />
          <Kpi icon="📉" value={data.avgWin ? `${data.avgWin} pips` : '—'} label="Avg Win" tint="#0ecb81" />
          <Kpi icon="📉" value={data.avgLoss ? `${data.avgLoss} pips` : '—'} label="Avg Loss" tint="#f6465d" />
        </div>

        {/* Chart + donut */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }} className="perf-grid">
          <div className="card card-premium">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Pips Performance</h3>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['weekly', 'monthly'] as View[]).map(v => (
                  <button key={v} onClick={() => setView(v)} className={`btn btn-sm ${view === v ? 'btn-gold' : 'btn-outline'}`}>{v === 'weekly' ? 'Weekly' : 'Monthly'}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 200, paddingBottom: 8 }}>
              {chartData.map((m: any) => {
                const pos = m.pips >= 0;
                const h = (Math.abs(m.pips) / maxAbs) * 100;
                return (
                  <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                    <span className="mono" style={{ fontSize: '0.7rem', color: pos ? 'var(--up)' : 'var(--down)', fontWeight: 700 }}>{pos ? '+' : ''}{m.pips}</span>
                    <div style={{ width: '100%', height: `${Math.max(h, 2)}%`, background: pos ? 'linear-gradient(180deg,#0ecb81,rgba(14,203,129,0.5))' : 'linear-gradient(180deg,#f6465d,rgba(246,70,93,0.5))', borderRadius: '4px 4px 0 0', transition: 'height 0.4s' }} />
                    <div style={{ fontSize: '0.66rem', color: '#9a9a9a', textAlign: 'center' }}>{m.label}</div>
                    {m.trades > 0 && <div style={{ fontSize: '0.6rem', color: '#666' }}>{m.trades}T</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card card-premium" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Win / Loss</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Donut size={160} centerTop="Win Rate" centerBottom={`${data.winRate}%`}
                segments={[
                  { label: `Wins (${data.wins})`, value: data.wins, color: '#0ecb81' },
                  { label: `Losses (${data.losses})`, value: data.losses, color: '#f6465d' },
                  { label: `Breakeven (${data.breakeven})`, value: data.breakeven, color: '#c9a84c' },
                ]} />
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[{ label: 'Wins', val: data.wins, col: 'var(--up)' }, { label: 'Losses', val: data.losses, col: 'var(--down)' }, { label: 'Breakeven', val: data.breakeven, col: '#c9a84c' }].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: '#9a9a9a' }}>{r.label}</span>
                  <span className="mono" style={{ color: r.col, fontWeight: 700 }}>{r.val}</span>
                </div>
              ))}
              {data.rr > 0 && (
                <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(74,163,212,0.1)', border: '1px solid rgba(74,163,212,0.25)', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#9a9a9a' }}>Risk : Reward</div>
                  <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4aa3d4' }}>1 : {data.rr}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Historical archive */}
        <div className="card card-premium">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>📁 Historical Archive</h3>
            <span style={{ fontSize: '0.76rem', color: '#9a9a9a' }}>{history.length} closed signals</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Pair</th><th>Direction</th><th>Entry</th><th>SL</th><th>TP1</th><th>Pips</th><th>Result</th><th>Date</th></tr>
              </thead>
              <tbody>
                {pageSlice.map((s: any) => {
                  const win = s.result === 'win';
                  const loss = s.result === 'loss';
                  const col = win ? 'var(--up)' : loss ? 'var(--down)' : '#c9a84c';
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>{s.pair}</td>
                      <td><span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20, color: s.direction === 'BUY' ? 'var(--up)' : 'var(--down)', background: s.direction === 'BUY' ? 'rgba(14,203,129,0.1)' : 'rgba(246,70,93,0.1)', border: `1px solid ${s.direction === 'BUY' ? 'rgba(14,203,129,0.3)' : 'rgba(246,70,93,0.3)'}` }}>{s.direction}</span></td>
                      <td className="mono" style={{ fontSize: '0.82rem' }}>{s.entry}</td>
                      <td className="mono" style={{ fontSize: '0.82rem', color: 'var(--down)' }}>{s.stopLoss}</td>
                      <td className="mono" style={{ fontSize: '0.82rem', color: 'var(--up)' }}>{s.tp1}</td>
                      <td className="mono" style={{ fontWeight: 700, color: col }}>{s.pips != null ? `${win ? '+' : loss ? '-' : ''}${Math.abs(s.pips)}` : '—'}</td>
                      <td><span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, color: col, background: `${col}18`, border: `1px solid ${col}33`, textTransform: 'capitalize' }}>{s.result || '—'}</span></td>
                      <td style={{ color: '#9a9a9a', fontSize: '0.78rem' }}>{new Date(s.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button className="btn btn-outline btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span style={{ fontSize: '0.82rem', color: '#9a9a9a', alignSelf: 'center' }}>Page {page + 1} / {totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', color: '#666', fontSize: '0.76rem' }}>Past performance does not guarantee future results. Trade responsibly.</p>
      </div>

      <style>{`@media(max-width:820px){.perf-grid{grid-template-columns:1fr!important}}`}</style>
    </PageShell>
  );
}

function Kpi({ icon, value, label, tint }: { icon: string; value: string | number; label: string; tint: string }) {
  return (
    <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -16, top: -16, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle,${tint}22,transparent 70%)` }} />
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${tint}1a`, border: `1px solid ${tint}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 10 }}>{icon}</div>
      <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color: tint }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: '#9a9a9a', marginTop: 5 }}>{label}</div>
    </div>
  );
}
