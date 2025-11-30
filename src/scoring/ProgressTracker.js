import { saveProgress } from '../utils/storage.js';
import { MetricsCalculator } from './MetricsCalculator.js';

export class ProgressTracker {
  constructor(state) {
    this.state = state;
    this.metricsCalc = new MetricsCalculator();
  }

  checkUnlock(renderLessonPicker) {
    const acc = this.metricsCalc.calculateAccuracy(
      this.state.correctThumbs,
      this.state.totalThumbs
    );
    const wpm = this.metricsCalc.calculateWPM(this.state.recentWords);
    const nextIdx = this.state.currentLessonIndex + 1;
    const wordsTyped = this.state.recentWords.length;

    // Unlock next lesson if: 80% accuracy OR 20 WPM OR typed 10+ words
    if (nextIdx < this.state.lessons.length && (acc >= 80 || wpm >= 20 || wordsTyped >= 10)) {
      if (!this.state.unlockedLessons.includes(nextIdx)) {
        this.state.unlockedLessons.push(nextIdx);
        saveProgress(this.state.unlockedLessons);
        if (renderLessonPicker) {
          renderLessonPicker();
        }
        return `Next lesson unlocked! (WPM: ${wpm}, Acc: ${Math.round(acc)}%)`;
      }
    }
    return null;
  }
}
