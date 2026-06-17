import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PWAPrompt } from './components/PWAPrompt.jsx'

// Global error handler — log only, never destroy the DOM
window.addEventListener('error', (e) => {
  console.error('GLOBAL ERROR:', e.message, e.filename, e.lineno);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('UNHANDLED PROMISE:', e.reason);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <PWAPrompt />
  </StrictMode>,
);
