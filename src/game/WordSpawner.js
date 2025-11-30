import { MIN_SPAWN, BASE_SPAWN, MIN_FALL, BASE_FALL } from '../config/constants.js';
import { findSafeSpawnPosition } from '../utils/positioning.js';
import { WordElement } from './WordElement.js';

export class WordSpawner {
  constructor(playfield, state, onMiss, audioManager) {
    this.playfield = playfield;
    this.state = state;
    this.onMiss = onMiss;
    this.audioManager = audioManager;
    this.spawnTimer = null;
  }

  spawnInterval() {
    return Math.max(MIN_SPAWN, BASE_SPAWN - (this.state.level - 1) * 180);
  }

  fallDuration() {
    return Math.max(MIN_FALL, BASE_FALL - (this.state.level - 1) * 900);
  }

  selectWordByLevel(wordPool) {
    // Calculate max word length based on level
    // Level 1-2: 3-4 chars, Level 3-4: 5-6 chars, Level 5+: any length
    const maxLength = Math.min(10, 2 + this.state.level);

    // Filter words by level-appropriate length
    const suitableWords = wordPool.filter(w => w.length <= maxLength);

    // If no suitable words, fall back to full pool
    const pool = suitableWords.length > 0 ? suitableWords : wordPool;

    return pool[Math.floor(this.state.rng() * pool.length)];
  }

  spawn() {
    if (!this.state.running || !this.state.activeWords.length) return null;
    if (this.state.falling.length >= 3) return null;

    let word;
    const lesson = this.state.lessons[this.state.currentLessonIndex];
    if (lesson?.config?.enforceAlternate) {
      const targetThumb = this.state.nextThumb || 'left';
      const pool = targetThumb === 'left' ? this.state.leftWords : this.state.rightWords;
      if (pool && pool.length) {
        word = this.selectWordByLevel(pool);
        this.state.nextThumb = targetThumb === 'left' ? 'right' : 'left';
      } else {
        word = this.selectWordByLevel(this.state.activeWords);
      }
    } else {
      word = this.selectWordByLevel(this.state.activeWords);
    }

    // Create WordElement instance (already has colored letters)
    const wordElement = new WordElement(word, this.onMiss);
    const el = wordElement.el;

    // Find safe position with spacing
    const estimatedWidth = word.length * 12 + 28;
    const left = findSafeSpawnPosition(estimatedWidth, this.state.falling, this.playfield, this.state.rng);
    wordElement.setPosition(left, this.fallDuration());

    this.playfield.appendChild(el);

    const entry = { word: word.toLowerCase(), el, wordElement };
    this.state.falling.push(entry);

    // Mark first word as active immediately
    if (this.state.falling.length === 1) {
      el.classList.add('active-word');
    }

    // Speak the word aloud
    if (this.audioManager) {
      this.audioManager.speakWord(word);
    }

    return entry;
  }

  startTimer(onSpawn) {
    this.stopTimer();
    this.spawnTimer = setInterval(() => {
      const entry = this.spawn();
      if (entry && onSpawn) {
        onSpawn(entry);
      }
    }, this.spawnInterval());
  }

  stopTimer() {
    if (this.spawnTimer) {
      clearInterval(this.spawnTimer);
      this.spawnTimer = null;
    }
  }

  clearAllWords() {
    this.state.falling.forEach(({ el }) => {
      if (el) el.remove();
    });
    this.state.falling = [];
  }
}
