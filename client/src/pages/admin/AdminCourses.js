import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../api';
import DashboardLayout from '../../components/DashboardLayout';
export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [selected, setSelected] = useState(null);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [resFile, setResFile] = useState(null);
    const load = () => api.getCourses().then(setCourses).finally(() => setLoading(false));
    useEffect(() => { load(); }, []);
    async function saveCourse() {
        setSaving(true);
        try {
            if (selected)
                await api.updateCourse(selected.id, form);
            else
                await api.createCourse(form);
            setModal(null);
            setForm({});
            setSelected(null);
            load();
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setSaving(false);
        }
    }
    async function deleteCourse(id) {
        if (!confirm('Delete this course and all its content?'))
            return;
        await api.deleteCourse(id);
        load();
    }
    async function saveModule() {
        setSaving(true);
        try {
            await api.addModule(form.courseId, { title: form.title, order: Number(form.order) || 0 });
            setModal(null);
            setForm({});
            load();
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setSaving(false);
        }
    }
    async function saveLesson() {
        setSaving(true);
        try {
            await api.addLesson({ moduleId: Number(form.moduleId), title: form.title, videoUrl: form.videoUrl, duration: form.duration, description: form.description, order: Number(form.order) || 0 });
            setModal(null);
            setForm({});
            load();
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setSaving(false);
        }
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
            }
            else if (form.fileUrl) {
                await api.addResourceLink({ lessonId: Number(form.lessonId), title: form.title, fileUrl: form.fileUrl });
            }
            else {
                alert('Upload a file or provide a link');
                setSaving(false);
                return;
            }
            setModal(null);
            setForm({});
            setResFile(null);
            load();
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setSaving(false);
        }
    }
    function openNewQuiz(moduleId) {
        setSelected(null);
        setForm({ moduleId, quizId: null, questions: [{ question: '', options: ['', ''], answer: 0 }] });
        setModal('quiz');
    }
    function openEditQuiz(moduleId, quiz) {
        setSelected(quiz);
        setForm({ moduleId, quizId: quiz.id, questions: JSON.parse(quiz.questions) });
        setModal('quiz');
    }
    function updateQuestions(next) { setForm({ ...form, questions: next }); }
    function addQuestion() { updateQuestions([...form.questions, { question: '', options: ['', ''], answer: 0 }]); }
    function removeQuestion(qi) { updateQuestions(form.questions.filter((_, i) => i !== qi)); }
    function setQuestionText(qi, text) {
        updateQuestions(form.questions.map((q, i) => i === qi ? { ...q, question: text } : q));
    }
    function setOptionText(qi, oi, text) {
        updateQuestions(form.questions.map((q, i) => i === qi ? { ...q, options: q.options.map((o, j) => j === oi ? text : o) } : q));
    }
    function addOption(qi) {
        updateQuestions(form.questions.map((q, i) => i === qi && q.options.length < 4 ? { ...q, options: [...q.options, ''] } : q));
    }
    function removeOption(qi, oi) {
        updateQuestions(form.questions.map((q, i) => {
            if (i !== qi || q.options.length <= 2)
                return q;
            const options = q.options.filter((_, j) => j !== oi);
            const answer = q.answer === oi ? 0 : q.answer > oi ? q.answer - 1 : q.answer;
            return { ...q, options, answer };
        }));
    }
    function setCorrectAnswer(qi, oi) {
        updateQuestions(form.questions.map((q, i) => i === qi ? { ...q, answer: oi } : q));
    }
    async function saveQuiz() {
        setSaving(true);
        try {
            if (form.quizId)
                await api.updateQuiz(form.quizId, form.questions);
            else
                await api.createQuiz({ moduleId: form.moduleId, questions: form.questions });
            setModal(null);
            setForm({});
            setSelected(null);
            load();
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setSaving(false);
        }
    }
    async function deleteQuiz(quizId) {
        if (!confirm('Delete this quiz? Students\' past results for it will also be removed.'))
            return;
        await api.deleteQuiz(quizId);
        load();
    }
    return (_jsxs(DashboardLayout, { title: "Course Management", subtitle: "Create and manage courses, modules and lessons.", actions: _jsx("button", { className: "btn btn-gold btn-sm", onClick: () => { setSelected(null); setForm({}); setModal('course'); }, children: "+ New Course" }), children: [loading ? _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: courses.map(c => (_jsxs("div", { className: "card", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }, children: [_jsxs("div", { children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 4 }, children: c.title }), _jsxs("p", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: [c.modules.length, " modules \u00B7 ", c.modules.reduce((a, m) => a + m.lessons.length, 0), " lessons \u00B7 ", c._count.enrollments, " enrolled"] })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { className: "btn btn-outline btn-sm", onClick: () => { setSelected(c); setForm({ title: c.title, description: c.description, thumbnail: c.thumbnail, category: c.category }); setModal('course'); }, children: "Edit" }), _jsx("button", { className: "btn btn-sm", style: { background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ef5350' }, onClick: () => deleteCourse(c.id), children: "Delete" }), _jsx("button", { className: "btn btn-primary btn-sm", onClick: () => { setForm({ courseId: c.id }); setModal('module'); }, children: "+ Module" })] })] }), c.modules.map((mod) => (_jsxs("div", { style: { marginLeft: 16, marginBottom: 10, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, gap: 8, flexWrap: 'wrap' }, children: [_jsxs("span", { style: { fontWeight: 600, fontSize: '0.9rem' }, children: ["\uD83D\uDCE6 ", mod.title] }), _jsxs("div", { style: { display: 'flex', gap: 6 }, children: [mod.quizzes?.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("button", { className: "btn btn-outline btn-sm", style: { padding: '4px 10px', fontSize: '0.72rem' }, onClick: () => openEditQuiz(mod.id, mod.quizzes[0]), children: "\uD83D\uDCDD Edit Quiz" }), _jsx("button", { className: "btn btn-sm", style: { padding: '4px 10px', fontSize: '0.72rem', background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ef5350' }, onClick: () => deleteQuiz(mod.quizzes[0].id), children: "Delete Quiz" })] })) : (_jsx("button", { className: "btn btn-outline btn-sm", style: { padding: '4px 10px', fontSize: '0.72rem' }, onClick: () => openNewQuiz(mod.id), children: "\uD83D\uDCDD + Quiz" })), _jsx("button", { className: "btn btn-primary btn-sm", onClick: () => { setForm({ moduleId: mod.id }); setModal('lesson'); }, children: "+ Lesson" })] })] }), mod.lessons.map((l) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', fontSize: '0.84rem', color: '#9a9a9a' }, children: [_jsx("span", { children: "\uD83C\uDFA5" }), _jsx("span", { style: { flex: 1 }, children: l.title }), l.duration && _jsx("span", { children: l.duration }), _jsx("button", { className: "btn btn-outline btn-sm", style: { padding: '4px 10px', fontSize: '0.72rem' }, onClick: () => { setForm({ lessonId: l.id }); setResFile(null); setModal('resource'); }, children: "\uD83D\uDCCE Resource" })] }, l.id)))] }, mod.id)))] }, c.id))) })), modal && (_jsx("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }, children: _jsxs("div", { className: "card", style: { width: '100%', maxWidth: modal === 'quiz' ? 640 : 480, padding: 28, maxHeight: '85vh', overflowY: 'auto' }, children: [_jsx("h3", { style: { fontWeight: 700, marginBottom: 20 }, children: modal === 'course' ? (selected ? 'Edit Course' : 'New Course') : modal === 'module' ? 'Add Module' : modal === 'lesson' ? 'Add Lesson' : modal === 'quiz' ? (form.quizId ? 'Edit Quiz' : 'New Quiz') : 'Add Resource' }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [modal === 'course' && _jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Title" }), _jsx("input", { value: form.title || '', onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "Course title" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description" }), _jsx("textarea", { value: form.description || '', onChange: e => setForm({ ...form, description: e.target.value }), rows: 3, placeholder: "Course description", style: { resize: 'vertical' } })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Category" }), _jsxs("select", { value: form.category || 'Beginner', onChange: e => setForm({ ...form, category: e.target.value }), children: [_jsx("option", { children: "Beginner" }), _jsx("option", { children: "Intermediate" }), _jsx("option", { children: "Advanced" }), _jsx("option", { children: "Crypto" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Thumbnail URL (optional)" }), _jsx("input", { value: form.thumbnail || '', onChange: e => setForm({ ...form, thumbnail: e.target.value }), placeholder: "https://..." })] })] }), modal === 'module' && _jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Module Title" }), _jsx("input", { value: form.title || '', onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "e.g. Module 1: Fundamentals" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Order" }), _jsx("input", { type: "number", value: form.order || '', onChange: e => setForm({ ...form, order: e.target.value }), placeholder: "1" })] })] }), modal === 'lesson' && _jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Lesson Title" }), _jsx("input", { value: form.title || '', onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "What is Forex?" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "YouTube URL" }), _jsx("input", { value: form.videoUrl || '', onChange: e => setForm({ ...form, videoUrl: e.target.value }), placeholder: "https://youtube.com/watch?v=..." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Duration" }), _jsx("input", { value: form.duration || '', onChange: e => setForm({ ...form, duration: e.target.value }), placeholder: "12:34" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description (optional)" }), _jsx("textarea", { value: form.description || '', onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, placeholder: "Short lesson summary", style: { resize: 'vertical' } })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Order" }), _jsx("input", { type: "number", value: form.order || '', onChange: e => setForm({ ...form, order: e.target.value }), placeholder: "1" })] })] }), modal === 'quiz' && _jsxs(_Fragment, { children: [_jsx("p", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: "Multiple choice. Add 2-4 options per question and mark the correct one." }), form.questions?.map((q, qi) => (_jsxs("div", { style: { padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("span", { style: { fontSize: '0.78rem', fontWeight: 700, color: '#c9a84c' }, children: ["Question ", qi + 1] }), form.questions.length > 1 && _jsx("button", { className: "btn btn-outline btn-sm", style: { padding: '2px 8px', fontSize: '0.7rem' }, onClick: () => removeQuestion(qi), children: "Remove" })] }), _jsx("input", { value: q.question, onChange: e => setQuestionText(qi, e.target.value), placeholder: "Question text" }), q.options.map((opt, oi) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("input", { type: "radio", name: `correct-${qi}`, checked: q.answer === oi, onChange: () => setCorrectAnswer(qi, oi), style: { accentColor: '#c9a84c', flexShrink: 0 }, title: "Mark as correct answer" }), _jsx("input", { value: opt, onChange: e => setOptionText(qi, oi, e.target.value), placeholder: `Option ${oi + 1}`, style: { flex: 1 } }), q.options.length > 2 && _jsx("button", { className: "btn btn-outline btn-sm", style: { padding: '2px 8px', fontSize: '0.7rem' }, onClick: () => removeOption(qi, oi), children: "\u00D7" })] }, oi))), q.options.length < 4 && _jsx("button", { className: "btn btn-outline btn-sm", style: { alignSelf: 'flex-start', fontSize: '0.75rem' }, onClick: () => addOption(qi), children: "+ Option" })] }, qi))), _jsx("button", { className: "btn btn-primary btn-sm", onClick: addQuestion, children: "+ Add Question" })] }), modal === 'resource' && _jsxs(_Fragment, { children: [_jsx("p", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: "Upload a PDF/file OR paste an external link." }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Resource Title" }), _jsx("input", { value: form.title || '', onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "e.g. Lesson Notes (PDF)" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Upload File (PDF, max 20MB)" }), _jsx("input", { type: "file", accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.zip", onChange: e => setResFile(e.target.files?.[0] || null), style: { color: '#9a9a9a' } })] }), _jsx("div", { style: { textAlign: 'center', color: '#666', fontSize: '0.8rem' }, children: "\u2014 or \u2014" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "External Link URL" }), _jsx("input", { value: form.fileUrl || '', onChange: e => setForm({ ...form, fileUrl: e.target.value }), placeholder: "https://...", disabled: !!resFile })] })] })] }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 20 }, children: [_jsx("button", { className: "btn btn-gold", onClick: modal === 'course' ? saveCourse : modal === 'module' ? saveModule : modal === 'lesson' ? saveLesson : modal === 'quiz' ? saveQuiz : saveResource, disabled: saving, children: saving ? 'Saving...' : 'Save' }), _jsx("button", { className: "btn btn-outline", onClick: () => { setModal(null); setForm({}); setSelected(null); setResFile(null); }, children: "Cancel" })] })] }) }))] }));
}
