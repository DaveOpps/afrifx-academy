import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';

function ytEmbed(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^&\s]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

export default function LessonViewer() {
  const { courseId, lessonId } = useParams();
  const nav = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [watched, setWatched] = useState<number[]>([]);
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number,number>>({});
  const [result, setResult] = useState<any>(null);
  const [resources, setResources] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submitText, setSubmitText] = useState<Record<number,string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); setQuiz(null); setResult(null); setAnswers({});
    Promise.all([api.getLesson(Number(lessonId)), api.myProgress(Number(courseId)), api.lessonResources(Number(lessonId))])
      .then(([l, w, r]) => {
        setLesson(l); setWatched(w); setResources(r);
        api.moduleAssignments(l.module.id).then(setAssignments).catch(() => {});
        setLoading(false);
      });
  }, [lessonId, courseId]);

  async function markWatched() {
    if (watched.includes(Number(lessonId))) return;
    await api.markWatched(Number(lessonId));
    setWatched(w => [...w, Number(lessonId)]);
  }

  async function loadQuiz(qId: number) {
    const q = await api.getQuiz(qId);
    setQuiz(q); setResult(null); setAnswers({});
  }

  async function submitQuiz() {
    const ans = Object.values(answers);
    const r = await api.submitQuiz(quiz.id, ans);
    setResult(r);
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#0d0d0d' }}><Navbar /><div className="loading-center"><span className="spinner"></span></div></div>;
  if (!lesson) return null;

  const mod = lesson.module;
  const allLessons = mod.lessons;
  const currentIdx = allLessons.findIndex((l: any) => l.id === Number(lessonId));
  const prevLesson = allLessons[currentIdx - 1];
  const nextLesson = allLessons[currentIdx + 1];

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d' }}>
      <Navbar />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 'calc(100vh - 64px)', maxWidth: 1200, margin: '0 auto' }}>
        {/* Main */}
        <div style={{ padding: '24px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Video */}
          <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
            <iframe src={ytEmbed(lesson.videoUrl)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen onLoad={markWatched} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: '0.78rem', color: '#9a9a9a', marginBottom: 6 }}>{mod.title}</p>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>{lesson.title}</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {lesson.duration && <span className="badge badge-gray">⏱ {lesson.duration}</span>}
              {watched.includes(Number(lessonId)) && <span className="badge badge-green">✓ Watched</span>}
            </div>
          </div>

          {/* Lesson description */}
          {lesson.description && (
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.88rem', color: '#b0b0b0', lineHeight: 1.7 }}>{lesson.description}</p>
            </div>
          )}

          {/* Resources */}
          {resources.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 12 }}>📎 Lesson Resources</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resources.map((r: any) => (
                  <a key={r.id} href={r.fileUrl} target="_blank" rel="noopener" download={r.type !== 'link'}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, fontSize: '0.86rem', color: '#c9a84c' }}>
                    <span>{r.type === 'link' ? '🔗' : r.type === 'pdf' ? '📄' : '📁'}</span>
                    <span style={{ flex: 1 }}>{r.title}</span>
                    <span style={{ fontSize: '0.74rem', color: '#9a9a9a' }}>{r.type === 'link' ? 'Open' : 'Download'} →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            {prevLesson && <button className="btn btn-outline btn-sm" onClick={() => nav(`/learn/${courseId}/${prevLesson.id}`)}>← Previous</button>}
            {nextLesson && <button className="btn btn-primary btn-sm" onClick={() => nav(`/learn/${courseId}/${nextLesson.id}`)}>Next Lesson →</button>}
          </div>

          {/* Practice Assignments */}
          {assignments.length > 0 && !nextLesson && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 14 }}>📋 Practice Assignments</h3>
              {assignments.map((a: any) => {
                const sub = a.submissions?.[0];
                return (
                  <div key={a.id} className="card card-premium" style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#b0b0b0', lineHeight: 1.6 }}>{a.description}</div>
                        {a.dueDate && <div style={{ fontSize: '0.76rem', color: '#c9a84c', marginTop: 6 }}>Due: {new Date(a.dueDate).toLocaleDateString('en-GB')}</div>}
                      </div>
                      {sub && <span style={{ fontSize: '0.7rem', padding: '3px 10px', borderRadius: 20, background: sub.grade != null ? 'rgba(14,203,129,0.12)' : 'rgba(201,168,76,0.12)', color: sub.grade != null ? 'var(--up)' : '#c9a84c', border: sub.grade != null ? '1px solid rgba(14,203,129,0.3)' : '1px solid rgba(201,168,76,0.3)', whiteSpace: 'nowrap' }}>
                        {sub.grade != null ? `✅ Graded ${sub.grade}/100` : '⏳ Submitted'}
                      </span>}
                    </div>
                    {sub?.feedback && <div style={{ fontSize: '0.82rem', color: '#b0b0b0', background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: 8, marginBottom: 10 }}>💬 Instructor: {sub.feedback}</div>}
                    {!sub ? (
                      <div>
                        <textarea value={submitText[a.id] || ''} onChange={e => setSubmitText(t => ({ ...t, [a.id]: e.target.value }))}
                          placeholder="Write your answer or paste a link to your work…"
                          style={{ width: '100%', minHeight: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 12, color: '#fff', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        <button className="btn btn-gold btn-sm" style={{ marginTop: 10 }} disabled={submitting === a.id || !submitText[a.id]?.trim()}
                          onClick={async () => { setSubmitting(a.id); await api.submitAssignment(a.id, submitText[a.id]); const updated = await api.moduleAssignments(lesson.module.id); setAssignments(updated); setSubmitting(null); }}>
                          {submitting === a.id ? 'Submitting…' : 'Submit Assignment'}
                        </button>
                      </div>
                    ) : (
                      <details style={{ marginTop: 6 }}>
                        <summary style={{ fontSize: '0.8rem', color: '#9a9a9a', cursor: 'pointer' }}>View your submission</summary>
                        <div style={{ fontSize: '0.85rem', color: '#b0b0b0', marginTop: 8, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>{sub.content}</div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Quiz */}
          {mod.quizzes?.length > 0 && !nextLesson && (
            <div className="card" style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 12, fontWeight: 700 }}>📝 Module Quiz</h3>
              {!quiz ? (
                <button className="btn btn-gold" onClick={() => loadQuiz(mod.quizzes[0].id)}>Take Quiz</button>
              ) : result ? (
                <div>
                  <div className={`alert ${result.score >= 60 ? 'alert-success' : 'alert-error'}`}>
                    You scored <strong>{result.score}%</strong> ({result.correct}/{result.total} correct)
                    {result.score >= 60 ? ' — Great job! 🎉' : ' — Keep practicing!'}
                  </div>
                  <Link to={`/courses/${courseId}`} className="btn btn-outline btn-sm">Back to Course</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {quiz.questions.map((q: any, qi: number) => (
                    <div key={qi}>
                      <p style={{ fontWeight: 600, marginBottom: 10 }}>{qi+1}. {q.question}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {q.options.map((opt: string, oi: number) => (
                          <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, background: answers[qi] === oi ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${answers[qi] === oi ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.9rem' }}>
                            <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers({...answers, [qi]: oi})} style={{ accentColor: '#c9a84c' }} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="btn btn-gold" onClick={submitQuiz} disabled={Object.keys(answers).length < quiz.questions.length}>Submit Quiz</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ padding: '24px 16px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }}>{mod.title}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {allLessons.map((l: any) => {
              const isActive = l.id === Number(lessonId);
              const isDone = watched.includes(l.id);
              return (
                <Link key={l.id} to={`/learn/${courseId}/${l.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: isActive ? 'rgba(26,107,60,0.2)' : 'transparent', border: isActive ? '1px solid rgba(26,107,60,0.4)' : '1px solid transparent', color: isActive ? '#fff' : '#9a9a9a', fontSize: '0.86rem', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '1rem' }}>{isDone ? '✅' : '🎥'}</span>
                  <span style={{ flex: 1 }}>{l.title}</span>
                  {l.duration && <span style={{ fontSize: '0.72rem', color: '#666' }}>{l.duration}</span>}
                </Link>
              );
            })}
          </div>
          <div style={{ marginTop: 20, padding: '14px', background: 'rgba(201,168,76,0.08)', borderRadius: 10, border: '1px solid rgba(201,168,76,0.2)' }}>
            <p style={{ fontSize: '0.8rem', color: '#c9a84c', fontWeight: 600, marginBottom: 4 }}>Progress</p>
            <div className="progress-bar-wrap" style={{ marginBottom: 6 }}>
              <div className="progress-bar-fill" style={{ width: `${Math.round(watched.length / allLessons.length * 100)}%` }}></div>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#9a9a9a' }}>{watched.length}/{allLessons.length} lessons watched</p>
          </div>
        </div>
      </div>
    </div>
  );
}
