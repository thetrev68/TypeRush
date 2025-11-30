import { leftLetters } from '../config/constants.js';
import { inferThumbFromChar } from '../utils/thumbDetection.js';
import { getExpectedThumb } from '../utils/thumbDetection.js';

export class InputHandler {
  constructor(hiddenInput, state, scoreManager, hud, activeWordTracker) {
    this.hiddenInput = hiddenInput;
    this.state = state;
    this.scoreManager = scoreManager;
    this.hud = hud;
    this.activeWordTracker = activeWordTracker;
    this.currentThumbSide = null;
  }

  setCurrentThumbSide(side) {
    this.currentThumbSide = side;
  }

  setupListener() {
    this.hiddenInput.addEventListener('input', () => {
      const val = this.hiddenInput.value.toLowerCase().replace(/[^a-z]/g, '');
      const lastChar = val.slice(-1);
      const detectedThumb = inferThumbFromChar(lastChar);

      if (detectedThumb) {
        this.currentThumbSide = detectedThumb;
      }

      if (!val) return;
      if (val.length > 20) {
        this.hiddenInput.value = '';
        return;
      }

      const activeEl = document.querySelector('.word.active-word');
      const activeEntry = this.state.falling.find(f => f.el === activeEl);

      if (activeEntry) {
        if (activeEntry.word.startsWith(val)) {
          this.highlightWordProgress(activeEntry.el, val);

          if (val === activeEntry.word) {
            this.handleWordComplete(activeEntry, detectedThumb);
          }
        } else {
          this.flashError(activeEntry.el);
          this.hiddenInput.value = '';
        }
      }
    });
  }

  highlightWordProgress(el, progress) {
    const word = el.dataset.originalWord || el.textContent;
    el.dataset.originalWord = word;

    if (progress.length === 0) {
      const firstLetter = word[0];
      const isLeft = leftLetters.has(firstLetter.toLowerCase());
      const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';
      el.innerHTML = `<span class="${firstLetterClass}">${firstLetter}</span>${word.substring(1)}`;
      return;
    }

    const typed = word.substring(0, progress.length);
    const remaining = word.substring(progress.length);
    const firstLetter = word[0];
    const isLeft = leftLetters.has(firstLetter.toLowerCase());
    const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';

    if (progress.length === 1) {
      el.innerHTML = `<span class="typed ${firstLetterClass}">${typed}</span>${remaining}`;
    } else {
      el.innerHTML = `<span class="typed">${typed}</span>${remaining}`;
    }
  }

  flashError(el) {
    el.classList.add('wrong-flash');
    setTimeout(() => el.classList.remove('wrong-flash'), 200);
  }

  handleWordComplete(activeEntry, detectedThumb) {
    const expected = getExpectedThumb(activeEntry.word);
    const actualThumb = detectedThumb || this.currentThumbSide;
    const thumbKnown = Boolean(actualThumb);
    let breakCombo = false;

    // Mark captured immediately to avoid later misses
    activeEntry.el.dataset.removed = '1';
    activeEntry.el.style.animationPlayState = 'paused';
    if (activeEntry.missHandler) {
      activeEntry.el.removeEventListener('animationend', activeEntry.missHandler);
    }

    if (thumbKnown) {
      const correct = actualThumb === expected;
      this.scoreManager.trackThumbAccuracy(correct);

      if (correct) {
        this.scoreManager.incrementCombo();
        const flashClass = 'correct-thumb';
        const flashDuration = 420;
        activeEntry.el.classList.add(flashClass);
        setTimeout(() => activeEntry.el.classList.remove(flashClass), flashDuration);
        setTimeout(() => this.popWord(activeEntry, { breakCombo, awardScore: true }), flashDuration);
      } else {
        breakCombo = true;
        this.scoreManager.breakCombo();
        const flashClass = 'wrong-thumb';
        const flashDuration = 480;
        activeEntry.el.classList.add(flashClass);
        setTimeout(() => activeEntry.el.classList.remove(flashClass), flashDuration);
        setTimeout(() => this.popWord(activeEntry, { breakCombo, awardScore: true }), flashDuration);
      }
    } else {
      this.scoreManager.incrementCombo();
      this.popWord(activeEntry, { breakCombo: false, awardScore: true });
    }

    this.hud.update(this.state);
    this.hiddenInput.value = '';
  }

  popWord(entry, { breakCombo = false, awardScore = true } = {}) {
    if (awardScore) {
      this.scoreManager.awardScore(entry.word.length, this.state.combo, breakCombo);
    }
    // Note: combo breaking must be done by the caller to avoid double-breaking

    this.scoreManager.trackWordTyped(entry.word.length);

    // Remove after animation completes
    setTimeout(() => {
      entry.el.remove();
      const currentIdx = this.state.falling.indexOf(entry);
      if (currentIdx !== -1) {
        this.state.falling.splice(currentIdx, 1);
        this.activeWordTracker.update(this.state.falling);
      }
    }, 120);
  }
}