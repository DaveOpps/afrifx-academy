import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api';

interface User { id: number; name: string; email: string; role: string; phone?: string; points?: number; studentId?: string; tier?: string; signalSubUntil?: string | null; createdAt?: string; }
interface AuthCtx { user: User | null; token: string | null; login: (token: string, user: User) => void; logout: () => void; refresh: () => void; }

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('afrifx_token'));

  useEffect(() => {
    if (token) {
      api.me().then(setUser).catch(() => { localStorage.removeItem('afrifx_token'); setToken(null); });
    }
  }, [token]);

  function login(t: string, u: User) {
    localStorage.setItem('afrifx_token', t);
    setToken(t); setUser(u);
  }
  function logout() {
    localStorage.removeItem('afrifx_token');
    setToken(null); setUser(null);
  }
  function refresh() {
    api.me().then(setUser).catch(() => {});
  }

  return <Ctx.Provider value={{ user, token, login, logout, refresh }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
