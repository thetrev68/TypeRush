export const saveProgress = (unlockedLessons) => {
  localStorage.setItem('tr_unlocked', JSON.stringify(unlockedLessons));
};

export const loadUnlockedLessons = () => {
  const rawValue = localStorage.getItem('tr_unlocked');
  
  // Return default if no value or empty
  if (rawValue === null || rawValue === '') {
    return [0];
  }
  
  try {
    return JSON.parse(rawValue);
  } catch (error) {
    // Log the parsing error with context
    console.error('Failed to parse unlocked lessons from localStorage:', error, 'Raw value:', rawValue);
    
    // Remove corrupted data and reset to safe default
    localStorage.removeItem('tr_unlocked');
    return [0];
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
