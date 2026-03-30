import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicShare } from '@/lib/api';
import type { CaseFile } from '@/lib/types';

export function PublicSharePage() {
  const { token = '' } = useParams();
  const [state, setState] = useState<{ loading: boolean; valid: boolean; title?: string; clientName?: string; allowDownload?: boolean; files: CaseFile[] }>({ loading: true, valid: false, files: [] });
  useEffect(() => {
    (async () => {
      const data = await getPublicShare(token);
      if (!data || !data.qr.is_active) return setState({ loading: false, valid: false, files: [] });
      setState({ loading: false, valid: true, title: data.qr.show_case_title ? data.caseItem?.title : undefined, clientName: data.qr.show_client_name ? data.caseItem?.client?.full_name : undefined, allowDownload: data.qr.allow_download, files: data.files });
    })();
  }, [token]);
  if (state.loading) return <div className="public-wrap">Loading...</div>;
  if (!state.valid) return <div className="public-wrap"><div className="login-card"><h1>الرابط غير متاح</h1><p>QR غير مفعل أو غير موجود.</p></div></div>;
  return <div className="public-wrap"><div className="public-card"><h1>{state.title || 'Case Files'}</h1>{state.clientName && <p>{state.clientName}</p>}<div className="file-grid">{state.files.map(f => <div key={f.id} className="file-card"><a href={f.file_url || '#'} target="_blank">{f.file_name}</a>{state.allowDownload && <a href={f.file_url || '#'} download={f.file_name}>Download</a>}</div>)}</div></div></div>;
}
