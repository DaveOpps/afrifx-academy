import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
export default function Verify() {
    const { code } = useParams();
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!code) {
            setError('No verification code provided.');
            setLoading(false);
            return;
        }
        api.verifyCert(code)
            .then(setResult)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [code]);
    return (_jsxs("div", { style: { minHeight: '100vh', background: '#0d0d0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }, children: [_jsxs(Link, { to: "/", style: { marginBottom: 40, textDecoration: 'none' }, children: [_jsxs("span", { style: { fontFamily: "'Playfair Display',serif", fontWeight: 800, fontSize: '1.8rem' }, children: [_jsx("span", { style: { color: '#fff' }, children: "Afri" }), _jsx("span", { style: { color: '#c9a84c' }, children: "FX" })] }), _jsx("span", { style: { fontSize: '0.65rem', color: '#9a9a9a', letterSpacing: 3, display: 'block', textTransform: 'uppercase', textAlign: 'center' }, children: "Academy" })] }), _jsxs("div", { style: { width: '100%', maxWidth: 520 }, children: [loading ? (_jsxs("div", { className: "card", style: { textAlign: 'center', padding: 60 }, children: [_jsx("span", { className: "spinner", style: { width: 40, height: 40 } }), _jsx("p", { style: { color: '#9a9a9a', marginTop: 16 }, children: "Verifying certificate..." })] })) : error ? (_jsxs("div", { className: "card", style: { textAlign: 'center', padding: 48 }, children: [_jsx("div", { style: { fontSize: '3.5rem', marginBottom: 16 }, children: "\u274C" }), _jsx("h2", { style: { color: '#ef5350', marginBottom: 8 }, children: "Certificate Not Found" }), _jsxs("p", { style: { color: '#9a9a9a', marginBottom: 24 }, children: ["The verification code ", _jsx("strong", { style: { color: '#fff', fontFamily: 'monospace' }, children: code }), " does not match any AfriFX Academy certificate."] }), _jsx("p", { style: { color: '#666', fontSize: '0.85rem' }, children: "If you believe this is an error, please contact us." })] })) : (_jsxs("div", { className: "card", style: { textAlign: 'center', padding: 48, border: '1px solid rgba(76,175,80,0.4)', background: 'rgba(76,175,80,0.04)' }, children: [_jsx("div", { style: { fontSize: '3.5rem', marginBottom: 16 }, children: "\u2705" }), _jsx("h2", { style: { color: '#4caf50', marginBottom: 4 }, children: "Certificate Verified" }), _jsx("p", { style: { color: '#9a9a9a', marginBottom: 32, fontSize: '0.9rem' }, children: "This is an authentic AfriFX Academy certificate." }), _jsx("div", { style: { background: '#0d0d0d', borderRadius: 12, padding: 24, textAlign: 'left', marginBottom: 24 }, children: [
                                    ['Certificate Holder', result.holderName],
                                    ['Course Completed', result.course],
                                    ['Date Issued', new Date(result.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
                                    ['Verification Code', result.verifyCode],
                                    ['Issued By', 'AfriFX Academy'],
                                ].map(([label, value]) => (_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 12 }, children: [_jsx("span", { style: { fontSize: '0.82rem', color: '#9a9a9a', flexShrink: 0 }, children: label }), _jsx("span", { style: { fontWeight: 600, fontSize: '0.9rem', textAlign: 'right', fontFamily: label === 'Verification Code' ? 'monospace' : undefined, color: label === 'Verification Code' ? '#c9a84c' : '#fff' }, children: value })] }, label))) }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 20 }, children: [_jsx("div", { style: { background: '#fff', padding: 10, borderRadius: 10 }, children: _jsx("img", { src: `/api/qr?text=${encodeURIComponent(window.location.href)}&size=160`, alt: "Verification QR", width: 140, height: 140, style: { display: 'block' } }) }), _jsx("span", { style: { fontSize: '0.72rem', color: '#9a9a9a' }, children: "Scan to re-verify this certificate" })] }), _jsxs("div", { style: { background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: '0.82rem', color: '#9a9a9a' }, children: ["Verified on ", new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })] })] })), _jsxs("p", { style: { textAlign: 'center', color: '#666', fontSize: '0.78rem', marginTop: 24 }, children: ["Certificate verification powered by ", _jsx("span", { style: { color: '#c9a84c' }, children: "AfriFX Academy" })] })] })] }));
}
