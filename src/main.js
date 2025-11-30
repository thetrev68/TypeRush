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

// DOM setup
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

// Element references
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

// Initialize state
const gameState = new GameState();

const { focusInput } = setupFocusManagement(hiddenInput);

// Initialize managers
const metricsCalc = new MetricsCalculator();
const scoreManager = new ScoreManager(gameState);
const progressTracker = new ProgressTracker(gameState, gameState.lessons);
const hud = new HUD({ scoreVal, bestVal, livesVal, speedVal, wpmVal, accuracyVal, comboVal }, metricsCalc);
const themeManager = new ThemeManager(themePicker, themeInfo);
const lessonPickerManager = new LessonPicker(lessonPicker, lessonInfo, gameState);
const overlayManager = new OverlayManager(overlay, overlayTitle, overlayMsg, overlayRestart);

// Setup word spawner
const handleMiss = (el) => {
  if (el.dataset.removed === '1') return;
  if (!gameState.running) return;
  const idx = gameState.falling.findIndex((f) => f.el === el);
  if (idx === -1) return;
  el.dataset.removed = '1';
  el.remove();
  gameState.falling.splice(idx, 1);
  scoreManager.loseLife();
  updateHUD();
  if (gameState.lives <= 0) {
    gameLifecycle.end('Out of lives', lessonPicker);
  }
};

const wordSpawner = new WordSpawner(playfield, gameState, handleMiss);
const activeWordTracker = new ActiveWordTracker(playfield);

// Setup game loop
const gameLoop = new GameLoop(gameState, wordSpawner, overlayManager, hud, activeWordTracker);

// Setup lifecycle
const gameLifecycle = new GameLifecycle(gameState, gameLoop, wordSpawner, hud, overlayManager, lessonPickerManager, progressTracker, focusInput);

// Setup input handler
const inputHandler = new InputHandler(hiddenInput, gameState, scoreManager, hud, activeWordTracker);

const loadData = async () => {
  try {
    const [wRes, lRes] = await Promise.all([fetch('/data/words.json'), fetch('/data/lessons.json')]);
    gameState.words = (await wRes.json()).filter(Boolean);
    gameState.lessons = await lRes.json();
  } catch {
    gameState.words = defaultWords;
    gameState.lessons = defaultLessons;
  }

  lessonPickerManager.render();
  themeManager.renderPicker();
  themeManager.setupEventListeners();
  lessonPickerManager.setupEventListeners();
};

const updateHUD = () => {
  hud.update(gameState);
};

inputHandler.setupListener();

overlayManager.setupRestartButton(async () => {
  if (!gameState.running) {
    // Starting fresh game
    await gameLifecycle.start(hiddenInput, lessonPicker);
  } else {
    // Resuming from pause (level up)
    overlayManager.hide();
    overlayRestart.textContent = 'Play';
    gameState.running = true;
    wordSpawner.spawn();
    gameLoop.start();
    hiddenInput.value = '';
    focusInput();
  }
});

// PWA badges
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

// Load data and initialize
loadData().then(() => {
  gameLifecycle.reset(lessonPicker);
});

// Service worker
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
