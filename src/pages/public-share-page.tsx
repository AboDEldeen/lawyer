import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicShare } from '@/lib/api';
import type { CaseFile } from '@/lib/types';

type ShareState = {
  loading: boolean;
  valid: boolean;
  title?: string;
  caseType?: string;
  clientName?: string;
  allowDownload?: boolean;
  files: CaseFile[];
};

function getFileExtension(name: string) {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

function getFileKind(file: CaseFile) {
  const mime = (file.mime_type || '').toLowerCase();
  const ext = getFileExtension(file.file_name);

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
    return 'image';
  }

  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'm4v', 'avi'].includes(ext)) {
    return 'video';
  }

  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }

  return 'file';
}

function formatFileSize(size?: number | null) {
  if (!size) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = size;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function PublicSharePage() {
  const { token = '' } = useParams();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [state, setState] = useState<ShareState>({
    loading: true,
    valid: false,
    files: []
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await getPublicShare(token);

        if (!mounted) return;

        if (!data || !data.qr?.is_active) {
          setState({ loading: false, valid: false, files: [] });
          return;
        }

        setState({
          loading: false,
          valid: true,
          title: data.qr.show_case_title ? data.caseItem?.title : undefined,
          caseType: data.caseItem?.case_type,
          clientName: data.qr.show_client_name ? data.caseItem?.client?.full_name : undefined,
          allowDownload: data.qr.allow_download,
          files: data.files || []
        });
      } catch (error) {
        console.error('Public share error:', error);
        if (mounted) {
          setState({ loading: false, valid: false, files: [] });
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  const files = useMemo(() => state.files || [], [state.files]);

  if (state.loading) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>جاري التحميل...</div>
      </div>
    );
  }

  if (!state.valid) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={{ marginTop: 0 }}>الرابط غير متاح</h1>
          <p style={{ marginBottom: 0 }}>الرابط غير موجود أو لا توجد بيانات متاحة للمشاركة.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: 1100 }}>
        <div style={headerCardStyle}>
          <div>
            <div style={labelStyle}>صاحب القضية</div>
            <div style={valueStyle}>{state.clientName || 'غير متاح'}</div>
          </div>

          <div>
            <div style={labelStyle}>نوع القضية</div>
            <div style={valueStyle}>{state.caseType || 'غير متاح'}</div>
          </div>

          <div>
            <div style={labelStyle}>عنوان القضية</div>
            <div style={valueStyle}>{state.title || 'غير متاح'}</div>
          </div>
        </div>

        {files.length === 0 ? (
          <div style={cardStyle}>لا توجد ملفات مرفوعة لهذه القضية.</div>
        ) : (
          <div style={gridStyle}>
            {files.map((file) => {
              const kind = getFileKind(file);

              return (
                <div key={file.id} style={fileCardStyle}>
                  <div style={{ marginBottom: 12 }}>
                    {kind === 'image' && file.file_url ? (
                      <img
                        src={file.file_url}
                        alt={file.file_name}
                        style={previewImageStyle}
                        onClick={() => setSelectedImage(file.file_url || null)}
                      />
                    ) : kind === 'video' && file.file_url ? (
                      <video
                        src={file.file_url}
                        controls
                        playsInline
                        style={previewVideoStyle}
                      />
                    ) : kind === 'pdf' && file.file_url ? (
                      <iframe
                        src={file.file_url}
                        title={file.file_name}
                        style={pdfFrameStyle}
                      />
                    ) : (
                      <div style={genericFileBoxStyle}>
                        <div style={{ fontSize: 42 }}>📄</div>
                        <div>ملف قابل للفتح</div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontWeight: 700, marginBottom: 6, wordBreak: 'break-word' }}>
                    {file.file_name}
                  </div>

                  <div style={{ opacity: 0.7, fontSize: 13, marginBottom: 14 }}>
                    {formatFileSize(file.file_size)}
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a
                      href={file.file_url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      style={openButtonStyle}
                    >
                      فتح الملف
                    </a>

                    {state.allowDownload && (
                      <a
                        href={file.file_url || '#'}
                        download={file.file_name}
                        style={downloadButtonStyle}
                      >
                        تنزيل
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedImage && (
        <div style={lightboxStyle} onClick={() => setSelectedImage(null)}>
          <img
            src={selectedImage}
            alt="preview"
            style={lightboxImageStyle}
            onClick={(e) => e.stopPropagation()}
          />
          <button style={closeButtonStyle} onClick={() => setSelectedImage(null)}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#07142b',
  color: '#fff',
  padding: '20px',
  boxSizing: 'border-box',
  display: 'flex',
  justifyContent: 'center'
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 700,
  margin: '60px auto',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 20,
  padding: 24,
  boxSizing: 'border-box'
};

const headerCardStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 16,
  marginBottom: 24,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 20,
  padding: 20
};

const labelStyle: React.CSSProperties = {
  opacity: 0.7,
  marginBottom: 6,
  fontSize: 13
};

const valueStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: 18,
  wordBreak: 'break-word'
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 18
};

const fileCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 20,
  padding: 16,
  boxSizing: 'border-box'
};

const previewImageStyle: React.CSSProperties = {
  width: '100%',
  height: 220,
  objectFit: 'cover',
  borderRadius: 14,
  cursor: 'zoom-in',
  background: '#000'
};

const previewVideoStyle: React.CSSProperties = {
  width: '100%',
  height: 220,
  borderRadius: 14,
  background: '#000'
};

const pdfFrameStyle: React.CSSProperties = {
  width: '100%',
  height: 220,
  border: 0,
  borderRadius: 14,
  background: '#fff'
};

const genericFileBoxStyle: React.CSSProperties = {
  width: '100%',
  height: 220,
  borderRadius: 14,
  background: 'rgba(255,255,255,0.05)',
  border: '1px dashed rgba(255,255,255,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: 8
};

const openButtonStyle: React.CSSProperties = {
  textDecoration: 'none',
  background: '#d4a914',
  color: '#111',
  padding: '10px 14px',
  borderRadius: 10,
  fontWeight: 700
};

const downloadButtonStyle: React.CSSProperties = {
  textDecoration: 'none',
  background: 'transparent',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.25)',
  fontWeight: 700
};

const lightboxStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.88)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 1000
};

const lightboxImageStyle: React.CSSProperties = {
  maxWidth: '95vw',
  maxHeight: '90vh',
  objectFit: 'contain',
  borderRadius: 12
};

const closeButtonStyle: React.CSSProperties = {
  position: 'fixed',
  top: 20,
  right: 20,
  background: '#fff',
  color: '#000',
  border: 0,
  borderRadius: 10,
  width: 40,
  height: 40,
  cursor: 'pointer',
  fontSize: 20,
  fontWeight: 700
};
