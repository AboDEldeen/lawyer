import { uid } from './utils';
import type { ActivityLog, CaseFile, CaseItem, CaseNote, Client, Payment, QrShareLink } from './types';

const STORAGE_KEYS = {
  cases: 'lawyer-cases',
  clients: 'lawyer-clients',
  payments: 'lawyer-payments',
  notes: 'lawyer-notes',
  files: 'lawyer-files',
  qr: 'lawyer-qr',
  activity: 'lawyer-activity'
};

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export async function getDashboardStats() {
  const cases = getStorage<any[]>(STORAGE_KEYS.cases, []);
  const payments = getStorage<Payment[]>(STORAGE_KEYS.payments, []);
  
  const totalCases = cases.length;
  const openCases = cases.filter((c) => c.status !== 'مغلقة').length;
  const closedCases = cases.filter((c) => c.status === 'مغلقة').length;
  const totalFees = cases.reduce((sum, c) => sum + Number(c.total_fees || 0), 0);
  const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  
  return { totalCases, openCases, closedCases, totalFees, totalCollected, remaining: totalFees - totalCollected };
}

export async function getCases() {
  const cases = getStorage<any[]>(STORAGE_KEYS.cases, []);
  const clients = getStorage<Client[]>(STORAGE_KEYS.clients, []);
  const payments = getStorage<Payment[]>(STORAGE_KEYS.payments, []);
  const files = getStorage<CaseFile[]>(STORAGE_KEYS.files, []);
  const qrLinks = getStorage<QrShareLink[]>(STORAGE_KEYS.qr, []);
  
  return cases.map((caseItem) => {
    const client = clients.find((c) => c.id === caseItem.client_id) || null;
    const casePay = payments.filter((p) => p.case_id === caseItem.id);
    const caseFiles = files.filter((f) => f.case_id === caseItem.id);
    const totalPaid = casePay.reduce((s, p) => s + Number(p.amount || 0), 0);
    const qr = qrLinks.find((q) => q.case_id === caseItem.id) || null;
    
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
  const clients = getStorage<Client[]>(STORAGE_KEYS.clients, []);
  const cases = getStorage<any[]>(STORAGE_KEYS.cases, []);
  const qrLinks = getStorage<QrShareLink[]>(STORAGE_KEYS.qr, []);
  
  let clientId: string;
  const existing = clients.find((c) => c.full_name === payload.clientName);
  
  if (existing) {
    clientId = existing.id;
  } else {
    const newClient: Client = {
      id: uid(),
      full_name: payload.clientName,
      phone: payload.phone || null,
      email: payload.email || null,
      created_at: new Date().toISOString()
    };
    clients.push(newClient);
    setStorage(STORAGE_KEYS.clients, clients);
    clientId = newClient.id;
  }
  
  const newCase = {
    id: uid(),
    client_id: clientId,
    title: payload.title,
    case_type: payload.case_type,
    status: payload.status,
    opening_date: payload.opening_date,
    court: payload.court || null,
    case_number: payload.case_number || null,
    total_fees: payload.total_fees,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  cases.push(newCase);
  setStorage(STORAGE_KEYS.cases, cases);
  
  // Create QR link
  const qrLink: QrShareLink = {
    id: uid(),
    case_id: newCase.id,
    token: uid(),
    is_active: true,
    allow_download: false,
    show_client_name: true,
    show_case_title: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  qrLinks.push(qrLink);
  setStorage(STORAGE_KEYS.qr, qrLinks);
  
  // Log activity
  await logActivity(newCase.id, 'case_created', `تم إنشاء القضية ${payload.title}`);
  
  return newCase;
}

export async function updateCase(id: string, values: Partial<CaseItem>) {
  const cases = getStorage<any[]>(STORAGE_KEYS.cases, []);
  const caseIndex = cases.findIndex((c) => c.id === id);
  
  if (caseIndex !== -1) {
    cases[caseIndex] = {
      ...cases[caseIndex],
      title: values.title ?? cases[caseIndex].title,
      case_type: values.case_type ?? cases[caseIndex].case_type,
      status: values.status ?? cases[caseIndex].status,
      opening_date: values.opening_date ?? cases[caseIndex].opening_date,
      court: values.court ?? cases[caseIndex].court,
      case_number: values.case_number ?? cases[caseIndex].case_number,
      total_fees: values.total_fees ?? cases[caseIndex].total_fees,
      updated_at: new Date().toISOString()
    };
    setStorage(STORAGE_KEYS.cases, cases);
    await logActivity(id, 'case_updated', 'تم تعديل بيانات القضية');
  }
}

export async function getCaseDetails(caseId: string) {
  const cases = getStorage<any[]>(STORAGE_KEYS.cases, []);
  const clients = getStorage<Client[]>(STORAGE_KEYS.clients, []);
  const payments = getStorage<Payment[]>(STORAGE_KEYS.payments, []);
  const files = getStorage<CaseFile[]>(STORAGE_KEYS.files, []);
  const notes = getStorage<CaseNote[]>(STORAGE_KEYS.notes, []);
  const activity = getStorage<ActivityLog[]>(STORAGE_KEYS.activity, []);
  const qrLinks = getStorage<QrShareLink[]>(STORAGE_KEYS.qr, []);
  
  const caseRow = cases.find((c) => c.id === caseId);
  if (!caseRow) throw new Error('Case not found');
  
  const client = clients.find((c) => c.id === caseRow.client_id) || null;
  const casePay = payments.filter((p) => p.case_id === caseId);
  const caseFiles = files.filter((f) => f.case_id === caseId);
  const caseNotes = notes.filter((n) => n.case_id === caseId);
  const caseActivity = activity.filter((a) => a.case_id === caseId);
  const caseQr = qrLinks.find((q) => q.case_id === caseId);
  
  const totalPaid = casePay.reduce((s, p) => s + Number(p.amount || 0), 0);
  
  return {
    caseItem: {
      ...caseRow,
      client: client,
      total_paid: totalPaid,
      remaining: Number(caseRow.total_fees || 0) - totalPaid,
      qr: caseQr || null
    } as CaseItem,
    payments: casePay as Payment[],
    files: caseFiles as CaseFile[],
    notes: caseNotes as CaseNote[],
    activity: caseActivity as ActivityLog[]
  };
}

export async function addPayment(caseId: string, amount: number, paymentDate: string, note?: string) {
  const payments = getStorage<Payment[]>(STORAGE_KEYS.payments, []);
  
  const newPayment: Payment = {
    id: uid(),
    case_id: caseId,
    amount,
    payment_date: paymentDate,
    note: note || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  payments.push(newPayment);
  setStorage(STORAGE_KEYS.payments, payments);
  await logActivity(caseId, 'payment_added', `تمت إضافة دفعة بقيمة ${amount}`);
}

export async function deletePayment(id: string, caseId: string) {
  const payments = getStorage<Payment[]>(STORAGE_KEYS.payments, []);
  const filtered = payments.filter((p) => p.id !== id);
  setStorage(STORAGE_KEYS.payments, filtered);
  await logActivity(caseId, 'payment_deleted', 'تم حذف دفعة');
}

export async function addNote(caseId: string, content: string) {
  const notes = getStorage<CaseNote[]>(STORAGE_KEYS.notes, []);
  
  const newNote: CaseNote = {
    id: uid(),
    case_id: caseId,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  notes.push(newNote);
  setStorage(STORAGE_KEYS.notes, notes);
  await logActivity(caseId, 'note_added', 'تمت إضافة ملاحظة');
}

export async function deleteNote(id: string, caseId: string) {
  const notes = getStorage<CaseNote[]>(STORAGE_KEYS.notes, []);
  const filtered = notes.filter((n) => n.id !== id);
  setStorage(STORAGE_KEYS.notes, filtered);
  await logActivity(caseId, 'note_deleted', 'تم حذف ملاحظة');
}

export async function uploadFiles(caseId: string, files: File[]) {
  const caseFiles = getStorage<CaseFile[]>(STORAGE_KEYS.files, []);
  
  for (const file of files) {
    const newFile: CaseFile = {
      id: uid(),
      case_id: caseId,
      file_name: file.name,
      file_path: `${caseId}/${Date.now()}-${file.name}`,
      file_url: URL.createObjectURL(file),
      mime_type: file.type,
      file_size: file.size,
      uploaded_at: new Date().toISOString()
    };
    caseFiles.push(newFile);
  }
  
  setStorage(STORAGE_KEYS.files, caseFiles);
  await logActivity(caseId, 'files_uploaded', `تم رفع ${files.length} ملف(ات)`);
}

export async function deleteFile(id: string, caseId: string) {
  const files = getStorage<CaseFile[]>(STORAGE_KEYS.files, []);
  const filtered = files.filter((f) => f.id !== id);
  setStorage(STORAGE_KEYS.files, filtered);
  await logActivity(caseId, 'file_deleted', 'تم حذف ملف');
}

export async function logActivity(caseId: string, type: string, description: string) {
  const activity = getStorage<ActivityLog[]>(STORAGE_KEYS.activity, []);
  
  const newActivity: ActivityLog = {
    id: uid(),
    case_id: caseId,
    type,
    description,
    created_at: new Date().toISOString()
  };
  
  activity.push(newActivity);
  setStorage(STORAGE_KEYS.activity, activity);
}

export async function getPublicShare(token: string) {
  const qrLinks = getStorage<QrShareLink[]>(STORAGE_KEYS.qr, []);
  const qr = qrLinks.find((q) => q.token === token && q.is_active);
  
  if (!qr) throw new Error('Invalid token');
  
  const cases = getStorage<any[]>(STORAGE_KEYS.cases, []);
  const clients = getStorage<Client[]>(STORAGE_KEYS.clients, []);
  const files = getStorage<CaseFile[]>(STORAGE_KEYS.files, []);
  
  const caseItem = cases.find((c) => c.id === qr.case_id);
  if (!caseItem) throw new Error('Case not found');
  
  const client = clients.find((c) => c.id === caseItem.client_id) || null;
  const caseFiles = files.filter((f) => f.case_id === qr.case_id);
  
  return { qr, caseItem: { ...caseItem, client }, files: caseFiles };
}

export async function updateQrSettings(caseId: string, settings: Partial<QrShareLink>) {
  const qrLinks = getStorage<QrShareLink[]>(STORAGE_KEYS.qr, []);
  const qrIndex = qrLinks.findIndex((q) => q.case_id === caseId);
  
  if (qrIndex !== -1) {
    qrLinks[qrIndex] = { ...qrLinks[qrIndex], ...settings };
    setStorage(STORAGE_KEYS.qr, qrLinks);
  }
}

export async function regenerateQrToken(caseId: string) {
  const qrLinks = getStorage<QrShareLink[]>(STORAGE_KEYS.qr, []);
  const qrIndex = qrLinks.findIndex((q) => q.case_id === caseId);
  
  if (qrIndex !== -1) {
    qrLinks[qrIndex].token = uid();
    setStorage(STORAGE_KEYS.qr, qrLinks);
  }
}

export async function deleteCase(caseId: string) {
  const cases = getStorage<any[]>(STORAGE_KEYS.cases, []);
  const payments = getStorage<Payment[]>(STORAGE_KEYS.payments, []);
  const files = getStorage<CaseFile[]>(STORAGE_KEYS.files, []);
  const notes = getStorage<CaseNote[]>(STORAGE_KEYS.notes, []);
  const qrLinks = getStorage<QrShareLink[]>(STORAGE_KEYS.qr, []);
  const activity = getStorage<ActivityLog[]>(STORAGE_KEYS.activity, []);
  
  // Delete case and all related data
  const filteredCases = cases.filter((c) => c.id !== caseId);
  const filteredPayments = payments.filter((p) => p.case_id !== caseId);
  const filteredFiles = files.filter((f) => f.case_id !== caseId);
  const filteredNotes = notes.filter((n) => n.case_id !== caseId);
  const filteredQr = qrLinks.filter((q) => q.case_id !== caseId);
  const filteredActivity = activity.filter((a) => a.case_id !== caseId);
  
  setStorage(STORAGE_KEYS.cases, filteredCases);
  setStorage(STORAGE_KEYS.payments, filteredPayments);
  setStorage(STORAGE_KEYS.files, filteredFiles);
  setStorage(STORAGE_KEYS.notes, filteredNotes);
  setStorage(STORAGE_KEYS.qr, filteredQr);
  setStorage(STORAGE_KEYS.activity, filteredActivity);
}
