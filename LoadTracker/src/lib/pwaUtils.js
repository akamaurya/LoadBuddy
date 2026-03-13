export const isMobileBrowser = () => {
  return window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent);
};

export const isStandalone = () => {
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

export const isPromptDismissed = () => {
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
