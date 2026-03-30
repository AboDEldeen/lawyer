import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { addNote, addPayment, deleteCase, deleteFile, deleteNote, deletePayment, getCaseDetails, regenerateQrToken, updateCase, updateQrSettings, uploadFiles } from '@/lib/api';
import type { CaseFile, CaseItem, CaseNote, Payment, ActivityLog } from '@/lib/types';
import { currency, copyText, today } from '@/lib/utils';
import { Modal } from './modal';
import { useLanguage } from '@/contexts/language-context';

export function CaseDrawer({ item, open, onClose, onRefresh }: { item: CaseItem | null; open: boolean; onClose: () => void; onRefresh: () => void; }) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'overview'|'payments'|'files'|'notes'|'activity'|'qr'>('overview');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [current, setCurrent] = useState<CaseItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [paymentForm, setPaymentForm] = useState({ amount: 0, payment_date: today(), note: '' });
  const [noteText, setNoteText] = useState('');

  useEffect(() => { 
    if (open && item) {
      setCurrent(item);
      load(item.id);
    } else {
      setCurrent(null);
    }
  }, [open, item?.id]);

  async function load(id: string) {
    try {
      const d = await getCaseDetails(id);
      setCurrent(d.caseItem); 
      setPayments(d.payments || []); 
      setFiles(d.files || []); 
      setNotes(d.notes || []); 
      setActivity(d.activity || []);
      if (d.caseItem.qr?.token) {
        const publicUrl = `${window.location.origin}/share/${d.caseItem.qr.token}`;
        setQrDataUrl(await QRCode.toDataURL(publicUrl));
      }
    } catch (err) {
      console.error('Error loading case details:', err);
    }
  }
  const paid = useMemo(() => payments.reduce((s, p) => s + Number(p.amount || 0), 0), [payments]);
  const remaining = Number(current?.total_fees || 0) - paid;

  if (!current) return null;

  return <Modal open={open} onClose={onClose} title={current.title} wide>
    <div className="tabs">{['overview','payments','files','notes','activity','qr'].map(x => <button key={x} className={tab===x?'tab active':'tab'} onClick={()=>setTab(x as any)}>{x==='overview'?'Overview':t(x as any)}</button>)}</div>
    {tab==='overview' && <div className="grid two">
      <label><span>{t('clientName')}</span><input value={current.client?.full_name || ''} disabled /></label>
      <label><span>{t('caseTitle')}</span><input value={current.title} onChange={(e)=>setCurrent({...current, title:e.target.value})} /></label>
      <label><span>{t('caseType')}</span><input value={current.case_type} onChange={(e)=>setCurrent({...current, case_type:e.target.value as any})} /></label>
      <label><span>{t('status')}</span><input value={current.status} onChange={(e)=>setCurrent({...current, status:e.target.value as any})} /></label>
      <label><span>{t('openingDate')}</span><input type="date" value={current.opening_date} onChange={(e)=>setCurrent({...current, opening_date:e.target.value})} /></label>
      <label><span>{t('court')}</span><input value={current.court || ''} onChange={(e)=>setCurrent({...current, court:e.target.value})} /></label>
      <label><span>{t('caseNumber')}</span><input value={current.case_number || ''} onChange={(e)=>setCurrent({...current, case_number:e.target.value})} /></label>
      <label><span>{t('totalFees')}</span><input type="number" value={current.total_fees} onChange={(e)=>setCurrent({...current, total_fees:Number(e.target.value)})} /></label>
      <div className="stat-card"><small>{t('paid')}</small><strong>{currency(paid)}</strong></div>
      <div className="stat-card"><small>{t('remaining')}</small><strong>{currency(remaining)}</strong></div>
      <div className="actions"><button className="primary-btn" onClick={async()=>{ if(!current) return; await updateCase(current.id, current); await load(current.id); onRefresh(); alert('تم الحفظ بنجاح'); }}>{t('save')}</button><button className="danger-btn" onClick={async()=>{ if(!current) return; if (confirm('هل تريد حذف هذه القضية؟')) { await deleteCase(current.id); onClose(); onRefresh(); }}}>{t('delete') || 'حذف'}</button></div>
    </div>}

    {tab==='payments' && <div>
      <div className="grid three"><label><span>{t('amount')}</span><input type="number" value={paymentForm.amount} onChange={(e)=>setPaymentForm({...paymentForm, amount:Number(e.target.value)})} /></label><label><span>{t('date')}</span><input type="date" value={paymentForm.payment_date} onChange={(e)=>setPaymentForm({...paymentForm, payment_date:e.target.value})} /></label><label><span>{t('note')}</span><input value={paymentForm.note} onChange={(e)=>setPaymentForm({...paymentForm, note:e.target.value})} /></label></div>
      <div className="actions"><button className="primary-btn" onClick={async()=>{ await addPayment(current.id, paymentForm.amount, paymentForm.payment_date, paymentForm.note); setPaymentForm({ amount: 0, payment_date: today(), note: ''}); await load(); onRefresh(); }}>{t('addPayment')}</button></div>
      <table className="table"><thead><tr><th>{t('amount')}</th><th>{t('date')}</th><th>{t('note')}</th><th></th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td>{currency(p.amount)}</td><td>{p.payment_date}</td><td>{p.note || '-'}</td><td><button className="ghost-btn" onClick={async()=>{ await deletePayment(p.id, current.id); await load(); onRefresh(); }}>حذف</button></td></tr>)}</tbody></table>
    </div>}

    {tab==='files' && <div>
      <div className="actions"><label className="primary-btn file-btn">{t('uploadFiles')}<input type="file" multiple hidden onChange={async(e)=>{ if (e.target.files?.length) { await uploadFiles(current.id, Array.from(e.target.files)); await load(); onRefresh(); }}} /></label><label className="ghost-btn file-btn">{t('cameraUpload')}<input type="file" accept="image/*" capture="environment" multiple hidden onChange={async(e)=>{ if (e.target.files?.length) { await uploadFiles(current.id, Array.from(e.target.files)); await load(); onRefresh(); }}} /></label></div>
      <div className="file-grid">{files.map(f => <div key={f.id} className="file-card"><a href={f.file_url || '#'} target="_blank">{f.file_name}</a><small>{f.mime_type}</small><button className="ghost-btn" onClick={async()=>{ await deleteFile(f.id, current.id); await load(); onRefresh(); }}>حذف</button></div>)}</div>
    </div>}

    {tab==='notes' && <div><div className="actions"><input value={noteText} onChange={(e)=>setNoteText(e.target.value)} placeholder={t('note')} /><button className="primary-btn" onClick={async()=>{ if (!noteText) return; await addNote(current.id, noteText); setNoteText(''); await load(); }}> {t('addNote')}</button></div><div className="stack">{notes.map(n=><div key={n.id} className="note-card"><p>{n.content}</p><small>{new Date(n.created_at).toLocaleString()}</small><button className="ghost-btn" onClick={async()=>{ await deleteNote(n.id, current.id); await load(); }}>حذف</button></div>)}</div></div>}

    {tab==='activity' && <div className="stack">{activity.map(a=><div key={a.id} className="note-card"><strong>{a.description}</strong><small>{new Date(a.created_at).toLocaleString()}</small></div>)}</div>}

    {tab==='qr' && <div className="qr-wrap">{qrDataUrl && <img src={qrDataUrl} alt="qr" className="qr-image" />}<div className="stack"><button className="primary-btn" onClick={()=>copyText(`${window.location.origin}/share/${current.qr?.token}`)}>{t('copyLink')}</button><button className="ghost-btn" onClick={()=>window.open(`/share/${current.qr?.token}`, '_blank')}>{t('openPublicPage')}</button><button className="ghost-btn" onClick={async()=>{ await regenerateQrToken(current.id); await load(); onRefresh(); }}>{t('regenerateQr')}</button><label className="switch-row"><input type="checkbox" checked={!!current.qr?.allow_download} onChange={async(e)=>{ await updateQrSettings(current.id, { allow_download: e.target.checked }); await load(); }} /> {t('allowDownload')}</label><label className="switch-row"><input type="checkbox" checked={!!current.qr?.show_client_name} onChange={async(e)=>{ await updateQrSettings(current.id, { show_client_name: e.target.checked }); await load(); }} /> {t('showClientName')}</label><label className="switch-row"><input type="checkbox" checked={!!current.qr?.is_active} onChange={async(e)=>{ await updateQrSettings(current.id, { is_active: e.target.checked }); await load(); }} /> Active</label></div></div>}
  </Modal>;
}
