import { createSeededRng } from '../utils/rng.js';
import { getExpectedThumb } from '../utils/thumbDetection.js';

export class GameLifecycle {
  constructor(state, gameLoop, wordSpawner, hud, overlayManager, lessonPicker, progressTracker, focusInput) {
    this.state = state;
    this.gameLoop = gameLoop;
    this.wordSpawner = wordSpawner;
    this.hud = hud;
    this.overlayManager = overlayManager;
    this.lessonPicker = lessonPicker;
    this.progressTracker = progressTracker;
    this.focusInput = focusInput;
  }

  async start(hiddenInput, lessonPickerEl) {
    const idx = Number(lessonPickerEl.value);
    this.state.currentLessonIndex = idx;
    this.state.activeWords = this.lessonPicker.filterWordsForLesson(
      this.state.lessons[idx],
      this.state.words
    );
    this.state.leftWords = this.state.activeWords.filter(w => getExpectedThumb(w) === 'left');
    this.state.rightWords = this.state.activeWords.filter(w => getExpectedThumb(w) === 'right');
    this.state.nextThumb = this.state.lessons[idx]?.config?.enforceAlternate ? 'left' : null;

    if (this.state.activeWords.length === 0) {
      alert('No words found for this lesson configuration!');
      return;
    }

    this.state.rng = createSeededRng(this.state.dailyMode);
    this.state.running = true;
    this.state.score = 0;
    this.state.lives = 5;
    this.state.level = this.state.lessons[idx].config.level || 1;
    this.state.correctThumbs = 0;
    this.state.totalThumbs = 0;
    this.state.recentWords = [];
    this.state.combo = 0;
    this.state.maxCombo = 0;
    this.wordSpawner.clearAllWords();
    this.hud.update(this.state);
    this.overlayManager.hide();
    lessonPickerEl.disabled = true;

    hiddenInput.value = '';
    this.focusInput();
    this.wordSpawner.spawn();
    this.gameLoop.start();
  }

  end(_reason, lessonPickerEl) {
    this.state.running = false;
    this.gameLoop.stop();
    this.wordSpawner.clearAllWords();
    const unlockMsg = this.progressTracker.checkUnlock();
    this.overlayManager.showGameOver(unlockMsg);
    lessonPickerEl.disabled = false;
  }

  reset(lessonPickerEl) {
    this.state.reset();
    this.gameLoop.stop();
    this.wordSpawner.clearAllWords();
    this.hud.update(this.state);
    this.overlayManager.showReady();
    lessonPickerEl.disabled = false;
  }
}