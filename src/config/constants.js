// Game timing constants
export const BASE_FALL = 13000;
export const BASE_SPAWN = 2500;
export const RAMP_MS = 50000;
export const MIN_FALL = 5000;
export const MIN_SPAWN = 1400;

// Keyboard layout - left/right thumb mapping
export const leftLetters = new Set(['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v', 'b']);
export const rightLetters = new Set(['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', 'n', 'm']);

// Default lessons (fallback if fetch fails)
export const defaultLessons = [
  { id: 'left-hand', title: 'Left Hand Practice', description: 'Words typed only with your left thumb.', config: { allowedSet: 'left' } },
  { id: 'right-hand', title: 'Right Hand Practice', description: 'Words typed only with your right thumb.', config: { allowedSet: 'right' } },
  { id: 'alternating', title: 'Alternating Thumbs', description: 'Words that alternate between thumbs.', config: { enforceAlternate: true } },
  { id: 'mixed-short', title: 'Mixed Short Words', description: 'A mix of short words from both thumbs.', config: { maxLength: 4 } },
  { id: 'mixed-fast', title: 'Mixed Fast', description: 'Full word set, faster pace.', config: { level: 2 } },
  { id: 'full-set', title: 'Full Set Challenge', description: 'The complete word list.', config: {} },
];

// Default words (fallback if fetch fails)
export const defaultWords = ['fast', 'thumb', 'type', 'speed', 'focus', 'quick', 'learn', 'tap', 'flow', 'left', 'right', 'home'];
