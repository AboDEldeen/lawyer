import { supabase } from './supabase';
import { uid } from './utils';
import type { ActivityLog, CaseFile, CaseItem, CaseNote, Client, Payment, QrShareLink } from './types';

async function ensureQr(caseId: string) {
  const { data: existing } = await supabase.from('qr_share_links').select('*').eq('case_id', caseId).maybeSingle();
  if (existing) return existing as QrShareLink;
  const token = uid();
  const { data, error } = await supabase.from('qr_share_links').insert({ case_id: caseId, token, is_active: true, allow_download: false, show_client_name: true, show_case_title: true }).select().single();
  if (error) throw error;
  return data as QrShareLink;
}

export async function getDashboardStats() {
  const { data: cases, error } = await supabase.from('cases').select('id,status,total_fees,payments(amount)');
  if (error) throw error;
  const rows = cases || [];
  const totalCases = rows.length;
  const openCases = rows.filter((c: any) => c.status !== 'مغلقة').length;
  const closedCases = rows.filter((c: any) => c.status === 'مغلقة').length;
  const totalFees = rows.reduce((sum: number, c: any) => sum + Number(c.total_fees || 0), 0);
  const totalCollected = rows.reduce((sum: number, c: any) => sum + (c.payments || []).reduce((s: number, p: any) => s + Number(p.amount || 0), 0), 0);
  return { totalCases, openCases, closedCases, totalFees, totalCollected, remaining: totalFees - totalCollected };
}

export async function getCases() {
  const { data, error } = await supabase.from('cases').select('*, client:clients(*), payments(amount), case_files(id), qr_share_links(*)').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => {
    const totalPaid = (row.payments || []).reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
    return { ...row, total_paid: totalPaid, remaining: Number(row.total_fees || 0) - totalPaid, files_count: (row.case_files || []).length, qr: row.qr_share_links?.[0] || null } as CaseItem;
  });
}

export async function createCase(payload: { clientName: string; phone?: string; email?: string; title: string; case_type: string; status: string; opening_date: string; court?: string; case_number?: string; total_fees: number; }) {
  let clientId: string | null = null;
  const { data: existing } = await supabase.from('clients').select('*').eq('full_name', payload.clientName).maybeSingle();
  if (existing) clientId = existing.id;
  else {
    const { data: client, error: clientErr } = await supabase.from('clients').insert({ full_name: payload.clientName, phone: payload.phone || null, email: payload.email || null }).select().single();
    if (clientErr) throw clientErr;
    clientId = client.id;
  }
  const { data: row, error } = await supabase.from('cases').insert({ client_id: clientId, title: payload.title, case_type: payload.case_type, status: payload.status, opening_date: payload.opening_date, court: payload.court || null, case_number: payload.case_number || null, total_fees: payload.total_fees }).select().single();
  if (error) throw error;
  await ensureQr(row.id);
  await logActivity(row.id, 'case_created', `تم إنشاء القضية ${payload.title}`);
  return row;
}

export async function updateCase(id: string, values: Partial<CaseItem>) {
  const { error } = await supabase.from('cases').update({ title: values.title, case_type: values.case_type, status: values.status, opening_date: values.opening_date, court: values.court, case_number: values.case_number, total_fees: values.total_fees }).eq('id', id);
  if (error) throw error;
  await logActivity(id, 'case_updated', 'تم تعديل بيانات القضية');
}

export async function getCaseDetails(caseId: string) {
  const [{ data: caseRow, error: caseErr }, { data: payments, error: pErr }, { data: files, error: fErr }, { data: notes, error: nErr }, { data: activity, error: aErr }] = await Promise.all([
    supabase.from('cases').select('*, client:clients(*), qr_share_links(*)').eq('id', caseId).single(),
    supabase.from('payments').select('*').eq('case_id', caseId).order('payment_date', { ascending: false }),
    supabase.from('case_files').select('*').eq('case_id', caseId).order('uploaded_at', { ascending: false }),
    supabase.from('case_notes').select('*').eq('case_id', caseId).order('created_at', { ascending: false }),
    supabase.from('activity_logs').select('*').eq('case_id', caseId).order('created_at', { ascending: false })
  ]);
  if (caseErr || pErr || fErr || nErr || aErr) throw caseErr || pErr || fErr || nErr || aErr;
  const totalPaid = (payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
  return { caseItem: { ...caseRow, total_paid: totalPaid, remaining: Number(caseRow.total_fees || 0) - totalPaid, qr: caseRow.qr_share_links?.[0] || null } as CaseItem, payments: (payments || []) as Payment[], files: (files || []) as CaseFile[], notes: (notes || []) as CaseNote[], activity: (activity || []) as ActivityLog[] };
}

export async function addPayment(caseId: string, amount: number, paymentDate: string, note?: string) {
  const { error } = await supabase.from('payments').insert({ case_id: caseId, amount, payment_date: paymentDate, note: note || null });
  if (error) throw error;
  await logActivity(caseId, 'payment_added', `تمت إضافة دفعة بقيمة ${amount}`);
}

export async function deletePayment(id: string, caseId: string) {
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
  await logActivity(caseId, 'payment_deleted', 'تم حذف دفعة');
}

export async function addNote(caseId: string, content: string) {
  const { error } = await supabase.from('case_notes').insert({ case_id: caseId, content });
  if (error) throw error;
  await logActivity(caseId, 'note_added', 'تمت إضافة ملاحظة');
}

export async function deleteNote(id: string, caseId: string) {
  const { error } = await supabase.from('case_notes').delete().eq('id', id);
  if (error) throw error;
  await logActivity(caseId, 'note_deleted', 'تم حذف ملاحظة');
}

export async function uploadFiles(caseId: string, files: File[]) {
  for (const file of files) {
    const path = `${caseId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage.from('case-files').upload(path, file, { upsert: true });
    if (uploadErr) throw uploadErr;
    const { data } = supabase.storage.from('case-files').getPublicUrl(path);
    const { error } = await supabase.from('case_files').insert({ case_id: caseId, file_name: file.name, file_path: path, file_url: data.publicUrl, mime_type: file.type, file_size: file.size });
    if (error) throw error;
  }
  await logActivity(caseId, 'files_uploaded', 'تم رفع ملفات جديدة');
}

export async function deleteFile(file: CaseFile) {
  const { error: storageErr } = await supabase.storage.from('case-files').remove([file.file_path]);
  if (storageErr) throw storageErr;
  const { error } = await supabase.from('case_files').delete().eq('id', file.id);
  if (error) throw error;
  await logActivity(file.case_id, 'file_deleted', `تم حذف الملف ${file.file_name}`);
}

export async function updateQrSettings(caseId: string, values: Partial<QrShareLink>) {
  const qr = await ensureQr(caseId);
  const { error } = await supabase.from('qr_share_links').update(values).eq('id', qr.id);
  if (error) throw error;
  await logActivity(caseId, 'qr_updated', 'تم تحديث إعدادات QR');
}

export async function regenerateQr(caseId: string) {
  const qr = await ensureQr(caseId);
  const { data, error } = await supabase.from('qr_share_links').update({ token: uid(), is_active: true }).eq('id', qr.id).select().single();
  if (error) throw error;
  await logActivity(caseId, 'qr_regenerated', 'تم تجديد QR');
  return data as QrShareLink;
}

export async function getPublicShare(token: string) {
  const { data: qr, error } = await supabase.from('qr_share_links').select('*, case:cases(*, client:clients(*))').eq('token', token).maybeSingle();
  if (error) throw error;
  if (!qr) return null;
  const { data: files, error: filesErr } = await supabase.from('case_files').select('*').eq('case_id', qr.case_id).order('uploaded_at', { ascending: false });
  if (filesErr) throw filesErr;
  return { qr: qr as any, files: (files || []) as CaseFile[] };
}

export async function logActivity(caseId: string, actionType: string, description: string) {
  await supabase.from('activity_logs').insert({ case_id: caseId, action_type: actionType, description });
}
