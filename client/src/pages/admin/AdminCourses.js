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
    return (_jsxs(DashboardLayout, { title: "Course Management", subtitle: "Create and manage courses, modules and lessons.", actions: _jsx("button", { className: "btn btn-gold btn-sm", onClick: () => { setSelected(null); setForm({}); setModal('course'); }, children: "+ New Course" }), children: [loading ? _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: courses.map(c => (_jsxs("div", { className: "card", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }, children: [_jsxs("div", { children: [_jsx("h3", { style: { fontWeight: 700, fontSize: '1rem', marginBottom: 4 }, children: c.title }), _jsxs("p", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: [c.modules.length, " modules \u00B7 ", c.modules.reduce((a, m) => a + m.lessons.length, 0), " lessons \u00B7 ", c._count.enrollments, " enrolled"] })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("button", { className: "btn btn-outline btn-sm", onClick: () => { setSelected(c); setForm({ title: c.title, description: c.description, thumbnail: c.thumbnail, category: c.category }); setModal('course'); }, children: "Edit" }), _jsx("button", { className: "btn btn-sm", style: { background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ef5350' }, onClick: () => deleteCourse(c.id), children: "Delete" }), _jsx("button", { className: "btn btn-primary btn-sm", onClick: () => { setForm({ courseId: c.id }); setModal('module'); }, children: "+ Module" })] })] }), c.modules.map((mod) => (_jsxs("div", { style: { marginLeft: 16, marginBottom: 10, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, children: [_jsxs("span", { style: { fontWeight: 600, fontSize: '0.9rem' }, children: ["\uD83D\uDCE6 ", mod.title] }), _jsx("button", { className: "btn btn-primary btn-sm", onClick: () => { setForm({ moduleId: mod.id }); setModal('lesson'); }, children: "+ Lesson" })] }), mod.lessons.map((l) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', fontSize: '0.84rem', color: '#9a9a9a' }, children: [_jsx("span", { children: "\uD83C\uDFA5" }), _jsx("span", { style: { flex: 1 }, children: l.title }), l.duration && _jsx("span", { children: l.duration }), _jsx("button", { className: "btn btn-outline btn-sm", style: { padding: '4px 10px', fontSize: '0.72rem' }, onClick: () => { setForm({ lessonId: l.id }); setResFile(null); setModal('resource'); }, children: "\uD83D\uDCCE Resource" })] }, l.id)))] }, mod.id)))] }, c.id))) })), modal && (_jsx("div", { style: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }, children: _jsxs("div", { className: "card", style: { width: '100%', maxWidth: 480, padding: 28 }, children: [_jsx("h3", { style: { fontWeight: 700, marginBottom: 20 }, children: modal === 'course' ? (selected ? 'Edit Course' : 'New Course') : modal === 'module' ? 'Add Module' : modal === 'lesson' ? 'Add Lesson' : 'Add Resource' }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: [modal === 'course' && _jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Title" }), _jsx("input", { value: form.title || '', onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "Course title" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description" }), _jsx("textarea", { value: form.description || '', onChange: e => setForm({ ...form, description: e.target.value }), rows: 3, placeholder: "Course description", style: { resize: 'vertical' } })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Category" }), _jsxs("select", { value: form.category || 'Beginner', onChange: e => setForm({ ...form, category: e.target.value }), children: [_jsx("option", { children: "Beginner" }), _jsx("option", { children: "Intermediate" }), _jsx("option", { children: "Advanced" }), _jsx("option", { children: "Crypto" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Thumbnail URL (optional)" }), _jsx("input", { value: form.thumbnail || '', onChange: e => setForm({ ...form, thumbnail: e.target.value }), placeholder: "https://..." })] })] }), modal === 'module' && _jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Module Title" }), _jsx("input", { value: form.title || '', onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "e.g. Module 1: Fundamentals" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Order" }), _jsx("input", { type: "number", value: form.order || '', onChange: e => setForm({ ...form, order: e.target.value }), placeholder: "1" })] })] }), modal === 'lesson' && _jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Lesson Title" }), _jsx("input", { value: form.title || '', onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "What is Forex?" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "YouTube URL" }), _jsx("input", { value: form.videoUrl || '', onChange: e => setForm({ ...form, videoUrl: e.target.value }), placeholder: "https://youtube.com/watch?v=..." })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Duration" }), _jsx("input", { value: form.duration || '', onChange: e => setForm({ ...form, duration: e.target.value }), placeholder: "12:34" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description (optional)" }), _jsx("textarea", { value: form.description || '', onChange: e => setForm({ ...form, description: e.target.value }), rows: 2, placeholder: "Short lesson summary", style: { resize: 'vertical' } })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Order" }), _jsx("input", { type: "number", value: form.order || '', onChange: e => setForm({ ...form, order: e.target.value }), placeholder: "1" })] })] }), modal === 'resource' && _jsxs(_Fragment, { children: [_jsx("p", { style: { fontSize: '0.82rem', color: '#9a9a9a' }, children: "Upload a PDF/file OR paste an external link." }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Resource Title" }), _jsx("input", { value: form.title || '', onChange: e => setForm({ ...form, title: e.target.value }), placeholder: "e.g. Lesson Notes (PDF)" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Upload File (PDF, max 20MB)" }), _jsx("input", { type: "file", accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.zip", onChange: e => setResFile(e.target.files?.[0] || null), style: { color: '#9a9a9a' } })] }), _jsx("div", { style: { textAlign: 'center', color: '#666', fontSize: '0.8rem' }, children: "\u2014 or \u2014" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "External Link URL" }), _jsx("input", { value: form.fileUrl || '', onChange: e => setForm({ ...form, fileUrl: e.target.value }), placeholder: "https://...", disabled: !!resFile })] })] })] }), _jsxs("div", { style: { display: 'flex', gap: 10, marginTop: 20 }, children: [_jsx("button", { className: "btn btn-gold", onClick: modal === 'course' ? saveCourse : modal === 'module' ? saveModule : modal === 'lesson' ? saveLesson : saveResource, disabled: saving, children: saving ? 'Saving...' : 'Save' }), _jsx("button", { className: "btn btn-outline", onClick: () => { setModal(null); setForm({}); setSelected(null); setResFile(null); }, children: "Cancel" })] })] }) }))] }));
}
