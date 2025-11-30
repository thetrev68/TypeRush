import { MIN_SPAWN, BASE_SPAWN, MIN_FALL, BASE_FALL, leftLetters } from '../config/constants.js';
import { findSafeSpawnPosition } from '../utils/positioning.js';

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

  spawn() {
    if (!this.state.running || !this.state.activeWords.length) return null;
    if (this.state.falling.length >= 3) return null;

    let word;
    const lesson = this.state.lessons[this.state.currentLessonIndex];
    if (lesson?.config?.enforceAlternate) {
      const targetThumb = this.state.nextThumb || 'left';
      const pool = targetThumb === 'left' ? this.state.leftWords : this.state.rightWords;
      if (pool && pool.length) {
        word = pool[Math.floor(this.state.rng() * pool.length)];
        this.state.nextThumb = targetThumb === 'left' ? 'right' : 'left';
      } else {
        word = this.state.activeWords[Math.floor(this.state.rng() * this.state.activeWords.length)];
      }
    } else {
      word = this.state.activeWords[Math.floor(this.state.rng() * this.state.activeWords.length)];
    }

    const el = document.createElement('div');
    el.className = 'word';
    el.textContent = word;
    el.dataset.originalWord = word;
    el.dataset.removed = '0';
    el.dataset.typedProgress = '';

    // Add thumb indicator to first letter
    const firstLetter = word[0];
    const isLeft = leftLetters.has(firstLetter.toLowerCase());
    const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';
    el.innerHTML = `<span class="${firstLetterClass}">${firstLetter}</span>${word.substring(1)}`;

    // Find safe position with spacing
    const estimatedWidth = word.length * 12 + 28;
    const left = findSafeSpawnPosition(estimatedWidth, this.state.falling, this.playfield, this.state.rng);
    el.style.left = `${left}px`;
    el.style.setProperty('--fall-duration', `${this.fallDuration()}ms`);

    const missHandler = () => this.onMiss(el);
    el.addEventListener('animationend', missHandler);
    this.playfield.appendChild(el);

    const entry = { word: word.toLowerCase(), el, missHandler };
    this.state.falling.push(entry);

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
