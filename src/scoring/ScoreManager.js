import { saveHighScore } from '../utils/storage.js';

export class ScoreManager {
  constructor(state, audioManager, hapticManager) {
    this.state = state;
    this.audioManager = audioManager;
    this.hapticManager = hapticManager;
  }

  celebrateHighScore() {
    // Play high score chime and celebrate haptic
    if (this.audioManager) {
      this.audioManager.playHighScore();
    }
    if (this.hapticManager) {
      this.hapticManager.celebrate();
    }

    // Flash the high score display
    const bestVal = document.getElementById('bestVal');
    if (bestVal) {
      bestVal.classList.add('highscore-flash');
      setTimeout(() => bestVal.classList.remove('highscore-flash'), 800);
    }

    const container = document.createElement('div');
    container.className = 'confetti';
    const emojis = ['🎉', '👏', '⭐', '🔥', '🎊'];
    for (let i = 0; i < 16; i++) {
      const span = document.createElement('span');
      span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      span.style.left = `${Math.random() * 100}%`;
      span.style.animationDelay = `${Math.random() * 0.2}s`;
      container.appendChild(span);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1200);
  }

  awardScore(wordLength, combo, breakCombo = false) {
    if (breakCombo) {
      this.state.combo = 0;
    }

    const base = Math.max(5, wordLength);
    const mult = 1 + Math.floor(combo / 5);
    this.state.score += base * mult;

    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      saveHighScore(this.state.highScore);
      this.celebrateHighScore();
    }
  }

  incrementCombo() {
    this.state.combo += 1;
    this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
  }

  breakCombo() {
    this.state.combo = 0;
  }

  loseLife() {
    this.state.lives -= 1;
    this.breakCombo();
  }

  trackWordTyped(wordLength) {
    const now = Date.now();
    this.state.recentWords.push({ time: now, chars: wordLength });
    if (this.state.recentWords.length > 10) {
      this.state.recentWords.shift();
    }
  }

  trackThumbAccuracy(wasCorrect) {
    this.state.totalThumbs++;
    if (wasCorrect) {
      this.state.correctThumbs++;
    }
  }
}
