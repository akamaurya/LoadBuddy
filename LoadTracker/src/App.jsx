import { useState, useEffect } from 'react';
import { getISOWeek } from 'date-fns';
import OneSignal from 'react-onesignal';
import './App.css';

// Use the environment variable from Vercel (must start with VITE_)
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID";

function App() {
  const [isPaused, setIsPaused] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  // Calculate current week and cycle
  const currentWeek = getISOWeek(new Date());
  const isDeload = currentWeek % 4 === 0;

  useEffect(() => {
    // 1. Check for iOS and if it's already installed (standalone mode)
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    const isStandalone = () => {
      return ('standalone' in window.navigator) && (window.navigator.standalone);
    };

    if (isIos() && !isStandalone()) {
      setShowIosPrompt(true);
    }

    // 2. Load cached pause state
    const savedPauseState = localStorage.getItem('loadtracker_paused');
    if (savedPauseState === 'true') {
      setIsPaused(true);
    }

    // 3. Initialize OneSignal
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: false,
          },
        });

        // Apply initial tags based on paused state
        const pausedStr = savedPauseState === 'true' ? 'true' : 'false';
        OneSignal.User.addTag("paused", pausedStr);

        // We will remove the automatic Slidedown prompt entirely.
        // On iOS, automatic prompts on load are heavily restricted and often fail silently.
        // It's much strictly better to rely *only* on the manual button click.
      } catch (error) {
        console.error("OneSignal Init Error:", error);
      }
    };

    initOneSignal();
  }, []);

  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    localStorage.setItem('loadtracker_paused', newState.toString());

    // Update OneSignal Tag
    try {
      OneSignal.User.addTag("paused", newState.toString());
    } catch (e) {
      console.error("Failed to update OneSignal tag", e);
    }
  };

  return (
    <div className={`app-container ${isDeload ? 'deload' : 'load'}`}>
      <main className="content">
        <h1>{isDeload ? 'Deload' : 'Load'}</h1>
      </main>

      <div className="button-group">
        <button className="action-button" onClick={async () => {
          try {
            // First show native permission prompt
            await OneSignal.Notifications.requestPermission();
          } catch (e) {
            console.error("Push Error", e);
            // Fallback to slidedown if native fails or is blocked
            OneSignal.Slidedown.promptPushCategories({ force: true });
          }
        }}>
          Enable Push
        </button>
        <button className="action-button" onClick={togglePause}>
          {isPaused ? 'Resume' : 'Pause'} Notifications
        </button>
      </div>

      {showIosPrompt && (
        <div className="ios-prompt">
          <p>Tap <span className="icon">⬇️ Share</span> and then<br /><strong>Add to Home Screen</strong><br />to install the LoadTracker app & enable notifications.</p>
        </div>
      )}
    </div>
  );
}

export default App;
