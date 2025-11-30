export const saveProgress = (unlockedLessons) => {
  localStorage.setItem('tr_unlocked', JSON.stringify(unlockedLessons));
};

export const loadUnlockedLessons = () => {
  const rawValue = localStorage.getItem('tr_unlocked');

  // Return default if no value or empty - first 3 levels unlocked
  if (rawValue === null || rawValue === '') {
    const defaultLessons = [0, 1, 2];
    saveProgress(defaultLessons);
    return defaultLessons;
  }

  try {
    const unlocked = JSON.parse(rawValue);

    // Migrate old data: ensure first 3 levels are always unlocked
    const migratedLessons = new Set(unlocked);
    migratedLessons.add(0);
    migratedLessons.add(1);
    migratedLessons.add(2);
    const result = Array.from(migratedLessons).sort((a, b) => a - b);

    // Save migrated data if it changed
    if (result.length !== unlocked.length || !result.every((v, i) => v === unlocked[i])) {
      saveProgress(result);
    }

    return result;
  } catch (error) {
    // Log the parsing error with context
    console.error('Failed to parse unlocked lessons from localStorage:', error, 'Raw value:', rawValue);

    // Remove corrupted data and reset to safe default
    localStorage.removeItem('tr_unlocked');
    const defaultLessons = [0, 1, 2];
    saveProgress(defaultLessons);
    return defaultLessons;
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
