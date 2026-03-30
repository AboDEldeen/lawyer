import { createClient } from "@/lib/supabase/client";
import type {
  Case,
  CaseWithClient,
  Client,
  Payment,
  CaseFile,
  CaseNote,
  QrShareLink,
  ActivityLog,
} from "@/types/database";

const supabase = createClient();

// ─── Cases ────────────────────────────────────────────────────────────────────

export async function getCases(filters?: {
  status?: string;
  case_type?: string;
  search?: string;
  sort?: string;
}): Promise<CaseWithClient[]> {
  let query = supabase
    .from("cases")
    .select(
      `*, clients(id, full_name, phone, email, reference_number)`
    )
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.case_type && filters.case_type !== "all") {
    query = query.eq("case_type", filters.case_type);
  }
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,case_number.ilike.%${filters.search}%,court.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as CaseWithClient[]) ?? [];
}

export async function getCaseById(id: string) {
  const { data, error } = await supabase
    .from("cases")
    .select(`*, clients(id, full_name, phone, email, reference_number)`)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as CaseWithClient;
}

export async function createCase(payload: {
  client: {
    full_name: string;
    phone?: string;
    email?: string;
    reference_number?: string;
  };
  case: {
    title: string;
    case_type: string;
    status: string;
    opening_date: string;
    court?: string;
    case_number?: string;
    total_fees: number;
    description?: string;
  };
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Upsert client by reference_number or create new
  let clientId: string;
  if (payload.client.reference_number) {
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("reference_number", payload.client.reference_number)
      .single();
    if (existing) {
      clientId = existing.id;
    } else {
      const { data: newClient, error: clientError } = await supabase
        .from("clients")
        .insert({ ...payload.client, created_by: user?.id })
        .select("id")
        .single();
      if (clientError) throw clientError;
      clientId = newClient.id;
    }
  } else {
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({ ...payload.client, created_by: user?.id })
      .select("id")
      .single();
    if (clientError) throw clientError;
    clientId = newClient.id;
  }

  const { data: newCase, error: caseError } = await supabase
    .from("cases")
    .insert({ ...payload.case, client_id: clientId, created_by: user?.id })
    .select(`*, clients(id, full_name, phone, email, reference_number)`)
    .single();
  if (caseError) throw caseError;

  // Log activity
  await logActivity({
    case_id: newCase.id,
    action_type: "case_created",
    description: `Case created: ${newCase.title}`,
    description_ar: `تم إنشاء القضية: ${newCase.title}`,
  });

  return newCase as CaseWithClient;
}

export async function updateCase(
  id: string,
  updates: Partial<Case>
) {
  const { data, error } = await supabase
    .from("cases")
    .update(updates)
    .eq("id", id)
    .select(`*, clients(id, full_name, phone, email, reference_number)`)
    .single();
  if (error) throw error;

  await logActivity({
    case_id: id,
    action_type: "case_updated",
    description: `Case updated`,
    description_ar: `تم تحديث بيانات القضية`,
  });

  return data as CaseWithClient;
}

export async function deleteCase(id: string) {
  const { error } = await supabase.from("cases").delete().eq("id", id);
  if (error) throw error;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function getPayments(caseId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("case_id", caseId)
    .order("payment_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addPayment(payload: {
  case_id: string;
  amount: number;
  payment_date: string;
  note?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("payments")
    .insert({ ...payload, created_by: user?.id })
    .select()
    .single();
  if (error) throw error;

  await logActivity({
    case_id: payload.case_id,
    action_type: "payment_added",
    description: `Payment added: ${payload.amount} EGP`,
    description_ar: `تمت إضافة دفعة: ${payload.amount} ج.م`,
  });

  return data as Payment;
}

export async function updatePayment(
  id: string,
  updates: { amount?: number; payment_date?: string; note?: string }
) {
  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function deletePayment(id: string, caseId: string) {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw error;

  await logActivity({
    case_id: caseId,
    action_type: "payment_deleted",
    description: "Payment deleted",
    description_ar: "تم حذف دفعة",
  });
}

// ─── Files ────────────────────────────────────────────────────────────────────

export async function getCaseFiles(caseId: string): Promise<CaseFile[]> {
  const { data, error } = await supabase
    .from("case_files")
    .select("*")
    .eq("case_id", caseId)
    .order("uploaded_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function uploadCaseFile(
  caseId: string,
  file: File
): Promise<CaseFile> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const ext = file.name.split(".").pop();
  const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `case-files/${caseId}/${uniqueName}`;

  const { error: uploadError } = await supabase.storage
    .from("case-files")
    .upload(filePath, file, { contentType: file.type, upsert: false });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from("case-files")
    .getPublicUrl(filePath);

  const { data, error } = await supabase
    .from("case_files")
    .insert({
      case_id: caseId,
      file_name: file.name,
      file_path: filePath,
      file_url: urlData.publicUrl,
      mime_type: file.type,
      file_size: file.size,
      uploaded_by: user?.id,
    })
    .select()
    .single();
  if (error) throw error;

  await logActivity({
    case_id: caseId,
    action_type: "file_uploaded",
    description: `File uploaded: ${file.name}`,
    description_ar: `تم رفع ملف: ${file.name}`,
  });

  return data as CaseFile;
}

export async function deleteCaseFile(file: CaseFile) {
  await supabase.storage.from("case-files").remove([file.file_path]);

  const { error } = await supabase
    .from("case_files")
    .delete()
    .eq("id", file.id);
  if (error) throw error;

  await logActivity({
    case_id: file.case_id,
    action_type: "file_deleted",
    description: `File deleted: ${file.file_name}`,
    description_ar: `تم حذف ملف: ${file.file_name}`,
  });
}

export async function getSignedFileUrl(
  filePath: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("case-files")
    .createSignedUrl(filePath, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function getCaseNotes(caseId: string): Promise<CaseNote[]> {
  const { data, error } = await supabase
    .from("case_notes")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addNote(caseId: string, content: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("case_notes")
    .insert({ case_id: caseId, content, created_by: user?.id })
    .select()
    .single();
  if (error) throw error;

  await logActivity({
    case_id: caseId,
    action_type: "note_added",
    description: "Note added",
    description_ar: "تمت إضافة ملاحظة",
  });

  return data as CaseNote;
}

export async function updateNote(id: string, content: string) {
  const { data, error } = await supabase
    .from("case_notes")
    .update({ content })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CaseNote;
}

export async function deleteNote(id: string, caseId: string) {
  const { error } = await supabase.from("case_notes").delete().eq("id", id);
  if (error) throw error;

  await logActivity({
    case_id: caseId,
    action_type: "note_deleted",
    description: "Note deleted",
    description_ar: "تم حذف ملاحظة",
  });
}

// ─── QR ───────────────────────────────────────────────────────────────────────

export async function getQrLink(caseId: string): Promise<QrShareLink | null> {
  const { data } = await supabase
    .from("qr_share_links")
    .select("*")
    .eq("case_id", caseId)
    .single();
  return data ?? null;
}

export async function updateQrSettings(
  id: string,
  updates: Partial<QrShareLink>
) {
  const { data, error } = await supabase
    .from("qr_share_links")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as QrShareLink;
}

export async function regenerateQrToken(caseId: string): Promise<QrShareLink> {
  // Generate a new token by doing a random hex
  const newToken = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const { data, error } = await supabase
    .from("qr_share_links")
    .update({ token: newToken, is_active: true })
    .eq("case_id", caseId)
    .select()
    .single();
  if (error) throw error;

  await logActivity({
    case_id: caseId,
    action_type: "qr_regenerated",
    description: "QR code regenerated",
    description_ar: "تم إعادة توليد رمز QR",
  });

  return data as QrShareLink;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export async function getActivityLogs(caseId: string): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

async function logActivity(payload: {
  case_id: string;
  action_type: string;
  description: string;
  description_ar?: string;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.from("activity_logs").insert({
    ...payload,
    created_by: user?.id,
  });
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const { data: cases, error } = await supabase
    .from("cases")
    .select("id, status, total_fees");
  if (error) throw error;

  const { data: payments } = await supabase
    .from("payments")
    .select("amount");

  const total = cases?.length ?? 0;
  const open = cases?.filter((c) => c.status === "open").length ?? 0;
  const closed = cases?.filter((c) => c.status === "closed").length ?? 0;
  const pending = cases?.filter((c) => c.status === "pending").length ?? 0;
  const totalFees = cases?.reduce((s, c) => s + (c.total_fees ?? 0), 0) ?? 0;
  const totalCollected =
    payments?.reduce((s, p) => s + (p.amount ?? 0), 0) ?? 0;

  return {
    total,
    open,
    closed,
    pending,
    totalFees,
    totalCollected,
    remaining: totalFees - totalCollected,
  };
}
