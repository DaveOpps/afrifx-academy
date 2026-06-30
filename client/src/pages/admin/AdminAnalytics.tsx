import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
import Donut from '../../components/charts/Donut';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [perf, setPerf] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      api.adminAnalytics(),
      api.adminStats().catch(() => null),
      api.signalPerformance().catch(() => null),
    ]).then(([a, s, p]) => { setData(a); setStats(s); setPerf(p); });
  }, []);

  if (!data) return <DashboardLayout title="Platform Analytics"><div className="loading-center"><span className="spinner"></span></div></DashboardLayout>;

  const maxSignup = Math.max(...data.signups.map((s: any) => s.count), 1);
  const maxPop = Math.max(...data.popularity.map((p: any) => p.enrollments), 1);
  const notStarted = Math.max(0, data.totalEnrollments - data.completedEnrollments - data.activeEnrollments);

  return (
    <DashboardLayout title="Platform Analytics" subtitle="Insights into enrollment trends and course performance.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 16 }}>
          <Kpi icon="📋" value={data.totalEnrollments} label="Total Enrollments" tint="#c9a84c" />
          <Kpi icon="🔄" value={data.activeEnrollments} label="In Progress" tint="#4aa3d4" />
          <Kpi icon="✅" value={data.completedEnrollments} label="Completed" tint="#4caf50" />
          <Kpi icon="📊" value={`${data.completionRate}%`} label="Completion Rate" tint="#e2c070" pillGold pill={perf ? `${perf.winRate}% signal WR` : undefined} />
        </div>

        {/* Secondary stat strip */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16 }}>
            <MiniStat icon="👥" value={stats.students} label="Students" to="/admin/students" />
            <MiniStat icon="📚" value={stats.courses} label="Courses" to="/admin/courses" />
            <MiniStat icon="🎓" value={stats.certs} label="Certificates" to="/admin/certificates" />
            <MiniStat icon="📡" value={perf ? perf.trades : 0} label="Signals Closed" to="/admin/signals" />
          </div>
        )}

        {/* Trend + completion donut */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }} className="bento-2">
          <div className="card card-premium">
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 24 }}>📈 New Students (6 months)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 210, paddingBottom: 8 }}>
              {data.signups.map((s: any) => (
                <div key={s.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.78rem', color: '#c9a84c', fontWeight: 700 }}>{s.count}</span>
                  <div style={{ width: '100%', height: `${(s.count / maxSignup) * 100}%`, minHeight: s.count > 0 ? 4 : 0, background: 'linear-gradient(180deg,#c9a84c,#1a6b3c)', borderRadius: '6px 6px 0 0', transition: 'height 0.5s' }} />
                  <span style={{ fontSize: '0.74rem', color: '#9a9a9a' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-premium" style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 18 }}>Course Completion</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {data.totalEnrollments > 0 ? (
                <Donut size={170} centerTop="Rate" centerBottom={`${data.completionRate}%`}
                  segments={[
                    { label: `Completed (${data.completedEnrollments})`, value: data.completedEnrollments, color: '#4caf50' },
                    { label: `Active (${data.activeEnrollments})`, value: data.activeEnrollments, color: '#c9a84c' },
                    { label: `Not Started (${notStarted})`, value: notStarted, color: '#3a3a3a' },
                  ]} />
              ) : <p style={{ color: '#9a9a9a', fontSize: '0.85rem' }}>No enrollment data yet.</p>}
            </div>
          </div>
        </div>

        {/* Popularity */}
        <div className="card card-premium">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>🔥 Most Popular Courses</h3>
          {data.popularity.length === 0 ? <p style={{ color: '#9a9a9a' }}>No enrollment data yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.popularity.map((p: any, i: number) => (
                <div key={p.title}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.86rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                      <span style={{ color: '#666', fontWeight: 700, fontSize: '0.78rem' }}>#{i + 1}</span>{p.title}
                    </span>
                    <span style={{ color: '#c9a84c', fontWeight: 700 }}>{p.enrollments} enrolled</span>
                  </div>
                  <div className="progress-bar-wrap" style={{ height: 9 }}><div className="progress-bar-fill" style={{ width: `${(p.enrollments / maxPop) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insight band */}
        <div className="card" style={{ background: 'linear-gradient(120deg, rgba(26,107,60,0.12), rgba(20,20,24,0.4) 60%, rgba(201,168,76,0.1))' }}>
          <p style={{ color: '#c8c8c8', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {data.completedEnrollments} of {data.totalEnrollments} enrollments fully completed.
            {data.completionRate >= 50 ? ' Great engagement! 🎉 Keep the momentum with fresh content and live sessions.' : ' Consider posting announcements or reminders to boost completion rates.'}
          </p>
        </div>
      </div>

      <style>{`@media (max-width: 900px){ .bento-2 { grid-template-columns: 1fr !important; } }`}</style>
    </DashboardLayout>
  );
}

function Kpi({ icon, value, label, tint, pill, pillGold }: { icon: string; value: number | string; label: string; tint: string; pill?: string; pillGold?: boolean }) {
  return (
    <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${tint}22, transparent 70%)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: `${tint}1a`, border: `1px solid ${tint}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{icon}</div>
        {pill && <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: '#c9a84c', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>{pill}</span>}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#9a9a9a', marginTop: 6 }}>{label}</div>
    </div>
  );
}

function MiniStat({ icon, value, label, to }: { icon: string; value: number | string; label: string; to: string }) {
  return (
    <Link to={to} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', padding: '16px 18px' }}>
      <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.74rem', color: '#9a9a9a' }}>{label}</div>
      </div>
    </Link>
  );
}
