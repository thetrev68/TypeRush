export const saveProgress = (unlockedLessons) => {
  localStorage.setItem('tr_unlocked', JSON.stringify(unlockedLessons));
};

export const loadUnlockedLessons = () => {
  return JSON.parse(localStorage.getItem('tr_unlocked') || '[0]');
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
