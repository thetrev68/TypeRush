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

    <section class="hero">
      <div class="cta">
        <button id="startBtn">Start</button>
        <button id="settingsBtn" class="ghost">Settings</button>
        <button id="statsBtn" class="ghost">Stats</button>
      </div>
      <p class="tip">Tap anywhere to focus the keyboard.</p>
    </section>

    <input id="hiddenInput" autocomplete="off" autocorrect="off" spellcheck="false" />
  </main>
`;

root.innerHTML = template;

const hiddenInput = document.querySelector('#hiddenInput');
const focusInput = () => {
  hiddenInput.focus({ preventScroll: true });
  hiddenInput.setSelectionRange(hiddenInput.value.length, hiddenInput.value.length);
};

// Keep keyboard up when the user taps the game surface.
['click', 'touchstart'].forEach((evt) => {
  document.addEventListener(evt, focusInput, { passive: true });
});

// Placeholder handlers for navigation.
const wireButton = (id, message) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', () => {
    console.log(message);
  });
};

wireButton('startBtn', 'Start pressed');
wireButton('settingsBtn', 'Settings pressed');
wireButton('statsBtn', 'Stats pressed');

// Register service worker for offline + installability.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((err) => {
      console.error('Service worker registration failed', err);
    });
  });
}
