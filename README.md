# TypeRush - Two-Thumb Typing Trainer

A lightweight, offline-capable PWA designed to help you master two-thumb typing on mobile devices through fun, fast-paced gameplay.

![Build Size](https://img.shields.io/badge/bundle%20size-8kB%20gzipped-success)
![PWA](https://img.shields.io/badge/PWA-enabled-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Engaging Gameplay**: Falling-word mechanic keeps practice fun and challenging
- **Two-Thumb Training**: Visual feedback teaches proper left/right thumb usage
- **PWA-First**: Install on your home screen, works offline after first load
- **Progressive Lessons**: Six structured lessons from beginner to advanced
- **Real-Time Metrics**: Track WPM, accuracy, combos, and high scores
- **Four Themes**: Default, Space, Ocean, and Racing visual styles
- **Daily Challenge**: Seeded randomization for consistent daily runs
- **Ultra-Lightweight**: < 8 kB gzipped (excluding word data)

## Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/TypeRush.git
cd TypeRush

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to play!

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run analyze
```

## How to Play

1. **Start a Game**: Tap "Start" or "Play" to begin
2. **Type Words**: As words fall from the top, type them exactly to clear them
3. **Use Correct Thumb**:
   - Green indicator = left thumb (Q-B keys)
   - Orange indicator = right thumb (Y-M keys)
4. **Build Combos**: Consecutive correct words with proper thumb usage multiply your score
5. **Track Progress**: Complete lessons with 95%+ accuracy and 30+ WPM to unlock the next

## Lesson Structure

1. **Left Hand Practice**: Words using only left-thumb letters
2. **Right Hand Practice**: Words using only right-thumb letters
3. **Alternating Thumbs**: Practice switching between hands
4. **Mixed Short Words**: Short words (4 letters max) from both thumbs
5. **Mixed Fast**: Full word set at increased speed
6. **Full Set Challenge**: Complete word list at maximum difficulty

## Architecture

### Tech Stack
- **Framework**: Vanilla JavaScript (no framework dependencies)
- **Build Tool**: Vite 5
- **Styling**: Pure CSS with CSS variables for theming
- **PWA**: Service Worker with smart caching strategies
- **Storage**: localStorage for progress and preferences

### File Structure
```
TypeRush/
├── public/
│   ├── data/
│   │   ├── words.json         # 500+ common words
│   │   └── lessons.json       # Lesson configurations
│   ├── icon.svg               # App icon
│   ├── manifest.json          # PWA manifest
│   └── service-worker.js      # Offline caching logic
├── src/
│   ├── config/                # Configuration & constants
│   │   ├── constants.js       # Default data & game constants
│   │   └── themes.js          # Theme definitions
│   ├── core/                  # Core game architecture
│   │   ├── GameLifecycle.js   # Game start/stop/reset logic
│   │   ├── GameLoop.js        # Main game tick loop
│   │   └── GameState.js       # Centralized state management
│   ├── game/                  # Game mechanics
│   │   ├── ActiveWordTracker.js  # Tracks current typing target
│   │   ├── InputHandler.js    # Keyboard input processing
│   │   ├── WordElement.js     # Word DOM element creation
│   │   └── WordSpawner.js     # Word spawning & falling logic
│   ├── scoring/               # Scoring & progression
│   │   ├── MetricsCalculator.js  # WPM & accuracy calculation
│   │   ├── ProgressTracker.js    # Lesson unlock tracking
│   │   └── ScoreManager.js    # Score & combo management
│   ├── ui/                    # User interface
│   │   ├── HUD.js             # Heads-up display updates
│   │   ├── LessonPicker.js    # Lesson selection UI
│   │   ├── OverlayManager.js  # Start/pause/game-over screens
│   │   └── ThemeManager.js    # Theme switching logic
│   ├── utils/                 # Utilities
│   │   ├── focus.js           # Keyboard focus management
│   │   ├── positioning.js     # Word positioning calculations
│   │   ├── rng.js             # Seeded random number generation
│   │   ├── storage.js         # localStorage wrapper
│   │   └── thumbDetection.js  # Left/right thumb detection
│   ├── main.js                # Application entry point
│   └── style.css              # All styles and themes
├── index.html                 # HTML entry point
├── vite.config.js             # Build configuration
└── package.json
```

### Architecture

**Modular Design**: TypeRush uses a clean, modular architecture with separation of concerns across distinct domains (core, game, scoring, UI, utilities). The codebase was recently refactored from a monolithic structure into this maintainable, extensible design that makes it easy to add features and test components independently.

**Core Game Loop** ([src/core/GameLoop.js](src/core/GameLoop.js))
- Manages requestAnimationFrame tick cycle
- Updates falling word positions
- Handles level progression and spawning

**State Management** ([src/core/GameState.js](src/core/GameState.js))
- Centralized game state (score, lives, speed, words)
- Lesson configuration and word filtering
- Clean state reset between games

**Input Processing** ([src/game/InputHandler.js](src/game/InputHandler.js))
- Keyboard input validation
- Active word matching and completion
- Integration with scoring system

**Scoring System** ([src/scoring/](src/scoring/))
- Real-time WPM calculation (rolling 10-word average)
- Accuracy tracking with combo multipliers
- Progress persistence via localStorage

**Caching Strategy** ([public/service-worker.js](public/service-worker.js))
- Static assets: Cache-first
- Data files: Network-first with offline fallback
- HTML: Network-first with SPA fallback

## Deployment

TypeRush is optimized for deployment on:

### Vercel (Recommended)
```bash
# Vercel will auto-detect vercel.json
vercel
```

### Netlify
```bash
# Netlify will auto-detect netlify.toml
netlify deploy --prod
```

### GitHub Pages
Use the provided GitHub Actions workflow or manually:
```bash
npm run build
# Deploy dist/ folder
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions and optimization tips.

## Performance

- **Bundle Size**: 7.55 kB gzipped (13% of 60 kB target)
  - CSS: 2.3 kB
  - JS: 5.47 kB
  - HTML: 0.78 kB
- **Target Lighthouse Scores**: 95-100 across all metrics
- **Offline-First**: Full functionality after initial load

## Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Samsung Internet 14+
- Mobile browsers with service worker support

## Keyboard Layout

TypeRush uses QWERTY two-thumb split:

**Left Thumb**: Q W E R T A S D F G Z X C V B
**Right Thumb**: Y U I O P H J K L N M
**Either Thumb**: Space

## Development

### Running Tests
```bash
npm test
```

### Code Quality
```bash
npm run lint
```

### Development Mode Notes
- Service Worker is disabled in dev to prevent Vite HMR conflicts
- Console logs are stripped in production builds
- Hot Module Replacement (HMR) enabled for fast iteration

## Configuration

### Adding Words
Edit [public/data/words.json](public/data/words.json) - array of lowercase words. Fallback defaults are defined in [src/config/constants.js](src/config/constants.js).

### Adding Lessons
Edit [public/data/lessons.json](public/data/lessons.json):
```json
{
  "id": "lesson-id",
  "title": "Lesson Title",
  "description": "What this lesson teaches",
  "config": {
    "allowedSet": "left|right",
    "enforceAlternate": true,
    "maxLength": 4,
    "level": 2
  }
}
```

### Adding Themes
Edit theme definitions in [src/config/themes.js](src/config/themes.js) and corresponding CSS in [src/style.css](src/style.css#L27-L56). The `ThemeManager` automatically renders available themes.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Add unit tests (Vitest)
- [ ] Generate PNG icons for better PWA support
- [ ] Add accessibility improvements (ARIA live regions, screen reader support)
- [ ] Text-to-speech for active words (Web Speech API)
- [ ] Implement privacy-friendly analytics
- [ ] Add sound effects and haptic feedback toggles
- [ ] Multiplayer mode
- [ ] Custom word lists
- [ ] Statistics dashboard with detailed typing analytics
- [ ] Achievement system

## Credits

- **Design & Planning**: Grok AI
- **Implementation**: MiniMax2, Grok Fast 1, Gemini Pro 3, ChatGPT Codex 5.1
- **QA & Polish**: Claude (Anthropic)

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
- Review [PhasedImplementationPlan.md](PhasedImplementationPlan.md) for architecture details

---

**Made with ⚡ by AI collaboration**
