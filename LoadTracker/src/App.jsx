import { useState, useEffect } from 'react';
import { differenceInDays, parseISO, format } from 'date-fns';
import OneSignal from 'react-onesignal';
import { LoginForm } from './components/LoginForm';
import { supabase } from './lib/supabase';
import { Settings } from './components/Settings';
import { OnboardingWizard } from './components/OnboardingWizard';
import { LandingPage } from './components/LandingPage';
import { PWAPrompt } from './components/PWAPrompt';
import { shouldShowPWAPrompt } from './lib/pwaUtils'; // ADDED
import './App.css';
import { Analytics } from '@vercel/analytics/react';

const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "YOUR_ONESIGNAL_APP_ID";
let isOneSignalInitialized = false;

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!supabase);
  const [authView, setAuthView] = useState('landing'); // 'landing' or 'login'

  const [isPaused, setIsPaused] = useState(false);
  // Flow states
  const [hasCompletedPwaPrompt, setHasCompletedPwaPrompt] = useState(!shouldShowPWAPrompt());
  const [isSubscribed, setIsSubscribed] = useState(true);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsInitializing(false);
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
        setShowSettings(false); // They have a profile, they are a returning user
      } else if (error && error.code !== 'PGRST116') { // PGRST116 is No Rows Found
        console.error("Error fetching profile", error);
        setShowSettings(true); // Treat as new user or error state requiring setup
      } else {
        setShowSettings(true); // New user (needs questionnaire)
      }
      setIsLoadingProfile(false);
    }
    getProfile();
  }, [session]);

  const localUserId = session?.user?.id;

  useEffect(() => {
    // 1. PWA Check is now handled by PWAPrompt component

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

  if (isInitializing) {
    return (
      <div className="auth-container" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>LoadTracker</h1>
        <p style={{ textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  if (!session) {
    if (authView === 'landing') {
      return (
        <>
          <LandingPage onSignIn={() => setAuthView('login')} onSignUp={() => setAuthView('login')} />
          <Analytics />
        </>
      );
    }

    return (
      <div className="auth-container" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>LoadTracker</h1>
        {supabase ? (
          <div>
            <button
              onClick={() => setAuthView('landing')}
              style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', marginBottom: '20px', fontSize: '14px', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}
            >
              ← Back
            </button>
            <LoginForm />
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#ff6b6b' }}>
            Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
          </p>
        )}
        <Analytics />
      </div>
    );
  }

  // Block 1: Is the profile loading?
  if (isLoadingProfile) {
    return <div className="loading" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading profile...</div>;
  }

  // Block 2: Are they a first time user? (Settings / Questionnaire)
  if (showSettings) {
    if (!profile) {
      // First Time User
      return (
        <OnboardingWizard 
          session={session} 
          onComplete={(newProfile) => {
            setProfile(newProfile);
            setShowSettings(false);
          }}
        />
      );
    } else {
      // Returning user wanting to access Settings dashboard
      return (
        <div className="auth-app-view">
          <Settings
            session={session}
            profile={profile}
            isDeload={isDeload}
            onProfileUpdated={(updatedProfile) => {
              setProfile(updatedProfile);
              setShowSettings(false); // Move to next step in flow
            }}
            onCancel={profile ? () => setShowSettings(false) : undefined}
          />
        </div>
      );
    }
  }

  // Block 3: Have they seen the PWA Prompt?
  if (!hasCompletedPwaPrompt) {
    return <PWAPrompt onContinue={() => setHasCompletedPwaPrompt(true)} />;
  }

  // Block 4: Main Application View (Load/Deload)
  // Calculate current week and cycle based on profile
  let isDeload = false;
  let daysUntilNextPhase = 0;

  if (profile) {
    // Custom calculation calculation based on start_date
    const start = parseISO(profile.start_date);
    const today = new Date();

    // Normalize to dates
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const daysSinceStart = differenceInDays(today, start);

    const cycleLengthDays = profile.cycle_length_weeks * 7;
    const loadLengthDays = (profile.cycle_length_weeks - profile.deload_length_weeks) * 7;

    // Days into cycle to determine phase
    if (daysSinceStart >= 0) {
      const daysIntoCycle = daysSinceStart % cycleLengthDays;
      isDeload = daysIntoCycle >= loadLengthDays;

      if (isDeload) {
        daysUntilNextPhase = cycleLengthDays - daysIntoCycle;
      } else {
        daysUntilNextPhase = loadLengthDays - daysIntoCycle;
      }
    } else {
      isDeload = false; // Before start date
      daysUntilNextPhase = Math.abs(daysSinceStart); // Days until it starts
    }
  }

  return (
    <div className={`app-container ${isDeload ? 'deload' : 'load'} auth-app-view`}>
      <main className="content">
        <h1>{isDeload ? 'DELOAD' : 'LOAD'}</h1>
        {profile && !showSettings && (
          <div className="status-info">
            <h2 className="next-phase">Next {isDeload ? 'LOAD' : 'DELOAD'} is in {daysUntilNextPhase} {daysUntilNextPhase === 1 ? 'Day' : 'Days'}</h2>
            <p className="cycle-context">
              Based on a {profile.cycle_length_weeks}-week cycle starting {format(parseISO(profile.start_date), 'MMM d, yyyy')}
            </p>
          </div>
        )}
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
        <button className="action-button secondary" onClick={() => setShowSettings(true)}>
          Settings
        </button>
        <button className="action-button secondary" onClick={() => supabase.auth.signOut()}>
          Log Out
        </button>
      </div>

      {/* Removed old ios-prompt */}
      <Analytics />
    </div>
  );
}

export default App;
