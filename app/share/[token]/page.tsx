import { createServiceClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { PublicShareClient } from "./public-share-client";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const supabase = await createServiceClient();
  const { data: qr } = await supabase
    .from("qr_share_links")
    .select("id, is_active, show_case_title, case_id, cases(title)")
    .eq("token", token)
    .single();

  const title = qr?.show_case_title && (qr.cases as { title?: string } | null)?.title
    ? (qr.cases as { title: string }).title
    : "ملفات القضية";

  return {
    title: `${title} | المحامية مي تونسي`,
    robots: { index: false, follow: false },
  };
}

export default async function PublicSharePage({ params }: Props) {
  const { token } = await params;
  const supabase = await createServiceClient();

  // Load QR link
  const { data: qrLink } = await supabase
    .from("qr_share_links")
    .select("*")
    .eq("token", token)
    .single();

  if (!qrLink) notFound();

  // If inactive, render disabled state
  if (!qrLink.is_active) {
    return (
      <PublicShareClient
        isActive={false}
        files={[]}
        caseTitle={null}
        clientName={null}
        allowDownload={false}
        token={token}
      />
    );
  }

  // Load case + client (only safe fields — no fees, notes, payments)
  const { data: caseData } = await supabase
    .from("cases")
    .select("id, title, clients(full_name)")
    .eq("id", qrLink.case_id)
    .single();

  // Load files
  const { data: files } = await supabase
    .from("case_files")
    .select("id, file_name, file_path, mime_type, file_size, uploaded_at")
    .eq("case_id", qrLink.case_id)
    .order("uploaded_at", { ascending: false });

  // Generate signed URLs server-side
  const filesWithUrls = await Promise.all(
    (files ?? []).map(async (f) => {
      const { data } = await supabase.storage
        .from("case-files")
        .createSignedUrl(f.file_path, 3600);
      return { ...f, signedUrl: data?.signedUrl ?? null };
    })
  );

  const clientName = qrLink.show_client_name
    ? (caseData?.clients as { full_name?: string } | null)?.full_name ?? null
    : null;
  const caseTitle = qrLink.show_case_title ? (caseData?.title ?? null) : null;

  return (
    <PublicShareClient
      isActive={true}
      files={filesWithUrls}
      caseTitle={caseTitle}
      clientName={clientName}
      allowDownload={qrLink.allow_download}
      token={token}
    />
  );
}
