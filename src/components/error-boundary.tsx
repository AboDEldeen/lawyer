import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '24px',
          background: 'var(--bg, #f6f7fb)',
          color: 'var(--text, #121826)',
          fontFamily: 'Segoe UI, Tahoma, sans-serif',
          direction: 'rtl'
        }}>
          <h2 style={{ margin: 0 }}>حدث خطأ غير متوقع</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>{this.state.error?.message || 'خطأ مجهول'}</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            style={{
              padding: '10px 24px',
              borderRadius: '14px',
              border: 'none',
              background: '#d4a820',
              color: '#231800',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '1rem'
            }}
          >
            إعادة تحميل التطبيق
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
