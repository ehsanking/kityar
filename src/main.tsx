import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { hydrateStudioStore } from './store';
import './index.css';

// Guard against dev server WebSocket connection issues in iframe
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e?.reason?.message || String(e?.reason || '');
    if (reason.toLowerCase().includes('websocket') || reason.includes('[vite]') || reason.includes('closed without opened')) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('error', (e) => {
    const msg = e?.message || '';
    if (
      msg.toLowerCase().includes('websocket') || 
      msg.includes('[vite]') || 
      msg.includes('closed without opened') ||
      e?.target instanceof WebSocket ||
      (e?.target && 'url' in e.target && String((e.target as any).url).includes('ws'))
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
}

// Load the saved design (IndexedDB) before the first render so edits never race hydration.
hydrateStudioStore()
  .catch((error) => console.error('Failed to restore saved project:', error))
  .finally(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
