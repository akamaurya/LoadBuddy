import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Global error handler to catch silent crashes
window.addEventListener('error', (e) => {
  console.error('GLOBAL ERROR:', e.message, e.filename, e.lineno);
  document.getElementById('root').innerHTML = `<pre style="color:red;padding:2rem;">Error: ${e.message}\n${e.filename}:${e.lineno}</pre>`;
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('UNHANDLED PROMISE:', e.reason);
});

try {
  const { default: App } = await import('./App.jsx');
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (err) {
  console.error('APP MOUNT ERROR:', err);
  document.getElementById('root').innerHTML = `<pre style="color:red;padding:2rem;">Mount Error: ${err.message}\n${err.stack}</pre>`;
}
