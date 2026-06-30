import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { Stars } from '../components/StarRating';
const CATEGORIES = ['All', 'Beginner', 'Intermediate', 'Advanced', 'Crypto'];
export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState('All');
    useEffect(() => {
        api.getCourses().then(async (cs) => {
            setCourses(cs);
            setLoading(false);
            // Fetch ratings for each course
            const r = {};
            await Promise.all(cs.map(async (c) => {
                try {
                    const rev = await api.courseReviews(c.id);
                    r[c.id] = { avg: rev.avg, count: rev.count };
                }
                catch { }
            }));
            setRatings(r);
        });
    }, []);
    const filtered = courses.filter(c => {
        const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
        const matchCat = cat === 'All' || c.category === cat;
        return matchSearch && matchCat;
    });
    return (_jsxs(DashboardLayout, { title: "All Courses", subtitle: "Start with any course \u2014 all are free to enroll.", children: [_jsxs("div", { style: { display: 'flex', gap: 14, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsxs("div", { style: { position: 'relative', flex: 1, minWidth: 240 }, children: [_jsx("span", { style: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9a9a9a' }, children: "\uD83D\uDD0D" }), _jsx("input", { placeholder: "Search courses...", value: search, onChange: e => setSearch(e.target.value), style: { width: '100%', padding: '11px 16px 11px 40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 50, color: '#fff', fontSize: '0.9rem', outline: 'none' } })] }), _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: CATEGORIES.map(c => (_jsx("button", { onClick: () => setCat(c), style: { padding: '8px 16px', borderRadius: 50, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', border: `1px solid ${cat === c ? '#c9a84c' : 'rgba(255,255,255,0.12)'}`, background: cat === c ? 'rgba(201,168,76,0.15)' : 'transparent', color: cat === c ? '#c9a84c' : '#9a9a9a', transition: 'all 0.2s' }, children: c }, c))) })] }), loading ? (_jsx("div", { className: "loading-center", children: _jsx("span", { className: "spinner" }) })) : filtered.length === 0 ? (_jsx("div", { className: "card", style: { textAlign: 'center', padding: 48 }, children: _jsx("p", { style: { color: '#9a9a9a' }, children: search || cat !== 'All' ? 'No courses match your filters.' : 'No courses available yet. Check back soon!' }) })) : (_jsx("div", { className: "grid-3", children: filtered.map(c => {
                    const total = c.modules.reduce((a, m) => a + m.lessons.length, 0);
                    const rating = ratings[c.id];
                    return (_jsxs("div", { className: "card card-hover", style: { display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }, children: [_jsxs("div", { style: { position: 'relative' }, children: [c.thumbnail ? (_jsx("img", { src: c.thumbnail, alt: c.title, style: { width: '100%', height: 180, objectFit: 'cover' } })) : (_jsx("div", { style: { width: '100%', height: 180, background: 'linear-gradient(135deg,#1a6b3c,#0f4526)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }, children: "\uD83D\uDCC8" })), _jsx("span", { className: "badge badge-gold", style: { position: 'absolute', top: 12, left: 12 }, children: c.category })] }), _jsxs("div", { style: { padding: 20, flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }, children: [_jsx("h3", { style: { fontSize: '1rem', fontWeight: 700 }, children: c.title }), rating && rating.count > 0 && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 6 }, children: [_jsx(Stars, { value: rating.avg, size: 14 }), _jsxs("span", { style: { fontSize: '0.78rem', color: '#9a9a9a' }, children: [rating.avg, " (", rating.count, ")"] })] })), _jsx("p", { style: { fontSize: '0.84rem', color: '#9a9a9a', lineHeight: 1.6, flex: 1 }, children: c.description }), _jsxs("div", { style: { display: 'flex', gap: 10, fontSize: '0.78rem', color: '#9a9a9a' }, children: [_jsxs("span", { children: ["\uD83D\uDCE6 ", c.modules.length] }), _jsxs("span", { children: ["\uD83C\uDFA5 ", total] }), _jsxs("span", { children: ["\uD83D\uDC65 ", c._count.enrollments] })] }), _jsx(Link, { to: `/courses/${c.id}`, className: "btn btn-primary", style: { marginTop: 4 }, children: "View Course" })] })] }, c.id));
                }) }))] }));
}
