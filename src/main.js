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
        <span>Accuracy</span>
        <strong id="accuracyVal">100%</strong>
      </div>
    </section>

    <section class="playfield" id="playfield">
      <div class="overlay hidden" id="overlay">
        <div class="overlay-card">
          <h2 id="overlayTitle">Ready?</h2>
          <p id="overlayMsg">Tap start to play.</p>
          <button id="overlayRestart">Play again</button>
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
const scoreVal = document.getElementById('scoreVal');
const livesVal = document.getElementById('livesVal');
const speedVal = document.getElementById('speedVal');
const accuracyVal = document.getElementById('accuracyVal');

const BASE_FALL = 13000;
const BASE_SPAWN = 2500;
const RAMP_MS = 50000;
const MIN_FALL = 5000;
const MIN_SPAWN = 1400;

const leftLetters = new Set(['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b']);
let currentThumbSide = null;

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
  running: false,
  score: 0,
  lives: 5,
  level: 1,
  spawnTimer: null,
  rampTimer: null,
  falling: [],
  correctThumbs: 0,
  totalThumbs: 0,
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

const loadWords = async () => {
  if (state.words.length) return state.words;
  try {
    const res = await fetch('/data/words.json');
    const data = await res.json();
    state.words = data.filter(Boolean);
  } catch (err) {
    console.error('Failed to load words, using fallback', err);
    state.words = ['fast', 'thumb', 'type', 'speed', 'focus', 'quick', 'learn', 'tap', 'flow'];
  }
  return state.words;
};

const updateHUD = () => {
  scoreVal.textContent = state.score.toString();
  livesVal.textContent = `${state.lives}`;
  speedVal.textContent = `Lv ${state.level}`;
  accuracyVal.textContent = state.totalThumbs ? `${Math.round((state.correctThumbs / state.totalThumbs) * 100)}%` : '100%';
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
  updateHUD();
};

const spawnWord = () => {
  if (!state.running || !state.words.length) return;
  if (state.falling.length >= 2) return;
  const word = state.words[Math.floor(Math.random() * state.words.length)];
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

const endGame = (reason = 'Game over') => {
  state.running = false;
  clearInterval(state.spawnTimer);
  clearInterval(state.rampTimer);
  clearFalling();
  overlayTitle.textContent = 'Game Over';
  overlayMsg.textContent = reason;
  overlay.classList.remove('hidden');
  startBtn.disabled = false;
  restartBtn.disabled = false;
};

const resetGame = () => {
  state.score = 0;
  state.lives = 5;
  state.level = 1;
  state.correctThumbs = 0;
  state.totalThumbs = 0;
  clearInterval(state.spawnTimer);
  clearInterval(state.rampTimer);
  clearFalling();
  updateHUD();
  overlayTitle.textContent = 'Ready?';
  overlayMsg.textContent = 'Tap start to play.';
  overlay.classList.remove('hidden');
};

const startGame = async () => {
  await loadWords();
  state.running = true;
  state.score = 0;
  state.lives = 5;
  state.level = 1;
  state.correctThumbs = 0;
  state.totalThumbs = 0;
  clearFalling();
  updateHUD();
  overlay.classList.add('hidden');
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
  resetGame();
  startGame();
});

resetGame();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.error('Service worker registration failed', err);
    });
  });
}
