export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "admin" | "staff";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: "admin" | "staff";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: "admin" | "staff";
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          email: string | null;
          reference_number: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone?: string | null;
          email?: string | null;
          reference_number?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          email?: string | null;
          reference_number?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      cases: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          case_type: string;
          status: "open" | "closed" | "pending" | "archived";
          opening_date: string;
          court: string | null;
          case_number: string | null;
          total_fees: number;
          description: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          case_type: string;
          status?: "open" | "closed" | "pending" | "archived";
          opening_date?: string;
          court?: string | null;
          case_number?: string | null;
          total_fees?: number;
          description?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          title?: string;
          case_type?: string;
          status?: "open" | "closed" | "pending" | "archived";
          opening_date?: string;
          court?: string | null;
          case_number?: string | null;
          total_fees?: number;
          description?: string | null;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          case_id: string;
          amount: number;
          payment_date: string;
          note: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          amount: number;
          payment_date?: string;
          note?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          payment_date?: string;
          note?: string | null;
          updated_at?: string;
        };
      };
      case_files: {
        Row: {
          id: string;
          case_id: string;
          file_name: string;
          file_path: string;
          file_url: string;
          mime_type: string | null;
          file_size: number | null;
          uploaded_by: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          file_name: string;
          file_path: string;
          file_url: string;
          mime_type?: string | null;
          file_size?: number | null;
          uploaded_by?: string | null;
          uploaded_at?: string;
        };
        Update: {
          file_name?: string;
        };
      };
      case_notes: {
        Row: {
          id: string;
          case_id: string;
          content: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          content: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
      };
      qr_share_links: {
        Row: {
          id: string;
          case_id: string;
          token: string;
          is_active: boolean;
          allow_download: boolean;
          show_client_name: boolean;
          show_case_title: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          token?: string;
          is_active?: boolean;
          allow_download?: boolean;
          show_client_name?: boolean;
          show_case_title?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          token?: string;
          is_active?: boolean;
          allow_download?: boolean;
          show_client_name?: boolean;
          show_case_title?: boolean;
          updated_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          case_id: string | null;
          action_type: string;
          description: string;
          description_ar: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id?: string | null;
          action_type: string;
          description: string;
          description_ar?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Case = Database["public"]["Tables"]["cases"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type CaseFile = Database["public"]["Tables"]["case_files"]["Row"];
export type CaseNote = Database["public"]["Tables"]["case_notes"]["Row"];
export type QrShareLink = Database["public"]["Tables"]["qr_share_links"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];

// Extended types with joins
export type CaseWithClient = Case & {
  clients: Pick<Client, "id" | "full_name" | "phone" | "email" | "reference_number">;
};

export type CaseWithDetails = CaseWithClient & {
  payments: Payment[];
  case_files: CaseFile[];
  case_notes: CaseNote[];
  qr_share_links: QrShareLink[];
  activity_logs: ActivityLog[];
};

export type CaseStatus = "open" | "closed" | "pending" | "archived";
