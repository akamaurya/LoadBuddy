const isMobileBrowser = () => {
  // Only use user agent — viewport width alone would false-positive on desktop narrow windows
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

const isStandalone = () => {
  // iOS Safari check
  if ('standalone' in window.navigator && window.navigator.standalone) {
    return true;
  }
  // Android / standard manifest check
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  return false;
};

const isPromptDismissed = () => {
  return localStorage.getItem('pwa_prompt_dismissed') === 'true';
};

export const dismissPrompt = () => {
  localStorage.setItem('pwa_prompt_dismissed', 'true');
};

export const getMobileOS = () => {
  const userAgent = window.navigator.userAgent || window.navigator.vendor || window.opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  return 'unknown';
};

export const shouldShowPWAPrompt = () => {
  return isMobileBrowser() && !isStandalone() && !isPromptDismissed();
};
