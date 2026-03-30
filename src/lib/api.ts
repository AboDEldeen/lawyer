import { supabase } from './supabase';

function makeToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function uploadFiles(caseId: string, files: File[]) {
  for (const file of files) {
    const ext = file.name.split('.').pop() || '';
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `${caseId}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from('case-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('case-files')
      .getPublicUrl(filePath);

    await supabase.from('case_files').insert({
      case_id: caseId,
      file_name: file.name,
      file_path: filePath,
      file_url: publicUrlData.publicUrl
    });
  }
}

export async function getPublicShare(token: string) {
  const { data: qr } = await supabase
    .from('qr_share_links')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  const { data: caseItem } = await supabase
    .from('cases')
    .select('*')
    .eq('id', qr.case_id)
    .single();

  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', caseItem.client_id)
    .single();

  const { data: files } = await supabase
    .from('case_files')
    .select('*')
    .eq('case_id', qr.case_id);

  return {
    qr,
    caseItem: {
      ...caseItem,
      client
    },
    files
  };
}
