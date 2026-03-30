import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BriefcaseBusiness, Moon, Sun, Languages, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useTheme } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';

export function AppShell() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>{t('appName')}</h1>
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><LayoutDashboard size={18} /> {t('dashboard')}</NavLink>
        <NavLink to="/cases" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><BriefcaseBusiness size={18} /> {t('cases')}</NavLink>
      </aside>
      <div className="content-wrap">
        <header className="header">
          <div />
          <div className="header-actions">
            <button className="icon-btn" onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}><Languages size={18} /> {language === 'ar' ? 'English' : 'العربية'}</button>
            <button className="icon-btn" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="icon-btn" onClick={() => { logout(); navigate('/login'); }}><LogOut size={18} /> {t('logout')}</button>
          </div>
        </header>
        <main className="main"><Outlet /></main>
      </div>
    </div>
  );
}
