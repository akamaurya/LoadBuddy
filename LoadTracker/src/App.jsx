import { useState, useEffect } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import OneSignal from 'react-onesignal';
import { LoginForm } from './components/LoginForm';
import { supabase } from './lib/supabase';
import { Settings } from './components/Settings';
import './App.css';
import { Analytics } from '@vercel/analytics/react';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID";
let isOneSignalInitialized = false;

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [isPaused, setIsPaused] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function getProfile() {
      if (!session || !supabase) {
        setProfile(null);
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile(data);
      } else if (error && error.code !== 'PGRST116') { // PGRST116 is No Rows Found
        console.error("Error fetching profile", error);
        setShowSettings(true);
      } else {
        setShowSettings(true); // Force settings if no profile
      }
      setIsLoadingProfile(false);
    }
    getProfile();
  }, [session]);

  const localUserId = session?.user?.id;

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
      if (isOneSignalInitialized || !localUserId) return;
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

        // Use Supabase User ID for OneSignal external id
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
  }, [localUserId]);

  const togglePause = () => {
    const newState = !isPaused;
    setIsPaused(newState);
    localStorage.setItem('loadtracker_paused', newState.toString());

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
      await OneSignal.Notifications.requestPermission();
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

  if (!session) {
    return (
      <div className="auth-container" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>LoadTracker</h1>
        {supabase ? (
          <LoginForm />
        ) : (
          <p style={{ textAlign: 'center', color: '#ff6b6b' }}>
            Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
          </p>
        )}
      </div>
    );
  }

  if (isLoadingProfile) {
    return <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading profile...</div>;
  }

  // Calculate current week and cycle based on profile
  let isDeload = false;

  if (profile) {
    // Custom calculation calculation based on start_date
    const start = parseISO(profile.start_date);
    const today = new Date();

    // Normalize to dates
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const daysSinceStart = differenceInDays(today, start);

    // Weeks since start (Floor gets complete weeks passed)
    if (daysSinceStart >= 0) {
      const weeksSinceStart = Math.floor(daysSinceStart / 7);
      const cycleProgress = weeksSinceStart % profile.cycle_length_weeks;
      isDeload = cycleProgress >= (profile.cycle_length_weeks - profile.deload_length_weeks);
    } else {
      isDeload = false; // Before start date
    }
  }

  return (
    <div className={`app-container ${isDeload ? 'deload' : 'load'}`}>
      <main className="content">
        <h1>{isDeload ? 'Deload' : 'Load'}</h1>
        {profile && !showSettings && (
          <p className="subtitle" style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.5rem' }}>
            Based on {profile.cycle_length_weeks}-week cycle starting {profile.start_date}
          </p>
        )}
      </main>

      {showSettings ? (
        <Settings
          session={session}
          profile={profile}
          onProfileUpdated={(updatedProfile) => {
            setProfile(updatedProfile);
            setShowSettings(false);
          }}
          onCancel={profile ? () => setShowSettings(false) : undefined}
        />
      ) : (
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
          <button className="action-button secondary" onClick={() => setShowSettings(true)}>
            Settings
          </button>
          <button className="action-button secondary" onClick={() => supabase.auth.signOut()}>
            Log Out
          </button>
        </div>
      )}

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
