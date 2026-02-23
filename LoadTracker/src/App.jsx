import { useState, useEffect } from 'react';
import { getISOWeek } from 'date-fns';
import OneSignal from 'react-onesignal';
import './App.css';

// Use the environment variable from Vercel (must start with VITE_)
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID";

import { Analytics } from '@vercel/analytics/react';

let isOneSignalInitialized = false;

function App() {
  const [isPaused, setIsPaused] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true); // Default to true so it doesn't flash

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
      if (ONESIGNAL_APP_ID === "YOUR_ONESIGNAL_APP_ID") {
        console.warn("OneSignal App ID is missing. Skipping initialization.");
        return;
      }
      if (isOneSignalInitialized) return;
      isOneSignalInitialized = true;
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: false,
          },
          serviceWorkerParam: { scope: "/" },
          serviceWorkerPath: "sw.js",
        });

        // Ensure the device registers as a distinct User in OneSignal
        // If we don't do this, anonymous web push sometimes fails to appear in Audience
        let localUserId = localStorage.getItem('loadtracker_uid');
        if (!localUserId) {
          localUserId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
          localStorage.setItem('loadtracker_uid', localUserId);
        }
        await OneSignal.login(localUserId);

        // Apply initial tags based on paused state
        const pausedStr = savedPauseState === 'true' ? 'true' : 'false';
        OneSignal.User.addTag("paused", pausedStr);

        // Check current subscription status
        const optIn = OneSignal.User.PushSubscription.optedIn;
        setIsSubscribed(!!optIn);

        // Listen for changes
        OneSignal.User.PushSubscription.addEventListener("change", (e) => {
          setIsSubscribed(e.current.optedIn);
        });

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
      if (window.OneSignal) {
        OneSignal.User.addTag("paused", newState.toString());
      }
    } catch (e) {
      console.error("Failed to update OneSignal tag", e);
    }
  };

  const handleEnablePush = async () => {
    try {
      if (!window.OneSignal) return;
      // First show native permission prompt
      await OneSignal.Notifications.requestPermission();
      // In V2, explicitly tell the SDK to opt the user's subscription in
      // This maps the device token to the User we just created
      await OneSignal.User.PushSubscription.optIn();
    } catch (e) {
      console.error("Push Error", e);
      if (window.OneSignal) {
        OneSignal.Slidedown.promptPushCategories({ force: true });
      }
    }
  };

  const handleTestPush = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      if (reg) {
        const title = isDeload ? "Deload next week" : "Load next week";
        const message = isDeload
          ? "Tomorrow starts your Deload week! Take it easy."
          : "Tomorrow starts your Load week! Time to push.";

        await reg.showNotification(title, {
          body: message,
          icon: "/pwa-192x192.png",
          vibrate: [200, 100, 200]
        });
      } else {
        alert("Service Worker not ready. Are you on iOS Home Screen?");
      }
    } catch (error) {
      console.error("Local Push Error:", error);
      alert("Error showing test push: " + error.message);
    }
  };

  return (
    <div className={`app-container ${isDeload ? 'deload' : 'load'}`}>
      <main className="content">
        <h1>{isDeload ? 'Deload' : 'Load'}</h1>
      </main>

      <div className="button-group">
        {!isSubscribed && (
          <button className="action-button" onClick={handleEnablePush}>
            Enable Push
          </button>
        )}
        {isSubscribed && (
          <button className="action-button" onClick={handleTestPush}>
            Test Push
          </button>
        )}
        <button className="action-button" onClick={togglePause}>
          {isPaused ? 'Resume' : 'Pause'} Tasks
        </button>
      </div>

      {showIosPrompt && (
        <div className="ios-prompt">
          <p>Tap <span className="icon">⬇️ Share</span> and then<br /><strong>Add to Home Screen</strong><br />to install the LoadTracker app & enable notifications.</p>
        </div>
      )}
      <Analytics />
    </div>
  );
}

export default App;
