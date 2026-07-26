import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept and swallow benign ResizeObserver layout loop notifications
if (typeof window !== 'undefined') {
  const IGNORED_MESSAGES = [
    'ResizeObserver loop completed with undelivered notifications',
    'ResizeObserver loop limit exceeded'
  ];

  window.addEventListener('error', (e: ErrorEvent) => {
    if (e && e.message && IGNORED_MESSAGES.some(msg => e.message.includes(msg))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  const originalOnerror = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    if (typeof message === 'string' && IGNORED_MESSAGES.some(msg => message.includes(msg))) {
      return true; // Suppress from console/unhandled errors
    }
    if (originalOnerror) {
      return originalOnerror(message, source, lineno, colno, error);
    }
    return false;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

