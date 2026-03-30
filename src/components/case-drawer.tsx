import { useEffect, useRef, useState, useMemo } from 'react';
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

function Toast({ msg, type, onDone }: { msg: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        padding: '12px 20px',
        borderRadius: 14,
        background: type === 'success' ? '#16a34a' : '#b91c1c',
        color: '#fff',
        fontFamily: 'inherit',
        fontSize: '0.95rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
      }}
    >
      {msg}
    </div>
  );
}

function formatSize(size: number) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = size;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx++;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[idx]}`;
}

export function CaseDrawer({ item, open, onClose, onRefresh }: CaseDrawerProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<'overview' | 'payments' | 'files' | 'notes' | 'activity' | 'qr'>('overview');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadPercent, setUploadPercent] = useState(0);

  const [currentCase, setCurrentCase] = useState<CaseItem | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [files, setFiles] = useState<CaseFile[]>([]);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [paymentForm, setPaymentForm] = useState({ amount: 0, payment_date: today(), note: '' });
  const [noteText, setNoteText] = useState('');

  const imageFilesInputRef = useRef<HTMLInputElement | null>(null);
  const videoFilesInputRef = useRef<HTMLInputElement | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => setToast({ msg, type });

  useEffect(() => {
    if (open && item?.id) {
      setTab('overview');
      loadData(item.id);
    } else {
      setCurrentCase(null);
      setPayments([]);
      setFiles([]);
      setNotes([]);
      setActivity([]);
      setQrDataUrl('');
    }
  }, [open, item?.id]);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const data = await getCaseDetails(id);
      if (!mountedRef.current) return;

      setCurrentCase(data.caseItem);
      setPayments(data.payments || []);
      setFiles(data.files || []);
      setNotes(data.notes || []);
      setActivity(data.activity || []);

      if (data.caseItem.qr?.token) {
        try {
          const url = `${window.location.origin}/share/${data.caseItem.qr.token}`;
          const qr = await QRCode.toDataURL(url);
          if (mountedRef.current) setQrDataUrl(qr);
        } catch {
          //
        }
      }
    } catch (err) {
      console.error('loadData error:', err);
      if (mountedRef.current) showToast('فشل تحميل بيانات القضية', 'error');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentCase) return;

    try {
      await updateCase(currentCase.id, currentCase);
      if (!mountedRef.current) return;

      showToast('تم الحفظ بنجاح ✓');
      onRefresh();
      await loadData(currentCase.id);
    } catch {
      if (mountedRef.current) showToast('حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handleDelete = async () => {
    if (!currentCase) return;

    if (window.confirm('هل أنت متأكد من حذف هذه القضية؟')) {
      try {
        await deleteCase(currentCase.id);
        onClose();
        onRefresh();
      } catch {
        showToast('فشل حذف القضية', 'error');
      }
    }
  };

  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + Number(p.amount || 0), 0), [payments]);
  const remainingAmount = (currentCase?.total_fees || 0) - totalPaid;

  const totalFilesBytes = useMemo(
    () => files.reduce((sum, f) => sum + Number(f.file_size || 0), 0),
    [files]
  );

  const supabaseBytes = useMemo(
    () =>
      files
        .filter((f: any) => f.storage_provider !== 'r2')
        .reduce((sum, f) => sum + Number(f.file_size || 0), 0),
    [files]
  );

  const r2Bytes = useMemo(
    () =>
      files
        .filter((f: any) => f.storage_provider === 'r2')
        .reduce((sum, f) => sum + Number(f.file_size || 0), 0),
    [files]
  );

  const handleFilesUpload = async (selectedFiles: File[]) => {
    if (!currentCase || !selectedFiles.length) return;

    try {
      setUploading(true);
      setUploadPercent(0);
      setUploadFileName('');

      await uploadFiles(currentCase.id, selectedFiles, ({ fileName, percent }) => {
        setUploadFileName(fileName);
        setUploadPercent(percent);
      });

      if (!mountedRef.current) return;

      await loadData(currentCase.id);
      onRefresh();
      showToast('تم رفع الملفات ✓');
    } catch (err) {
      console.error(err);
      showToast('فشل رفع الملفات', 'error');
    } finally {
      if (mountedRef.current) {
        setUploading(false);
        setUploadFileName('');
        setUploadPercent(0);
      }
    }
  };

  if (!open || !item) return null;

  if (loading && !currentCase) {
    return (
      <Modal open={open} onClose={onClose} title="جاري التحميل...">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          جاري تحميل بيانات القضية...
        </div>
      </Modal>
    );
  }

  if (!currentCase) return null;

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}

      <Modal open={open} onClose={onClose} title={currentCase.title || 'تفاصيل القضية'} wide>
        <div className="tabs">
          {(['overview', 'payments', 'files', 'notes', 'activity', 'qr'] as const).map((id) => (
            <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
              {id === 'overview' ? 'البيانات' : t(id)}
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
                <button className="primary-btn" onClick={handleSave} disabled={loading}>
                  {loading ? '...' : t('save')}
                </button>
                <button className="danger-btn" onClick={handleDelete}>
                  {t('delete')}
                </button>
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

              <button
                className="primary-btn"
                onClick={async () => {
                  try {
                    await addPayment(
                      currentCase.id,
                      paymentForm.amount,
                      paymentForm.payment_date,
                      paymentForm.note
                    );
                    if (!mountedRef.current) return;

                    setPaymentForm({ amount: 0, payment_date: today(), note: '' });
                    await loadData(currentCase.id);
                    onRefresh();
                    showToast('تمت إضافة الدفعة ✓');
                  } catch {
                    showToast('فشل إضافة الدفعة', 'error');
                  }
                }}
              >
                {t('addPayment')}
              </button>

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
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{currency(p.amount)}</td>
                      <td>{p.payment_date}</td>
                      <td>{p.note || '-'}</td>
                      <td>
                        <button
                          className="ghost-btn danger"
                          onClick={async () => {
                            if (confirm('حذف هذه الدفعة؟')) {
                              await deletePayment(p.id, currentCase.id);
                              if (mountedRef.current) {
                                await loadData(currentCase.id);
                                onRefresh();
                              }
                            }
                          }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'files' && (
            <div className="stack gap">
              <div className="stat-card" style={{ marginBottom: 12 }}>
                <div>إجمالي الملفات: {formatSize(totalFilesBytes)}</div>
                <div>صور وملفات على Supabase: {formatSize(supabaseBytes)}</div>
                <div>فيديوهات على R2: {formatSize(r2Bytes)}</div>
              </div>

              {supabaseBytes > 6 * 1024 * 1024 * 1024 && (
                <div style={{ color: '#facc15', marginBottom: 10 }}>
                  تنبيه: مساحة Supabase قربت من الحد.
                </div>
              )}

              <div className="actions" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  className="primary-btn"
                  onClick={() => imageFilesInputRef.current?.click()}
                  disabled={uploading}
                >
                  رفع صور / ملفات
                </button>

                <button
                  className="ghost-btn"
                  onClick={() => videoFilesInputRef.current?.click()}
                  disabled={uploading}
                >
                  رفع فيديوهات
                </button>

                <input
                  ref={imageFilesInputRef}
                  type="file"
                  multiple
                  hidden
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                  onChange={async (e) => {
                    const selected = Array.from(e.target.files || []);
                    if (selected.length) {
                      await handleFilesUpload(selected);
                    }
                    e.currentTarget.value = '';
                  }}
                />

                <input
                  ref={videoFilesInputRef}
                  type="file"
                  multiple
                  hidden
                  accept="video/*"
                  onChange={async (e) => {
                    const selected = Array.from(e.target.files || []);
                    if (selected.length) {
                      await handleFilesUpload(selected);
                    }
                    e.currentTarget.value = '';
                  }}
                />
              </div>

              {uploading && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 6, fontSize: 13 }}>
                    جاري رفع: {uploadFileName || '...'} — {uploadPercent}%
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: 10,
                      background: 'rgba(255,255,255,0.12)',
                      borderRadius: 999
                    }}
                  >
                    <div
                      style={{
                        width: `${uploadPercent}%`,
                        height: '100%',
                        background: '#d4a914',
                        borderRadius: 999,
                        transition: 'width .2s ease'
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="file-grid">
                {files.map((f: any) => (
                  <div key={f.id} className="file-card">
                    <a href={f.file_url || '#'} target="_blank" rel="noreferrer">
                      {f.file_name}
                    </a>

                    <small>{f.mime_type || '-'}</small>
                    <small>{formatSize(Number(f.file_size || 0))}</small>
                    <small>{f.storage_provider === 'r2' ? 'Video / R2' : 'Supabase'}</small>

                    <button
                      className="ghost-btn danger"
                      onClick={async () => {
                        if (confirm('حذف هذا الملف؟')) {
                          await deleteFile(f.id, currentCase.id);
                          if (mountedRef.current) await loadData(currentCase.id);
                        }
                      }}
                    >
                      حذف
                    </button>
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
                <button
                  className="primary-btn"
                  onClick={async () => {
                    if (!noteText.trim()) return;
                    try {
                      await addNote(currentCase.id, noteText);
                      if (mountedRef.current) {
                        setNoteText('');
                        await loadData(currentCase.id);
                        showToast('تمت إضافة الملاحظة ✓');
                      }
                    } catch {
                      showToast('فشل إضافة الملاحظة', 'error');
                    }
                  }}
                >
                  {t('addNote')}
                </button>
              </div>

              <div className="stack">
                {notes.map((n) => (
                  <div key={n.id} className="note-card">
                    <p>{n.content}</p>
                    <small>{new Date(n.created_at).toLocaleString()}</small>
                    <button
                      className="ghost-btn danger"
                      onClick={async () => {
                        if (confirm('حذف هذه الملاحظة؟')) {
                          await deleteNote(n.id, currentCase.id);
                          if (mountedRef.current) await loadData(currentCase.id);
                        }
                      }}
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'activity' && (
            <div className="stack">
              {activity.length === 0 && (
                <p style={{ color: 'var(--muted)', textAlign: 'center' }}>{t('noData')}</p>
              )}
              {activity.map((a) => (
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
                <button
                  className="primary-btn"
                  onClick={() => {
                    copyText(`${window.location.origin}/share/${currentCase.qr?.token}`);
                    showToast('تم نسخ الرابط ✓');
                  }}
                >
                  {t('copyLink')}
                </button>

                <button
                  className="ghost-btn"
                  onClick={() => window.open(`/share/${currentCase.qr?.token}`, '_blank')}
                >
                  {t('openPublicPage')}
                </button>

                <button
                  className="ghost-btn"
                  onClick={async () => {
                    await regenerateQrToken(currentCase.id);
                    if (mountedRef.current) {
                      await loadData(currentCase.id);
                      onRefresh();
                      showToast('تم تجديد QR ✓');
                    }
                  }}
                >
                  {t('regenerateQr')}
                </button>

                <label className="switch-row">
                  <input
                    type="checkbox"
                    checked={!!currentCase.qr?.allow_download}
                    onChange={async (e) => {
                      await updateQrSettings(currentCase.id, { allow_download: e.target.checked });
                      if (mountedRef.current) await loadData(currentCase.id);
                    }}
                  />{' '}
                  {t('allowDownload')}
                </label>

                <label className="switch-row">
                  <input
                    type="checkbox"
                    checked={!!currentCase.qr?.show_client_name}
                    onChange={async (e) => {
                      await updateQrSettings(currentCase.id, { show_client_name: e.target.checked });
                      if (mountedRef.current) await loadData(currentCase.id);
                    }}
                  />{' '}
                  {t('showClientName')}
                </label>

                <label className="switch-row">
                  <input
                    type="checkbox"
                    checked={!!currentCase.qr?.is_active}
                    onChange={async (e) => {
                      await updateQrSettings(currentCase.id, { is_active: e.target.checked });
                      if (mountedRef.current) await loadData(currentCase.id);
                    }}
                  />{' '}
                  مفعّل
                </label>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}