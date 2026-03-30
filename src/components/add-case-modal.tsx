import { useState } from 'react';
import { Modal } from './modal';
import { useLanguage } from '@/contexts/language-context';
import { createCase } from '@/lib/api';
import { today } from '@/lib/utils';

const caseTypes = ['جنح','جنايات','مدني','تجاري','أسرة','عمالي','إداري','مستعجل','أحوال شخصية','اقتصادي'];
const statuses = ['مفتوحة','جارية','مؤجلة','منتهية','مغلقة'];

export function AddCaseModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void; }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ clientName: '', phone: '', email: '', title: '', case_type: 'مدني', status: 'مفتوحة', opening_date: today(), court: '', case_number: '', total_fees: 0 });

  async function submit() {
    setLoading(true);
    try {
      await createCase({ ...form, total_fees: Number(form.total_fees || 0) });
      onCreated();
      onClose();
    } finally { setLoading(false); }
  }

  return <Modal open={open} onClose={onClose} title={t('addCase')}>
    <div className="grid two">
      <label><span>{t('clientName')}</span><input value={form.clientName} onChange={(e)=>setForm({...form, clientName:e.target.value})} /></label>
      <label><span>{t('caseTitle')}</span><input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} /></label>
      <label><span>الهاتف</span><input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} /></label>
      <label><span>البريد</span><input value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} /></label>
      <label><span>{t('caseType')}</span><select value={form.case_type} onChange={(e)=>setForm({...form, case_type:e.target.value})}>{caseTypes.map(x=><option key={x}>{x}</option>)}</select></label>
      <label><span>{t('status')}</span><select value={form.status} onChange={(e)=>setForm({...form, status:e.target.value})}>{statuses.map(x=><option key={x}>{x}</option>)}</select></label>
      <label><span>{t('openingDate')}</span><input type="date" value={form.opening_date} onChange={(e)=>setForm({...form, opening_date:e.target.value})} /></label>
      <label><span>{t('totalFees')}</span><input type="number" value={form.total_fees} onChange={(e)=>setForm({...form, total_fees:Number(e.target.value)})} /></label>
      <label><span>{t('court')}</span><input value={form.court} onChange={(e)=>setForm({...form, court:e.target.value})} /></label>
      <label><span>{t('caseNumber')}</span><input value={form.case_number} onChange={(e)=>setForm({...form, case_number:e.target.value})} /></label>
    </div>
    <div className="actions"><button className="ghost-btn" onClick={onClose}>{t('cancel')}</button><button className="primary-btn" onClick={submit} disabled={loading}>{loading ? '...' : t('save')}</button></div>
  </Modal>;
}
