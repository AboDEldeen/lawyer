import { createContext, useContext, useMemo, useState } from 'react';

const USERNAME = 'ahmed';
const PASSWORD = '123456';
const STORAGE_KEY = 'lawyer-auth';

type Ctx = {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem(STORAGE_KEY) === '1');
  const value = useMemo(
    () => ({
      isAuthenticated,
      login: (username: string, password: string) => {
        const ok = username === USERNAME && password === PASSWORD;
        if (ok) {
          localStorage.setItem(STORAGE_KEY, '1');
          setIsAuthenticated(true);
        }
        return ok;
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setIsAuthenticated(false);
      }
    }),
    [isAuthenticated]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
