import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
const Ctx = createContext({});
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('afrifx_token'));
    useEffect(() => {
        if (token) {
            api.me().then(setUser).catch(() => { localStorage.removeItem('afrifx_token'); setToken(null); });
        }
    }, [token]);
    function login(t, u) {
        localStorage.setItem('afrifx_token', t);
        setToken(t);
        setUser(u);
    }
    function logout() {
        localStorage.removeItem('afrifx_token');
        setToken(null);
        setUser(null);
    }
    function refresh() {
        api.me().then(setUser).catch(() => { });
    }
    return _jsx(Ctx.Provider, { value: { user, token, login, logout, refresh }, children: children });
}
export const useAuth = () => useContext(Ctx);
