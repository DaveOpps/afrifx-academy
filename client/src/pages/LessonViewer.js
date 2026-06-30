import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navbar from '../components/Navbar';
function ytEmbed(url) {
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|watch\?v=))([^&\s]+)/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}
export default function LessonViewer() {
    const { courseId, lessonId } = useParams();
    const nav = useNavigate();
    const [lesson, setLesson] = useState(null);
    const [watched, setWatched] = useState([]);
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [resources, setResources] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submitText, setSubmitText] = useState({});
    const [submitting, setSubmitting] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setLoading(true);
        setQuiz(null);
        setResult(null);
        setAnswers({});
        Promise.all([api.getLesson(Number(lessonId)), api.myProgress(Number(courseId)), api.lessonResources(Number(lessonId))])
            .then(([l, w, r]) => {
            setLesson(l);
            setWatched(w);
            setResources(r);
            api.moduleAssignments(l.module.id).then(setAssignments).catch(() => { });
            setLoading(false);
        });
    }, [lessonId, courseId]);
    async function markWatched() {
        if (watched.includes(Number(lessonId)))
            return;
        await api.markWatched(Number(lessonId));
        setWatched(w => [...w, Number(lessonId)]);
    }
    async function loadQuiz(qId) {
        const q = await api.getQuiz(qId);
        setQuiz(q);
        setResult(null);
        setAnswers({});
    }
    async function submitQuiz() {
        const ans = Object.values(answers);
        const r = await api.submitQuiz(quiz.id, ans);
        setResult(r);
    }
    if (loading)
        return _jsxs("div", { style: { minHeight: '100vh', background: '#0d0d0d' }, children: [_jsx(Navbar, {}), _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) })] });
    if (!lesson)
        return null;
    const mod = lesson.module;
    const allLessons = mod.lessons;
    const currentIdx = allLessons.findIndex((l) => l.id === Number(lessonId));
    const prevLesson = allLessons[currentIdx - 1];
    const nextLesson = allLessons[currentIdx + 1];
    return (_jsxs("div", { style: { minHeight: '100vh', background: '#0d0d0d' }, children: [_jsx(Navbar, {}), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 'calc(100vh - 64px)', maxWidth: 1200, margin: '0 auto' }, children: [_jsxs("div", { style: { padding: '24px', borderRight: '1px solid rgba(255,255,255,0.07)' }, children: [_jsx("div", { style: { position: 'relative', paddingBottom: '56.25%', background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }, children: _jsx("iframe", { src: ytEmbed(lesson.videoUrl), style: { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }, allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, onLoad: markWatched }) }), _jsxs("div", { style: { marginBottom: 20 }, children: [_jsx("p", { style: { fontSize: '0.78rem', color: '#9a9a9a', marginBottom: 6 }, children: mod.title }), _jsx("h1", { style: { fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }, children: lesson.title }), _jsxs("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap' }, children: [lesson.duration && _jsxs("span", { className: "badge badge-gray", children: ["\u23F1 ", lesson.duration] }), watched.includes(Number(lessonId)) && _jsx("span", { className: "badge badge-green", children: "\u2713 Watched" })] })] }), lesson.description && (_jsx("div", { className: "card", style: { marginBottom: 16 }, children: _jsx("p", { style: { fontSize: '0.88rem', color: '#b0b0b0', lineHeight: 1.7 }, children: lesson.description }) })), resources.length > 0 && (_jsxs("div", { className: "card", style: { marginBottom: 16 }, children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '0.92rem', marginBottom: 12 }, children: "\uD83D\uDCCE Lesson Resources" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: resources.map((r) => (_jsxs("a", { href: r.fileUrl, target: "_blank", rel: "noopener", download: r.type !== 'link', style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, fontSize: '0.86rem', color: '#c9a84c' }, children: [_jsx("span", { children: r.type === 'link' ? '🔗' : r.type === 'pdf' ? '📄' : '📁' }), _jsx("span", { style: { flex: 1 }, children: r.title }), _jsxs("span", { style: { fontSize: '0.74rem', color: '#9a9a9a' }, children: [r.type === 'link' ? 'Open' : 'Download', " \u2192"] })] }, r.id))) })] })), _jsxs("div", { style: { display: 'flex', gap: 10, marginBottom: 24 }, children: [prevLesson && _jsx("button", { className: "btn btn-outline btn-sm", onClick: () => nav(`/learn/${courseId}/${prevLesson.id}`), children: "\u2190 Previous" }), nextLesson && _jsx("button", { className: "btn btn-primary btn-sm", onClick: () => nav(`/learn/${courseId}/${nextLesson.id}`), children: "Next Lesson \u2192" })] }), assignments.length > 0 && !nextLesson && (_jsxs("div", { style: { marginTop: 16 }, children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 14 }, children: "\uD83D\uDCCB Practice Assignments" }), assignments.map((a) => {
                                        const sub = a.submissions?.[0];
                                        return (_jsxs("div", { className: "card card-premium", style: { marginBottom: 14 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, marginBottom: 4 }, children: a.title }), _jsx("div", { style: { fontSize: '0.85rem', color: '#b0b0b0', lineHeight: 1.6 }, children: a.description }), a.dueDate && _jsxs("div", { style: { fontSize: '0.76rem', color: '#c9a84c', marginTop: 6 }, children: ["Due: ", new Date(a.dueDate).toLocaleDateString('en-GB')] })] }), sub && _jsx("span", { style: { fontSize: '0.7rem', padding: '3px 10px', borderRadius: 20, background: sub.grade != null ? 'rgba(14,203,129,0.12)' : 'rgba(201,168,76,0.12)', color: sub.grade != null ? 'var(--up)' : '#c9a84c', border: sub.grade != null ? '1px solid rgba(14,203,129,0.3)' : '1px solid rgba(201,168,76,0.3)', whiteSpace: 'nowrap' }, children: sub.grade != null ? `✅ Graded ${sub.grade}/100` : '⏳ Submitted' })] }), sub?.feedback && _jsxs("div", { style: { fontSize: '0.82rem', color: '#b0b0b0', background: 'rgba(255,255,255,0.04)', padding: '10px 12px', borderRadius: 8, marginBottom: 10 }, children: ["\uD83D\uDCAC Instructor: ", sub.feedback] }), !sub ? (_jsxs("div", { children: [_jsx("textarea", { value: submitText[a.id] || '', onChange: e => setSubmitText(t => ({ ...t, [a.id]: e.target.value })), placeholder: "Write your answer or paste a link to your work\u2026", style: { width: '100%', minHeight: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 12, color: '#fff', fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' } }), _jsx("button", { className: "btn btn-gold btn-sm", style: { marginTop: 10 }, disabled: submitting === a.id || !submitText[a.id]?.trim(), onClick: async () => { setSubmitting(a.id); await api.submitAssignment(a.id, submitText[a.id]); const updated = await api.moduleAssignments(lesson.module.id); setAssignments(updated); setSubmitting(null); }, children: submitting === a.id ? 'Submitting…' : 'Submit Assignment' })] })) : (_jsxs("details", { style: { marginTop: 6 }, children: [_jsx("summary", { style: { fontSize: '0.8rem', color: '#9a9a9a', cursor: 'pointer' }, children: "View your submission" }), _jsx("div", { style: { fontSize: '0.85rem', color: '#b0b0b0', marginTop: 8, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8 }, children: sub.content })] }))] }, a.id));
                                    })] })), mod.quizzes?.length > 0 && !nextLesson && (_jsxs("div", { className: "card", style: { marginTop: 16 }, children: [_jsx("h3", { style: { marginBottom: 12, fontWeight: 700 }, children: "\uD83D\uDCDD Module Quiz" }), !quiz ? (_jsx("button", { className: "btn btn-gold", onClick: () => loadQuiz(mod.quizzes[0].id), children: "Take Quiz" })) : result ? (_jsxs("div", { children: [_jsxs("div", { className: `alert ${result.score >= 60 ? 'alert-success' : 'alert-error'}`, children: ["You scored ", _jsxs("strong", { children: [result.score, "%"] }), " (", result.correct, "/", result.total, " correct)", result.score >= 60 ? ' — Great job! 🎉' : ' — Keep practicing!'] }), _jsx(Link, { to: `/courses/${courseId}`, className: "btn btn-outline btn-sm", children: "Back to Course" })] })) : (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 20 }, children: [quiz.questions.map((q, qi) => (_jsxs("div", { children: [_jsxs("p", { style: { fontWeight: 600, marginBottom: 10 }, children: [qi + 1, ". ", q.question] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: q.options.map((opt, oi) => (_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', borderRadius: 8, background: answers[qi] === oi ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${answers[qi] === oi ? 'rgba(201,168,76,0.4)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.9rem' }, children: [_jsx("input", { type: "radio", name: `q${qi}`, checked: answers[qi] === oi, onChange: () => setAnswers({ ...answers, [qi]: oi }), style: { accentColor: '#c9a84c' } }), opt] }, oi))) })] }, qi))), _jsx("button", { className: "btn btn-gold", onClick: submitQuiz, disabled: Object.keys(answers).length < quiz.questions.length, children: "Submit Quiz" })] }))] }))] }), _jsxs("div", { style: { padding: '24px 16px', overflowY: 'auto' }, children: [_jsx("h3", { style: { fontSize: '0.9rem', fontWeight: 700, marginBottom: 14, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: 1 }, children: mod.title }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 4 }, children: allLessons.map((l) => {
                                    const isActive = l.id === Number(lessonId);
                                    const isDone = watched.includes(l.id);
                                    return (_jsxs(Link, { to: `/learn/${courseId}/${l.id}`, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, background: isActive ? 'rgba(26,107,60,0.2)' : 'transparent', border: isActive ? '1px solid rgba(26,107,60,0.4)' : '1px solid transparent', color: isActive ? '#fff' : '#9a9a9a', fontSize: '0.86rem', transition: 'all 0.2s' }, children: [_jsx("span", { style: { fontSize: '1rem' }, children: isDone ? '✅' : '🎥' }), _jsx("span", { style: { flex: 1 }, children: l.title }), l.duration && _jsx("span", { style: { fontSize: '0.72rem', color: '#666' }, children: l.duration })] }, l.id));
                                }) }), _jsxs("div", { style: { marginTop: 20, padding: '14px', background: 'rgba(201,168,76,0.08)', borderRadius: 10, border: '1px solid rgba(201,168,76,0.2)' }, children: [_jsx("p", { style: { fontSize: '0.8rem', color: '#c9a84c', fontWeight: 600, marginBottom: 4 }, children: "Progress" }), _jsx("div", { className: "progress-bar-wrap", style: { marginBottom: 6 }, children: _jsx("div", { className: "progress-bar-fill", style: { width: `${Math.round(watched.length / allLessons.length * 100)}%` } }) }), _jsxs("p", { style: { fontSize: '0.78rem', color: '#9a9a9a' }, children: [watched.length, "/", allLessons.length, " lessons watched"] })] })] })] })] }));
}
