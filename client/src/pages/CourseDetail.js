import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    const [course, setCourse] = useState(null);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [openMod, setOpenMod] = useState(null);
    const [reviewData, setReviewData] = useState({ reviews: [], avg: 0, count: 0 });
    const [myReview, setMyReview] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [savingReview, setSavingReview] = useState(false);
    function loadReviews() {
        api.courseReviews(Number(id)).then(setReviewData);
        if (user)
            api.myReview(Number(id)).then(r => { if (r) {
                setMyReview(r);
                setRating(r.rating);
                setComment(r.comment || '');
            } });
    }
    useEffect(() => {
        api.getCourse(Number(id)).then(c => { setCourse(c); setOpenMod(c.modules[0]?.id); setLoading(false); });
        if (user)
            api.myEnrollments().then(e => setEnrolled(e.some((en) => en.courseId === Number(id))));
        loadReviews();
    }, [id, user]);
    async function submitReview() {
        if (!rating)
            return alert('Please select a star rating');
        setSavingReview(true);
        try {
            await api.submitReview({ courseId: Number(id), rating, comment });
            loadReviews();
            alert('Thank you for your review!');
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setSavingReview(false);
        }
    }
    async function handleEnroll() {
        if (!user)
            return nav('/register');
        setEnrolling(true);
        try {
            await api.enroll(Number(id));
            setEnrolled(true);
            const first = course.modules[0]?.lessons[0];
            if (first)
                nav(`/learn/${id}/${first.id}`);
        }
        catch (e) {
            alert(e.message);
        }
        finally {
            setEnrolling(false);
        }
    }
    if (loading)
        return _jsx(DashboardLayout, { title: "Course", children: _jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) }) });
    if (!course)
        return null;
    const totalLessons = course.modules.reduce((a, m) => a + m.lessons.length, 0);
    return (_jsxs(DashboardLayout, { title: "Course Details", subtitle: "Explore the curriculum and enroll for free.", children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }, className: "cd-grid", children: [_jsxs("div", { children: [_jsx("span", { className: "badge badge-green", style: { marginBottom: 16 }, children: "\uD83D\uDCC8 Forex Course" }), _jsx("h1", { style: { fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }, children: course.title }), _jsx("p", { style: { color: '#9a9a9a', lineHeight: 1.8, marginBottom: 24 }, children: course.description }), _jsxs("div", { style: { display: 'flex', gap: 20, fontSize: '0.84rem', color: '#9a9a9a', marginBottom: 32 }, children: [_jsxs("span", { children: ["\uD83D\uDCE6 ", course.modules.length, " modules"] }), _jsxs("span", { children: ["\uD83C\uDFA5 ", totalLessons, " lessons"] }), _jsxs("span", { children: ["\uD83D\uDC65 ", course._count.enrollments, " enrolled"] }), _jsx("span", { children: "\uD83C\uDF93 Certificate on completion" })] }), _jsx("h2", { style: { fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }, children: "Course Curriculum" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 }, children: course.modules.map((mod) => (_jsxs("div", { style: { border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden' }, children: [_jsxs("button", { onClick: () => setOpenMod(openMod === mod.id ? null : mod.id), style: { width: '100%', padding: '14px 18px', background: openMod === mod.id ? 'rgba(26,107,60,0.15)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }, children: [_jsx("span", { children: mod.title }), _jsxs("span", { style: { color: '#9a9a9a', fontSize: '0.8rem' }, children: [mod.lessons.length, " lessons ", openMod === mod.id ? '▲' : '▼'] })] }), openMod === mod.id && (_jsxs("div", { children: [mod.lessons.map((l) => (_jsxs("div", { style: { padding: '10px 18px 10px 30px', display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem', color: '#9a9a9a' }, children: [_jsx("span", { children: "\uD83C\uDFA5" }), _jsx("span", { style: { flex: 1 }, children: l.title }), l.duration && _jsx("span", { style: { fontSize: '0.78rem' }, children: l.duration }), enrolled && _jsx(Link, { to: `/learn/${course.id}/${l.id}`, style: { color: '#c9a84c', fontSize: '0.78rem' }, children: "Watch \u2192" })] }, l.id))), mod.quizzes?.length > 0 && (_jsx("div", { style: { padding: '10px 18px 10px 30px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem', color: '#c9a84c' }, children: "\uD83D\uDCDD Module Quiz" }))] }))] }, mod.id))) })] }), _jsxs("div", { className: "card card-premium", style: { position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }, children: [course.thumbnail && _jsx("img", { src: course.thumbnail, alt: "", style: { width: '100%', borderRadius: 8, objectFit: 'cover', height: 180 } }), _jsx("div", { style: { fontSize: '1.5rem', fontWeight: 800, color: '#c9a84c' }, children: "FREE" }), _jsx("button", { onClick: handleEnroll, className: "btn btn-gold", disabled: enrolling, style: { width: '100%' }, children: enrolled ? 'Continue Learning →' : enrolling ? 'Enrolling...' : 'Enroll Now — Free →' }), _jsx("div", { style: { fontSize: '0.82rem', color: '#9a9a9a', display: 'flex', flexDirection: 'column', gap: 8 }, children: ['🎥 HD Video Lessons', '📝 Module Quizzes', '🎓 Completion Certificate', '⏰ Learn at your own pace', '📱 Mobile friendly'].map(f => _jsx("span", { children: f }, f)) })] })] }), _jsxs("div", { style: { marginTop: 48, maxWidth: 720 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }, children: [_jsx("h2", { style: { fontSize: '1.2rem', fontWeight: 700 }, children: "Student Reviews" }), reviewData.count > 0 && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(Stars, { value: reviewData.avg, size: 18 }), _jsx("span", { style: { color: '#c9a84c', fontWeight: 700 }, children: reviewData.avg }), _jsxs("span", { style: { color: '#9a9a9a', fontSize: '0.85rem' }, children: ["(", reviewData.count, " reviews)"] })] }))] }), enrolled && (_jsxs("div", { className: "card", style: { marginBottom: 24 }, children: [_jsx("h3", { style: { fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }, children: myReview ? 'Update your review' : 'Write a review' }), _jsx("div", { style: { marginBottom: 14 }, children: _jsx(StarInput, { value: rating, onChange: setRating }) }), _jsx("textarea", { value: comment, onChange: e => setComment(e.target.value), rows: 3, placeholder: "Share your experience with this course...", style: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 12, color: '#fff', fontSize: '0.9rem', resize: 'vertical', outline: 'none', marginBottom: 14 } }), _jsx("button", { className: "btn btn-gold btn-sm", onClick: submitReview, disabled: savingReview, children: savingReview ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review' })] })), reviewData.reviews.length === 0 ? (_jsxs("p", { style: { color: '#9a9a9a', fontSize: '0.9rem' }, children: ["No reviews yet. ", enrolled ? 'Be the first to review!' : 'Enroll to leave a review.'] })) : (_jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 14 }, children: reviewData.reviews.map((r) => (_jsxs("div", { className: "card", style: { padding: 18 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("div", { style: { width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#1a6b3c,#c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }, children: r.user.name[0] }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 600, fontSize: '0.88rem' }, children: r.user.name }), _jsx(Stars, { value: r.rating, size: 13 })] })] }), _jsx("span", { style: { fontSize: '0.75rem', color: '#777' }, children: new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) })] }), r.comment && _jsx("p", { style: { fontSize: '0.88rem', color: '#b0b0b0', lineHeight: 1.7 }, children: r.comment })] }, r.id))) }))] })] }));
}
