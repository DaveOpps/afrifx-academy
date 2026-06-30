import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

type Tab = 'overview' | 'courses' | 'quizzes' | 'certificates' | 'payments' | 'settings';

export default function MyAccount() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [settingsForm, setSettingsForm] = useState({ name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    api.meFull().then(d => { setData(d); setSettingsForm({ name: d.user.name, phone: d.user.phone || '' }); }).finally(() => setLoading(false));
  }, []);

  const reload = () => api.meFull().then(setData);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      await api.updateMe(settingsForm);
      await reload();
      setMsg({ ok: true, text: 'Profile updated.' });
    } catch { setMsg({ ok: false, text: 'Failed to save.' }); } finally { setSaving(false); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (pwForm.next !== pwForm.confirm) { setMsg({ ok: false, text: 'Passwords do not match.' }); return; }
    if (pwForm.next.length < 6) { setMsg({ ok: false, text: 'Password must be at least 6 characters.' }); return; }
    setSaving(true);
    try {
      await (api as any).changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next });
      setPwForm({ current: '', next: '', confirm: '' });
      setMsg({ ok: true, text: 'Password changed.' });
    } catch (err: any) { setMsg({ ok: false, text: err.message || 'Failed.' }); } finally { setSaving(false); }
  }

  if (loading || !data) return <DashboardLayout title="My Account"><div className="loading-center"><span className="spinner" /></div></DashboardLayout>;

  const { user, enrollments, certificates, payments, quizResults, isPremium, signalActive } = data;

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',      label: 'Overview',      icon: '🏠' },
    { id: 'courses',       label: 'My Courses',    icon: '📚' },
    { id: 'quizzes',       label: 'Quiz Scores',   icon: '📝' },
    { id: 'certificates',  label: 'Certificates',  icon: '🎓' },
    { id: 'payments',      label: 'Payments',      icon: '💳' },
    { id: 'settings',      label: 'Settings',      icon: '⚙️' },
  ];

  const tierColor = user.tier === 'vvip' ? '#c9a84c' : user.tier === 'premium' ? '#4aa3d4' : '#9a9a9a';
  const tierLabel = user.tier === 'vvip' ? 'VVIP' : user.tier === 'premium' ? 'Premium' : 'Free';

  return (
    <DashboardLayout title="My Account" subtitle="Personal dashboard — your progress, certs, and settings in one place.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Profile hero */}
        <div className="card card-premium" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg,rgba(26,107,60,0.22),rgba(20,20,24,0.6) 55%,rgba(201,168,76,0.14))' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, flexShrink: 0 }}>
            {user.name[0]}
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '1.3rem', fontWeight: 800 }}>{user.name}</h2>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: tierColor, background: `${tierColor}18`, border: `1px solid ${tierColor}44`, textTransform: 'uppercase', letterSpacing: 1 }}>{tierLabel}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9a9a9a', marginTop: 4 }}>{user.email}</div>
            {user.studentId && <div className="mono" style={{ fontSize: '0.78rem', color: '#c9a84c', marginTop: 4 }}>🪪 {user.studentId}</div>}
          </div>
          <div style={{ position: 'relative', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <StatPill icon="📚" value={enrollments.length} label="Courses" />
            <StatPill icon="🎓" value={certificates.length} label="Certs" />
            <StatPill icon="📝" value={quizResults.length} label="Quizzes" />
            <StatPill icon="⭐" value={user.points} label="Points" />
          </div>
        </div>

        {/* Membership banner for free users */}
        {!isPremium && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: 'linear-gradient(120deg,rgba(201,168,76,0.08),rgba(26,107,60,0.08))', border: '1px solid rgba(201,168,76,0.25)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>🔓 You have Free membership</div>
              <div style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Enroll in any course to unlock Premium — Student ID, certificates, progress tracking & more.</div>
            </div>
            <Link to="/courses" className="btn btn-gold btn-sm">Browse Courses →</Link>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 16 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMsg(null); }}
              className={`btn btn-sm ${tab === t.id ? 'btn-gold' : 'btn-outline'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && <OverviewTab user={user} enrollments={enrollments} certificates={certificates} quizResults={quizResults} payments={payments} signalActive={signalActive} isPremium={isPremium} />}
        {tab === 'courses' && <CoursesTab enrollments={enrollments} />}
        {tab === 'quizzes' && <QuizzesTab quizResults={quizResults} />}
        {tab === 'certificates' && <CertsTab certificates={certificates} />}
        {tab === 'payments' && <PaymentsTab payments={payments} />}
        {tab === 'settings' && (
          <SettingsTab
            form={settingsForm} setForm={setSettingsForm} onSave={saveProfile}
            pwForm={pwForm} setPwForm={setPwForm} onPw={changePassword}
            saving={saving} msg={msg}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

/* ---- Overview ---- */
function OverviewTab({ user, enrollments, certificates, quizResults, payments, signalActive, isPremium }: any) {
  const avgScore = quizResults.length ? Math.round(quizResults.reduce((s: number, q: any) => s + q.score, 0) / quizResults.length) : null;
  const active = user.signalSubUntil ? new Date(user.signalSubUntil) > new Date() : false;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
        <InfoCard icon="📚" title="Enrolled Courses" value={enrollments.length} sub={`${enrollments.filter((e: any) => e.pct === 100).length} completed`} tint="#c9a84c" />
        <InfoCard icon="🎓" title="Certificates" value={certificates.length} sub="earned so far" tint="#4caf50" />
        <InfoCard icon="📝" title="Avg Quiz Score" value={avgScore !== null ? `${avgScore}%` : '—'} sub={`${quizResults.length} quizzes taken`} tint="#4aa3d4" />
        <InfoCard icon="📡" title="Signal Access" value={signalActive ? 'Active' : 'Inactive'} sub={active ? `Until ${new Date(user.signalSubUntil).toLocaleDateString('en-GB')}` : user.tier === 'vvip' ? 'VVIP lifetime' : 'Subscribe for $5/mo'} tint={signalActive ? '#0ecb81' : '#f6465d'} />
      </div>

      {/* Membership features */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="mem-grid">
        <MembershipCard tier="free" active={true} />
        <MembershipCard tier="premium" active={isPremium} />
      </div>

      {/* Recent activity */}
      {enrollments.length > 0 && (
        <div className="card">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Course Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {enrollments.slice(0, 4).map((e: any) => (
              <div key={e.courseId}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '0.84rem' }}>
                  <span>{e.title}</span>
                  <span style={{ color: e.pct === 100 ? 'var(--up)' : '#c9a84c', fontWeight: 700 }}>{e.pct}%</span>
                </div>
                <div className="progress-bar-wrap"><div className="progress-bar-fill" style={{ width: `${e.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Courses tab ---- */
function CoursesTab({ enrollments }: { enrollments: any[] }) {
  if (!enrollments.length) return <Empty icon="📚" text="You haven't enrolled in any courses yet." action={<Link to="/courses" className="btn btn-gold btn-sm">Browse Courses</Link>} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {enrollments.map((e: any) => (
        <div key={e.courseId} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,rgba(26,107,60,0.3),rgba(201,168,76,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>📚</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</div>
            <div style={{ fontSize: '0.78rem', color: '#9a9a9a', marginBottom: 8 }}>{e.watched}/{e.totalLessons} lessons · enrolled {new Date(e.enrolledAt).toLocaleDateString('en-GB')}</div>
            <div className="progress-bar-wrap" style={{ height: 7 }}><div className="progress-bar-fill" style={{ width: `${e.pct}%` }} /></div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: e.pct === 100 ? 'var(--up)' : '#c9a84c' }}>{e.pct}%</div>
            <div style={{ fontSize: '0.72rem', color: '#9a9a9a' }}>{e.pct === 100 ? '✅ Done' : 'In progress'}</div>
          </div>
          <Link to={`/courses/${e.courseId}`} className="btn btn-outline btn-sm">Continue →</Link>
        </div>
      ))}
    </div>
  );
}

/* ---- Quiz scores ---- */
function QuizzesTab({ quizResults }: { quizResults: any[] }) {
  if (!quizResults.length) return <Empty icon="📝" text="No quiz attempts yet." action={<Link to="/courses" className="btn btn-gold btn-sm">Start Learning</Link>} />;
  const avg = Math.round(quizResults.reduce((s: number, q: any) => s + q.score, 0) / quizResults.length);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <InfoCard icon="📊" title="Average Score" value={`${avg}%`} sub={`${quizResults.length} attempts`} tint="#c9a84c" />
        <InfoCard icon="🏆" title="Best Score" value={`${Math.max(...quizResults.map((q: any) => q.score))}%`} sub="highest attempt" tint="#0ecb81" />
        <InfoCard icon="📝" title="Total Quizzes" value={quizResults.length} sub="completed" tint="#4aa3d4" />
      </div>
      <div className="card card-premium">
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>All Quiz Attempts</h3>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Quiz</th><th>Score</th><th>Grade</th><th>Date</th></tr></thead>
            <tbody>
              {quizResults.map((q: any) => {
                const grade = q.score >= 80 ? 'Excellent' : q.score >= 60 ? 'Pass' : 'Retry';
                const col = q.score >= 80 ? 'var(--up)' : q.score >= 60 ? '#c9a84c' : 'var(--down)';
                return (
                  <tr key={q.id}>
                    <td>Quiz #{q.quizId}</td>
                    <td className="mono" style={{ color: col, fontWeight: 700 }}>{q.score}%</td>
                    <td><span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 20, color: col, background: `${col}18`, border: `1px solid ${col}33` }}>{grade}</span></td>
                    <td style={{ color: '#9a9a9a', fontSize: '0.82rem' }}>{new Date(q.createdAt).toLocaleDateString('en-GB')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---- Certificates ---- */
function CertsTab({ certificates }: { certificates: any[] }) {
  if (!certificates.length) return <Empty icon="🎓" text="No certificates yet. Complete a course to earn one." action={<Link to="/courses" className="btn btn-gold btn-sm">Browse Courses</Link>} />;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
      {certificates.map((c: any) => (
        <div key={c.id} className="card card-premium" style={{ background: 'linear-gradient(135deg,rgba(201,168,76,0.1),rgba(26,107,60,0.08))' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎓</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{c.courseName || 'Course Certificate'}</div>
          <div className="mono" style={{ fontSize: '0.74rem', color: '#c9a84c', marginBottom: 10 }}>{c.certCode}</div>
          <div style={{ fontSize: '0.76rem', color: '#9a9a9a', marginBottom: 14 }}>Issued {new Date(c.createdAt).toLocaleDateString('en-GB')}</div>
          <a href={`/certs/${c.filename}`} target="_blank" rel="noreferrer" className="btn btn-gold btn-sm" style={{ width: '100%', textAlign: 'center' }}>Download PDF</a>
        </div>
      ))}
    </div>
  );
}

/* ---- Payments ---- */
function PaymentsTab({ payments }: { payments: any[] }) {
  if (!payments.length) return <Empty icon="💳" text="No payment history yet." />;
  const purposeLabel: Record<string, string> = { premium: 'Premium Membership', vvip: 'VVIP Membership', signal_sub: 'Signal Subscription', course: 'Course Enrollment' };
  return (
    <div className="card card-premium">
      <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Payment History</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {payments.map((p: any) => (
              <tr key={p.id}>
                <td style={{ color: '#9a9a9a', fontSize: '0.82rem' }}>{new Date(p.createdAt).toLocaleDateString('en-GB')}</td>
                <td>{purposeLabel[p.purpose] || p.purpose}</td>
                <td className="mono" style={{ color: 'var(--up)', fontWeight: 700 }}>${p.amount.toFixed(2)}</td>
                <td><span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, color: 'var(--up)', background: 'rgba(14,203,129,0.1)', border: '1px solid rgba(14,203,129,0.25)' }}>{p.status || 'completed'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---- Settings ---- */
function SettingsTab({ form, setForm, onSave, pwForm, setPwForm, onPw, saving, msg }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="settings-grid">
      <div className="card card-premium">
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Profile Information</h3>
        <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Full Name
            <input className="form-input" style={{ marginTop: 6, width: '100%' }} value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Phone Number
            <input className="form-input" style={{ marginTop: 6, width: '100%' }} value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} placeholder="Optional" />
          </label>
          {msg && <div style={{ fontSize: '0.82rem', color: msg.ok ? 'var(--up)' : 'var(--down)', padding: '8px 12px', borderRadius: 8, background: msg.ok ? 'rgba(14,203,129,0.08)' : 'rgba(246,70,93,0.08)' }}>{msg.text}</div>}
          <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
        </form>
      </div>

      <div className="card card-premium">
        <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20 }}>Change Password</h3>
        <form onSubmit={onPw} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Current Password
            <input type="password" className="form-input" style={{ marginTop: 6, width: '100%' }} value={pwForm.current} onChange={e => setPwForm((f: any) => ({ ...f, current: e.target.value }))} required />
          </label>
          <label style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>New Password
            <input type="password" className="form-input" style={{ marginTop: 6, width: '100%' }} value={pwForm.next} onChange={e => setPwForm((f: any) => ({ ...f, next: e.target.value }))} required />
          </label>
          <label style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Confirm New Password
            <input type="password" className="form-input" style={{ marginTop: 6, width: '100%' }} value={pwForm.confirm} onChange={e => setPwForm((f: any) => ({ ...f, confirm: e.target.value }))} required />
          </label>
          <button type="submit" className="btn btn-outline" disabled={saving}>{saving ? 'Saving…' : 'Change Password'}</button>
        </form>
      </div>

      <style>{`@media(max-width:700px){.settings-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

/* ---- Membership feature cards ---- */
function MembershipCard({ tier, active }: { tier: 'free' | 'premium'; active: boolean }) {
  const isPrem = tier === 'premium';
  const features = isPrem
    ? ['Official AFRIFX Student ID Card', 'Unique Certificate Number', 'Personal Student Dashboard', 'Progress Tracking', 'Course Completion Certificate', 'Lifetime access to courses']
    : ['Free account registration', 'Selected educational articles', 'Community announcements', 'Newsletters & trading tips'];
  return (
    <div className="card" style={{ border: active && isPrem ? '1px solid rgba(201,168,76,0.4)' : '1px solid rgba(255,255,255,0.08)', opacity: !active && isPrem ? 0.7 : 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{isPrem ? '⭐ Premium' : '🔓 Free'}</div>
          <div style={{ fontSize: '0.74rem', color: '#9a9a9a' }}>{isPrem ? 'Enrolled students' : 'All registered users'}</div>
        </div>
        {active && <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: isPrem ? '#c9a84c' : 'var(--up)', background: isPrem ? 'rgba(201,168,76,0.12)' : 'rgba(14,203,129,0.12)', border: isPrem ? '1px solid rgba(201,168,76,0.3)' : '1px solid rgba(14,203,129,0.3)' }}>ACTIVE</span>}
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '0.82rem', color: '#c8c8c8' }}>
            <span style={{ color: isPrem ? '#c9a84c' : 'var(--up)', flexShrink: 0 }}>✓</span>{f}
          </li>
        ))}
      </ul>
      {isPrem && !active && (
        <Link to="/courses" className="btn btn-gold btn-sm" style={{ marginTop: 14, width: '100%', textAlign: 'center' }}>Enroll in a Course →</Link>
      )}
    </div>
  );
}

/* ---- Helpers ---- */
function StatPill({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.8rem' }}>{icon}</div>
      <div style={{ fontWeight: 800, fontSize: '1.2rem', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '0.68rem', color: '#9a9a9a' }}>{label}</div>
    </div>
  );
}

function InfoCard({ icon, title, value, sub, tint }: { icon: string; title: string; value: number | string; sub: string; tint: string }) {
  return (
    <div className="card card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -16, top: -16, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle,${tint}22,transparent 70%)` }} />
      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${tint}1a`, border: `1px solid ${tint}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.76rem', color: tint, fontWeight: 600, marginTop: 4 }}>{title}</div>
      <div style={{ fontSize: '0.72rem', color: '#9a9a9a', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function Empty({ icon, text, action }: { icon: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: '3rem', marginBottom: 12 }}>{icon}</div>
      <p style={{ color: '#9a9a9a', marginBottom: action ? 16 : 0 }}>{text}</p>
      {action}
    </div>
  );
}
