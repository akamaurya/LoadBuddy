import React, { useEffect, useState } from 'react';
import { shouldShowPWAPrompt, getMobileOS, dismissPrompt } from '../lib/pwaUtils';
import './PWAPrompt.css';

export function PWAPrompt({ onContinue }) {
  const [show, setShow] = useState(false);
  const [os, setOs] = useState('unknown');
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if we should show the prompt immediately and set state
    if (shouldShowPWAPrompt()) {
      setShow(true);
      setOs(getMobileOS());
    } else {
      // If we shouldn't show it, immediately continue
      onContinue();
    }

    // Capture the beforeinstallprompt event for Android
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [onContinue]);

  const handleDismiss = () => {
    dismissPrompt();
    setShow(false);
    onContinue();
  };

  const handleInstallClick = async () => {
    if (os === 'Android' && deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        dismissPrompt(); // Optional: treat install as dismissal so it doesn't show again
        setShow(false);
        onContinue();
      }
      setDeferredPrompt(null);
    } else if (os === 'iOS') {
      // For iOS, the user just dismisses the dialog after reading the instructions
      handleDismiss();
    }
  };

  if (!show) return null;

  return (
    <div className="pwa-overlay">
      <div className="pwa-modal">
        <h2 className="pwa-title">Install LoadBuddy</h2>
        <p className="pwa-text">
          For the best experience, add LoadBuddy to your home screen. This enables
          push notifications for your Load/Deload cycles.
        </p>

        {os === 'iOS' && (
          <div className="pwa-instructions">
            <p>1. Tap the <span className="icon">⬇️ Share</span> button at the bottom navigation bar.</p>
            <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
          </div>
        )}

        {os === 'Android' && (
          <div className="pwa-instructions">
            <p>Tap the button below to install the app on your device.</p>
          </div>
        )}

        <div className="pwa-actions">
          {(os === 'Android' || os === 'iOS') && (
            <button className="pwa-btn pwa-install-btn" onClick={handleInstallClick}>
              {os === 'Android' ? 'Install App' : 'I Understand'}
            </button>
          )}
          <button className="pwa-btn pwa-skip-btn" onClick={handleDismiss}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
