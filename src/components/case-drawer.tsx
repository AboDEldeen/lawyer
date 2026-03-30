import { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  getCaseDetails, 
  updateCase, 
  deleteCase, 
  addPayment, 
  deletePayment, 
  addNote, 
  deleteNote, 
  uploadFiles, 
  deleteFile, 
  regenerateQrToken, 
  updateQrSettings 
} from '@/lib/api';
import type { CaseItem, Payment, CaseFile, CaseNote, ActivityLog } from '@/lib/types';
import { currency, copyText, today } from '@/lib/utils';
import { Modal } from './modal';
import { useLanguage } from '@/contexts/language-context';

interface CaseDrawerProps {
  item: CaseItem | null;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function CaseDrawer({ item, open, onClose, onRefresh }: CaseDrawerProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'overview' | 'payments' | 'files' | 'notes' | 'activity' | 'qr'>('overview');
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [currentCase, setCurrentCase] = useState<CaseItem | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Form states
  const [paymentForm, setPaymentForm] = useState({ amount: 0, payment_date: today(), note: '' });
  const [noteText, setNoteText] = useState('');

  // Load full details when modal opens or item changes
  useEffect(() => {
    if (open && item?.id) {
      loadData(item.id);
    } else {
      resetStates();
    }
  }, [open, item?.id]);

  const resetStates = () => {
    setCurrentCase(null);
    setPayments([]);
    setFiles([]);
    setNotes([]);
    setActivity([]);
    setQrDataUrl('');
    setTab('overview');
  };

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const data = await getCaseDetails(id);
      if (data) {
        setCurrentCase(data.caseItem);
        setPayments(data.payments || []);
        setFiles(data.files || []);
        setNotes(data.notes || []);
        setActivity(data.activity || []);
        
        if (data.caseItem.qr?.token) {
          const url = `${window.location.origin}/share/${data.caseItem.qr.token}`;
          const qr = await QRCode.toDataURL(url);
          setQrDataUrl(qr);
        }
      }
    } catch (error) {
      console.error("Failed to load case details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentCase) return;
    try {
      await updateCase(currentCase.id, currentCase);
      alert('تم الحفظ بنجاح');
      onRefresh();
      loadData(currentCase.id);
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const handleDelete = async () => {
    if (!currentCase) return;
    if (window.confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      await deleteCase(currentCase.id);
      onClose();
      onRefresh();
    }
  };

  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + Number(p.amount || 0), 0), [payments]);
  const remainingAmount = (currentCase?.total_fees || 0) - totalPaid;

  if (!open || !item) return null;
  if (loading && !currentCase) return <Modal open={open} onClose={onClose} title="Loading..."><div style={{padding: '2rem', textAlign: 'center'}}>جاري التحميل...</div></Modal>;
  if (!currentCase) return null;

  return (
    <Modal open={open} onClose={onClose} title={currentCase.title || 'تفاصيل القضية'} wide>
      <div className="tabs">
        {(['overview', 'payments', 'files', 'notes', 'activity', 'qr'] as const).map((id) => (
          <button 
            key={id} 
            className={`tab ${tab === id ? 'active' : ''}`} 
            onClick={() => setTab(id)}
          >
            {id === 'overview' ? 'Overview' : t(id)}
          </button>
        ))}
      </div>

      <div className="tab-content" style={{ padding: '1rem 0' }}>
        {tab === 'overview' && (
          <div className="grid two">
            <label>
              <span>{t('clientName')}</span>
              <input value={currentCase.client?.full_name || ''} disabled />
            </label>
            <label>
              <span>{t('caseTitle')}</span>
              <input 
                value={currentCase.title || ''} 
                onChange={(e) => setCurrentCase({ ...currentCase, title: e.target.value })} 
              />
            </label>
            <label>
              <span>{t('caseType')}</span>
              <input 
                value={currentCase.case_type || ''} 
                onChange={(e) => setCurrentCase({ ...currentCase, case_type: e.target.value as any })} 
              />
            </label>
            <label>
              <span>{t('status')}</span>
              <input 
                value={currentCase.status || ''} 
                onChange={(e) => setCurrentCase({ ...currentCase, status: e.target.value as any })} 
              />
            </label>
            <label>
              <span>{t('openingDate')}</span>
              <input 
                type="date" 
                value={currentCase.opening_date || ''} 
                onChange={(e) => setCurrentCase({ ...currentCase, opening_date: e.target.value })} 
              />
            </label>
            <label>
              <span>{t('court')}</span>
              <input 
                value={currentCase.court || ''} 
                onChange={(e) => setCurrentCase({ ...currentCase, court: e.target.value })} 
              />
            </label>
            <label>
              <span>{t('caseNumber')}</span>
              <input 
                value={currentCase.case_number || ''} 
                onChange={(e) => setCurrentCase({ ...currentCase, case_number: e.target.value })} 
              />
            </label>
            <label>
              <span>{t('totalFees')}</span>
              <input 
                type="number" 
                value={currentCase.total_fees || 0} 
                onChange={(e) => setCurrentCase({ ...currentCase, total_fees: Number(e.target.value) })} 
              />
            </label>
            <div className="stat-card">
              <small>{t('paid')}</small>
              <strong>{currency(totalPaid)}</strong>
            </div>
            <div className="stat-card">
              <small>{t('remaining')}</small>
              <strong>{currency(remainingAmount)}</strong>
            </div>
            <div className="actions" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button className="primary-btn" onClick={handleSave}>{t('save')}</button>
              <button className="danger-btn" onClick={handleDelete}>{t('delete')}</button>
            </div>
          </div>
        )}

        {tab === 'payments' && (
          <div className="stack gap">
            <div className="grid three">
              <label>
                <span>{t('amount')}</span>
                <input 
                  type="number" 
                  value={paymentForm.amount} 
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} 
                />
              </label>
              <label>
                <span>{t('date')}</span>
                <input 
                  type="date" 
                  value={paymentForm.payment_date} 
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} 
                />
              </label>
              <label>
                <span>{t('note')}</span>
                <input 
                  value={paymentForm.note} 
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} 
                />
              </label>
            </div>
            <button className="primary-btn" onClick={async () => {
              await addPayment(currentCase.id, paymentForm.amount, paymentForm.payment_date, paymentForm.note);
              setPaymentForm({ amount: 0, payment_date: today(), note: '' });
              loadData(currentCase.id);
              onRefresh();
            }}>{t('addPayment')}</button>
            
            <table className="table">
              <thead>
                <tr>
                  <th>{t('amount')}</th>
                  <th>{t('date')}</th>
                  <th>{t('note')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>{currency(p.amount)}</td>
                    <td>{p.payment_date}</td>
                    <td>{p.note || '-'}</td>
                    <td>
                      <button className="ghost-btn danger" onClick={async () => {
                        if (confirm('حذف هذه الدفعة؟')) {
                          await deletePayment(p.id, currentCase.id);
                          loadData(currentCase.id);
                          onRefresh();
                        }
                      }}>حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'files' && (
          <div className="stack gap">
            <div className="actions">
              <label className="primary-btn file-btn">
                {t('uploadFiles')}
                <input 
                  type="file" 
                  multiple 
                  hidden 
                  onChange={async (e) => {
                    if (e.target.files?.length) {
                      await uploadFiles(currentCase.id, Array.from(e.target.files));
                      loadData(currentCase.id);
                      onRefresh();
                    }
                  }} 
                />
              </label>
            </div>
            <div className="file-grid">
              {files.map(f => (
                <div key={f.id} className="file-card">
                  <a href={f.file_url || '#'} target="_blank" rel="noreferrer">{f.file_name}</a>
                  <small>{f.mime_type}</small>
                  <button className="ghost-btn danger" onClick={async () => {
                    if (confirm('حذف هذا الملف؟')) {
                      await deleteFile(f.id, currentCase.id);
                      loadData(currentCase.id);
                      onRefresh();
                    }
                  }}>حذف</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'notes' && (
          <div className="stack gap">
            <div className="actions" style={{ display: 'flex', gap: '8px' }}>
              <input 
                value={noteText} 
                onChange={(e) => setNoteText(e.target.value)} 
                placeholder={t('note')} 
                style={{ flex: 1 }}
              />
              <button className="primary-btn" onClick={async () => {
                if (!noteText.trim()) return;
                await addNote(currentCase.id, noteText);
                setNoteText('');
                loadData(currentCase.id);
              }}>{t('addNote')}</button>
            </div>
            <div className="stack">
              {notes.map(n => (
                <div key={n.id} className="note-card">
                  <p>{n.content}</p>
                  <small>{new Date(n.created_at).toLocaleString()}</small>
                  <button className="ghost-btn danger" onClick={async () => {
                    if (confirm('حذف هذه الملاحظة؟')) {
                      await deleteNote(n.id, currentCase.id);
                      loadData(currentCase.id);
                    }
                  }}>حذف</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div className="stack">
            {activity.map(a => (
              <div key={a.id} className="note-card">
                <strong>{a.description}</strong>
                <small>{new Date(a.created_at).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}

        {tab === 'qr' && (
          <div className="qr-wrap" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            {qrDataUrl && <img src={qrDataUrl} alt="qr" className="qr-image" style={{ width: '200px' }} />}
            <div className="stack gap" style={{ flex: 1 }}>
              <button className="primary-btn" onClick={() => copyText(`${window.location.origin}/share/${currentCase.qr?.token}`)}>
                {t('copyLink')}
              </button>
              <button className="ghost-btn" onClick={() => window.open(`/share/${currentCase.qr?.token}`, '_blank')}>
                {t('openPublicPage')}
              </button>
              <button className="ghost-btn" onClick={async () => {
                await regenerateQrToken(currentCase.id);
                loadData(currentCase.id);
                onRefresh();
              }}>
                {t('regenerateQr')}
              </button>
              <label className="switch-row">
                <input 
                  type="checkbox" 
                  checked={!!currentCase.qr?.allow_download} 
                  onChange={async (e) => {
                    await updateQrSettings(currentCase.id, { allow_download: e.target.checked });
                    loadData(currentCase.id);
                  }} 
                /> {t('allowDownload')}
              </label>
              <label className="switch-row">
                <input 
                  type="checkbox" 
                  checked={!!currentCase.qr?.show_client_name} 
                  onChange={async (e) => {
                    await updateQrSettings(currentCase.id, { show_client_name: e.target.checked });
                    loadData(currentCase.id);
                  }} 
                /> {t('showClientName')}
              </label>
              <label className="switch-row">
                <input 
                  type="checkbox" 
                  checked={!!currentCase.qr?.is_active} 
                  onChange={async (e) => {
                    await updateQrSettings(currentCase.id, { is_active: e.target.checked });
                    loadData(currentCase.id);
                  }} 
                /> Active
              </label>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
