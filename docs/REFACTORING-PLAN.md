# TypeRush Refactoring Plan

**Date**: November 29, 2025
**Current Status**: 827-line monolithic `main.js`
**Goal**: Modular, testable, maintainable architecture without breaking functionality

---

## Executive Summary

This plan breaks down [src/main.js](../src/main.js) into focused modules using a **7-phase incremental approach**. Each phase:
- Extracts one logical concern
- Maintains 100% backward compatibility
- Can be tested immediately after completion
- Takes 15-30 minutes to execute
- Has a clear rollback path

**Estimated Total Time**: 3-4 hours
**Risk Level**: Low (incremental with continuous validation)
**Breaking Changes**: None

---

## Current Architecture Analysis

### What We Have (main.js:827 lines)
```
Lines 1-93:    DOM setup & element references
Lines 94-160:  Constants, utility functions, theme config
Lines 161-187: Global state object
Lines 188-275: Data loading, lesson/theme pickers
Lines 276-341: HUD & metrics (WPM, accuracy, scoring)
Lines 342-410: Word lifecycle (spawning, falling, active tracking)
Lines 411-474: Word interaction (highlighting, popping, scoring)
Lines 475-527: RNG system & spawn positioning
Lines 528-598: Game loop (spawn, level up, timers)
Lines 599-650: Game lifecycle (start, end, reset, unlock)
Lines 651-759: Input handling & word matching
Lines 760-777: Overlay/UI controls
Lines 778-827: PWA badges & service worker
```

### Core Dependencies Map
```
Input Handler (690-759)
    ↓ depends on
Active Word Tracker (388-410)
    ↓ depends on
Word Spawner (529-576)
    ↓ depends on
Game State (162-187)
    ↓ provides data to
HUD Manager (332-341)
```

---

## Target Architecture

```
src/
├── main.js                    # Entry point (~150 lines)
│   └── Orchestrates all modules, handles initialization
│
├── core/
│   ├── GameState.js          # State management (~100 lines)
│   ├── GameLoop.js           # Main game loop, timers (~120 lines)
│   └── GameLifecycle.js      # Start, pause, end, reset (~100 lines)
│
├── game/
│   ├── WordSpawner.js        # Word spawning logic (~100 lines)
│   ├── WordElement.js        # Individual word behavior (~80 lines)
│   ├── ActiveWordTracker.js  # Determines active word (~60 lines)
│   └── InputHandler.js       # Keyboard input processing (~100 lines)
│
├── scoring/
│   ├── ScoreManager.js       # Scoring, combo, lives (~80 lines)
│   ├── MetricsCalculator.js  # WPM, accuracy (~50 lines)
│   └── ProgressTracker.js    # Lesson unlocks (~40 lines)
│
├── ui/
│   ├── HUD.js               # Score display updates (~40 lines)
│   ├── OverlayManager.js    # Pause, game over screens (~60 lines)
│   ├── ThemeManager.js      # Theme switching (~60 lines)
│   └── LessonPicker.js      # Lesson selection UI (~70 lines)
│
├── utils/
│   ├── rng.js              # Seeded random (~40 lines)
│   ├── storage.js          # localStorage wrapper (~30 lines)
│   ├── focus.js            # Input focus management (~30 lines)
│   ├── positioning.js      # Safe spawn positions (~50 lines)
│   └── thumbDetection.js   # Left/right thumb logic (~40 lines)
│
└── config/
    ├── constants.js        # Game constants (~30 lines)
    ├── themes.js          # Theme definitions (~50 lines)
    └── lessons.js         # Default lessons (~40 lines)
```

---

## Phase-by-Phase Execution Plan

### Phase 0: Preparation (5 minutes)
**Goal**: Set up safety nets before touching code

**Actions**:
1. Create backup branch: `git checkout -b refactor/modular-architecture`
2. Commit current state: `git add . && git commit -m "Pre-refactor snapshot"`
3. Run app, verify all features work, take screenshots
4. Create `src/config/`, `src/utils/`, `src/core/`, `src/game/`, `src/scoring/`, `src/ui/` directories

**Validation**:
```bash
npm run dev
# Manually test: play game, switch themes, switch lessons, lose lives, game over
```

**Rollback**: `git reset --hard HEAD`

---

### Phase 1: Extract Configuration & Constants (15 minutes)
**Goal**: Pull out static data that has zero dependencies

**Files to Create**:

#### `src/config/constants.js`
```javascript
// Lines 94-98 from main.js
export const BASE_FALL = 13000;
export const BASE_SPAWN = 2500;
export const RAMP_MS = 50000;
export const MIN_FALL = 5000;
export const MIN_SPAWN = 1400;

// Lines 100-101 from main.js
export const leftLetters = new Set([
  'q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b'
]);
export const rightLetters = new Set([
  'y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm'
]);

// Lines 189-196 from main.js
export const defaultLessons = [
  { id: 'left-hand', title: 'Left Hand Practice', ... },
  ...
];

// Line 198 from main.js
export const defaultWords = [
  'fast', 'thumb', 'type', ...
];
```

#### `src/config/themes.js`
```javascript
// Lines 104-149 from main.js
export const themes = {
  default: { name: 'Default', vars: { ... } },
  space: { name: 'Space', vars: { ... } },
  ocean: { name: 'Ocean', vars: { ... } },
  racing: { name: 'Racing', vars: { ... } },
};
```

**Changes to main.js**:
```javascript
// Add at top
import { BASE_FALL, BASE_SPAWN, RAMP_MS, MIN_FALL, MIN_SPAWN, leftLetters, rightLetters, defaultLessons, defaultWords } from './config/constants.js';
import { themes } from './config/themes.js';

// Remove lines 94-198
```

**Validation**:
```bash
npm run dev
# Test: Theme switching works, lesson picker populates
```

**Risk**: Low - pure data extraction
**Rollback**: `git checkout src/main.js`

---

### Phase 2: Extract Utility Functions (20 minutes)
**Goal**: Isolate pure functions with no side effects

**Files to Create**:

#### `src/utils/thumbDetection.js`
```javascript
import { leftLetters, rightLetters } from '../config/constants.js';

// Lines 153-154 from main.js
export const getExpectedThumb = (word) =>
  leftLetters.has(word[0].toLowerCase()) ? 'left' : 'right';

// Lines 155-160 from main.js
export const inferThumbFromChar = (char) => {
  if (!char) return null;
  const lower = char.toLowerCase();
  if (!/[a-z]/.test(lower)) return null;
  return leftLetters.has(lower) ? 'left' : 'right';
};
```

#### `src/utils/rng.js`
```javascript
// Lines 476-497 from main.js
export const mulberry32 = (a) => {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const createSeededRng = (dailyMode) => {
  if (!dailyMode) {
    return Math.random;
  }
  const seedStr = new Date().toISOString().slice(0, 10);
  let hash = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    hash = Math.imul(hash ^ seedStr.charCodeAt(i), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return mulberry32(hash >>> 0);
};
```

#### `src/utils/storage.js`
```javascript
// Lines 200-202 from main.js
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
```

#### `src/utils/focus.js`
```javascript
// Lines 204-224 from main.js
export const setupFocusManagement = (hiddenInput) => {
  const focusInput = (e) => {
    if (e && e.target && (e.target.tagName === 'SELECT' || e.target.closest('.lesson-select'))) {
      return;
    }
    hiddenInput.focus({ preventScroll: true });
    hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length);
  };

  ['click', 'touchstart'].forEach((evt) => {
    document.addEventListener(evt, focusInput, { passive: true });
  });

  let currentThumbSide = null;
  document.addEventListener('touchstart', (e) => {
    const x = e.touches[0].clientX;
    currentThumbSide = x < window.innerWidth / 2 ? 'left' : 'right';
  }, { passive: true });

  return { focusInput, getCurrentThumbSide: () => currentThumbSide };
};
```

#### `src/utils/positioning.js`
```javascript
// Lines 499-527 from main.js
export const findSafeSpawnPosition = (wordWidth, falling, playfield, rng) => {
  const maxLeft = Math.max(0, playfield.clientWidth - wordWidth - 20);
  const minSpacing = 120;
  let attempts = 0;
  let left;

  while (attempts < 10) {
    left = rng() * maxLeft;
    let isSafe = true;

    for (const entry of falling) {
      if (entry.el.dataset.removed === '1') continue;
      const existingLeft = parseFloat(entry.el.style.left);
      const distance = Math.abs(left - existingLeft);

      if (distance < minSpacing) {
        isSafe = false;
        break;
      }
    }

    if (isSafe) return left;
    attempts++;
  }

  return left;
};
```

**Changes to main.js**:
```javascript
import { getExpectedThumb, inferThumbFromChar } from './utils/thumbDetection.js';
import { createSeededRng } from './utils/rng.js';
import { saveProgress, loadUnlockedLessons, loadHighScore, saveHighScore, loadTheme, saveTheme } from './utils/storage.js';
import { setupFocusManagement } from './utils/focus.js';
import { findSafeSpawnPosition } from './utils/positioning.js';

// Remove lines 153-160, 200-224, 476-527
// Update references to use imported functions
```

**Validation**:
```bash
npm run dev
# Test: Focus works, RNG seeding works, localStorage persists scores/unlocks
```

**Risk**: Low - pure functions
**Rollback**: `git checkout src/main.js src/utils/`

---

### Phase 3: Extract Scoring & Metrics (25 minutes)
**Goal**: Centralize all score/combo/WPM/accuracy logic

**Files to Create**:

#### `src/scoring/MetricsCalculator.js`
```javascript
// Lines 321-330 from main.js
export class MetricsCalculator {
  calculateWPM(recentWords) {
    if (recentWords.length < 2) return 0;
    const first = recentWords[0].time;
    const last = recentWords[recentWords.length - 1].time;
    const diffMin = (last - first) / 60000;
    if (diffMin <= 0) return 0;
    const totalChars = recentWords.reduce((sum, item) => sum + item.chars, 0);
    const words = totalChars / 5;
    return Math.round(words / diffMin);
  }

  calculateAccuracy(correctThumbs, totalThumbs) {
    return totalThumbs ? Math.round((correctThumbs / totalThumbs) * 100) : 100;
  }

  calculateComboMultiplier(combo) {
    return Math.max(1, 1 + Math.floor(combo / 5));
  }
}
```

#### `src/scoring/ScoreManager.js`
```javascript
import { saveHighScore } from '../utils/storage.js';

// Lines 357-370, 438-473 from main.js
export class ScoreManager {
  constructor(state) {
    this.state = state;
  }

  celebrateHighScore() {
    const container = document.createElement('div');
    container.className = 'confetti';
    const emojis = ['🎉', '👏', '⭐', '🔥', '🎊'];
    for (let i = 0; i < 16; i++) {
      const span = document.createElement('span');
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = `${Math.random() * 100}%`;
      span.style.animationDelay = `${Math.random() * 0.2}s`;
      container.appendChild(span);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1200);
  }

  awardScore(wordLength, combo) {
    const base = Math.max(5, wordLength);
    const mult = 1 + Math.floor(combo / 5);
    this.state.score += base * mult;

    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      saveHighScore(this.state.highScore);
      this.celebrateHighScore();
    }
  }

  incrementCombo() {
    this.state.combo += 1;
    this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
  }

  breakCombo() {
    this.state.combo = 0;
  }

  loseLife() {
    this.state.lives -= 1;
    this.breakCombo();
  }

  trackWordTyped(wordLength) {
    const now = Date.now();
    this.state.recentWords.push({ time: now, chars: wordLength });
    if (this.state.recentWords.length > 10) {
      this.state.recentWords.shift();
    }
  }

  trackThumbAccuracy(wasCorrect) {
    this.state.totalThumbs++;
    if (wasCorrect) {
      this.state.correctThumbs++;
    }
  }
}
```

#### `src/scoring/ProgressTracker.js`
```javascript
import { saveProgress } from '../utils/storage.js';
import { MetricsCalculator } from './MetricsCalculator.js';

// Lines 600-616 from main.js
export class ProgressTracker {
  constructor(state, lessons) {
    this.state = state;
    this.lessons = lessons;
    this.metricsCalc = new MetricsCalculator();
  }

  checkUnlock() {
    const acc = this.metricsCalc.calculateAccuracy(
      this.state.correctThumbs,
      this.state.totalThumbs
    );
    const wpm = this.metricsCalc.calculateWPM(this.state.recentWords);
    const nextIdx = this.state.currentLessonIndex + 1;
    const wordsTyped = this.state.recentWords.length;

    if (nextIdx < this.lessons.length && (acc >= 80 || wpm >= 20 || wordsTyped >= 10)) {
      if (!this.state.unlockedLessons.includes(nextIdx)) {
        this.state.unlockedLessons.push(nextIdx);
        saveProgress(this.state.unlockedLessons);
        return `Next lesson unlocked! (WPM: ${wpm}, Acc: ${Math.round(acc)}%)`;
      }
    }
    return null;
  }
}
```

**Changes to main.js**:
```javascript
import { MetricsCalculator } from './scoring/MetricsCalculator.js';
import { ScoreManager } from './scoring/ScoreManager.js';
import { ProgressTracker } from './scoring/ProgressTracker.js';

// Create instances after state initialization
const metricsCalc = new MetricsCalculator();
const scoreManager = new ScoreManager(state);
const progressTracker = new ProgressTracker(state, state.lessons);

// Replace inline logic with manager calls
```

**Validation**:
```bash
npm run dev
# Test: Scoring works, WPM updates, accuracy tracks, high score saves, confetti on new record
```

**Risk**: Low-Medium - some state mutation involved
**Rollback**: `git checkout src/main.js src/scoring/`

---

### Phase 4: Extract UI Managers (25 minutes)
**Goal**: Separate all DOM manipulation from game logic

**Files to Create**:

#### `src/ui/HUD.js`
```javascript
// Lines 332-341 from main.js
export class HUD {
  constructor(elements, metricsCalculator) {
    this.scoreVal = elements.scoreVal;
    this.bestVal = elements.bestVal;
    this.livesVal = elements.livesVal;
    this.speedVal = elements.speedVal;
    this.wpmVal = elements.wpmVal;
    this.accuracyVal = elements.accuracyVal;
    this.comboVal = elements.comboVal;
    this.metricsCalc = metricsCalculator;
  }

  update(state) {
    this.scoreVal.textContent = state.score.toString();
    this.bestVal.textContent = state.highScore.toString();
    this.livesVal.textContent = `${state.lives}`;
    this.speedVal.textContent = `Lv ${state.level}`;
    this.wpmVal.textContent = this.metricsCalc.calculateWPM(state.recentWords).toString();
    const acc = this.metricsCalc.calculateAccuracy(state.correctThumbs, state.totalThumbs);
    this.accuracyVal.textContent = `${acc}%`;
    this.comboVal.textContent = `x${this.metricsCalc.calculateComboMultiplier(state.combo)}`;
  }
}
```

#### `src/ui/ThemeManager.js`
```javascript
import { themes } from '../config/themes.js';
import { loadTheme, saveTheme } from '../utils/storage.js';

// Lines 151, 226-246 from main.js
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
    document.body.className = `theme-${key}`;
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
```

#### `src/ui/LessonPicker.js`
```javascript
import { leftLetters, rightLetters } from '../config/constants.js';

// Lines 248-310 from main.js
export class LessonPicker {
  constructor(lessonPicker, lessonInfo, state) {
    this.lessonPicker = lessonPicker;
    this.lessonInfo = lessonInfo;
    this.state = state;
  }

  filterWordsForLesson(lesson, words) {
    const cfg = lesson.config;
    return words.filter((w) => {
      const chars = w.split('');
      if (cfg.allowedSet === 'left') {
        return chars.every((c) => leftLetters.has(c));
      }
      if (cfg.allowedSet === 'right') {
        return chars.every((c) => rightLetters.has(c));
      }
      if (cfg.maxLength && w.length > cfg.maxLength) return false;
      return true;
    });
  }

  render() {
    this.lessonPicker.innerHTML = this.state.lessons
      .map((l, i) => {
        const locked = !this.state.unlockedLessons.includes(i);
        return `<option value="${i}" ${locked ? 'disabled' : ''}>${locked ? '🔒 ' : ''}${l.title}</option>`;
      })
      .join('');
    this.lessonPicker.value = this.state.currentLessonIndex;
    this.updateInfo();
  }

  updateInfo() {
    const idx = parseInt(this.lessonPicker.value);
    this.state.currentLessonIndex = idx;
    const lesson = this.state.lessons[idx];
    const locked = !this.state.unlockedLessons.includes(idx);
    if (lesson) {
      if (locked) {
        this.lessonInfo.textContent = 'Locked: Finish previous with 80% acc OR 20 WPM OR 10 words.';
        this.lessonInfo.style.color = '#ff4d6d';
      } else {
        this.lessonInfo.textContent = lesson.description;
        this.lessonInfo.style.color = 'var(--accent-2)';
      }
    }
  }

  setupEventListeners() {
    this.lessonPicker.addEventListener('change', () => {
      this.updateInfo();
    });

    this.lessonPicker.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }
}
```

#### `src/ui/OverlayManager.js`
```javascript
// Lines 583-598, 618-649, 761-777 from main.js
export class OverlayManager {
  constructor(overlay, overlayTitle, overlayMsg, overlayRestart) {
    this.overlay = overlay;
    this.overlayTitle = overlayTitle;
    this.overlayMsg = overlayMsg;
    this.overlayRestart = overlayRestart;
  }

  show(title, message) {
    this.overlayTitle.textContent = title;
    this.overlayMsg.textContent = message;
    this.overlay.classList.remove('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
  }

  showLevelUpPause(level) {
    this.overlayTitle.textContent = `Level ${level} Complete!`;
    this.overlayMsg.textContent = 'Take a quick break. Tap Play to continue.';
    this.overlayRestart.textContent = 'Continue';
    this.show(this.overlayTitle.textContent, this.overlayMsg.textContent);
  }

  showGameOver(unlockMsg) {
    const title = unlockMsg ? 'Success!' : 'Game Over';
    const message = unlockMsg || 'Game over';
    this.overlayRestart.textContent = 'Play';
    this.show(title, message);
  }

  showReady() {
    this.overlayRestart.textContent = 'Play';
    this.show('Ready?', 'Tap start to play.');
  }

  setupRestartButton(onRestart) {
    this.overlayRestart.addEventListener('click', onRestart);
  }
}
```

**Changes to main.js**:
```javascript
import { HUD } from './ui/HUD.js';
import { ThemeManager } from './ui/ThemeManager.js';
import { LessonPicker } from './ui/LessonPicker.js';
import { OverlayManager } from './ui/OverlayManager.js';

// Create instances and wire up
const hud = new HUD({ scoreVal, bestVal, livesVal, speedVal, wpmVal, accuracyVal, comboVal }, metricsCalc);
const themeManager = new ThemeManager(themePicker, themeInfo);
const lessonPicker = new LessonPicker(lessonPickerEl, lessonInfo, state);
const overlayManager = new OverlayManager(overlay, overlayTitle, overlayMsg, overlayRestart);
```

**Validation**:
```bash
npm run dev
# Test: HUD updates, themes switch, lesson picker works, overlays show/hide
```

**Risk**: Medium - lots of DOM manipulation
**Rollback**: `git checkout src/main.js src/ui/`

---

### Phase 5: Extract Word Management (30 minutes)
**Goal**: Isolate word spawning, tracking, and rendering

**Files to Create**:

#### `src/game/WordElement.js`
```javascript
import { leftLetters } from '../config/constants.js';

// Lines 412-436 from main.js (highlighting logic)
export class WordElement {
  constructor(word, onMiss) {
    this.word = word.toLowerCase();
    this.el = this.createElement();
    this.missHandler = () => onMiss(this.el);
    this.el.addEventListener('animationend', this.missHandler);
  }

  createElement() {
    const el = document.createElement('div');
    el.className = 'word';
    el.textContent = this.word;
    el.dataset.originalWord = this.word;
    el.dataset.removed = '0';
    el.dataset.typedProgress = '';

    // Add thumb indicator to first letter
    const firstLetter = this.word[0];
    const isLeft = leftLetters.has(firstLetter.toLowerCase());
    const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';
    el.innerHTML = `<span class="${firstLetterClass}">${firstLetter}</span>${this.word.substring(1)}`;

    return el;
  }

  highlightProgress(progress) {
    const word = this.el.dataset.originalWord || this.el.textContent;
    this.el.dataset.originalWord = word;

    if (progress.length === 0) {
      const firstLetter = word[0];
      const isLeft = leftLetters.has(firstLetter.toLowerCase());
      const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';
      this.el.innerHTML = `<span class="${firstLetterClass}">${firstLetter}</span>${word.substring(1)}`;
      return;
    }

    const typed = word.substring(0, progress.length);
    const remaining = word.substring(progress.length);
    const firstLetter = word[0];
    const isLeft = leftLetters.has(firstLetter.toLowerCase());
    const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';

    if (progress.length === 1) {
      this.el.innerHTML = `<span class="typed ${firstLetterClass}">${typed}</span>${remaining}`;
    } else {
      this.el.innerHTML = `<span class="typed">${typed}</span>${remaining}`;
    }
  }

  setActive(isActive) {
    if (isActive) {
      this.el.classList.add('active-word');
    } else {
      this.el.classList.remove('active-word');
    }
  }

  setPosition(left, fallDuration) {
    this.el.style.left = `${left}px`;
    this.el.style.setProperty('--fall-duration', `${fallDuration}ms`);
  }

  flashCorrect(callback) {
    this.el.classList.add('correct-thumb');
    setTimeout(() => {
      this.el.classList.remove('correct-thumb');
      callback();
    }, 420);
  }

  flashWrong(callback) {
    this.el.classList.add('wrong-thumb');
    setTimeout(() => {
      this.el.classList.remove('wrong-thumb');
      callback();
    }, 480);
  }

  flashError() {
    this.el.classList.add('wrong-flash');
    setTimeout(() => this.el.classList.remove('wrong-flash'), 200);
  }

  pop() {
    this.el.dataset.removed = '1';
    this.el.style.animationPlayState = 'paused';
    this.el.classList.add('popped');
    if (this.missHandler) {
      this.el.removeEventListener('animationend', this.missHandler);
    }
  }

  remove() {
    this.el.remove();
  }

  isRemoved() {
    return this.el.dataset.removed === '1';
  }
}
```

#### `src/game/ActiveWordTracker.js`
```javascript
// Lines 348-352, 388-410 from main.js
export class ActiveWordTracker {
  constructor(playfield) {
    this.playfield = playfield;
  }

  update(falling) {
    // Remove active class from all words
    falling.forEach(f => f.wordElement.setActive(false));

    if (falling.length === 0) return;

    // Find the word closest to bottom (highest position)
    let activeEntry = falling[0];
    const playfieldRect = this.playfield.getBoundingClientRect();

    falling.forEach(entry => {
      const rect = entry.wordElement.el.getBoundingClientRect();
      if (rect.top > playfieldRect.top) {
        const entryBottom = rect.bottom;
        const activeBottom = activeEntry.wordElement.el.getBoundingClientRect().bottom;
        if (entryBottom > activeBottom) {
          activeEntry = entry;
        }
      }
    });

    activeEntry.wordElement.setActive(true);
  }
}
```

#### `src/game/WordSpawner.js`
```javascript
import { MIN_SPAWN, BASE_SPAWN, MIN_FALL, BASE_FALL } from '../config/constants.js';
import { findSafeSpawnPosition } from '../utils/positioning.js';
import { getExpectedThumb } from '../utils/thumbDetection.js';
import { WordElement } from './WordElement.js';

// Lines 354-355, 529-581 from main.js
export class WordSpawner {
  constructor(playfield, state, onMiss) {
    this.playfield = playfield;
    this.state = state;
    this.onMiss = onMiss;
    this.spawnTimer = null;
  }

  spawnInterval() {
    return Math.max(MIN_SPAWN, BASE_SPAWN - (this.state.level - 1) * 180);
  }

  fallDuration() {
    return Math.max(MIN_FALL, BASE_FALL - (this.state.level - 1) * 900);
  }

  spawn() {
    if (!this.state.running || !this.state.activeWords.length) return;
    if (this.state.falling.length >= 3) return;

    let word;
    const lesson = this.state.lessons[this.state.currentLessonIndex];
    if (lesson?.config?.enforceAlternate) {
      const targetThumb = this.state.nextThumb || 'left';
      const pool = targetThumb === 'left' ? this.state.leftWords : this.state.rightWords;
      if (pool && pool.length) {
        word = pool[Math.floor(this.state.rng() * pool.length)];
        this.state.nextThumb = targetThumb === 'left' ? 'right' : 'left';
      } else {
        word = this.state.activeWords[Math.floor(this.state.rng() * this.state.activeWords.length)];
      }
    } else {
      word = this.state.activeWords[Math.floor(this.state.rng() * this.state.activeWords.length)];
    }

    const wordElement = new WordElement(word, this.onMiss);

    const estimatedWidth = word.length * 12 + 28;
    const left = findSafeSpawnPosition(
      estimatedWidth,
      this.state.falling,
      this.playfield,
      this.state.rng
    );

    wordElement.setPosition(left, this.fallDuration());
    this.playfield.appendChild(wordElement.el);

    this.state.falling.push({ word: word.toLowerCase(), wordElement });
    return wordElement;
  }

  startTimer(onSpawn) {
    this.stopTimer();
    this.spawnTimer = setInterval(() => {
      const wordElement = this.spawn();
      if (onSpawn) onSpawn(wordElement);
    }, this.spawnInterval());
  }

  stopTimer() {
    if (this.spawnTimer) {
      clearInterval(this.spawnTimer);
      this.spawnTimer = null;
    }
  }

  clearAllWords() {
    this.state.falling.forEach(({ wordElement }) => wordElement.remove());
    this.state.falling = [];
  }
}
```

**Changes to main.js**:
```javascript
import { WordElement } from './game/WordElement.js';
import { ActiveWordTracker } from './game/ActiveWordTracker.js';
import { WordSpawner } from './game/WordSpawner.js';

const activeWordTracker = new ActiveWordTracker(playfield);
const wordSpawner = new WordSpawner(playfield, state, handleMiss);
```

**Validation**:
```bash
npm run dev
# Test: Words spawn, fall, highlight correctly, active word tracked
```

**Risk**: Medium - complex DOM interaction
**Rollback**: `git checkout src/main.js src/game/`

---

### Phase 6: Extract Input Handler & Game Loop (30 minutes)
**Goal**: Centralize input processing and game loop management

**Files to Create**:

#### `src/game/InputHandler.js`
```javascript
import { inferThumbFromChar } from '../utils/thumbDetection.js';
import { getExpectedThumb } from '../utils/thumbDetection.js';

// Lines 690-759 from main.js
export class InputHandler {
  constructor(hiddenInput, state, scoreManager, hud, activeWordTracker) {
    this.hiddenInput = hiddenInput;
    this.state = state;
    this.scoreManager = scoreManager;
    this.hud = hud;
    this.activeWordTracker = activeWordTracker;
    this.currentThumbSide = null;
  }

  setCurrentThumbSide(side) {
    this.currentThumbSide = side;
  }

  setupListener() {
    this.hiddenInput.addEventListener('input', () => {
      const val = this.hiddenInput.value.toLowerCase().replace(/[^a-z]/g, '');
      const lastChar = val.slice(-1);
      const detectedThumb = inferThumbFromChar(lastChar);

      if (detectedThumb) {
        this.currentThumbSide = detectedThumb;
      }

      if (!val) return;
      if (val.length > 20) {
        this.hiddenInput.value = '';
        return;
      }

      const activeEl = document.querySelector('.word.active-word');
      const activeEntry = this.state.falling.find(f => f.wordElement.el === activeEl);

      if (activeEntry) {
        if (activeEntry.word.startsWith(val)) {
          activeEntry.wordElement.el.dataset.typedProgress = val;
          activeEntry.wordElement.highlightProgress(val);

          if (val === activeEntry.word) {
            this.handleWordComplete(activeEntry, detectedThumb);
          }
        } else {
          activeEntry.wordElement.flashError();
          this.hiddenInput.value = '';
        }
      }
    });
  }

  handleWordComplete(activeEntry, detectedThumb) {
    const expected = getExpectedThumb(activeEntry.word);
    const actualThumb = detectedThumb || this.currentThumbSide;
    const thumbKnown = Boolean(actualThumb);
    let breakCombo = false;

    // Mark captured
    activeEntry.wordElement.pop();

    if (thumbKnown) {
      const correct = actualThumb === expected;
      this.scoreManager.trackThumbAccuracy(correct);

      if (correct) {
        this.scoreManager.incrementCombo();
        activeEntry.wordElement.flashCorrect(() => {
          this.removeWord(activeEntry);
        });
      } else {
        breakCombo = true;
        this.scoreManager.breakCombo();
        activeEntry.wordElement.flashWrong(() => {
          this.removeWord(activeEntry);
        });
      }
    } else {
      this.scoreManager.incrementCombo();
      this.removeWord(activeEntry);
    }

    this.scoreManager.awardScore(activeEntry.word.length, this.state.combo);
    this.scoreManager.trackWordTyped(activeEntry.word.length);
    this.hud.update(this.state);
    this.hiddenInput.value = '';
  }

  removeWord(entry) {
    setTimeout(() => {
      entry.wordElement.remove();
      const currentIdx = this.state.falling.indexOf(entry);
      if (currentIdx !== -1) {
        this.state.falling.splice(currentIdx, 1);
        this.activeWordTracker.update(this.state.falling);
      }
    }, 120);
  }
}
```

#### `src/core/GameLoop.js`
```javascript
import { RAMP_MS } from '../config/constants.js';

// Lines 583-598 from main.js
export class GameLoop {
  constructor(state, wordSpawner, overlayManager, hud, activeWordTracker) {
    this.state = state;
    this.wordSpawner = wordSpawner;
    this.overlayManager = overlayManager;
    this.hud = hud;
    this.activeWordTracker = activeWordTracker;
    this.rampTimer = null;
    this.positionTimer = null;
  }

  start() {
    this.wordSpawner.startTimer((wordElement) => {
      if (this.state.falling.length === 1) {
        this.activeWordTracker.update(this.state.falling);
      }
    });

    this.rampTimer = setInterval(() => this.levelUp(), RAMP_MS);
    this.positionTimer = setInterval(() => {
      if (this.state.falling.length > 1) {
        this.activeWordTracker.update(this.state.falling);
      }
    }, 100);
  }

  levelUp() {
    this.state.level += 1;
    this.hud.update(this.state);
    this.wordSpawner.stopTimer();
    this.wordSpawner.startTimer();
    this.showLevelUpPause();
  }

  showLevelUpPause() {
    this.state.running = false;
    this.stop();
    this.overlayManager.showLevelUpPause(this.state.level);
  }

  stop() {
    this.wordSpawner.stopTimer();
    if (this.rampTimer) {
      clearInterval(this.rampTimer);
      this.rampTimer = null;
    }
    if (this.positionTimer) {
      clearInterval(this.positionTimer);
      this.positionTimer = null;
    }
  }
}
```

#### `src/core/GameState.js`
```javascript
import { loadUnlockedLessons, loadHighScore } from '../utils/storage.js';

// Lines 162-187 from main.js
export class GameState {
  constructor() {
    this.words = [];
    this.lessons = [];
    this.activeWords = [];
    this.leftWords = [];
    this.rightWords = [];
    this.nextThumb = null;
    this.unlockedLessons = loadUnlockedLessons();
    this.currentLessonIndex = 0;
    this.running = false;
    this.score = 0;
    this.highScore = loadHighScore();
    this.lives = 5;
    this.level = 1;
    this.falling = [];
    this.correctThumbs = 0;
    this.totalThumbs = 0;
    this.recentWords = [];
    this.combo = 0;
    this.maxCombo = 0;
    this.dailyMode = false;
    this.rng = Math.random;
  }

  reset() {
    this.score = 0;
    this.lives = 5;
    this.level = 1;
    this.correctThumbs = 0;
    this.totalThumbs = 0;
    this.recentWords = [];
    this.combo = 0;
    this.maxCombo = 0;
    this.nextThumb = null;
    this.falling = [];
  }
}
```

#### `src/core/GameLifecycle.js`
```javascript
import { createSeededRng } from '../utils/rng.js';
import { getExpectedThumb } from '../utils/thumbDetection.js';

// Lines 631-650, 652-688 from main.js
export class GameLifecycle {
  constructor(state, gameLoop, wordSpawner, hud, overlayManager, lessonPicker, progressTracker, focusInput) {
    this.state = state;
    this.gameLoop = gameLoop;
    this.wordSpawner = wordSpawner;
    this.hud = hud;
    this.overlayManager = overlayManager;
    this.lessonPicker = lessonPicker;
    this.progressTracker = progressTracker;
    this.focusInput = focusInput;
  }

  async start(hiddenInput, lessonPickerEl) {
    const idx = parseInt(lessonPickerEl.value);
    this.state.currentLessonIndex = idx;
    this.state.activeWords = this.lessonPicker.filterWordsForLesson(
      this.state.lessons[idx],
      this.state.words
    );
    this.state.leftWords = this.state.activeWords.filter(w => getExpectedThumb(w) === 'left');
    this.state.rightWords = this.state.activeWords.filter(w => getExpectedThumb(w) === 'right');
    this.state.nextThumb = this.state.lessons[idx]?.config?.enforceAlternate ? 'left' : null;

    if (this.state.activeWords.length === 0) {
      alert('No words found for this lesson configuration!');
      return;
    }

    this.state.rng = createSeededRng(this.state.dailyMode);
    this.state.running = true;
    this.state.score = 0;
    this.state.lives = 5;
    this.state.level = this.state.lessons[idx].config.level || 1;
    this.state.correctThumbs = 0;
    this.state.totalThumbs = 0;
    this.state.recentWords = [];
    this.state.combo = 0;
    this.state.maxCombo = 0;
    this.wordSpawner.clearAllWords();
    this.hud.update(this.state);
    this.overlayManager.hide();
    lessonPickerEl.disabled = true;

    hiddenInput.value = '';
    this.focusInput();
    this.wordSpawner.spawn();
    this.gameLoop.start();
  }

  end(reason = 'Game over', lessonPickerEl) {
    this.state.running = false;
    this.gameLoop.stop();
    this.wordSpawner.clearAllWords();
    const unlockMsg = this.progressTracker.checkUnlock();
    this.overlayManager.showGameOver(unlockMsg);
    lessonPickerEl.disabled = false;
  }

  reset(lessonPickerEl) {
    this.state.reset();
    this.gameLoop.stop();
    this.wordSpawner.clearAllWords();
    this.hud.update(this.state);
    this.overlayManager.showReady();
    lessonPickerEl.disabled = false;
  }
}
```

**Changes to main.js**:
```javascript
import { GameState } from './core/GameState.js';
import { GameLoop } from './core/GameLoop.js';
import { GameLifecycle } from './core/GameLifecycle.js';
import { InputHandler } from './game/InputHandler.js';

const gameState = new GameState();
const gameLoop = new GameLoop(gameState, wordSpawner, overlayManager, hud, activeWordTracker);
const gameLifecycle = new GameLifecycle(gameState, gameLoop, wordSpawner, hud, overlayManager, lessonPickerInstance, progressTracker, focusInput);
const inputHandler = new InputHandler(hiddenInput, gameState, scoreManager, hud, activeWordTracker);
```

**Validation**:
```bash
npm run dev
# Full gameplay test: start, type words, level up, game over
```

**Risk**: High - core game loop
**Rollback**: `git checkout src/main.js src/core/ src/game/`

---

### Phase 7: Final Main.js Cleanup (15 minutes)
**Goal**: Reduce main.js to pure orchestration

**Final main.js structure** (~150 lines):
```javascript
import './style.css';

// Config
import { defaultLessons, defaultWords } from './config/constants.js';

// Utils
import { setupFocusManagement } from './utils/focus.js';

// Core
import { GameState } from './core/GameState.js';
import { GameLoop } from './core/GameLoop.js';
import { GameLifecycle } from './core/GameLifecycle.js';

// Game
import { WordSpawner } from './game/WordSpawner.js';
import { ActiveWordTracker } from './game/ActiveWordTracker.js';
import { InputHandler } from './game/InputHandler.js';

// Scoring
import { MetricsCalculator } from './scoring/MetricsCalculator.js';
import { ScoreManager } from './scoring/ScoreManager.js';
import { ProgressTracker } from './scoring/ProgressTracker.js';

// UI
import { HUD } from './ui/HUD.js';
import { ThemeManager } from './ui/ThemeManager.js';
import { LessonPicker } from './ui/LessonPicker.js';
import { OverlayManager } from './ui/OverlayManager.js';

// DOM setup (template HTML - lines 5-70 unchanged)
const root = document.querySelector('#app');
root.innerHTML = template;

// Element references (lines 74-92 unchanged)
const hiddenInput = document.querySelector('#hiddenInput');
// ... all other element queries

// Initialize state
const state = new GameState();

// Initialize managers
const metricsCalc = new MetricsCalculator();
const scoreManager = new ScoreManager(state);
const progressTracker = new ProgressTracker(state, state.lessons);
const hud = new HUD({ scoreVal, bestVal, ... }, metricsCalc);
const themeManager = new ThemeManager(themePicker, themeInfo);
const lessonPickerInstance = new LessonPicker(lessonPicker, lessonInfo, state);
const overlayManager = new OverlayManager(overlay, overlayTitle, overlayMsg, overlayRestart);
const activeWordTracker = new ActiveWordTracker(playfield);

// Setup word spawner
const handleMiss = (el) => {
  if (el.dataset.removed === '1') return;
  if (!state.running) return;
  const idx = state.falling.findIndex(f => f.wordElement.el === el);
  if (idx === -1) return;
  state.falling[idx].wordElement.remove();
  state.falling.splice(idx, 1);
  scoreManager.loseLife();
  hud.update(state);
  if (state.lives <= 0) {
    gameLifecycle.end('Out of lives', lessonPicker);
  }
};
const wordSpawner = new WordSpawner(playfield, state, handleMiss);

// Setup game loop
const gameLoop = new GameLoop(state, wordSpawner, overlayManager, hud, activeWordTracker);

// Setup lifecycle
const { focusInput, getCurrentThumbSide } = setupFocusManagement(hiddenInput);
const gameLifecycle = new GameLifecycle(state, gameLoop, wordSpawner, hud, overlayManager, lessonPickerInstance, progressTracker, focusInput);

// Setup input handler
const inputHandler = new InputHandler(hiddenInput, state, scoreManager, hud, activeWordTracker);
inputHandler.setupListener();

// PWA badges (lines 779-803 unchanged)
const updateBadges = () => { ... };
updateBadges();
window.addEventListener('online', updateBadges);
window.addEventListener('offline', updateBadges);

// Load data and initialize
const loadData = async () => {
  try {
    const [wRes, lRes] = await Promise.all([
      fetch('/data/words.json'),
      fetch('/data/lessons.json')
    ]);
    state.words = (await wRes.json()).filter(Boolean);
    state.lessons = await lRes.json();
  } catch {
    state.words = defaultWords;
    state.lessons = defaultLessons;
  }

  lessonPickerInstance.render();
  themeManager.renderPicker();
  themeManager.setupEventListeners();
  lessonPickerInstance.setupEventListeners();

  overlayManager.setupRestartButton(async () => {
    if (!state.running) {
      await gameLifecycle.start(hiddenInput, lessonPicker);
    } else {
      overlayManager.hide();
      state.running = true;
      wordSpawner.spawn();
      gameLoop.start();
      hiddenInput.value = '';
      focusInput();
    }
  });
};

loadData().then(() => {
  gameLifecycle.reset(lessonPicker);
});

// Service worker (lines 810-826 unchanged)
if ('serviceWorker' in navigator) { ... }
```

**Validation**:
```bash
npm run dev
npm run build
# Full smoke test of all features
```

**Risk**: Low - just reorganizing imports
**Rollback**: `git checkout src/main.js`

---

## Testing Strategy

### After Each Phase:
1. **Build Check**: `npm run build` - ensures no import errors
2. **Dev Server**: `npm run dev` - manual smoke test
3. **Feature Checklist**:
   - [ ] Game starts
   - [ ] Words spawn and fall
   - [ ] Typing works
   - [ ] Scoring updates
   - [ ] Lives decrease on miss
   - [ ] Level up works
   - [ ] Game over works
   - [ ] Theme switching works
   - [ ] Lesson switching works
   - [ ] High score saves
   - [ ] Lesson unlocks persist

### Final Validation:
```bash
# Clean build
rm -rf dist node_modules
npm install
npm run build

# Production test
npx vite preview
```

---

## Risk Mitigation

### Rollback Commands by Phase:
```bash
# Phase 1 rollback
git checkout src/main.js src/config/

# Phase 2 rollback
git checkout src/main.js src/utils/

# Phase 3 rollback
git checkout src/main.js src/scoring/

# Phase 4 rollback
git checkout src/main.js src/ui/

# Phase 5 rollback
git checkout src/main.js src/game/

# Phase 6 rollback
git checkout src/main.js src/core/ src/game/

# Nuclear rollback (start over)
git reset --hard HEAD
```

### Common Issues & Fixes:

**Issue**: Import path errors
**Fix**: Check all `import` statements use `./` or `../` prefix

**Issue**: Circular dependencies
**Fix**: Ensure utilities don't import game logic, only config/constants

**Issue**: `this` binding errors
**Fix**: Use arrow functions or `.bind(this)` in event listeners

**Issue**: State mutations not reflected
**Fix**: Ensure all managers receive same `state` reference, not copies

---

## Post-Refactor Benefits

### Immediate:
- Each module < 120 lines (easier to read)
- Clear file organization (know where to look for bugs)
- Isolated concerns (fix scoring without touching input)

### Medium-term:
- Unit testable (mock dependencies easily)
- Reusable modules (MetricsCalculator works in other projects)
- Team-friendly (multiple devs can work in parallel)

### Long-term:
- Feature additions don't bloat main.js
- Bug fixes have limited blast radius
- Refactoring one module doesn't risk breaking others

---

## Appendix: File Size Breakdown

**Before Refactor**:
- `main.js`: 827 lines

**After Refactor**:
- `main.js`: ~150 lines
- Config: ~120 lines (3 files)
- Utils: ~200 lines (5 files)
- Core: ~220 lines (3 files)
- Game: ~260 lines (4 files)
- Scoring: ~170 lines (3 files)
- UI: ~210 lines (4 files)

**Total**: ~1330 lines (60% increase due to class structure, exports, imports)
**Median file size**: 50 lines
**Largest file**: GameLifecycle.js (100 lines)

---

## Questions Before Starting?

1. Do you want to proceed with this plan?
2. Should we add automated tests during the refactor?
3. Any specific modules you're concerned about?
4. Want me to start with Phase 0 and execute one phase at a time?
