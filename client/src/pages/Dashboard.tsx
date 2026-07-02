import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import MarketTicker from '../components/MarketTicker';
import Donut from '../components/charts/Donut';
import TradingViewWidget from '../components/TradingViewWidget';

const ECON_EVENTS = [
  { time: '08:30', cur: 'USD', title: 'Core CPI m/m', impact: 'high' },
  { time: '10:00', cur: 'EUR', title: 'ECB President Speech', impact: 'med' },
  { time: '13:30', cur: 'USD', title: 'Unemployment Claims', impact: 'high' },
  { time: '15:00', cur: 'GBP', title: 'BOE Gov Speech', impact: 'med' },
];
const IMPACT = { high: '#ef5350', med: '#c9a84c', low: '#9a9a9a' } as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  const h = Math.floor(diff / 3.6e6), m = Math.floor((diff % 3.6e6) / 6e4), s = Math.floor((diff % 6e4) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: '#c9a84c' }}>{pad(h)}:{pad(m)}:{pad(s)}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [game, setGame] = useState<any>(null);
  const [nextMeet, setNextMeet] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [activity, setActivity] = useState<any>(null);
  const [board, setBoard] = useState<any[]>([]);
  const [perf, setPerf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.myEnrollments(),
      api.myCerts(),
      api.myGamification(),
      api.nextMeeting().catch(() => null),
      api.getLatestSignals().catch(() => []),
      api.myActivity().catch(() => null),
      api.leaderboard().catch(() => []),
      api.signalPerformance().catch(() => null),
    ])
      .then(([e, c, g, nm, s, a, b, p]) => {
        setEnrollments(e); setCerts(c); setGame(g); setNextMeet(nm);
        setSignals(s || []); setActivity(a); setBoard(b || []); setPerf(p);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalLessons = enrollments.reduce((s, e) => s + (e.totalLessons || 0), 0);
  const watchedTotal = enrollments.reduce((s, e) => s + (e.watchedCount || 0), 0);
  const overallPct = totalLessons ? Math.round((watchedTotal / totalLessons) * 100) : 0;
  const completedCount = enrollments.filter(e => e.completedAt).length;
  const inProgress = enrollments.filter(e => !e.completedAt && (e.watchedCount || 0) > 0).length;
  const notStarted = enrollments.filter(e => !e.completedAt && !(e.watchedCount || 0)).length;

  const signalActive = user?.tier === 'vvip' || (!!user?.signalSubUntil && new Date(user.signalSubUntil) > new Date());
  const firstName = user?.name?.split(' ')[0];

  // Resume target
  const resume = enrollments.find(e => !e.completedAt && (e.watchedCount || 0) > 0) || enrollments.find(e => !e.completedAt) || enrollments[0];
  const resumeLesson = resume?.course?.modules?.[0]?.lessons?.[0];
  const resumePct = resume ? (resume.completedAt ? 100 : resume.totalLessons ? Math.round((resume.watchedCount / resume.totalLessons) * 100) : 0) : 0;

  // Smart nudge
  const nudge = enrollments.length === 0
    ? { text: 'Enroll in your first course to begin', cta: 'Browse Courses', to: '/courses' }
    : !signalActive
      ? { text: 'Unlock daily trading signals', cta: 'Get Signals — $5/mo', to: '/signals' }
      : { text: 'Keep your streak alive — continue learning', cta: 'Resume', to: resumeLesson ? `/learn/${resume.course.id}/${resumeLesson.id}` : '/courses' };

  if (loading) {
    return <DashboardLayout title="Dashboard"><div className="loading-center"><span className="spinner"></span></div></DashboardLayout>;
  }

  return (
    <DashboardLayout title="Omni Dashboard" subtitle={`${greeting()}, ${firstName} 👋 · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      actions={<Link to="/courses" className="btn btn-gold btn-sm">+ Enroll</Link>}>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Market ticker */}
        <MarketTicker />

        {/* Hero + streak */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }} className="bento-2">
          {/* Resume / nudge hero */}
          <div className="card card-premium" style={{ overflow: 'hidden', position: 'relative', background: 'linear-gradient(120deg, rgba(26,107,60,0.28), rgba(20,20,24,0.6) 55%, rgba(201,168,76,0.18))', border: '1px solid rgba(201,168,76,0.25)' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: 0.5, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.22), transparent 70%)' }} />
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: '0.72rem', letterSpacing: 2, textTransform: 'uppercase', color: '#c9a84c' }}>{resume && !resume.completedAt ? 'Continue learning' : 'Your next step'}</span>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.5rem', fontWeight: 800, margin: '8px 0 6px' }}>
                {resume ? resume.course.title : 'Start your trading journey'}
              </h2>
              <p style={{ color: '#c8c8c8', fontSize: '0.9rem', marginBottom: 16 }}>{nudge.text}</p>
              {resume && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, maxWidth: 360 }}>
                  <div className="progress-bar-wrap" style={{ flex: 1 }}><div className="progress-bar-fill" style={{ width: `${resumePct}%` }} /></div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c9a84c' }}>{resumePct}%</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to={nudge.to} className="btn btn-gold btn-sm">{nudge.cta} →</Link>
                {resume && resumeLesson && nudge.cta !== 'Resume' && <Link to={`/learn/${resume.course.id}/${resumeLesson.id}`} className="btn btn-outline btn-sm">Continue course</Link>}
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: '2.4rem' }}>🔥</span>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{activity?.streak ?? 0}</div>
                <div style={{ fontSize: '0.78rem', color: '#9a9a9a' }}>day streak</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
              {(activity?.days || []).map((d: any, i: number) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div title={`${d.count} lessons`} style={{ height: 30, borderRadius: 6, background: d.count > 0 ? `rgba(201,168,76,${Math.min(1, 0.3 + d.count * 0.25)})` : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 4 }} />
                  <span style={{ fontSize: '0.62rem', color: '#777' }}>{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
          <KpiCard icon="📚" value={enrollments.length} label="Enrolled Courses" tint="#c9a84c" pill={inProgress ? `${inProgress} active` : undefined} />
          <KpiCard icon="✅" value={completedCount} label="Completed" tint="#4caf50" pill={enrollments.length ? `${Math.round((completedCount / enrollments.length) * 100)}%` : undefined} />
          <KpiCard icon="🎓" value={certs.length} label="Certificates" tint="#4aa3d4" />
          <KpiCard icon="🏆" value={game?.points ?? 0} label={`Points · Rank #${game?.rank ?? '—'}`} tint="#e2c070" pillGold pill={`${overallPct}% done`} />
        </div>

        {/* Chart + signals/live */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 20 }} className="bento-2">
          <div className="card card-premium" style={{ padding: 8 }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
              height={360}
              config={{ autosize: true, symbol: 'OANDA:XAUUSD', interval: '60', timezone: 'Etc/UTC', theme: 'dark', style: '1', locale: 'en', allow_symbol_change: true, hide_side_toolbar: true, calendar: false, support_host: 'https://www.tradingview.com' }}
            />
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <Link to="/markets" className="btn btn-outline btn-sm">Open full markets →</Link>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Market technicals */}
            <div className="card" style={{ padding: 8 }}>
              <TradingViewWidget
                scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
                height={300}
                config={{ interval: '1D', width: '100%', isTransparent: true, height: '100%', symbol: 'OANDA:XAUUSD', showIntervalTabs: true, displayMode: 'single', locale: 'en', colorTheme: 'dark' }}
              />
            </div>

            {/* Live countdown */}
            {nextMeet?.meeting ? (
              <div className="card" style={{ background: nextMeet.status === 'live' ? 'linear-gradient(135deg,rgba(76,175,80,0.18),rgba(20,20,24,0.4))' : 'linear-gradient(135deg,rgba(34,158,217,0.14),rgba(20,20,24,0.4))', border: nextMeet.status === 'live' ? '1px solid rgba(76,175,80,0.4)' : '1px solid rgba(34,158,217,0.3)' }}>
                {nextMeet.status === 'live'
                  ? <span style={{ color: '#4caf50', fontWeight: 700, fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />LIVE NOW</span>
                  : <span style={{ color: '#4aa3d4', fontWeight: 700, fontSize: '0.74rem' }}>NEXT LIVE SESSION</span>}
                <div style={{ fontWeight: 700, margin: '6px 0 10px' }}>{nextMeet.meeting.title}</div>
                {nextMeet.status !== 'live' && <div style={{ marginBottom: 12 }}><Countdown target={nextMeet.meeting.startTime} /></div>}
                <a href={nextMeet.meeting.meetLink} target="_blank" rel="noopener" className={`btn btn-sm ${nextMeet.status === 'live' ? 'btn-primary' : 'btn-gold'}`} style={{ width: '100%' }}>{nextMeet.status === 'live' ? 'Join Now' : 'Join Session'}</a>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', color: '#9a9a9a', fontSize: '0.85rem' }}>📹 No live sessions scheduled</div>
            )}

            {/* Signal scoreboard */}
            <div className="card" style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.98rem' }}>Signal Scoreboard</h3>
                <Link to="/performance" style={{ fontSize: '0.76rem', color: '#c9a84c' }}>Details →</Link>
              </div>
              {perf && perf.trades > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: '2rem', fontWeight: 800, color: '#4caf50' }}>{perf.winRate}%</span>
                    <span style={{ fontSize: '0.78rem', color: '#9a9a9a' }}>win rate · {perf.trades} trades</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                    {perf.history.slice(0, 8).map((s: any, i: number) => (
                      <span key={i} title={`${s.pair} · ${s.result}`} style={{ width: 18, height: 18, borderRadius: 5, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, background: s.result === 'win' ? 'rgba(76,175,80,0.2)' : s.result === 'loss' ? 'rgba(239,83,80,0.2)' : 'rgba(154,154,154,0.2)', color: s.result === 'win' ? '#4caf50' : s.result === 'loss' ? '#ef5350' : '#9a9a9a' }}>{s.result === 'win' ? 'W' : s.result === 'loss' ? 'L' : '–'}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9a9a9a' }}>Total: <b style={{ color: perf.totalPips >= 0 ? '#4caf50' : '#ef5350' }}>{perf.totalPips >= 0 ? '+' : ''}{perf.totalPips} pips</b></div>
                </>
              ) : (
                <p style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>No closed trades yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity / podium / calendar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {/* Course stats donut */}
          <div className="card">
            <h3 style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: 16 }}>Course Statistics</h3>
            {enrollments.length === 0 ? <p style={{ color: '#9a9a9a', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>Enroll to see stats.</p> : (
              <Donut size={150} centerTop="Courses" centerBottom={String(enrollments.length)}
                segments={[
                  { label: `Completed (${completedCount})`, value: completedCount, color: '#4caf50' },
                  { label: `In Progress (${inProgress})`, value: inProgress, color: '#c9a84c' },
                  { label: `Not Started (${notStarted})`, value: notStarted, color: '#3a3a3a' },
                ]} />
            )}
          </div>

          {/* Leaderboard podium */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.98rem' }}>Top Traders</h3>
              <Link to="/leaderboard" style={{ fontSize: '0.76rem', color: '#c9a84c' }}>All →</Link>
            </div>
            {board.slice(0, 3).map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: '1.2rem', width: 24 }}>{['🥇', '🥈', '🥉'][i]}</span>
                <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem' }}>{u.name[0]}</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.86rem' }}>{u.name}{u.isMe && <span style={{ color: '#c9a84c' }}> (you)</span>}</span>
                <span style={{ fontWeight: 700, color: '#c9a84c', fontSize: '0.85rem' }}>{u.points}</span>
              </div>
            ))}
            {board.length === 0 && <p style={{ color: '#9a9a9a', fontSize: '0.82rem' }}>No rankings yet.</p>}
          </div>

          {/* Economic calendar */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.98rem' }}>Today's Market Events</h3>
              <span style={{ fontSize: '0.68rem', color: '#666' }}>demo</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ECON_EVENTS.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
                  <span style={{ fontFamily: 'monospace', color: '#9a9a9a', minWidth: 42 }}>{e.time}</span>
                  <span style={{ fontWeight: 700, color: '#fff', minWidth: 34 }}>{e.cur}</span>
                  <span style={{ flex: 1, color: '#c8c8c8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: IMPACT[e.impact as keyof typeof IMPACT], flexShrink: 0 }} title={e.impact} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My courses */}
        <div className="card card-premium">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>My Courses</h3>
            <Link to="/courses" style={{ fontSize: '0.82rem', color: '#c9a84c' }}>Browse all →</Link>
          </div>
          {enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '28px 0' }}>
              <p style={{ fontSize: '2rem', marginBottom: 8 }}>📚</p>
              <p style={{ color: '#9a9a9a', marginBottom: 16 }}>You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="btn btn-gold btn-sm">Start Learning</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {enrollments.map(en => {
                const pct = en.completedAt ? 100 : en.totalLessons ? Math.round((en.watchedCount / en.totalLessons) * 100) : 0;
                const fl = en.course.modules[0]?.lessons[0];
                return (
                  <div key={en.id} style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>📈</div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{en.course.title}</span>
                        {en.completedAt && <span className="badge badge-green">Done</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="progress-bar-wrap" style={{ flex: 1 }}><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
                        <span style={{ fontSize: '0.76rem', color: '#c9a84c', fontWeight: 700, minWidth: 34, textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {fl && <Link to={`/learn/${en.course.id}/${fl.id}`} className="btn btn-primary btn-sm">{pct > 0 ? 'Continue' : 'Start'}</Link>}
                      {en.completedAt && <Link to="/certificates" className="btn btn-gold btn-sm">Cert</Link>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Membership + achievements */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)', gap: 20 }} className="bento-2">
          <div className="card" style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.08),rgba(20,20,24,0.4))' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.98rem' }}>Membership</h3>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: user?.tier === 'vvip' ? '#c9a84c' : user?.tier === 'premium' ? '#4aa3d4' : '#9a9a9a', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 12px', borderRadius: 20 }}>{user?.tier === 'vvip' ? 'VVIP' : user?.tier === 'premium' ? 'Premium' : 'Free'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 16 }}>
              <span style={{ color: '#9a9a9a' }}>Signals</span>
              {signalActive ? <span style={{ color: '#4caf50', fontWeight: 600 }}>● Active</span> : <span style={{ color: '#9a9a9a' }}>○ Off</span>}
            </div>
            {user?.tier !== 'vvip' && <Link to="/pricing" className="btn btn-gold btn-sm" style={{ width: '100%' }}>Upgrade</Link>}
          </div>

          <div className="card">
            {game && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.98rem' }}>Achievements</h3>
                  <span style={{ fontSize: '0.8rem', color: '#9a9a9a' }}>{game.earned}/{game.total}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(96px,1fr))', gap: 10 }}>
                  {game.achievements.map((a: any) => (
                    <div key={a.id} title={a.desc} style={{ textAlign: 'center', padding: '12px 6px', borderRadius: 10, background: a.earned ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.02)', border: a.earned ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(255,255,255,0.05)', opacity: a.earned ? 1 : 0.4 }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: 4, filter: a.earned ? 'none' : 'grayscale(1)' }}>{a.icon}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600 }}>{a.title}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 900px){ .bento-2 { grid-template-columns: 1fr !important; } }`}</style>
    </DashboardLayout>
  );
}

function KpiCard({ icon, value, label, tint, pill, pillGold }: {
  icon: string; value: number | string; label: string; tint: string; pill?: string; pillGold?: boolean;
}) {
  return (
    <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -20, top: -20, width: 90, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${tint}22, transparent 70%)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: `${tint}1a`, border: `1px solid ${tint}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{icon}</div>
        {pill && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: pillGold ? '#c9a84c' : '#4caf50', background: pillGold ? 'rgba(201,168,76,0.12)' : 'rgba(76,175,80,0.12)', border: `1px solid ${pillGold ? 'rgba(201,168,76,0.3)' : 'rgba(76,175,80,0.3)'}` }}>{pill}</span>}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#9a9a9a', marginTop: 6 }}>{label}</div>
    </div>
  );
}
