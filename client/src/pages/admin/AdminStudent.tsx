import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminStudent() {
  const { id } = useParams();
  const [student, setStudent] = useState<any>(null);
  const [issuing, setIssuing] = useState<number | null>(null);
  const [newPw, setNewPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  useEffect(() => { api.adminStudent(Number(id)).then(setStudent); }, [id]);

  async function issue(courseId: number) {
    setIssuing(courseId);
    try { await api.issueCert({ userId: id, courseId }); alert('Certificate issued!'); }
    catch (e: any) { alert(e.message); }
    finally { setIssuing(null); }
  }

  async function resetPw() {
    if (newPw.length < 6) { setPwMsg('Password must be at least 6 characters'); return; }
    try { await api.resetStudentPassword(Number(id), newPw); setPwMsg('Password reset successfully!'); setNewPw(''); }
    catch (e: any) { setPwMsg(e.message); }
  }

  async function toggleRole() {
    const next = student.role === 'instructor' ? 'student' : 'instructor';
    if (!confirm(next === 'instructor' ? 'Promote this member to Instructor? They will be able to host meetings.' : 'Demote this instructor back to Student?')) return;
    try { await api.setStudentRole(Number(id), next); setStudent({ ...student, role: next }); }
    catch (e: any) { alert(e.message); }
  }

  if (!student) return <DashboardLayout title="Student"><div className="loading-center"><span className="spinner"></span></div></DashboardLayout>;

  return (
    <DashboardLayout title={student.name} subtitle="Student profile, progress and account actions.">
        <Link to="/admin/students" style={{ color: '#9a9a9a', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>← Back to Students</Link>

        {/* Header */}
        <div className="card card-premium" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 700, flexShrink: 0 }}>{student.name[0]}</div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4 }}>{student.name}</h1>
            <p style={{ color: '#9a9a9a', fontSize: '0.88rem' }}>{student.email} {student.phone && `· ${student.phone}`}</p>
            <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 8, padding: '5px 12px' }}>
              <span style={{ fontSize: '0.7rem', color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>Student ID</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#c9a84c' }}>{student.studentId || '—'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {student.role === 'instructor' && <span className="badge" style={{ background: 'rgba(34,158,217,0.15)', color: '#4aa3d4', border: '1px solid rgba(34,158,217,0.4)' }}>🎤 Instructor</span>}
              <span className="badge badge-gold">{student.enrollments.length} courses</span>
              <span className="badge badge-green">{student.certificates.length} certs</span>
              <span className="badge badge-gray">{student.progress.length} lessons watched</span>
              <button className="btn btn-outline btn-sm" onClick={toggleRole}>{student.role === 'instructor' ? '↓ Demote to Student' : '↑ Make Instructor'}</button>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9a9a9a' }}>Joined {new Date(student.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>

        {/* Enrollments */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Enrolled Courses</h2>
          {student.enrollments.length === 0 ? <p style={{ color: '#9a9a9a' }}>No enrollments yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {student.enrollments.map((en: any) => {
                const allLessons = en.course.modules.flatMap((m: any) => m.lessons);
                const watched = student.progress.filter((p: any) => allLessons.some((l: any) => l.id === p.lessonId)).length;
                const pct = allLessons.length ? Math.round(watched / allLessons.length * 100) : 0;
                const hasCert = student.certificates.some((c: any) => c.courseId === en.courseId);
                return (
                  <div key={en.id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{en.course.title}</h3>
                        <p style={{ fontSize: '0.78rem', color: '#9a9a9a', marginTop: 2 }}>{watched}/{allLessons.length} lessons · {pct}% complete</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {en.completedAt && <span className="badge badge-green">Completed</span>}
                        {!hasCert && en.completedAt && (
                          <button className="btn btn-gold btn-sm" onClick={() => issue(en.courseId)} disabled={issuing === en.courseId}>
                            {issuing === en.courseId ? 'Issuing...' : '🎓 Issue Cert'}
                          </button>
                        )}
                        {hasCert && <span className="badge badge-gold">🎓 Cert Issued</span>}
                      </div>
                    </div>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset password */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>🔑 Reset Student Password</h2>
          {pwMsg && <div className={`alert ${pwMsg.includes('success') ? 'alert-success' : 'alert-error'}`}>{pwMsg}</div>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="text" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min. 6 chars)"
              style={{ flex: 1, minWidth: 220, padding: '11px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
            <button className="btn btn-outline" onClick={resetPw}>Reset Password</button>
          </div>
        </div>

        {/* Quiz results */}
        {student.quizResults.length > 0 && (
          <div className="card">
            <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Quiz Results</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Module</th><th>Score</th><th>Date</th></tr></thead>
                <tbody>
                  {student.quizResults.map((r: any) => (
                    <tr key={r.id}>
                      <td>{r.quiz.module.title}</td>
                      <td><span className={`badge ${r.score >= 60 ? 'badge-green' : 'badge-gray'}`}>{r.score}%</span></td>
                      <td style={{ color: '#9a9a9a', fontSize: '0.82rem' }}>{new Date(r.takenAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </DashboardLayout>
  );
}
