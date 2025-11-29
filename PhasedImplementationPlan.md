# TypeRush Mobile — Phased Implementation Plan (LLM-Friendly)

Scope: lightweight PWA/mobile web game that trains two-thumb typing via falling words. Target: runs smoothly on low-end Android/iPhone, offline-capable, <60 kB gzipped (excluding audio), minimal prompts to an LLM per phase.

LLM prompting pattern:
- Give the LLM the current phase goal, acceptance criteria, and existing files.
- Ask for a single patch or file set per phase; run, test, then proceed.
- Keep prompts short; prefer “implement exactly this” with file paths.

Tech + constraints:
- Stack: Vite + Preact (or Vanilla + minimal DOM) + TypeScript optional.
- PWA: manifest, service worker, offline cache of core assets.
- No backend; localStorage for persistence.
- Assets: tiny CSS/JS; audio optional and short; word list in JSON.

Thumb-zone map (QWERTY, two-thumb split):
- Left letters: Q W E R T A S D F G Z X C V B
- Right letters: Y U I O P H J K L N M
- Space: either thumb

---

## Phase 0 — Boilerplate PWA
Goal: scaffolding, installable, offline shell.
- Create Vite app with Vanilla or Preact; single-page layout with full-height view.
- Add `manifest.json`, `service-worker.js` (cache shell + word list), icons (placeholder SVG ok).
- Base UI: title, Start, Settings, Stats buttons; mobile viewport meta; hidden input to trigger keyboard.
- Ensure keyboard focus on tap; prevent overscroll bounce.
Acceptance criteria:
- App installs as PWA; offline loads shell; Lighthouse PWA 100/100.
- Build size under 30 kB gzipped (no word list yet).

## Phase 1 — Core Falling Words Engine
Goal: playable loop.
- Word list: 500 common English words in `data/words.json`.
- Renderer: CSS/DOM preferred (lighter than canvas); words fall linearly.
- Spawner: interval-based with speed ramp every 30s; random x positions.
- Input: hidden `<input>`; `input` listener; exact match pops word, adds score, plays tick sound (optional).
- Lives: 3; game over when a word reaches bottom; show restart.
- Basic HUD: score, lives, speed level.
Acceptance criteria:
- Words spawn, fall, can be typed away; game ends correctly.
- No dropped inputs; works with mobile keyboards (iOS/Android).
- No jank on low-end devices.

## Phase 2 — Thumb Zones & Visual Feedback
Goal: enforce two-thumb habit.
- Detect touch side: `touchstart` x vs viewport half; set `currentThumbSide`.
- Map expected thumb from first letter of falling word.
- On correct thumb: brief highlight; on wrong thumb: red flash + accuracy penalty.
- Add optional key-color hint using CSS variables; fallback to on-screen highlight under letter.
Acceptance criteria:
- Wrong-thumb penalty triggers visibly; accuracy tracked separately.
- No blocking of input; works with both thumbs rapidly.

## Phase 3 — Lessons & Progression
Goal: structured practice.
- Lesson config JSON (5+ stages), e.g.:
  - Left only (allowed: left letters + space)
  - Right only (allowed: right letters + space)
  - Alternating (enforce alternation)
  - Mixed fast (full set, faster ramp)
- Filter word list per lesson; lock/unlock based on thumb accuracy >=95% and WPM >=30.
- Persist progress in localStorage.
Acceptance criteria:
- Lessons load and restrict words correctly; gating works and persists after reload.
- WPM computed over last 10 words; thumb accuracy tracked per lesson.

## Phase 4 — Stats, Combos, and Polish
Goal: make it sticky and measurable.
- Metrics: real-time WPM, thumb accuracy %, combo count, high score, session stats.
- Combo/multiplier for consecutive correct words; break on miss or wrong thumb.
- Daily challenge: deterministic seed per day.
- Simple celebratory effect on new high score (emoji rain is fine).
Acceptance criteria:
- Metrics update live; combos feel responsive; daily seed changes each day.
- High scores persist; performance remains smooth.

## Phase 5 — Themes & Juice
Goal: visual variety, cheap assets.
- Define 4 themes (Default, Space, Ocean, Racing) via CSS variables only.
- Background gradient/pattern per theme; word color/sprite tweak per theme.
- Theme selector in Settings; persists.
Acceptance criteria:
- Theme switch is instant, no reload; cached offline.
- Total added size <10 kB.

## Phase 6 — Final Optimization & Deployment
Goal: shippable build.
- Code split if needed; preload critical assets; cache word list separately.
- Verify Lighthouse 100/100 (PWA, Perf, Best Practices, SEO).
- Deploy to Vercel/Netlify; set proper cache headers.
Acceptance criteria:
- Production build under 60 kB gzipped (excluding audio).
- Offline works after first load; install prompt works; deployed URL reachable.

---

Per-phase prompt skeleton for the LLM
```
You are coding TypeRush, a lightweight PWA to teach two-thumb typing. Current phase: <phase>. Tech: Vite + <stack>. Constraints: offline PWA, low bundle size. Please produce the file changes only for this phase, with code blocks per file path. Keep code minimal and mobile-first. Do not regress previous acceptance criteria.
```

