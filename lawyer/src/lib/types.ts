export type CaseStatus = 'مفتوحة' | 'جارية' | 'مؤجلة' | 'منتهية' | 'مغلقة';
export type CaseType = 'جنح' | 'جنايات' | 'مدني' | 'تجاري' | 'أسرة' | 'عمالي' | 'إداري' | 'مستعجل' | 'أحوال شخصية' | 'اقتصادي';

export type Client = { id: string; full_name: string; phone?: string | null; email?: string | null; reference_number?: string | null; notes?: string | null; created_at: string; updated_at: string; };
export type CaseItem = { id: string; client_id: string; title: string; case_type: CaseType; status: CaseStatus; opening_date: string; court?: string | null; case_number?: string | null; total_fees: number; created_at: string; updated_at: string; client?: Client; total_paid?: number; remaining?: number; files_count?: number; qr?: QrShareLink | null; };
export type Payment = { id: string; case_id: string; amount: number; payment_date: string; note?: string | null; created_at: string; updated_at: string; };
export type CaseFile = { id: string; case_id: string; file_name: string; file_path: string; file_url?: string | null; mime_type?: string | null; file_size?: number | null; uploaded_at: string; };
export type CaseNote = { id: string; case_id: string; content: string; created_at: string; updated_at: string; };
export type ActivityLog = { id: string; case_id: string; action_type: string; description: string; created_at: string; };
export type QrShareLink = { id: string; case_id: string; token: string; is_active: boolean; allow_download: boolean; show_client_name: boolean; show_case_title: boolean; created_at: string; updated_at: string; };
