import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LocaleProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/theme';

// #region agent log
const dbg = (location: string, message: string, data: Record<string, unknown>, hypothesisId: string) => {
  const payload = { sessionId: '3c04c7', location, message, data, hypothesisId, timestamp: Date.now(), runId: 'pre-fix' };
  try {
    const key = '__dbg_3c04c7';
    const prev = JSON.parse(sessionStorage.getItem(key) || '[]');
    prev.push(payload);
    sessionStorage.setItem(key, JSON.stringify(prev).slice(0, 50000));
  } catch { /* noop */ }
  fetch('http://127.0.0.1:7592/ingest/abe513a0-761a-4a15-a754-72df22875d63', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '3c04c7' },
    body: JSON.stringify(payload),
  }).catch(() => {});
};
window.addEventListener('error', (e) => {
  dbg('main.tsx:window.error', 'uncaught error', { message: e.message, stack: e.error?.stack?.slice(0, 800), filename: e.filename, lineno: e.lineno }, 'A');
});
window.addEventListener('unhandledrejection', (e) => {
  const reason = e.reason;
  dbg('main.tsx:unhandledrejection', 'unhandled rejection', { message: String(reason?.message || reason), stack: reason?.stack?.slice(0, 800) }, 'A');
});
class DebugErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error?.message || String(error) };
  }
  componentDidCatch(error: Error, info: { componentStack?: string }) {
    dbg('main.tsx:ErrorBoundary', 'react render crash', { message: error.message, stack: error.stack?.slice(0, 800), componentStack: info.componentStack?.slice(0, 800) }, 'B');
  }
  render() {
    if (this.state.error) {
      return <div style={{ color: '#fff', padding: 24, background: '#111' }}>WebTrader crash: {this.state.error}</div>;
    }
    return this.props.children;
  }
}
dbg('main.tsx:boot', 'app boot', { href: location.href }, 'C');
// #endregion

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DebugErrorBoundary>
      <LocaleProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </LocaleProvider>
    </DebugErrorBoundary>
  </StrictMode>
);
