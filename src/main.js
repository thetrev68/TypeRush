import './style.css';
import { BASE_FALL, BASE_SPAWN, RAMP_MS, MIN_FALL, MIN_SPAWN, leftLetters, rightLetters, defaultLessons, defaultWords } from './config/constants.js';
import { themes } from './config/themes.js';
import { getExpectedThumb, inferThumbFromChar } from './utils/thumbDetection.js';
import { createSeededRng } from './utils/rng.js';
import { saveProgress, loadUnlockedLessons, loadHighScore, saveHighScore, loadTheme, saveTheme } from './utils/storage.js';
import { setupFocusManagement } from './utils/focus.js';
import { findSafeSpawnPosition } from './utils/positioning.js';
import { MetricsCalculator } from './scoring/MetricsCalculator.js';
import { ScoreManager } from './scoring/ScoreManager.js';
import { ProgressTracker } from './scoring/ProgressTracker.js';

const root = document.querySelector('#app');

const template = `
  <main class="app">
    <header class="top">
      <div class="title">
        <h1>TypeRush</h1>
        <p>Two-thumb typing trainer</p>
      </div>
      <div class="badges">
        <span class="pill" id="pwaBadge">PWA</span>
        <span class="pill" id="offlineBadge">Offline</span>
      </div>
    </header>

    <section class="hud">
      <div class="hud-item">
        <span>Score</span>
        <strong id="scoreVal">0</strong>
      </div>
      <div class="hud-item">
        <span>Best</span>
        <strong id="bestVal">0</strong>
      </div>
      <div class="hud-item">
        <span>Lives</span>
        <strong id="livesVal">5</strong>
      </div>
      <div class="hud-item">
        <span>Speed</span>
        <strong id="speedVal">Lv 1</strong>
      </div>
      <div class="hud-item">
        <span>WPM</span>
        <strong id="wpmVal">0</strong>
      </div>
      <div class="hud-item">
        <span>Accuracy</span>
        <strong id="accuracyVal">100%</strong>
      </div>
      <div class="hud-item">
        <span>Combo</span>
        <strong id="comboVal">x1</strong>
      </div>
    </section>

    <section class="playfield" id="playfield">
      <div class="overlay hidden" id="overlay">
        <div class="overlay-card">
          <h2 id="overlayTitle">Ready?</h2>
          <p id="overlayMsg">Tap Play to start.</p>
          <div class="lesson-control">
            <select id="lessonPicker" class="lesson-select"></select>
            <div id="lessonInfo" class="lesson-info"></div>
          </div>
          <div class="lesson-control">
            <select id="themePicker" class="lesson-select"></select>
            <div id="themeInfo" class="lesson-info"></div>
          </div>
          <button id="overlayRestart">Play</button>
        </div>
      </div>
    </section>

    <p class="tip">Tap anywhere to keep the keyboard focused.</p>
    <input id="hiddenInput" autocomplete="off" autocorrect="off" spellcheck="false" />
  </main>
`;

root.innerHTML = template;

const hiddenInput = document.querySelector('#hiddenInput');
const playfield = document.getElementById('playfield');
const pwaBadge = document.getElementById('pwaBadge');
const offlineBadge = document.getElementById('offlineBadge');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMsg = document.getElementById('overlayMsg');
const overlayRestart = document.getElementById('overlayRestart');
const lessonPicker = document.getElementById('lessonPicker');
const lessonInfo = document.getElementById('lessonInfo');
const themePicker = document.getElementById('themePicker');
const themeInfo = document.getElementById('themeInfo');
const scoreVal = document.getElementById('scoreVal');
const bestVal = document.getElementById('bestVal');
const livesVal = document.getElementById('livesVal');
const speedVal = document.getElementById('speedVal');
const wpmVal = document.getElementById('wpmVal');
const accuracyVal = document.getElementById('accuracyVal');
const comboVal = document.getElementById('comboVal');

let currentTheme = loadTheme();

const state = {
  words: [],
  lessons: [],
  activeWords: [],
  leftWords: [],
  rightWords: [],
  nextThumb: null,
  unlockedLessons: loadUnlockedLessons(),
  currentLessonIndex: 0,
  running: false,
  score: 0,
  highScore: loadHighScore(),
  lives: 5,
  level: 1,
  spawnTimer: null,
  rampTimer: null,
  positionTimer: null,
  falling: [],
  correctThumbs: 0,
  totalThumbs: 0,
  recentWords: [],
  combo: 0,
  maxCombo: 0,
  dailyMode: false,
  rng: Math.random,
};

const { focusInput, getCurrentThumbSide, setCurrentThumbSide } = setupFocusManagement(hiddenInput);

const metricsCalc = new MetricsCalculator();
const scoreManager = new ScoreManager(state);
const progressTracker = new ProgressTracker(state);

const applyTheme = (key) => {
  const theme = themes[key] || themes.default;
  Object.entries(theme.vars).forEach(([k, v]) => {
    document.documentElement.style.setProperty(k, v);
  });
  // Update body class for theme-specific CSS
  document.body.className = `theme-${key}`;
  currentTheme = key;
  saveTheme(key);
  if (themeInfo) {
    themeInfo.textContent = `Theme: ${theme.name}`;
  }
};

const renderThemePicker = () => {
  themePicker.innerHTML = Object.entries(themes)
    .map(([k, v]) => `<option value="${k}" ${k === currentTheme ? 'selected' : ''}>${v.name}</option>`)
    .join('');
  themePicker.value = currentTheme;
  applyTheme(currentTheme);
};

const filterWordsForLesson = (lesson) => {
  const cfg = lesson.config;
  return state.words.filter((w) => {
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
};

const loadData = async () => {
  try {
    const [wRes, lRes] = await Promise.all([fetch('/data/words.json'), fetch('/data/lessons.json')]);
    state.words = (await wRes.json()).filter(Boolean);
    state.lessons = await lRes.json();
  } catch {
    state.words = defaultWords;
    state.lessons = defaultLessons;
  }

  renderLessonPicker();
  renderThemePicker();
};

const renderLessonPicker = () => {
  lessonPicker.innerHTML = state.lessons
    .map((l, i) => {
      const locked = !state.unlockedLessons.includes(i);
      return `<option value="${i}" ${locked ? 'disabled' : ''}>${locked ? '🔒 ' : ''}${l.title}</option>`;
    })
    .join('');
  lessonPicker.value = state.currentLessonIndex;
  updateLessonInfo();
};

const updateLessonInfo = () => {
  const idx = parseInt(lessonPicker.value);
  state.currentLessonIndex = idx;
  const lesson = state.lessons[idx];
  const locked = !state.unlockedLessons.includes(idx);
  if (lesson) {
    if (locked) {
      lessonInfo.textContent = 'Locked: Finish previous with 80% acc OR 20 WPM OR 10 words.';
      lessonInfo.style.color = '#ff4d6d';
    } else {
      lessonInfo.textContent = lesson.description;
      lessonInfo.style.color = 'var(--accent-2)';
    }
  }
};

lessonPicker.addEventListener('change', () => {
  updateLessonInfo();
});

themePicker.addEventListener('change', (e) => {
  applyTheme(e.target.value);
});

// Add touch support for mobile
lessonPicker.addEventListener('touchstart', (e) => {
  e.stopPropagation();
}, { passive: true });

themePicker.addEventListener('touchstart', (e) => {
  e.stopPropagation();
}, { passive: true });

const updateHUD = () => {
  scoreVal.textContent = state.score.toString();
  bestVal.textContent = state.highScore.toString();
  livesVal.textContent = `${state.lives}`;
  speedVal.textContent = `Lv ${state.level}`;
  wpmVal.textContent = metricsCalc.calculateWPM(state.recentWords).toString();
  const acc = metricsCalc.calculateAccuracy(state.correctThumbs, state.totalThumbs);
  accuracyVal.textContent = `${acc}%`;
  comboVal.textContent = `x${metricsCalc.calculateComboMultiplier(state.combo)}`;
};

const clearFalling = () => {
  state.falling.forEach(({ el }) => el.remove());
  state.falling = [];
};

const updateWordPositions = () => {
  if (state.falling.length > 1) {
    updateActiveWord();
  }
};

const spawnInterval = () => Math.max(MIN_SPAWN, BASE_SPAWN - (state.level - 1) * 180);
const fallDuration = () => Math.max(MIN_FALL, BASE_FALL - (state.level - 1) * 900);

const handleMiss = (el) => {
  if (el.dataset.removed === '1') return;
  if (!state.running) return;
  const idx = state.falling.findIndex((f) => f.el === el);
  if (idx === -1) return;
  el.dataset.removed = '1';
  el.remove();
  state.falling.splice(idx, 1);
  scoreManager.loseLife();
  updateHUD();
  if (state.lives <= 0) {
    endGame('Out of lives');
  }
};

const updateActiveWord = () => {
  // Remove active class from all words
  state.falling.forEach(f => f.el.classList.remove('active-word'));
  
  if (state.falling.length === 0) return;
  
  // Find the word closest to bottom (highest position)
  let activeEntry = state.falling[0];
  const playfieldRect = playfield.getBoundingClientRect();
  
  state.falling.forEach(entry => {
    const rect = entry.el.getBoundingClientRect();
    if (rect.top > playfieldRect.top) { // Only consider words that have started falling
      const entryBottom = rect.bottom;
      const activeBottom = activeEntry.el.getBoundingClientRect().bottom;
      if (entryBottom > activeBottom) {
        activeEntry = entry;
      }
    }
  });
  
  activeEntry.el.classList.add('active-word');
};

const highlightWordProgress = (el, progress) => {
  const word = el.dataset.originalWord || el.textContent;
  el.dataset.originalWord = word; // Store original word for reference
  
  if (progress.length === 0) {
    // Add thumb indicator to first letter
    const firstLetter = word[0];
    const isLeft = leftLetters.has(firstLetter.toLowerCase());
    const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';
    el.innerHTML = `<span class="${firstLetterClass}">${firstLetter}</span>${word.substring(1)}`;
    return;
  }
  
  const typed = word.substring(0, progress.length);
  const remaining = word.substring(progress.length);
  const firstLetter = word[0];
  const isLeft = leftLetters.has(firstLetter.toLowerCase());
  const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';
  
  if (progress.length === 1) {
    el.innerHTML = `<span class="typed ${firstLetterClass}">${typed}</span>${remaining}`;
  } else {
    el.innerHTML = `<span class="typed">${typed}</span>${remaining}`;
  }
};

const popWord = (entry, { breakCombo = false, awardScore = true } = {}) => {
  const idx = state.falling.indexOf(entry);
  if (idx === -1) return;
  if (entry.missHandler) {
    entry.el.removeEventListener('animationend', entry.missHandler);
  }
  entry.el.dataset.removed = '1';
  entry.el.style.animationPlayState = 'paused';
  entry.el.classList.add('popped');

  if (awardScore) {
    scoreManager.awardScore(entry.word.length, state.combo, breakCombo);
  } else if (breakCombo) {
    scoreManager.breakCombo();
  }

  scoreManager.trackWordTyped(entry.word.length);
  updateHUD();

  // Remove after animation completes
  setTimeout(() => {
    entry.el.remove();
    const currentIdx = state.falling.indexOf(entry);
    if (currentIdx !== -1) {
      state.falling.splice(currentIdx, 1);
      updateActiveWord();
    }
  }, 120);
};

const setRng = () => {
  state.rng = createSeededRng(state.dailyMode);
};

const spawnWord = () => {
  if (!state.running || !state.activeWords.length) return;
  if (state.falling.length >= 3) return; // Allow up to 3 words on screen

  let word;
  const lesson = state.lessons[state.currentLessonIndex];
  if (lesson?.config?.enforceAlternate) {
    const targetThumb = state.nextThumb || 'left';
    const pool = targetThumb === 'left' ? state.leftWords : state.rightWords;
    if (pool && pool.length) {
      word = pool[Math.floor(state.rng() * pool.length)];
      state.nextThumb = targetThumb === 'left' ? 'right' : 'left';
    } else {
      word = state.activeWords[Math.floor(state.rng() * state.activeWords.length)];
    }
  } else {
    word = state.activeWords[Math.floor(state.rng() * state.activeWords.length)];
  }

  const el = document.createElement('div');
  el.className = 'word';
  el.textContent = word;
  el.dataset.originalWord = word;
  el.dataset.removed = '0';
  el.dataset.typedProgress = '';

  // Add thumb indicator to first letter
  const firstLetter = word[0];
  const isLeft = leftLetters.has(firstLetter.toLowerCase());
  const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';
  el.innerHTML = `<span class="${firstLetterClass}">${firstLetter}</span>${word.substring(1)}`;

  // Find safe position with spacing
  const estimatedWidth = word.length * 12 + 28; // Rough estimate: ~12px per char + padding
  const left = findSafeSpawnPosition(estimatedWidth, state.falling, playfield, state.rng);
  el.style.left = `${left}px`;
  el.style.setProperty('--fall-duration', `${fallDuration()}ms`);

  const missHandler = () => handleMiss(el);
  el.addEventListener('animationend', missHandler);
  playfield.appendChild(el);
  state.falling.push({ word: word.toLowerCase(), el, missHandler });

  // Set the first spawned word as active
  if (state.falling.length === 1) {
    updateActiveWord();
  }
};

const restartSpawnTimer = () => {
  clearInterval(state.spawnTimer);
  state.spawnTimer = setInterval(spawnWord, spawnInterval());
};

const showLevelUpPause = () => {
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.rampTimer);
  overlayTitle.textContent = `Level ${state.level} Complete!`;
  overlayMsg.textContent = 'Take a quick break. Tap Play to continue.';
  overlay.classList.remove('hidden');
  overlayRestart.textContent = 'Continue';
};

const levelUp = () => {
  state.level += 1;
  updateHUD();
  restartSpawnTimer();
  showLevelUpPause();
};

const checkUnlock = () => {
  return progressTracker.checkUnlock(renderLessonPicker);
};

const endGame = (reason = 'Game over') => {
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.rampTimer);
  clearInterval(state.positionTimer);
  clearFalling();
  const unlockMsg = checkUnlock();
  overlayTitle.textContent = unlockMsg ? 'Success!' : 'Game Over';
  overlayMsg.textContent = unlockMsg || reason;
  overlay.classList.remove('hidden');
  lessonPicker.disabled = false;
};

const resetGame = () => {
  state.score = 0;
  state.lives = 5;
  state.level = 1;
  state.correctThumbs = 0;
  state.totalThumbs = 0;
  state.recentWords = [];
  state.combo = 0;
  state.maxCombo = 0;
  state.nextThumb = null;
  clearInterval(state.spawnTimer);
  clearInterval(state.rampTimer);
  clearInterval(state.positionTimer);
  clearFalling();
  updateHUD();
  overlayTitle.textContent = 'Ready?';
  overlayMsg.textContent = 'Tap start to play.';
  overlay.classList.remove('hidden');
  lessonPicker.disabled = false;
};

const startGame = async () => {
  const idx = parseInt(lessonPicker.value);
  state.currentLessonIndex = idx;
  state.activeWords = filterWordsForLesson(state.lessons[idx]);
  state.leftWords = state.activeWords.filter((w) => getExpectedThumb(w) === 'left');
  state.rightWords = state.activeWords.filter((w) => getExpectedThumb(w) === 'right');
  state.nextThumb = state.lessons[idx]?.config?.enforceAlternate ? 'left' : null;

  if (state.activeWords.length === 0) {
    alert('No words found for this lesson configuration!');
    return;
  }

  setRng();
  state.running = true;
  state.score = 0;
  state.lives = 5;
  state.level = state.lessons[idx].config.level || 1;
  state.correctThumbs = 0;
  state.totalThumbs = 0;
  state.recentWords = [];
  state.combo = 0;
  state.maxCombo = 0;
  clearFalling();
  updateHUD();
  overlay.classList.add('hidden');
  lessonPicker.disabled = true;

  hiddenInput.value = '';
  focusInput();
  spawnWord();
  restartSpawnTimer();
  clearInterval(state.rampTimer);
  clearInterval(state.positionTimer);
  state.rampTimer = setInterval(levelUp, RAMP_MS);
  state.positionTimer = setInterval(updateWordPositions, 100); // Update active word every 100ms
};

hiddenInput.addEventListener('input', () => {
  const val = hiddenInput.value.toLowerCase().replace(/[^a-z]/g, '');
  const lastChar = val.slice(-1);
  const detectedThumb = inferThumbFromChar(lastChar);
  if (detectedThumb) {
    setCurrentThumbSide(detectedThumb);
  }
  if (!val) return;
  if (val.length > 20) {
    hiddenInput.value = '';
    return;
  }

  // Find active word for typing
  const activeEl = document.querySelector('.word.active-word');
  const activeEntry = state.falling.find(f => f.el === activeEl);
  
  if (activeEntry) {
    // Check if the current input matches the start of the active word
    if (activeEntry.word.startsWith(val)) {
      // Correct partial input - update progress
      activeEntry.el.dataset.typedProgress = val;
      highlightWordProgress(activeEntry.el, val);
      
      // Check if word is complete
      if (val === activeEntry.word) {
        const expected = getExpectedThumb(activeEntry.word);
        const actualThumb = detectedThumb || getCurrentThumbSide();
        const thumbKnown = Boolean(actualThumb);
        let breakCombo = false;
        
        // Mark captured immediately to avoid later misses
        activeEntry.el.dataset.removed = '1';
        activeEntry.el.style.animationPlayState = 'paused';
        if (activeEntry.missHandler) {
          activeEntry.el.removeEventListener('animationend', activeEntry.missHandler);
        }
        
        if (thumbKnown) {
          const correct = actualThumb === expected;
          scoreManager.trackThumbAccuracy(correct);
          if (correct) {
            scoreManager.incrementCombo();
          } else {
            breakCombo = true;
            scoreManager.breakCombo();
          }
          const flashClass = correct ? 'correct-thumb' : 'wrong-thumb';
          const flashDuration = correct ? 420 : 480;
          activeEntry.el.classList.add(flashClass);
          setTimeout(() => activeEntry.el.classList.remove(flashClass), flashDuration);
          setTimeout(() => popWord(activeEntry, { breakCombo, awardScore: true }), flashDuration);
        } else {
          scoreManager.incrementCombo();
          popWord(activeEntry, { breakCombo: false, awardScore: true });
        }
        updateHUD();
        hiddenInput.value = '';
      }
    } else {
      // Wrong input - flash red but don't clear combo or immediately end game
      activeEntry.el.classList.add('wrong-flash');
      setTimeout(() => activeEntry.el.classList.remove('wrong-flash'), 200);
      hiddenInput.value = '';
    }
  }
});

overlayRestart.addEventListener('click', async () => {
  if (!state.running) {
    // Starting fresh game
    await startGame();
  } else {
    // Resuming from pause (level up)
    overlay.classList.add('hidden');
    overlayRestart.textContent = 'Play';
    state.running = true;
    spawnWord();
    restartSpawnTimer();
    state.rampTimer = setInterval(levelUp, RAMP_MS);
    state.positionTimer = setInterval(updateWordPositions, 100);
    hiddenInput.value = '';
    focusInput();
  }
});

// PWA and Offline detection
const updateBadges = () => {
  // Check if running as installed PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true;

  if (isPWA) {
    pwaBadge.classList.add('active');
  } else {
    pwaBadge.classList.remove('active');
  }

  // Check if offline
  const isOffline = !navigator.onLine;
  if (isOffline) {
    offlineBadge.classList.add('active');
  } else {
    offlineBadge.classList.remove('active');
  }
};

// Update badges on load and when online/offline changes
updateBadges();
window.addEventListener('online', updateBadges);
window.addEventListener('offline', updateBadges);

setRng();
loadData().then(() => {
  resetGame();
});

if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {
        // Silent fail for service worker registration
      });
    });
  } else {
    // In dev, remove any registered SW/caches so Vite HMR works reliably.
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    if (window.caches) {
      caches.keys().then((keys) =>
        keys.filter((k) => k.startsWith('typerush-cache')).forEach((k) => caches.delete(k))
      );
    }
  }
}
