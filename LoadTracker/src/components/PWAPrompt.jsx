import React, { useEffect, useState } from 'react';
import { shouldShowPWAPrompt, getMobileOS, dismissPrompt } from '../lib/pwaUtils';
import './PWAPrompt.css';

export function PWAPrompt() {
  const [os] = useState(() => getMobileOS());
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show after a small delay to ensure hydration/navigator fully ready
    const timer = setTimeout(() => {
      if (shouldShowPWAPrompt()) {
        setIsVisible(true);
      }
    }, 500);


    // Capture the beforeinstallprompt event for Android
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (shouldShowPWAPrompt()) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    dismissPrompt();
    setIsVisible(false);
  };

  const handleInstallClick = async () => {
    if (os === 'Android' && deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        dismissPrompt();
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else if (os === 'iOS') {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-overlay">
      <div className="pwa-modal">
        <h2 className="pwa-title">Add LoadBuddy to Home Screen</h2>
        <p className="pwa-text">
          For the best experience, add LoadBuddy to your home screen. This enables
          push notifications for your Load/Deload cycles.
        </p>

        {os === 'iOS' && (
          <div className="pwa-instructions">
            <div className="pwa-step">
              <span className="pwa-step-number">1</span>
              <p>Tap the <span className="pwa-icon-inline">•••</span> button at the bottom of Safari</p>
            </div>
            <div className="pwa-step">
              <span className="pwa-step-number">2</span>
              <p>Tap <span className="pwa-icon-inline pwa-share-icon">&#xFEFF;⎙</span> <strong>Share</strong></p>
            </div>
            <div className="pwa-step">
              <span className="pwa-step-number">3</span>
              <p>Tap <strong>View More</strong> <span className="pwa-icon-inline pwa-chevron">›</span></p>
            </div>
            <div className="pwa-step">
              <span className="pwa-step-number">4</span>
              <p>Scroll down and tap <span className="pwa-icon-inline">+</span> <strong>Add to Home Screen</strong></p>
            </div>
            <div className="pwa-step">
              <span className="pwa-step-number">5</span>
              <p>Tap <strong>Add</strong> in the top right corner</p>
            </div>
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
