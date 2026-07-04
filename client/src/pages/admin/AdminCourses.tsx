import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'course'|'module'|'lesson'|'resource'|'quiz'|null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [resFile, setResFile] = useState<File | null>(null);

  const load = () => api.getCourses().then(setCourses).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function saveCourse() {
    setSaving(true);
    try {
      if (selected) await api.updateCourse(selected.id, form);
      else await api.createCourse(form);
      setModal(null); setForm({}); setSelected(null); load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function deleteCourse(id: number) {
    if (!confirm('Delete this course and all its content?')) return;
    await api.deleteCourse(id); load();
  }

  async function saveModule() {
    setSaving(true);
    try { await api.addModule(form.courseId, { title: form.title, order: Number(form.order) || 0 }); setModal(null); setForm({}); load(); }
    catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function saveLesson() {
    setSaving(true);
    try { await api.addLesson({ moduleId: Number(form.moduleId), title: form.title, videoUrl: form.videoUrl, duration: form.duration, description: form.description, order: Number(form.order) || 0 }); setModal(null); setForm({}); load(); }
    catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function saveResource() {
    setSaving(true);
    try {
      if (resFile) {
        const fd = new FormData();
        fd.append('file', resFile);
        fd.append('lessonId', String(form.lessonId));
        fd.append('title', form.title || resFile.name);
        await api.uploadResource(fd);
      } else if (form.fileUrl) {
        await api.addResourceLink({ lessonId: Number(form.lessonId), title: form.title, fileUrl: form.fileUrl });
      } else {
        alert('Upload a file or provide a link'); setSaving(false); return;
      }
      setModal(null); setForm({}); setResFile(null); load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  function openNewQuiz(moduleId: number) {
    setSelected(null);
    setForm({ moduleId, quizId: null, questions: [{ question: '', options: ['', ''], answer: 0 }] });
    setModal('quiz');
  }
  function openEditQuiz(moduleId: number, quiz: any) {
    setSelected(quiz);
    setForm({ moduleId, quizId: quiz.id, questions: JSON.parse(quiz.questions) });
    setModal('quiz');
  }
  function updateQuestions(next: any[]) { setForm({ ...form, questions: next }); }
  function addQuestion() { updateQuestions([...form.questions, { question: '', options: ['', ''], answer: 0 }]); }
  function removeQuestion(qi: number) { updateQuestions(form.questions.filter((_: any, i: number) => i !== qi)); }
  function setQuestionText(qi: number, text: string) {
    updateQuestions(form.questions.map((q: any, i: number) => i === qi ? { ...q, question: text } : q));
  }
  function setOptionText(qi: number, oi: number, text: string) {
    updateQuestions(form.questions.map((q: any, i: number) => i === qi ? { ...q, options: q.options.map((o: string, j: number) => j === oi ? text : o) } : q));
  }
  function addOption(qi: number) {
    updateQuestions(form.questions.map((q: any, i: number) => i === qi && q.options.length < 4 ? { ...q, options: [...q.options, ''] } : q));
  }
  function removeOption(qi: number, oi: number) {
    updateQuestions(form.questions.map((q: any, i: number) => {
      if (i !== qi || q.options.length <= 2) return q;
      const options = q.options.filter((_: string, j: number) => j !== oi);
      const answer = q.answer === oi ? 0 : q.answer > oi ? q.answer - 1 : q.answer;
      return { ...q, options, answer };
    }));
  }
  function setCorrectAnswer(qi: number, oi: number) {
    updateQuestions(form.questions.map((q: any, i: number) => i === qi ? { ...q, answer: oi } : q));
  }

  async function saveQuiz() {
    setSaving(true);
    try {
      if (form.quizId) await api.updateQuiz(form.quizId, form.questions);
      else await api.createQuiz({ moduleId: form.moduleId, questions: form.questions });
      setModal(null); setForm({}); setSelected(null); load();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  async function deleteQuiz(quizId: number) {
    if (!confirm('Delete this quiz? Students\' past results for it will also be removed.')) return;
    await api.deleteQuiz(quizId); load();
  }

  return (
    <DashboardLayout
      title="Course Management"
      subtitle="Create and manage courses, modules and lessons."
      actions={<button className="btn btn-gold btn-sm" onClick={() => { setSelected(null); setForm({}); setModal('course'); }}>+ New Course</button>}
    >
        {loading ? <div className="loading-center"><span className="spinner"></span></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {courses.map(c => (
              <div key={c.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{c.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>{c.modules.length} modules · {c.modules.reduce((a: number, m: any) => a + m.lessons.length, 0)} lessons · {c._count.enrollments} enrolled</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => { setSelected(c); setForm({ title: c.title, description: c.description, thumbnail: c.thumbnail, category: c.category }); setModal('course'); }}>Edit</button>
                    <button className="btn btn-sm" style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ef5350' }} onClick={() => deleteCourse(c.id)}>Delete</button>
                    <button className="btn btn-primary btn-sm" onClick={() => { setForm({ courseId: c.id }); setModal('module'); }}>+ Module</button>
                  </div>
                </div>
                {c.modules.map((mod: any) => (
                  <div key={mod.id} style={{ marginLeft: 16, marginBottom: 10, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>📦 {mod.title}</span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {mod.quizzes?.length > 0 ? (
                          <>
                            <button className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => openEditQuiz(mod.id, mod.quizzes[0])}>📝 Edit Quiz</button>
                            <button className="btn btn-sm" style={{ padding: '4px 10px', fontSize: '0.72rem', background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ef5350' }} onClick={() => deleteQuiz(mod.quizzes[0].id)}>Delete Quiz</button>
                          </>
                        ) : (
                          <button className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => openNewQuiz(mod.id)}>📝 + Quiz</button>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ moduleId: mod.id }); setModal('lesson'); }}>+ Lesson</button>
                      </div>
                    </div>
                    {mod.lessons.map((l: any) => (
                      <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', fontSize: '0.84rem', color: '#9a9a9a' }}>
                        <span>🎥</span><span style={{ flex: 1 }}>{l.title}</span>{l.duration && <span>{l.duration}</span>}
                        <button className="btn btn-outline btn-sm" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => { setForm({ lessonId: l.id }); setResFile(null); setModal('resource'); }}>📎 Resource</button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: modal === 'quiz' ? 640 : 480, padding: 28, maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>{modal === 'course' ? (selected ? 'Edit Course' : 'New Course') : modal === 'module' ? 'Add Module' : modal === 'lesson' ? 'Add Lesson' : modal === 'quiz' ? (form.quizId ? 'Edit Quiz' : 'New Quiz') : 'Add Resource'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {modal === 'course' && <>
                <div className="form-group"><label>Title</label><input value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Course title" /></div>
                <div className="form-group"><label>Description</label><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} rows={3} placeholder="Course description" style={{ resize: 'vertical' }} /></div>
                <div className="form-group"><label>Category</label>
                  <select value={form.category||'Beginner'} onChange={e=>setForm({...form,category:e.target.value})}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Crypto</option>
                  </select>
                </div>
                <div className="form-group"><label>Thumbnail URL (optional)</label><input value={form.thumbnail||''} onChange={e=>setForm({...form,thumbnail:e.target.value})} placeholder="https://..." /></div>
              </>}
              {modal === 'module' && <>
                <div className="form-group"><label>Module Title</label><input value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Module 1: Fundamentals" /></div>
                <div className="form-group"><label>Order</label><input type="number" value={form.order||''} onChange={e=>setForm({...form,order:e.target.value})} placeholder="1" /></div>
              </>}
              {modal === 'lesson' && <>
                <div className="form-group"><label>Lesson Title</label><input value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} placeholder="What is Forex?" /></div>
                <div className="form-group"><label>YouTube URL</label><input value={form.videoUrl||''} onChange={e=>setForm({...form,videoUrl:e.target.value})} placeholder="https://youtube.com/watch?v=..." /></div>
                <div className="form-group"><label>Duration</label><input value={form.duration||''} onChange={e=>setForm({...form,duration:e.target.value})} placeholder="12:34" /></div>
                <div className="form-group"><label>Description (optional)</label><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} rows={2} placeholder="Short lesson summary" style={{ resize: 'vertical' }} /></div>
                <div className="form-group"><label>Order</label><input type="number" value={form.order||''} onChange={e=>setForm({...form,order:e.target.value})} placeholder="1" /></div>
              </>}
              {modal === 'quiz' && <>
                <p style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Multiple choice. Add 2-4 options per question and mark the correct one.</p>
                {form.questions?.map((q: any, qi: number) => (
                  <div key={qi} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c9a84c' }}>Question {qi + 1}</span>
                      {form.questions.length > 1 && <button className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => removeQuestion(qi)}>Remove</button>}
                    </div>
                    <input value={q.question} onChange={e => setQuestionText(qi, e.target.value)} placeholder="Question text" />
                    {q.options.map((opt: string, oi: number) => (
                      <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input type="radio" name={`correct-${qi}`} checked={q.answer === oi} onChange={() => setCorrectAnswer(qi, oi)} style={{ accentColor: '#c9a84c', flexShrink: 0 }} title="Mark as correct answer" />
                        <input value={opt} onChange={e => setOptionText(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} style={{ flex: 1 }} />
                        {q.options.length > 2 && <button className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => removeOption(qi, oi)}>×</button>}
                      </div>
                    ))}
                    {q.options.length < 4 && <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start', fontSize: '0.75rem' }} onClick={() => addOption(qi)}>+ Option</button>}
                  </div>
                ))}
                <button className="btn btn-primary btn-sm" onClick={addQuestion}>+ Add Question</button>
              </>}
              {modal === 'resource' && <>
                <p style={{ fontSize: '0.82rem', color: '#9a9a9a' }}>Upload a PDF/file OR paste an external link.</p>
                <div className="form-group"><label>Resource Title</label><input value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Lesson Notes (PDF)" /></div>
                <div className="form-group"><label>Upload File (PDF, max 20MB)</label><input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.zip" onChange={e=>setResFile(e.target.files?.[0] || null)} style={{ color: '#9a9a9a' }} /></div>
                <div style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem' }}>— or —</div>
                <div className="form-group"><label>External Link URL</label><input value={form.fileUrl||''} onChange={e=>setForm({...form,fileUrl:e.target.value})} placeholder="https://..." disabled={!!resFile} /></div>
              </>}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-gold" onClick={modal==='course'?saveCourse:modal==='module'?saveModule:modal==='lesson'?saveLesson:modal==='quiz'?saveQuiz:saveResource} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="btn btn-outline" onClick={() => { setModal(null); setForm({}); setSelected(null); setResFile(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
