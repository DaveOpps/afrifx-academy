import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { api.adminStudents().then(setStudents).finally(() => setLoading(false)); }, []);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title={`Students (${students.length})`}
      subtitle="Manage all enrolled students."
      actions={<input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#fff', fontSize: '0.84rem', outline: 'none', width: 200 }} />}
    >
        {loading ? <div className="loading-center"><span className="spinner"></span></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Student</th><th>Phone</th><th>Enrollments</th><th>Certs</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>{s.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</div>
                          <div style={{ color: '#9a9a9a', fontSize: '0.78rem' }}>{s.email}</div>
                          {s.studentId && <div style={{ color: '#c9a84c', fontSize: '0.72rem', fontFamily: 'monospace' }}>{s.studentId}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#9a9a9a', fontSize: '0.84rem' }}>{s.phone || '—'}</td>
                    <td><span className="badge badge-gold">{s.enrollments.length}</span></td>
                    <td><span className="badge badge-green">{s.certificates.length}</span></td>
                    <td style={{ color: '#9a9a9a', fontSize: '0.82rem' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td><Link to={`/admin/students/${s.id}`} className="btn btn-outline btn-sm">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </DashboardLayout>
  );
}
