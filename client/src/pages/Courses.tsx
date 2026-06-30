import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { Stars } from '../components/StarRating';

const CATEGORIES = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Crypto'];

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<number, { avg: number; count: number }>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');

  useEffect(() => {
    api.getCourses().then(async (cs) => {
      setCourses(cs);
      setLoading(false);
      // Fetch ratings for each course
      const r: Record<number, { avg: number; count: number }> = {};
      await Promise.all(cs.map(async (c: any) => {
        try { const rev = await api.courseReviews(c.id); r[c.id] = { avg: rev.avg, count: rev.count }; } catch {}
      }));
      setRatings(r);
    });
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'All' || c.category === cat;
    return matchSearch && matchCat;
  });

  return (
    <DashboardLayout title="All Courses" subtitle="Start with any course — all are free to enroll.">
        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9a9a9a' }}>🔍</span>
            <input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '11px 16px 11px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 50, color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                style={{ padding: '8px 16px', borderRadius: 50, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${cat === c ? '#c9a84c' : 'rgba(255,255,255,0.12)'}`, background: cat === c ? 'rgba(201,168,76,0.15)' : 'transparent', color: cat === c ? '#c9a84c' : '#9a9a9a', transition: 'all 0.2s' }}>{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-center"><span className="spinner"></span></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ color: '#9a9a9a' }}>{search || cat !== 'All' ? 'No courses match your filters.' : 'No courses available yet. Check back soon!'}</p>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(c => {
              const total = c.modules.reduce((a: number, m: any) => a + m.lessons.length, 0);
              const rating = ratings[c.id];
              return (
                <div key={c.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                  <div style={{ position: 'relative' }}>
                    {c.thumbnail ? (
                      <img src={c.thumbnail} alt={c.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: 180, background: 'linear-gradient(135deg,#1a6b3c,#0f4526)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📈</div>
                    )}
                    <span className="badge badge-gold" style={{ position: 'absolute', top: 12, left: 12 }}>{c.category}</span>
                  </div>
                  <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{c.title}</h3>
                    {rating && rating.count > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Stars value={rating.avg} size={14} />
                        <span style={{ fontSize: '0.78rem', color: '#9a9a9a' }}>{rating.avg} ({rating.count})</span>
                      </div>
                    )}
                    <p style={{ fontSize: '0.84rem', color: '#9a9a9a', lineHeight: 1.6, flex: 1 }}>{c.description}</p>
                    <div style={{ display: 'flex', gap: 10, fontSize: '0.78rem', color: '#9a9a9a' }}>
                      <span>📦 {c.modules.length}</span>
                      <span>🎥 {total}</span>
                      <span>👥 {c._count.enrollments}</span>
                    </div>
                    <Link to={`/courses/${c.id}`} className="btn btn-primary" style={{ marginTop: 4 }}>View Course</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </DashboardLayout>
  );
}
