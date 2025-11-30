export const saveProgress = (unlockedLessons) => {
  localStorage.setItem('tr_unlocked', JSON.stringify(unlockedLessons));
};

export const loadUnlockedLessons = () => {
  const rawValue = localStorage.getItem('tr_unlocked');

  // Return default if no value or empty - first 3 levels unlocked
  if (rawValue === null || rawValue === '') {
    return [0, 1, 2];
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    // Log the parsing error with context
    console.error('Failed to parse unlocked lessons from localStorage:', error, 'Raw value:', rawValue);

    // Remove corrupted data and reset to safe default
    localStorage.removeItem('tr_unlocked');
    return [0, 1, 2];
  }
};

export const loadHighScore = () => {
  return parseInt(localStorage.getItem('tr_highscore') || '0', 10);
};

export const saveHighScore = (score) => {
  localStorage.setItem('tr_highscore', score.toString());
};

export const loadTheme = () => {
  return localStorage.getItem('tr_theme') || 'default';
};

export const saveTheme = (theme) => {
  localStorage.setItem('tr_theme', theme);
};

export const loadAudioSettings = () => {
  const rawValue = localStorage.getItem('tr_audioSettings');

  // Default settings
  const defaults = {
    sfxEnabled: true,
    musicEnabled: true,
    ttsEnabled: false,
    hapticsEnabled: true,
    masterVolume: 0.7,
    musicVolume: 0.4
  };

  if (rawValue === null || rawValue === '') {
    return defaults;
  }

  try {
    return { ...defaults, ...JSON.parse(rawValue) };
  } catch (error) {
    console.error('Failed to parse audio settings from localStorage:', error, 'Raw value:', rawValue);
    localStorage.removeItem('tr_audioSettings');
    return defaults;
  }
};

export const saveAudioSettings = (settings) => {
  localStorage.setItem('tr_audioSettings', JSON.stringify(settings));
};
