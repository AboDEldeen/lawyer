import { useEffect, useState } from 'react';
import { getCases, getDashboardStats } from '@/lib/api';
import { currency } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';
import type { CaseItem } from '@/lib/types';
import { CaseDrawer } from '@/components/case-drawer';
import { AddCaseModal } from '@/components/add-case-modal';

export function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState({ totalCases: 0, openCases: 0, closedCases: 0, totalFees: 0, totalCollected: 0, remaining: 0 });
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [active, setActive] = useState<CaseItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const load = async () => { try { setStats(await getDashboardStats()); const allCases = await getCases(); setCases(allCases.slice(0, 5)); } catch (err) { console.error('Error loading dashboard:', err); } };
  useEffect(() => { load(); }, []);
  return <div className="stack gap"><div className="page-head"><h2>{t('dashboard')}</h2><button className="primary-btn" onClick={()=>setShowAdd(true)}>{t('addCase')}</button></div><div className="stats-grid">{[
    [t('totalCases'), stats.totalCases], [t('openCases'), stats.openCases], [t('closedCases'), stats.closedCases], [t('totalFees'), currency(stats.totalFees)], [t('totalCollected'), currency(stats.totalCollected)], [t('remaining'), currency(stats.remaining)]
  ].map(([k,v]) => <div key={String(k)} className="stat-card"><small>{k}</small><strong>{v}</strong></div>)}</div><div className="card"><h3>Latest Cases</h3><table className="table"><thead><tr><th>{t('clientName')}</th><th>{t('caseTitle')}</th><th>{t('caseType')}</th><th>{t('remaining')}</th><th></th></tr></thead><tbody>{cases.length === 0 ? <tr><td colSpan={5}>{t('noData')}</td></tr> : cases.map(c=><tr key={c.id}><td>{c.client?.full_name || 'N/A'}</td><td>{c.title}</td><td>{c.case_type}</td><td>{currency(c.remaining || 0)}</td><td><div style={{display:'flex',gap:'8px'}}><button className="ghost-btn" onClick={()=>setActive(c)}>تعديل وحفظ</button><button className="danger-btn" style={{padding:'0.6rem 0.8rem',fontSize:'0.9rem'}} onClick={async()=>{ if(confirm('هل تريد حذف هذه القضية؟')) { const {deleteCase} = await import('@/lib/api'); await deleteCase(c.id); await load(); }}}>حذف</button></div></td></tr>)}</tbody></table></div><CaseDrawer item={active} open={!!active} onClose={()=>setActive(null)} onRefresh={load} /><AddCaseModal open={showAdd} onClose={()=>setShowAdd(false)} onCreated={load} /></div>;
}
