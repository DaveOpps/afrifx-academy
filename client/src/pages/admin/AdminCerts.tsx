import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminCerts() {
  const [certs, setCerts] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ userId: '', courseId: '' });
  const [issuing, setIssuing] = useState(false);

  const load = () => Promise.all([api.adminCerts(), api.adminStudents(), api.getCourses()])
    .then(([c, s, co]) => { setCerts(c); setStudents(s); setCourses(co); })
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  async function issue() {
    if (!form.userId || !form.courseId) return alert('Select student and course');
    setIssuing(true);
    try { await api.issueCert(form); load(); setForm({ userId: '', courseId: '' }); }
    catch (e: any) { alert(e.message); }
    finally { setIssuing(false); }
  }

  return (
    <DashboardLayout title="Certificate Management" subtitle="Issue and track all certificates.">
        {/* Manual issue */}
        <div className="card card-premium" style={{ marginBottom: 28 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>Issue Certificate Manually</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div className="form-group">
              <label>Student</label>
              <select value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}>
                <option value="">Select student...</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Course</label>
              <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}>
                <option value="">Select course...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <button className="btn btn-gold" onClick={issue} disabled={issuing}>
              {issuing ? 'Issuing...' : '🎓 Issue'}
            </button>
          </div>
        </div>

        {loading ? <div className="loading-center"><span className="spinner"></span></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Course</th><th>Issued</th><th>PDF</th></tr></thead>
              <tbody>
                {certs.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.user.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#9a9a9a' }}>{c.user.email}</div>
                    </td>
                    <td style={{ fontSize: '0.88rem' }}>{c.course.title}</td>
                    <td style={{ color: '#9a9a9a', fontSize: '0.82rem' }}>{new Date(c.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>{c.fileUrl ? <a href={c.fileUrl} download className="btn btn-outline btn-sm">⬇ PDF</a> : <span style={{ color: '#666' }}>—</span>}</td>
                  </tr>
                ))}
                {certs.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9a9a9a', padding: 32 }}>No certificates issued yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
    </DashboardLayout>
  );
}
