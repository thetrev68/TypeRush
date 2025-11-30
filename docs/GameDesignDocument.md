# TypeRush Mobile — Game Design Document

## Overview
Mobile web/PWA game that teaches fast two-thumb typing through short, replayable falling-word sessions. Emphasis on real device keyboards, low friction, and clear thumb feedback.

## Core Gameplay
- Falling words (later short phrases) spawn at random x-positions and descend at increasing speed.
- Player types the word on the native keyboard; exact match removes the word and scores points.
- Lives: 3. A word reaching the bottom loses a life. Game over on zero lives; offer restart.
- Speed ramps every 30s (configurable) to encourage urgency without overwhelming beginners.

## Progression (Lessons)
1) Left thumb only (left-hand letters + space)  
2) Right thumb only (right-hand letters + space)  
3) Alternating / both thumbs (full alphabet, enforce alternation)  
4) Mixed fast (full alphabet, faster ramp)  
5) Sentences / punctuation-lite (optional stretch goal)

Gate: unlock next lesson at thumb accuracy ≥95% and WPM ≥30 (per lesson), persisted locally.

## Thumb Zones (QWERTY)
- Left thumb: Q W E R T A S D F G Z X C V B
- Right thumb: Y U I O P H J K L N M
- Space: either thumb

## Training Features
- Thumb feedback: color cue per thumb (e.g., blue/orange) and a brief flash for correct/incorrect thumb usage.
- Touch-side detection: track touchstart x-position to infer current thumb; log wrong-thumb errors.
- Optional next-letter hint: subtle highlight appearing ~0.8s before expected hit.
- Slow-motion drill mode for new keys (reduced fall speed, higher drop intervals).
- No ghost-hand overlays to keep UI minimal.

## Scoring and Stats
- Metrics: WPM (rolling window), letter accuracy, thumb accuracy, combo multiplier, high score.
- Combo: consecutive correct words increase multiplier; broken by miss or wrong thumb.
- Daily challenge: seeded word order per day for fairness/comparison.
- Unlockable themes as cosmetic rewards; no powerups that alter difficulty.

## UX/UI
- Mobile-first, single-screen HUD: score, lives, WPM, accuracy, combo, lesson name.
- Settings: theme selector, sound on/off, haptics toggle (if supported), lesson selection (locked until earned).
- Visuals: light-weight gradients/patterns; avoid heavy assets; optional emoji confetti on high score.
- Accessibility: large tap targets; readable fonts; high contrast themes available.

## Tech Notes
- Delivery: PWA (Vite + Vanilla/Preact). Offline-capable via service worker; localStorage for saves.
- Input: hidden text input to summon native keyboard; prevent scroll/zoom; keep focus after interactions.
- Performance: target <60 kB gzipped (excluding audio), smooth on low-end Android/iPhone.
- Data: word list JSON (~500 common words), lesson config JSON. Audio optional and tiny.
