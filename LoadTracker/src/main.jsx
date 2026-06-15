import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Global error handler — log only, never destroy the DOM
window.addEventListener('error', (e) => {
  console.error('GLOBAL ERROR:', e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('UNHANDLED PROMISE:', e.reason);
});

try {
  const { default: App } = await import('./App.jsx');
  const { PWAPrompt } = await import('./components/PWAPrompt.jsx');
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
      <PWAPrompt />
    </StrictMode>,
  );
} catch (err) {
  console.error('APP MOUNT ERROR:', err);
  document.getElementById('root').innerHTML = `<pre style="color:red;padding:2rem;">Mount Error: ${err.message}\n${err.stack}</pre>`;
}
