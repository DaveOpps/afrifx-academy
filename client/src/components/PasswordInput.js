import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
// Password field with a show/hide (eye) toggle.
export default function PasswordInput({ value, onChange, placeholder, required, autoComplete }) {
    const [show, setShow] = useState(false);
    return (_jsxs("div", { style: { position: 'relative' }, children: [_jsx("input", { type: show ? 'text' : 'password', required: required, placeholder: placeholder, value: value, autoComplete: autoComplete, onChange: e => onChange(e.target.value), style: { width: '100%', paddingRight: 44, boxSizing: 'border-box' } }), _jsx("button", { type: "button", onClick: () => setShow(s => !s), "aria-label": show ? 'Hide password' : 'Show password', title: show ? 'Hide password' : 'Show password', style: {
                    position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 6,
                    color: show ? '#c9a84c' : '#9a9a9a', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }, children: show ? (
                // eye-off
                _jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" }), _jsx("line", { x1: "1", y1: "1", x2: "23", y2: "23" })] })) : (
                // eye
                _jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] })) })] }));
}
