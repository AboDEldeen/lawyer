import { useEffect, useMemo, useState } from 'react';
import { getCases } from '@/lib/api';
import type { CaseItem } from '@/lib/types';
import { currency } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';
import { CaseDrawer } from '@/components/case-drawer';
import { AddCaseModal } from '@/components/add-case-modal';

export function CasesPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<CaseItem[]>([]);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<CaseItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const load = async () => setItems(await getCases());
  useEffect(() => { load(); }, []);
  const filtered = useMemo(() => items.filter(c => [c.client?.full_name, c.title, c.case_type, c.opening_date].join(' ').toLowerCase().includes(search.toLowerCase())), [items, search]);
  return <div className="stack gap"><div className="page-head"><h2>{t('cases')}</h2><button className="primary-btn" onClick={()=>setShowAdd(true)}>{t('addCase')}</button></div><div className="card"><input placeholder={t('search')} value={search} onChange={(e)=>setSearch(e.target.value)} /></div><div className="card"><table className="table"><thead><tr><th>{t('clientName')}</th><th>{t('caseTitle')}</th><th>{t('caseType')}</th><th>{t('status')}</th><th>{t('openingDate')}</th><th>{t('totalFees')}</th><th>{t('paid')}</th><th>{t('remaining')}</th><th>QR</th><th></th></tr></thead><tbody>{filtered.map(c=><tr key={c.id}><td>{c.client?.full_name}</td><td>{c.title}</td><td>{c.case_type}</td><td>{c.status}</td><td>{c.opening_date}</td><td>{currency(Number(c.total_fees||0))}</td><td>{currency(Number(c.total_paid||0))}</td><td>{currency(Number(c.remaining||0))}</td><td>{c.qr?.is_active ? 'Active' : 'Off'}</td><td><button className="ghost-btn" onClick={()=>setActive(c)}>{t('details')}</button></td></tr>)}</tbody></table></div><CaseDrawer item={active} open={!!active} onClose={()=>setActive(null)} onRefresh={load} /><AddCaseModal open={showAdd} onClose={()=>setShowAdd(false)} onCreated={load} /></div>;
}
