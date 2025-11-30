import { leftLetters, rightLetters } from '../config/constants.js';

export class LessonPicker {
  constructor(lessonPicker, lessonInfo, state) {
    this.lessonPicker = lessonPicker;
    this.lessonInfo = lessonInfo;
    this.state = state;
  }

  filterWordsForLesson(lesson, words) {
    const cfg = lesson.config || {};
    return words.filter((w) => {
      const chars = w.toLowerCase().split('');
      if (cfg.allowedSet === 'left') {
        return chars.every((c) => leftLetters.has(c));
      }
      if (cfg.allowedSet === 'right') {
        return chars.every((c) => rightLetters.has(c));
      }
      if (cfg.maxLength && w.length > cfg.maxLength) return false;
      return true;
    });
  }

  render() {
    this.lessonPicker.innerHTML = this.state.lessons
      .map((l, i) => {
        const locked = !this.state.unlockedLessons.includes(i);
        return `<option value="${i}" ${locked ? 'disabled' : ''}>${locked ? '🔒 ' : ''}${l.title}</option>`;
      })
      .join('');
    this.lessonPicker.value = this.state.currentLessonIndex;
    this.updateInfo();
  }

  updateInfo() {
    const idx = parseInt(this.lessonPicker.value);
    this.state.currentLessonIndex = idx;
    const lesson = this.state.lessons[idx];
    const locked = !this.state.unlockedLessons.includes(idx);
    if (lesson) {
      if (locked) {
        this.lessonInfo.textContent = 'Locked: Finish previous with 80% acc OR 20 WPM OR 10 words.';
        this.lessonInfo.style.color = '#ff4d6d';
      } else {
        this.lessonInfo.textContent = lesson.description;
        this.lessonInfo.style.color = 'var(--accent-2)';
      }
    }
  }

  setupEventListeners() {
    this.lessonPicker.addEventListener('change', () => {
      this.updateInfo();
    });

    this.lessonPicker.addEventListener('touchstart', (e) => {
      e.stopPropagation();
    }, { passive: true });
  }
}
