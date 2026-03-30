-- ============================================================
-- RLS POLICIES — Lawyer Mai Tunsy
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- CLIENTS POLICIES
-- ============================================================
CREATE POLICY "Authenticated users can view all clients"
  ON clients FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert clients"
  ON clients FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update clients"
  ON clients FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete clients"
  ON clients FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- CASES POLICIES
-- ============================================================
CREATE POLICY "Authenticated users can view all cases"
  ON cases FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert cases"
  ON cases FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update cases"
  ON cases FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete cases"
  ON cases FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- PAYMENTS POLICIES
-- ============================================================
CREATE POLICY "Authenticated users can view all payments"
  ON payments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert payments"
  ON payments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update payments"
  ON payments FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete payments"
  ON payments FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- CASE FILES POLICIES
-- ============================================================
CREATE POLICY "Authenticated users can view all case files"
  ON case_files FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert case files"
  ON case_files FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete case files"
  ON case_files FOR DELETE
  USING (auth.role() = 'authenticated');

-- Public can read case files IF they have a valid active QR token
-- This is handled via the API route with service role key, not direct RLS

-- ============================================================
-- CASE NOTES POLICIES
-- ============================================================
CREATE POLICY "Authenticated users can view all case notes"
  ON case_notes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert case notes"
  ON case_notes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update case notes"
  ON case_notes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete case notes"
  ON case_notes FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- QR SHARE LINKS POLICIES
-- ============================================================
CREATE POLICY "Authenticated users can view qr links"
  ON qr_share_links FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update qr links"
  ON qr_share_links FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert qr links"
  ON qr_share_links FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Public can read qr_share_links (only token + is_active — secure data loading done in API)
CREATE POLICY "Public can read active qr share links by token"
  ON qr_share_links FOR SELECT
  USING (is_active = TRUE);

-- ============================================================
-- ACTIVITY LOGS POLICIES
-- ============================================================
CREATE POLICY "Authenticated users can view all activity logs"
  ON activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- STORAGE POLICIES (for case-files bucket)
-- ============================================================
-- Run these in the Supabase Dashboard → Storage → Policies
-- OR via SQL:

-- Allow authenticated users to upload
-- INSERT policy: bucket_id = 'case-files' AND auth.role() = 'authenticated'

-- Allow authenticated users to read
-- SELECT policy: bucket_id = 'case-files' AND auth.role() = 'authenticated'

-- Allow authenticated users to delete
-- DELETE policy: bucket_id = 'case-files' AND auth.role() = 'authenticated'

-- Public files are served via signed URLs generated server-side
