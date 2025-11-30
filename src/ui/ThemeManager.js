import { themes } from '../config/themes.js';
import { loadTheme, saveTheme } from '../utils/storage.js';

export class ThemeManager {
  constructor(themePicker, themeInfo) {
    this.themePicker = themePicker;
    this.themeInfo = themeInfo;
    this.currentTheme = loadTheme();
  }

  applyTheme(key) {
    const theme = themes[key] || themes.default;
    Object.entries(theme.vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
    // Update body class for theme-specific CSS
    // Remove any existing theme-* classes, then add the new theme class
    Array.from(document.body.classList).forEach(className => {
      if (className.startsWith('theme-')) {
        document.body.classList.remove(className);
      }
    });
    document.body.classList.add(`theme-${key}`);
    this.currentTheme = key;
    saveTheme(key);
    if (this.themeInfo) {
      this.themeInfo.textContent = `Theme: ${theme.name}`;
    }
  }

  renderPicker() {
    this.themePicker.innerHTML = Object.entries(themes)
      .map(([k, v]) => `<option value="${k}" ${k === this.currentTheme ? 'selected' : ''}>${v.name}</option>`)
      .join('');
    this.themePicker.value = this.currentTheme;
    this.applyTheme(this.currentTheme);
  }

  setupEventListeners() {
    this.themePicker.addEventListener('change', (e) => {
      this.applyTheme(e.target.value);
    });

    this.themePicker.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }
}
