import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import MarketTicker from '../../components/MarketTicker';
import Donut from '../../components/charts/Donut';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function AdminDash() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [perf, setPerf] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.adminStats(),
      api.adminAnalytics().catch(() => null),
      api.signalPerformance().catch(() => null),
      api.listApplications().catch(() => []),
    ])
      .then(([s, a, p, ap]) => { setStats(s); setAnalytics(a); setPerf(p); setApps(ap || []); })
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0];
  const newApps = apps.filter(a => a.status === 'new').length;
  const maxSignup = analytics ? Math.max(1, ...analytics.signups.map((s: any) => s.count)) : 1;
  const maxPop = analytics ? Math.max(1, ...analytics.popularity.map((p: any) => p.enrollments)) : 1;
  const newThisMonth = analytics ? analytics.signups[analytics.signups.length - 1]?.count ?? 0 : 0;

  if (loading || !stats) {
    return <DashboardLayout title="Admin Dashboard"><div className="loading-center"><span className="spinner"></span></div></DashboardLayout>;
  }

  const notStarted = analytics ? Math.max(0, analytics.totalEnrollments - analytics.completedEnrollments - analytics.activeEnrollments) : 0;

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`${greeting()}, ${firstName} 👋 · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      actions={<Link to="/admin/courses" className="btn btn-gold btn-sm">+ New Course</Link>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <MarketTicker />

        {/* Hero command center + this week */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }} className="bento-2">
          <div className="card card-premium" style={{ overflow: 'hidden', position: 'relative', background: 'linear-gradient(120deg, rgba(26,107,60,0.28), rgba(20,20,24,0.6) 55%, rgba(201,168,76,0.18))', border: '1px solid rgba(201,168,76,0.25)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: '0.72rem', letterSpacing: 2, textTransform: 'uppercase', color: '#c9a84c' }}>Command Center</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 6px' }}>Manage your academy</h2>
              <p style={{ color: '#c8c8c8', fontSize: '0.9rem', marginBottom: 18 }}>Quick actions to keep AfriFX running smoothly.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/admin/courses" className="btn btn-gold btn-sm">+ Course</Link>
                <Link to="/admin/signals" className="btn btn-outline btn-sm">+ Signal</Link>
                <Link to="/admin/announcements" className="btn btn-outline btn-sm">Announce</Link>
                <Link to="/admin/meetings" className="btn btn-outline btn-sm">Schedule Meeting</Link>
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📈</span>
              <div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1 }}>{newThisMonth}</div>
                <div style={{ fontSize: '0.76rem', color: '#9a9a9a' }}>New students this month</div>
              </div>
            </div>
            <Link to="/admin/applications" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <span style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📥</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1, color: newApps ? '#c9a84c' : '#fff' }}>{newApps}</div>
                <div style={{ fontSize: '0.76rem', color: '#9a9a9a' }}>New applications {newApps > 0 && '· review →'}</div>
              </div>
            </Link>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          <KpiCard icon="👥" value={stats.students} label="Total Students" tint="#c9a84c" to="/admin/students" pill={newThisMonth ? `+${newThisMonth} mo` : undefined} />
          <KpiCard icon="📚" value={stats.courses} label="Courses" tint="#4aa3d4" to="/admin/courses" />
          <KpiCard icon="📋" value={stats.enrollments} label="Enrollments" tint="#4caf50" to="/admin/students" pill={analytics ? `${analytics.completionRate}% done` : undefined} />
          <KpiCard icon="🎓" value={stats.certs} label="Certificates" tint="#e2c070" to="/admin/certificates" pillGold />
        </div>

        {/* Trend + signals/apps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }} className="bento-2">
          <div className="card card-premium">
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 24 }}>📈 New Students (6 months)</h3>
            {analytics ? (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 200, paddingBottom: 8 }}>
                {analytics.signups.map((s: any) => (
                  <div key={s.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.76rem', color: '#c9a84c', fontWeight: 700 }}>{s.count}</span>
                    <div style={{ width: '100%', height: `${(s.count / maxSignup) * 100}%`, minHeight: s.count > 0 ? 4 : 0, background: 'linear-gradient(180deg,#c9a84c,#1a6b3c)', borderRadius: '6px 6px 0 0', transition: 'height 0.5s' }} />
                    <span style={{ fontSize: '0.72rem', color: '#9a9a9a' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: '#9a9a9a' }}>No data.</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.98rem' }}>Signal Win Rate</h3>
                <Link to="/admin/signals" style={{ fontSize: '0.76rem', color: '#c9a84c' }}>Manage →</Link>
              </div>
              {perf && perf.trades > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#4caf50' }}>{perf.winRate}%</span>
                    <span style={{ fontSize: '0.78rem', color: '#9a9a9a' }}>{perf.wins}W / {perf.losses}L · {perf.trades} trades</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9a9a9a', marginTop: 4 }}>Total: <b style={{ color: perf.totalPips >= 0 ? '#4caf50' : '#ef5350' }}>{perf.totalPips >= 0 ? '+' : ''}{perf.totalPips} pips</b></div>
                </>
              ) : <p style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>No closed trades yet.</p>}
            </div>

            <div className="card" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.98rem' }}>Recent Applications</h3>
                <Link to="/admin/applications" style={{ fontSize: '0.76rem', color: '#c9a84c' }}>All →</Link>
              </div>
              {apps.length === 0 ? <p style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>No applications yet.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {apps.slice(0, 3).map(a => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
                      <span>{a.type === 'ib' ? '🤝' : '🎤'}</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                      <span style={{ fontSize: '0.66rem', color: a.status === 'new' ? '#c9a84c' : '#9a9a9a', textTransform: 'uppercase' }}>{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Completion donut + popularity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: 16 }}>Course Completion</h3>
            {analytics && analytics.totalEnrollments > 0 ? (
              <Donut size={150} centerTop="Rate" centerBottom={`${analytics.completionRate}%`}
                segments={[
                  { label: `Completed (${analytics.completedEnrollments})`, value: analytics.completedEnrollments, color: '#4caf50' },
                  { label: `Active (${analytics.activeEnrollments})`, value: analytics.activeEnrollments, color: '#c9a84c' },
                  { label: `Not Started (${notStarted})`, value: notStarted, color: '#3a3a3a' },
                ]} />
            ) : <p style={{ color: '#9a9a9a', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No enrollment data yet.</p>}
          </div>

          <div className="card" style={{ gridColumn: 'span 2', minWidth: 0 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: 16 }}>🔥 Most Popular Courses</h3>
            {analytics && analytics.popularity.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {analytics.popularity.map((p: any) => (
                  <div key={p.title}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.84rem' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>{p.title}</span>
                      <span style={{ color: '#c9a84c', fontWeight: 700 }}>{p.enrollments}</span>
                    </div>
                    <div className="progress-bar-wrap" style={{ height: 8 }}><div className="progress-bar-fill" style={{ width: `${(p.enrollments / maxPop) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: '#9a9a9a', fontSize: '0.85rem' }}>No enrollment data yet.</p>}
          </div>
        </div>

        {/* Recent students */}
        <div className="card card-premium">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Recent Students</h3>
            <Link to="/admin/students" style={{ fontSize: '0.82rem', color: '#c9a84c' }}>View all →</Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th></th></tr></thead>
              <tbody>
                {stats.recent.map((s: any) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.74rem', fontWeight: 700 }}>{s.name[0]}</span>
                        {s.name}
                      </div>
                    </td>
                    <td style={{ color: '#9a9a9a' }}>{s.email}</td>
                    <td style={{ color: '#9a9a9a', fontSize: '0.82rem' }}>{new Date(s.createdAt).toLocaleDateString('en-GB')}</td>
                    <td><Link to={`/admin/students/${s.id}`} style={{ color: '#c9a84c', fontSize: '0.82rem' }}>View →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px){ .bento-2 { grid-template-columns: 1fr !important; } }`}</style>
    </DashboardLayout>
  );
}

function KpiCard({ icon, value, label, tint, pill, pillGold, to }: {
  icon: string; value: number | string; label: string; tint: string; pill?: string; pillGold?: boolean; to?: string;
}) {
  const inner = (
    <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden', height: '100%' }}>
      <div style={{ position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${tint}22, transparent 70%)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: `${tint}1a`, border: `1px solid ${tint}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{icon}</div>
        {pill && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: pillGold ? '#c9a84c' : '#4caf50', background: pillGold ? 'rgba(201,168,76,0.12)' : 'rgba(76,175,80,0.12)', border: `1px solid ${pillGold ? 'rgba(201,168,76,0.3)' : 'rgba(76,175,80,0.3)'}` }}>{pill}</span>}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#9a9a9a', marginTop: 6 }}>{label}</div>
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}
