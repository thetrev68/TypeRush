# TypeRush - Project Context

## Overview
**TypeRush** is a lightweight Mobile PWA designed to teach two-thumb typing efficiency. It uses falling words gameplay to train users on specific thumb zones (left vs. right hand) on a standard QWERTY mobile keyboard.

The project focuses on low bundle size (<60kB), offline capability, and smooth performance on low-end devices. It uses **Vite** with **Vanilla JavaScript** (no framework).

## Current Status
**Phase 3 Completed:** Lessons & Progression.
- Users can select lessons (Left Hand, Right Hand, Alternating, etc.).
- Progression is gated by Accuracy (>=95%) and WPM (>=30).
- Unlocks are persisted in `localStorage`.

**Next Phase:** Phase 4 - Stats, Combos, and Polish.

## Architecture
The project follows a simple, flat architecture suitable for a small PWA.

### File Structure
- **`index.html`**: Entry point. Contains the DOM structure for the HUD, Playfield, Overlays, and the hidden input field used to trigger the mobile keyboard.
- **`src/main.js`**: core game logic.
  - **State Management**: Handles `score`, `lives`, `level`, `falling` words, and `lessons`.
  - **Game Loop**: `requestAnimationFrame` or interval-based spawning and falling logic.
  - **Input Handling**: Listens to a hidden `<input>` element to capture keystrokes while keeping the virtual keyboard open.
  - **Thumb Detection**: Uses `touchstart` X-coordinates to infer which thumb (left/right) the user is using.
- **`src/style.css`**: CSS variables for theming, animations for falling words (`@keyframes fall`), and responsive mobile-first styles.
- **`public/`**: Static assets.
  - **`data/words.json`**: Word list.
  - **`data/lessons.json`**: Configuration for game stages/lessons.
  - **`manifest.json` & `service-worker.js`**: PWA configuration for offline support and installability.

### Key Concepts
- **Thumb Zones:**
  - **Left:** Q, W, E, R, T, A, S, D, F, G, Z, X, C, V, B
  - **Right:** Y, U, I, O, P, H, J, K, L, N, M
- **Input Hack:** A hidden opacity-0 input field is kept focused to ensure the mobile keyboard remains visible without obstructing the game view.
- **Persistence:** `localStorage` keys:
  - `tr_unlocked`: Array of unlocked lesson indices.

## Development

### Commands
- **Start Dev Server:** `npm run dev`
- **Build for Production:** `npm run build` (Outputs to `dist/`)
- **Preview Build:** `npm run preview`

### Conventions
- **Mobile-First:** Styles are written for mobile viewports first.
- **Vanilla JS:** No frameworks (React/Vue) to keep bundle size minimal.
- **Performance:** CSS animations preferred over JS-driven animation frames where possible.
- **Offline-First:** Critical assets must be cached via the Service Worker.

## Documentation
- **`PhasedImplementationPlan.md`**: Detailed roadmap of development phases.
- **`GameDesignDocument.md`**: Gameplay mechanics and design goals.
