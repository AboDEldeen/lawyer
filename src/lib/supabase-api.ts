import { supabase } from './supabase';
import type {
  ActivityLog,
  CaseFile,
  CaseItem,
  CaseNote,
  Client,
  Payment,
  QrShareLink
} from './types';

function makeToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function logActivity(caseId: string, type: string, description: string) {
  await supabase.from('activity_logs').insert({
    case_id: caseId,
    action_type: type,
    description
  });
}

export async function getDashboardStats() {
  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select('id, status, total_fees');

  if (casesError) throw casesError;

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount');

  if (paymentsError) throw paymentsError;

  const totalCases = cases?.length || 0;
  const openCases = (cases || []).filter((c) => c.status !== 'مغلقة').length;
  const closedCases = (cases || []).filter((c) => c.status === 'مغلقة').length;
  const totalFees = (cases || []).reduce((sum, c) => sum + Number(c.total_fees || 0), 0);
  const totalCollected = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return {
    totalCases,
    openCases,
    closedCases,
    totalFees,
    totalCollected,
    remaining: totalFees - totalCollected
  };
}

export async function getCases() {
  const { data: cases, error: casesError } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false });

  if (casesError) throw casesError;

  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('*');

  if (clientsError) throw clientsError;

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*');

  if (paymentsError) throw paymentsError;

  const { data: files, error: filesError } = await supabase
    .from('case_files')
    .select('*');

  if (filesError) throw filesError;

  const { data: qrLinks, error: qrError } = await supabase
    .from('qr_share_links')
    .select('*');

  if (qrError) throw qrError;

  return (cases || []).map((caseItem: any) => {
    const client = (clients || []).find((c: any) => c.id === caseItem.client_id) || null;
    const casePayments = (payments || []).filter((p: any) => p.case_id === caseItem.id);
    const caseFiles = (files || []).filter((f: any) => f.case_id === caseItem.id);
    const qr = (qrLinks || []).find((q: any) => q.case_id === caseItem.id) || null;

    const totalPaid = casePayments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);

    return {
      ...caseItem,
      client,
      total_paid: totalPaid,
      remaining: Number(caseItem.total_fees || 0) - totalPaid,
      files_count: caseFiles.length,
      qr
    } as CaseItem;
  });
}

export async function createCase(payload: {
  clientName: string;
  phone?: string;
  email?: string;
  title: string;
  case_type: string;
  status: string;
  opening_date: string;
  court?: string;
  case_number?: string;
  total_fees: number;
}) {
  let clientId = '';

  const { data: existingClient } = await supabase
    .from('clients')
    .select('*')
    .eq('full_name', payload.clientName)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id;
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from('clients')
      .insert({
        full_name: payload.clientName,
        phone: payload.phone || null,
        email: payload.email || null
      })
      .select()
      .single();

    if (clientError) throw clientError;
    clientId = newClient.id;
  }

  const { data: newCase, error: caseError } = await supabase
    .from('cases')
    .insert({
      client_id: clientId,
      title: payload.title,
      case_type: payload.case_type,
      status: payload.status,
      opening_date: payload.opening_date,
      court: payload.court || null,
      case_number: payload.case_number || null,
      total_fees: payload.total_fees
    })
    .select()
    .single();

  if (caseError) throw caseError;

  const { error: qrError } = await supabase.from('qr_share_links').insert({
    case_id: newCase.id,
    token: makeToken(),
    is_active: true,
    allow_download: true,
    show_client_name: true,
    show_case_title: true
  });

  if (qrError) throw qrError;

  await logActivity(newCase.id, 'case_created', `تم إنشاء القضية ${payload.title}`);

  return newCase;
}

export async function updateCase(id: string, values: Partial<CaseItem>) {
  const { error } = await supabase
    .from('cases')
    .update({
      title: values.title,
      case_type: values.case_type,
      status: values.status,
      opening_date: values.opening_date,
      court: values.court,
      case_number: values.case_number,
      total_fees: values.total_fees
    })
    .eq('id', id);

  if (error) throw error;

  await logActivity(id, 'case_updated', 'تم تعديل بيانات القضية');
}

export async function getCaseDetails(caseId: string) {
  const { data: caseRow, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .single();

  if (caseError) throw caseError;

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', caseRow.client_id)
    .maybeSingle();

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('*')
    .eq('case_id', caseId)
    .order('payment_date', { ascending: false });

  if (paymentsError) throw paymentsError;

  const { data: files, error: filesError } = await supabase
    .from('case_files')
    .select('*')
    .eq('case_id', caseId)
    .order('uploaded_at', { ascending: false });

  if (filesError) throw filesError;

  const { data: notes, error: notesError } = await supabase
    .from('case_notes')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (notesError) throw notesError;

  const { data: activity, error: activityError } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (activityError) throw activityError;

  const { data: qr } = await supabase
    .from('qr_share_links')
    .select('*')
    .eq('case_id', caseId)
    .maybeSingle();

  const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return {
    caseItem: {
      ...caseRow,
      client: (client as Client) || null,
      total_paid: totalPaid,
      remaining: Number(caseRow.total_fees || 0) - totalPaid,
      qr: (qr as QrShareLink) || null
    } as CaseItem,
    payments: (payments || []) as Payment[],
    files: (files || []) as CaseFile[],
    notes: (notes || []) as CaseNote[],
    activity: (activity || []) as ActivityLog[]
  };
}

export async function addPayment(caseId: string, amount: number, paymentDate: string, note?: string) {
  const { error } = await supabase.from('payments').insert({
    case_id: caseId,
    amount,
    payment_date: paymentDate,
    note: note || null
  });

  if (error) throw error;

  await logActivity(caseId, 'payment_added', `تمت إضافة دفعة بقيمة ${amount}`);
}

export async function deletePayment(id: string, caseId: string) {
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;

  await logActivity(caseId, 'payment_deleted', 'تم حذف دفعة');
}

export async function addNote(caseId: string, content: string) {
  const { error } = await supabase.from('case_notes').insert({
    case_id: caseId,
    content
  });

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
    const ext = file.name.split('.').pop() || '';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${caseId}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from('case-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('case-files')
      .getPublicUrl(filePath);

    const { error: insertError } = await supabase.from('case_files').insert({
      case_id: caseId,
      file_name: file.name,
      file_path: filePath,
      file_url: publicUrlData.publicUrl,
      mime_type: file.type || null,
      file_size: file.size
    });

    if (insertError) throw insertError;
  }

  await logActivity(caseId, 'files_uploaded', `تم رفع ${files.length} ملف(ات)`);
}

export async function deleteFile(id: string, caseId: string) {
  const { data: fileRow, error: fileReadError } = await supabase
    .from('case_files')
    .select('*')
    .eq('id', id)
    .single();

  if (fileReadError) throw fileReadError;

  const { error: storageError } = await supabase.storage
    .from('case-files')
    .remove([fileRow.file_path]);

  if (storageError) throw storageError;

  const { error: deleteError } = await supabase
    .from('case_files')
    .delete()
    .eq('id', id);

  if (deleteError) throw deleteError;

  await logActivity(caseId, 'file_deleted', 'تم حذف ملف');
}

export async function getPublicShare(token: string) {
  const { data: qr, error: qrError } = await supabase
    .from('qr_share_links')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .maybeSingle();

  if (qrError) throw qrError;
  if (!qr) throw new Error('Invalid token');

  const { data: caseItem, error: caseError } = await supabase
    .from('cases')
    .select('*')
    .eq('id', qr.case_id)
    .single();

  if (caseError) throw caseError;

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', caseItem.client_id)
    .maybeSingle();

  const { data: files, error: filesError } = await supabase
    .from('case_files')
    .select('*')
    .eq('case_id', qr.case_id)
    .order('uploaded_at', { ascending: false });

  if (filesError) throw filesError;

  return {
    qr,
    caseItem: {
      ...caseItem,
      client: client || null
    },
    files: (files || []) as CaseFile[]
  };
}

export async function updateQrSettings(caseId: string, settings: Partial<QrShareLink>) {
  const { error } = await supabase
    .from('qr_share_links')
    .update({
      is_active: settings.is_active,
      allow_download: settings.allow_download,
      show_client_name: settings.show_client_name,
      show_case_title: settings.show_case_title
    })
    .eq('case_id', caseId);

  if (error) throw error;
}

export async function regenerateQrToken(caseId: string) {
  const { error } = await supabase
    .from('qr_share_links')
    .update({
      token: makeToken(),
      is_active: true
    })
    .eq('case_id', caseId);

  if (error) throw error;

  await logActivity(caseId, 'qr_regenerated', 'تم إعادة توليد رمز QR');
}

export async function deleteCase(caseId: string) {
  const { data: caseFiles } = await supabase
    .from('case_files')
    .select('file_path')
    .eq('case_id', caseId);

  if (caseFiles?.length) {
    await supabase.storage
      .from('case-files')
      .remove(caseFiles.map((f) => f.file_path));
  }

  const { error } = await supabase.from('cases').delete().eq('id', caseId);
  if (error) throw error;
}