# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeRush is a two-thumb typing trainer PWA built with vanilla JavaScript and Vite. It features a falling-word mechanic, progressive lessons, themes, and offline support via service workers. Bundle size is ultra-lightweight (< 8 kB gzipped).

## Development Commands

```bash
# Development server with HMR
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run analyze
```

## Architecture

### Modular Design Philosophy

The codebase uses a clean, modular architecture with ES6 classes and explicit separation of concerns. **The monolithic structure was recently refactored into this design** to improve maintainability and testability.

### Core Patterns

**Centralized State**: `GameState` class holds all game state (score, lives, falling words, etc.). Managers and handlers receive state references and mutate it directly. There is no state immutability or state management library.

**Constructor Injection**: All classes receive dependencies through constructors. For example, `GameLifecycle` receives 8 dependencies including `state`, `gameLoop`, `wordSpawner`, etc.

**Manager Classes**: UI and game logic are organized into manager classes (e.g., `ThemeManager`, `ScoreManager`, `OverlayManager`). Each manager owns a specific domain and exposes methods to manipulate it.

**Event Flow**:
1. User types → `InputHandler` validates input
2. `InputHandler` calls `ScoreManager` methods (e.g., `handleCorrectWord()`)
3. `ScoreManager` mutates `GameState`
4. `HUD.update(state)` called to reflect changes
5. `ProgressTracker` checks if lessons should unlock

### Module Organization

- **audio/**: Audio system (`AudioManager`, `BackgroundMusic`, theme music profiles)
- **config/**: Static configuration (constants, theme definitions)
- **core/**: Game architecture (`GameState`, `GameLoop`, `GameLifecycle`)
- **game/**: Game mechanics (`WordSpawner`, `InputHandler`, `ActiveWordTracker`, `WordElement`)
- **scoring/**: Scoring logic (`ScoreManager`, `MetricsCalculator`, `ProgressTracker`)
- **ui/**: User interface (`HUD`, `ThemeManager`, `LessonPicker`, `OverlayManager`)
- **utils/**: Pure utilities (storage, RNG, thumb detection, positioning, focus)

### Key Architectural Decisions

**Data Loading**: Words and lessons are fetched from `/data/*.json` at startup with fallback to hardcoded defaults in `config/constants.js`. This allows offline operation after first load.

**Thumb Detection**: The two-thumb keyboard layout splits QWERTY into left (`Q-B`) and right (`Y-M`) keys. The `thumbDetection.js` utility determines which thumb should type a word based on its characters.

**Active Word Selection**: `ActiveWordTracker` identifies the "active word" (closest to bottom of playfield) and applies the `.active-word` CSS class. This is the word the user should currently type.

**Lesson Filtering**: `LessonPicker.filterWordsForLesson()` applies lesson config rules:
- `allowedSet`: "left" | "right" - filter by thumb
- `enforceAlternate`: true - require alternating thumbs
- `maxLength`: number - max word length
- `level`: number - affects game speed (not word filtering)

**Alternating Thumb Enforcement**: When `enforceAlternate` is true, `state.nextThumb` tracks which thumb should type the next word. `WordSpawner` respects this by selecting from `state.leftWords` or `state.rightWords`. Note: Thumb validation only occurs in left-hand or right-hand specific modes; mixed-thumb words are allowed in alternating/mixed modes without validation.

**Seeded RNG**: Daily challenge mode uses a date-based seed with a custom RNG implementation (`utils/rng.js`) to ensure consistent word sequences across sessions.

**Game Loop**: Uses `requestAnimationFrame` for smooth 60fps updates. `GameLoop` updates word positions, checks if words passed the bottom threshold, and handles level progression (speed increases). The loop can be paused/resumed via `GameLoop.pause()` and `GameLoop.resume()`.

**Pause System**: Comprehensive pause functionality allows players to pause gameplay at any time. When paused:
- Game loop stops (`GameLoop.pause()`)
- All falling words pause animation (`WordElement.pause()`)
- Background music pauses (`BackgroundMusic.pause()`)
- Sound effects and haptics are suppressed (`AudioManager.setPaused(true)`)
- Overlay shows "Game Paused" with Resume button
- Resume restores all systems to previous state

**Audio System**: Implemented with `AudioManager` for sound effects and haptics, plus `BackgroundMusic` for theme-specific melodies. Each theme has a unique musical profile defined in `themeMusicProfiles.js` using Web Audio API oscillators. Audio is user-controlled and respects browser autoplay policies.

**localStorage Prefix**: All localStorage keys use `tr_` prefix (e.g., `tr_unlocked`, `tr_highscore`, `tr_theme`).

**Error Handling in Storage**: `storage.js` includes robust JSON parse error handling with automatic cleanup of corrupted data and fallback to safe defaults. Migration logic auto-unlocks the first 3 levels for existing users.

### State Lifecycle

1. **Initialize**: `GameState` constructed, loads unlocked lessons & high score from localStorage
2. **Reset**: `state.reset()` clears game-specific state (score, lives, combo) but preserves lessons/words
3. **Start**: `GameLifecycle.start()` filters words for lesson, seeds RNG, spawns first word, starts loop, starts background music
4. **Running**: `GameLoop` ticks, words fall, input handled, score updates
5. **Pause**: `GameLifecycle.pause()` stops loop, pauses words, pauses music, shows pause overlay
6. **Resume**: `GameLifecycle.resume()` restarts loop, resumes words, resumes music, hides overlay
7. **End**: `GameLifecycle.end()` stops loop, clears words, stops music, checks for lesson unlocks, shows overlay

### DOM Structure

The entire app is rendered into `#app` via a template literal in `main.js`. No component framework is used. DOM references are stored as constants and passed to managers.

**Critical Elements**:
- `#hiddenInput`: Hidden input field that maintains keyboard focus
- `#playfield`: Container where falling words are spawned
- `#overlay`: Game start/pause/end screen
- `.hud`: Displays score, lives, WPM, accuracy, combo
- `#pauseBtn`: Pause button (appears during gameplay, hidden on overlay)

### Service Worker Strategy

- **Development**: Service worker is explicitly unregistered to avoid conflicts with Vite HMR
- **Production**: Registers `/service-worker.js` with cache-first for assets, network-first for data
- **Badge Updates**: PWA and offline status badges update based on `display-mode` media query and `navigator.onLine`

### Testing & Validation

Currently no unit tests exist (see Roadmap). When adding tests, note that:
- Classes are already organized for easy testing
- Utils are pure functions (except storage which touches localStorage)
- Managers can be tested with mock state and DOM elements

### PWA Considerations

- Manifest at `/manifest.json` defines app metadata
- SVG icon at `/icon.svg` (PNG icons needed for broader support)
- Data files preloaded via `<link rel="preload">` in `index.html`
- Theme color set to `#0f172a` (slate-900)

### Performance Constraints

- **Bundle size target**: < 8 kB gzipped for JS
- **Build config**: esbuild drops console logs and debugger statements in production
- **No external dependencies**: Framework-free to minimize bundle size
