import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';
const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('lawyer-theme') as Theme) || 'dark');
  useEffect(() => {
    localStorage.setItem('lawyer-theme', theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  const value = useMemo(() => ({ theme, toggleTheme: () => setTheme((p) => (p === 'dark' ? 'light' : 'dark')) }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
