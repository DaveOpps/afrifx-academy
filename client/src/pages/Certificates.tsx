import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

export default function Certificates() {
  const { user } = useAuth();
  const [certs, setCerts] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([api.myCerts(), api.myEnrollments()])
      .then(([c, e]) => { setCerts(c); setEnrollments(e); })
      .finally(() => setLoading(false));
  }, []);

  async function claim(courseId: number) {
    setClaiming(courseId);
    try {
      const c = await api.claimCert(courseId);
      setCerts(prev => [...prev.filter(x => x.courseId !== courseId), c]);
    } catch (e: any) { alert(e.message); }
    finally { setClaiming(null); }
  }

  const completed = enrollments.filter(e => e.completedAt);
  const certCourseIds = certs.map(c => c.courseId);

  return (
    <DashboardLayout title="My Certificates" subtitle="Download your certificates for completed courses.">
        {loading ? (
          <div className="loading-center"><span className="spinner"></span></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Claimable */}
            {completed.filter(e => !certCourseIds.includes(e.courseId)).map(e => (
              <div key={e.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', background: 'rgba(26,107,60,0.08)', border: '1px solid rgba(26,107,60,0.3)' }}>
                <div>
                  <span className="badge badge-green" style={{ marginBottom: 8 }}>✅ Course Completed</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{e.course.title}</h3>
                  <p style={{ fontSize: '0.82rem', color: '#9a9a9a', marginTop: 4 }}>Certificate ready to claim!</p>
                </div>
                <button className="btn btn-gold" onClick={() => claim(e.courseId)} disabled={claiming === e.courseId}>
                  {claiming === e.courseId ? <><span className="spinner"></span> Generating...</> : '🎓 Claim Certificate'}
                </button>
              </div>
            ))}

            {/* Earned certs */}
            {certs.length === 0 && completed.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎓</p>
                <h3 style={{ marginBottom: 8 }}>No certificates yet</h3>
                <p style={{ color: '#9a9a9a' }}>Complete a course to earn your certificate</p>
              </div>
            )}

            {certs.map(cert => (
              <div key={cert.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 12, background: 'linear-gradient(135deg,#c9a84c,#a07828)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>🎓</div>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{cert.course.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Issued {new Date(cert.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p style={{ fontSize: '0.78rem', color: '#666', marginTop: 2 }}>Recipient: {user?.name}</p>
                  </div>
                </div>
                {cert.fileUrl && (
                  <a href={cert.fileUrl} download className="btn btn-gold btn-sm">⬇ Download PDF</a>
                )}
              </div>
            ))}
          </div>
        )}
    </DashboardLayout>
  );
}
