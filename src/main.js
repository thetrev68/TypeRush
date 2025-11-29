import './style.css';

const root = document.querySelector('#app');

const template = `
  <main class="app">
    <header class="top">
      <div class="title">
        <h1>TypeRush</h1>
        <p>Two-thumb typing trainer</p>
      </div>
      <div class="badges">
        <span class="pill">PWA</span>
        <span class="pill">Offline</span>
      </div>
    </header>

    <section class="hud">
      <div class="hud-item">
        <span>Score</span>
        <strong id="scoreVal">0</strong>
      </div>
      <div class="hud-item">
        <span>Lives</span>
        <strong id="livesVal">3</strong>
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
    </section>

    <section class="playfield" id="playfield">
      <div class="overlay hidden" id="overlay">
        <div class="overlay-card">
          <h2 id="overlayTitle">Ready?</h2>
          <p id="overlayMsg">Tap start to play.</p>
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

    <section class="controls">
      <button id="startBtn">Start</button>
      <button id="restartBtn" class="ghost" disabled>Restart</button>
    </section>

    <p class="tip">Tap anywhere to keep the keyboard focused.</p>
    <input id="hiddenInput" autocomplete="off" autocorrect="off" spellcheck="false" />
  </main>
`;

root.innerHTML = template;

const hiddenInput = document.querySelector('#hiddenInput');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const playfield = document.getElementById('playfield');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMsg = document.getElementById('overlayMsg');
const overlayRestart = document.getElementById('overlayRestart');
const lessonPicker = document.getElementById('lessonPicker');
const lessonInfo = document.getElementById('lessonInfo');
const themePicker = document.getElementById('themePicker');
const themeInfo = document.getElementById('themeInfo');
const scoreVal = document.getElementById('scoreVal');
const livesVal = document.getElementById('livesVal');
const speedVal = document.getElementById('speedVal');
const wpmVal = document.getElementById('wpmVal');
const accuracyVal = document.getElementById('accuracyVal');

const BASE_FALL = 13000;
const BASE_SPAWN = 2500;
const RAMP_MS = 50000;
const MIN_FALL = 5000;
const MIN_SPAWN = 1400;

const leftLetters = new Set(['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b']);
const rightLetters = new Set(['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm']);
let currentThumbSide = null;

const themes = {
  default: {
    name: 'Default',
    vars: {
      '--bg': '#0b1220',
      '--panel': 'rgba(255, 255, 255, 0.04)',
      '--text': '#e6ecff',
      '--muted': '#9fb1d5',
      '--accent': '#7c5dff',
      '--accent-2': '#35d1ff',
    }
  },
  space: {
    name: 'Space',
    vars: {
      '--bg': '#0a0a0f',
      '--panel': 'rgba(138, 43, 226, 0.08)',
      '--text': '#e6e6ff',
      '--muted': '#9ca3af',
      '--accent': '#8a2be2',
      '--accent-2': '#00d4ff',
    }
  },
  ocean: {
    name: 'Ocean',
    vars: {
      '--bg': '#062042',
      '--panel': 'rgba(59, 130, 246, 0.06)',
      '--text': '#e0f2fe',
      '--muted': '#93c5fd',
      '--accent': '#0284c7',
      '--accent-2': '#06b6d4',
    }
  },
  racing: {
    name: 'Racing',
    vars: {
      '--bg': '#1a1a1a',
      '--panel': 'rgba(239, 68, 68, 0.06)',
      '--text': '#fef2f2',
      '--muted': '#fca5a5',
      '--accent': '#dc2626',
      '--accent-2': '#f59e0b',
    }
  }
};

let currentTheme = localStorage.getItem('tr_theme') || 'default';

const getExpectedThumb = (word) => {
  const first = word[0].toLowerCase();
  return leftLetters.has(first) ? 'left' : 'right';
};

const inferThumbFromChar = (char) => {
  if (!char) return null;
  const lower = char.toLowerCase();
  if (!/[a-z]/.test(lower)) return null;
  return leftLetters.has(lower) ? 'left' : 'right';
};

const state = {
  words: [],
  lessons: [],
  activeWords: [],
  leftWords: [],
  rightWords: [],
  nextThumb: null,
  unlockedLessons: JSON.parse(localStorage.getItem('tr_unlocked')) || [0],
  currentLessonIndex: 0,
  running: false,
  score: 0,
  lives: 5,
  level: 1,
  spawnTimer: null,
  rampTimer: null,
  falling: [],
  correctThumbs: 0,
  totalThumbs: 0,
  recentWords: [], // for WPM calc
};

const saveProgress = () => {
  localStorage.setItem('tr_unlocked', JSON.stringify(state.unlockedLessons));
};

const applyTheme = (themeName) => {
  const theme = themes[themeName];
  if (!theme) return;
  
  Object.entries(theme.vars).forEach(([prop, value]) => {
    document.documentElement.style.setProperty(prop, value);
  });
  
  // Update body class for theme-specific styling
  document.body.className = document.body.className.replace(/theme-\w+/, '');
  document.body.classList.add(`theme-${themeName}`);
  
  currentTheme = themeName;
  localStorage.setItem('tr_theme', themeName);
  updateThemeInfo();
};

const renderThemePicker = () => {
  themePicker.innerHTML = Object.entries(themes).map(([key, theme]) => 
    `<option value="${key}">${theme.name}</option>`
  ).join('');
  themePicker.value = currentTheme;
  applyTheme(currentTheme);
};

const updateThemeInfo = () => {
  themeInfo.textContent = `${themes[currentTheme].name} theme active`;
  themeInfo.style.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-2');
};

const focusInput = () => {
  hiddenInput.focus({ preventScroll: true });
  hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length);
};

['click', 'touchstart'].forEach((evt) => {
  document.addEventListener(evt, focusInput, { passive: true });
});

document.addEventListener('touchstart', (e) => {
  const x = e.touches[0].clientX;
  currentThumbSide = x < window.innerWidth / 2 ? 'left' : 'right';
}, { passive: true });

const filterWordsForLesson = (lesson) => {
  const cfg = lesson.config;
  return state.words.filter(w => {
    const chars = w.split('');
    if (cfg.allowedSet === 'left') {
      return chars.every(c => leftLetters.has(c));
    }
    if (cfg.allowedSet === 'right') {
      return chars.every(c => rightLetters.has(c));
    }
    if (cfg.maxLength && w.length > cfg.maxLength) return false;
    return true;
  });
};

const loadData = async () => {
  try {
    const [wRes, lRes] = await Promise.all([
      fetch('/data/words.json'),
      fetch('/data/lessons.json')
    ]);
    state.words = (await wRes.json()).filter(Boolean);
    state.lessons = await lRes.json();
    renderLessonPicker();
    renderThemePicker();
  } catch (err) {
    console.error('Failed to load data', err);
    renderThemePicker();
  }
};

const renderLessonPicker = () => {
  lessonPicker.innerHTML = state.lessons.map((l, i) => {
    const locked = !state.unlockedLessons.includes(i);
    const prefix = locked ? '🔒 ' : '';
    return `<option value="${i}">${prefix}${l.title}</option>`;
  }).join('');
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
      lessonInfo.textContent = "Locked: Complete previous lesson with 95% Acc & 30 WPM.";
      lessonInfo.style.color = "#ff4d6d";
      startBtn.disabled = true;
    } else {
      lessonInfo.textContent = lesson.description;
      lessonInfo.style.color = "var(--accent-2)";
      startBtn.disabled = false;
    }
  }
};

lessonPicker.addEventListener('change', updateLessonInfo);

themePicker.addEventListener('change', (e) => {
  applyTheme(e.target.value);
});

const updateHUD = () => {
  scoreVal.textContent = state.score.toString();
  livesVal.textContent = `${state.lives}`;
  speedVal.textContent = `Lv ${state.level}`;
  wpmVal.textContent = calculateWPM().toString();
  
  const acc = state.totalThumbs ? Math.round((state.correctThumbs / state.totalThumbs) * 100) : 100;
  accuracyVal.textContent = `${acc}%`;
};

const clearFalling = () => {
  state.falling.forEach(({ el }) => el.remove());
  state.falling = [];
};

const spawnInterval = () => Math.max(MIN_SPAWN, BASE_SPAWN - (state.level - 1) * 180);
const fallDuration = () => Math.max(MIN_FALL, BASE_FALL - (state.level - 1) * 900);

const handleMiss = (el) => {
  if (!state.running) return;
  const idx = state.falling.findIndex((f) => f.el === el);
  if (idx === -1) return;
  el.remove();
  state.falling.splice(idx, 1);
  state.lives -= 1;
  updateHUD();
  if (state.lives <= 0) {
    endGame('Out of lives');
  }
};

const popWord = (entry) => {
  const idx = state.falling.indexOf(entry);
  if (idx === -1) return;
  entry.el.classList.add('popped');
  setTimeout(() => entry.el.remove(), 120);
  state.falling.splice(idx, 1);
  state.score += Math.max(5, entry.word.length);
  
  // WPM Tracking
  const now = Date.now();
  state.recentWords.push({ time: now, chars: entry.word.length });
  // Keep only last 10 words
  if (state.recentWords.length > 10) state.recentWords.shift();
  
  updateHUD();
};

const calculateWPM = () => {
  if (state.recentWords.length < 2) return 0;
  const first = state.recentWords[0].time;
  const last = state.recentWords[state.recentWords.length - 1].time;
  const diffMin = (last - first) / 60000;
  if (diffMin <= 0) return 0;
  
  const totalChars = state.recentWords.reduce((sum, item) => sum + item.chars, 0);
  const words = totalChars / 5; // standard avg word length
  return Math.round(words / diffMin);
};

const spawnWord = () => {
  if (!state.running || !state.activeWords.length) return;
  if (state.falling.length >= 2) return;
  
  let word;
  const lesson = state.lessons[state.currentLessonIndex];
  
  if (lesson?.config?.enforceAlternate) {
     // Deterministic alternation
     const targetThumb = state.nextThumb || 'left';
     const sourceList = targetThumb === 'left' ? state.leftWords : state.rightWords;
     if (sourceList && sourceList.length > 0) {
       word = sourceList[Math.floor(Math.random() * sourceList.length)];
       state.nextThumb = targetThumb === 'left' ? 'right' : 'left';
     } else {
       // Fallback if one side has no words
       word = state.activeWords[Math.floor(Math.random() * state.activeWords.length)];
     }
  } else {
     word = state.activeWords[Math.floor(Math.random() * state.activeWords.length)];
  }

  const el = document.createElement('div');
  el.className = 'word';
  el.textContent = word;
  const maxLeft = Math.max(0, playfield.clientWidth - 80);
  const left = Math.random() * maxLeft;
  el.style.left = `${left}px`;
  el.style.setProperty('--fall-duration', `${fallDuration()}ms`);
  el.addEventListener('animationend', () => handleMiss(el));
  playfield.appendChild(el);
  state.falling.push({ word: word.toLowerCase(), el });
};

const restartSpawnTimer = () => {
  clearInterval(state.spawnTimer);
  state.spawnTimer = setInterval(spawnWord, spawnInterval());
};

const levelUp = () => {
  state.level += 1;
  updateHUD();
  restartSpawnTimer();
};

const checkUnlock = () => {
  const acc = state.totalThumbs ? (state.correctThumbs / state.totalThumbs) * 100 : 100;
  const wpm = calculateWPM();
  const nextIdx = state.currentLessonIndex + 1;
  
  if (acc >= 95 && wpm >= 30 && nextIdx < state.lessons.length) {
    if (!state.unlockedLessons.includes(nextIdx)) {
      state.unlockedLessons.push(nextIdx);
      saveProgress();
      renderLessonPicker();
      return `Next lesson unlocked! (WPM: ${wpm}, Acc: ${Math.round(acc)}%)`;
    }
  }
  return null;
};

const endGame = (reason = 'Game over') => {
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.rampTimer);
  clearFalling();
  
  const unlockMsg = checkUnlock();
  overlayTitle.textContent = unlockMsg ? 'Success!' : 'Game Over';
  overlayMsg.textContent = unlockMsg || reason;
  
  overlay.classList.remove('hidden');
  startBtn.disabled = false;
  restartBtn.disabled = false;
  lessonPicker.disabled = false;
};

const resetGame = () => {
  state.score = 0;
  state.lives = 5;
  state.level = 1;
  state.correctThumbs = 0;
  state.totalThumbs = 0;
  state.recentWords = [];
  state.nextThumb = null;
  clearInterval(state.spawnTimer);
  clearInterval(state.rampTimer);
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
    alert("No words found for this lesson configuration!");
    return;
  }

  // Setup alternation buckets if needed
  const lesson = state.lessons[idx];
  if (lesson.config.enforceAlternate) {
    state.leftWords = state.activeWords.filter(w => getExpectedThumb(w) === 'left');
    state.rightWords = state.activeWords.filter(w => getExpectedThumb(w) === 'right');
    state.nextThumb = Math.random() > 0.5 ? 'left' : 'right';
  }

  state.running = true;
  state.score = 0;
  state.lives = 5;
  state.level = state.lessons[idx].config.level || 1;
  state.correctThumbs = 0;
  state.totalThumbs = 0;
  state.recentWords = [];
  clearFalling();
  updateHUD();
  overlay.classList.add('hidden');
  lessonPicker.disabled = true;
  
  hiddenInput.value = '';
  focusInput();
  spawnWord();
  restartSpawnTimer();
  clearInterval(state.rampTimer);
  state.rampTimer = setInterval(levelUp, RAMP_MS);
  startBtn.disabled = true;
  restartBtn.disabled = false;
};

hiddenInput.addEventListener('input', () => {
  const val = hiddenInput.value.trim().toLowerCase();
  const lastChar = val.slice(-1);
  const detectedThumb = inferThumbFromChar(lastChar);
  if (detectedThumb) {
    currentThumbSide = detectedThumb;
  }
  if (!val) return;
  const entry = state.falling.find((f) => f.word === val);
  if (entry) {
    const expected = getExpectedThumb(entry.word);
    const actualThumb = detectedThumb || currentThumbSide;
    const thumbKnown = Boolean(actualThumb);
    if (thumbKnown) {
      state.totalThumbs++;
      const correct = actualThumb === expected;
      if (correct) state.correctThumbs++;
      const flashClass = correct ? 'correct-thumb' : 'wrong-thumb';
      const flashDuration = correct ? 420 : 480;
      entry.el.classList.add(flashClass);
      setTimeout(() => entry.el.classList.remove(flashClass), flashDuration);
      setTimeout(() => popWord(entry), flashDuration);
    } else {
      popWord(entry);
    }
    updateHUD();
    hiddenInput.value = '';
  } else if (val.length > 20) {
    hiddenInput.value = '';
  }
});

startBtn.addEventListener('click', () => {
  if (!state.running) {
    startGame();
  }
});

restartBtn.addEventListener('click', () => {
  resetGame();
  startGame();
});

overlayRestart.addEventListener('click', () => {
  if (!state.running) {
    startGame();
  } else {
    resetGame();
    startGame();
  }
});

// Initialize theme immediately
renderThemePicker();
applyTheme(currentTheme);

// Initialize app
loadData();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.error('Service worker registration failed', err);
    });
  });
}
