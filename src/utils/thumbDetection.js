import { leftLetters, rightLetters } from '../config/constants.js';

export const getExpectedThumb = (word) =>
  leftLetters.has(word[0].toLowerCase()) ? 'left' : 'right';

export const inferThumbFromChar = (char) => {
  if (!char) return null;
  const lower = char.toLowerCase();
  if (!/[a-z]/.test(lower)) return null;
  return leftLetters.has(lower) ? 'left' : 'right';
};
