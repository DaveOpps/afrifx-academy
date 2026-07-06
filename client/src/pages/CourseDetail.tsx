import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Stars, StarInput } from '../components/StarRating';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [openMod, setOpenMod] = useState<number | null>(null);
  const [reviewData, setReviewData] = useState<any>({ reviews: [], avg: 0, count: 0 });
  const [myReview, setMyReview] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  function loadReviews() {
    api.courseReviews(Number(id)).then(setReviewData);
    if (user) api.myReview(Number(id)).then(r => { if (r) { setMyReview(r); setRating(r.rating); setComment(r.comment || ''); } });
  }

  useEffect(() => {
    api.getCourse(Number(id)).then(c => { setCourse(c); setOpenMod(c.modules[0]?.id); setLoading(false); });
    if (user) api.myEnrollments().then(e => setEnrolled(e.some((en: any) => en.courseId === Number(id))));
    loadReviews();
  }, [id, user]);

  async function submitReview() {
    if (!rating) return alert('Please select a star rating');
    setSavingReview(true);
    try {
      await api.submitReview({ courseId: Number(id), rating, comment });
      loadReviews();
      alert('Thank you for your review!');
    } catch (e: any) { alert(e.message); }
    finally { setSavingReview(false); }
  }

  async function handleEnroll() {
    if (!user) return nav('/register');
    setEnrolling(true);
    try {
      await api.enroll(Number(id));
      setEnrolled(true);
      const first = course.modules[0]?.lessons[0];
      if (first) nav(`/learn/${id}/${first.id}`);
    } catch (e: any) { alert(e.message); }
    finally { setEnrolling(false); }
  }

  if (loading) return <DashboardLayout title="Course"><div className="loading-center"><span className="spinner"></span></div></DashboardLayout>;
  if (!course) return null;

  const totalLessons = course.modules.reduce((a: number, m: any) => a + m.lessons.length, 0);

  return (
    <DashboardLayout title="Course Details" subtitle="Explore the curriculum and enroll for free.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }} className="cd-grid">
          {/* Left */}
          <div>
            <span className="badge badge-green" style={{ marginBottom: 16 }}>📈 Forex Course</span>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>{course.title}</h1>
            <p style={{ color: '#9a9a9a', lineHeight: 1.8, marginBottom: 24 }}>{course.description}</p>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.84rem', color: '#9a9a9a', marginBottom: 32 }}>
              <span>📦 {course.modules.length} modules</span>
              <span>🎥 {totalLessons} lessons</span>
              <span>👥 {course._count.enrollments} enrolled</span>
              <span>🎓 Certificate on completion</span>
            </div>

            {/* Curriculum */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Course Curriculum</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {course.modules.map((mod: any) => (
                <div key={mod.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }}>
                  <button onClick={() => setOpenMod(openMod === mod.id ? null : mod.id)}
                    style={{ width: '100%', padding: '14px 18px', background: openMod === mod.id ? 'rgba(26,107,60,0.15)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}>
                    <span>{mod.title}</span>
                    <span style={{ color: '#9a9a9a', fontSize: '0.8rem' }}>{mod.lessons.length} lessons {openMod === mod.id ? '▲' : '▼'}</span>
                  </button>
                  {openMod === mod.id && (
                    <div>
                      {mod.lessons.map((l: any) => (
                        <div key={l.id} style={{ padding: '10px 18px 10px 30px', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem', color: '#9a9a9a' }}>
                          <span>🎥</span>
                          <span style={{ flex: 1 }}>{l.title}</span>
                          {l.duration && <span style={{ fontSize: '0.78rem' }}>{l.duration}</span>}
                          {enrolled && <Link to={`/learn/${course.id}/${l.id}`} style={{ color: '#c9a84c', fontSize: '0.78rem' }}>Watch →</Link>}
                        </div>
                      ))}
                      {mod.quizzes?.length > 0 && (
                        <div style={{ padding: '10px 18px 10px 30px', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem', color: '#c9a84c' }}>
                          <span style={{ flex: 1 }}>📝 Module Quiz</span>
                          {enrolled && mod.lessons.length > 0 && (
                            <Link to={`/learn/${course.id}/${mod.lessons[mod.lessons.length - 1].id}?quiz=1`} style={{ color: '#c9a84c', fontSize: '0.78rem', fontWeight: 700 }}>Take Quiz →</Link>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Enroll card */}
          <div className="card card-premium" style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {course.thumbnail && <img src={course.thumbnail} alt="" style={{ width: '100%', borderRadius: 8, objectFit: 'cover', height: 180 }} />}
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c9a84c' }}>FREE</div>
            <button onClick={handleEnroll} className="btn btn-gold" disabled={enrolling} style={{ width: '100%' }}>
              {enrolled ? 'Continue Learning →' : enrolling ? 'Enrolling...' : 'Enroll Now — Free →'}
            </button>
            <div style={{ fontSize: '0.82rem', color: '#9a9a9a', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['🎥 HD Video Lessons','📝 Module Quizzes','🎓 Completion Certificate','⏰ Learn at your own pace','📱 Mobile friendly'].map(f => <span key={f}>{f}</span>)}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ marginTop: 48, maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Student Reviews</h2>
            {reviewData.count > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stars value={reviewData.avg} size={18} />
                <span style={{ color: '#c9a84c', fontWeight: 700 }}>{reviewData.avg}</span>
                <span style={{ color: '#9a9a9a', fontSize: '0.85rem' }}>({reviewData.count} reviews)</span>
              </div>
            )}
          </div>

          {/* Write a review (enrolled only) */}
          {enrolled && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>{myReview ? 'Update your review' : 'Write a review'}</h3>
              <div style={{ marginBottom: 14 }}><StarInput value={rating} onChange={setRating} /></div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Share your experience with this course..."
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 12, color: '#fff', fontSize: '0.9rem', resize: 'vertical', outline: 'none', marginBottom: 14 }} />
              <button className="btn btn-gold btn-sm" onClick={submitReview} disabled={savingReview}>{savingReview ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}</button>
            </div>
          )}

          {/* Reviews list */}
          {reviewData.reviews.length === 0 ? (
            <p style={{ color: '#9a9a9a', fontSize: '0.9rem' }}>No reviews yet. {enrolled ? 'Be the first to review!' : 'Enroll to leave a review.'}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reviewData.reviews.map((r: any) => (
                <div key={r.id} className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{r.user.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.user.name}</div>
                        <Stars value={r.rating} size={13} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#777' }}>{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: '0.88rem', color: '#b0b0b0', lineHeight: 1.7 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
    </DashboardLayout>
  );
}
