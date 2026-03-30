import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';

export function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  return <div className="login-page"><div className="login-card"><h1>{t('appName')}</h1><p>{t('internalLogin')}</p><label><span>{t('username')}</span><input value={username} onChange={(e)=>setUsername(e.target.value)} /></label><label><span>{t('password')}</span><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /></label>{error && <p className="error">{error}</p>}<button className="primary-btn full" onClick={()=>{ const ok = login(username, password); if (ok) navigate('/'); else setError(t('invalidCredentials')); }}>{t('login')}</button></div></div>;
}
