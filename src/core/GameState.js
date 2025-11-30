import { loadUnlockedLessons, loadHighScore } from '../utils/storage.js';

export class GameState {
  constructor() {
    this.words = [];
    this.lessons = [];
    this.activeWords = [];
    this.leftWords = [];
    this.rightWords = [];
    this.nextThumb = null;
    this.unlockedLessons = loadUnlockedLessons();
    this.currentLessonIndex = 0;
    this.running = false;
    this.score = 0;
    this.highScore = loadHighScore();
    this.lives = 5;
    this.level = 1;
    this.falling = [];
    this.correctThumbs = 0;
    this.totalThumbs = 0;
    this.recentWords = [];
    this.combo = 0;
    this.maxCombo = 0;
    this.dailyMode = false;
    this.rng = Math.random;
  }

  reset() {
    this.score = 0;
    this.lives = 5;
    this.level = 1;
    this.correctThumbs = 0;
    this.totalThumbs = 0;
    this.recentWords = [];
    this.combo = 0;
    this.maxCombo = 0;
    this.nextThumb = null;
    this.falling = [];
  }
}