import { leftLetters } from '../config/constants.js';

export class WordElement {
  constructor(word, onMiss) {
    this.word = word.toLowerCase();
    this.el = this.createElement();
    this.missHandler = (event) => {
      // Only call onMiss for the fall animation and when word is still active
      if (event.animationName === 'fall' && !this.isRemoved() && document.contains(this.el)) {
        onMiss(this.el);
      }
    };
    this.el.addEventListener('animationend', this.missHandler);
  }

  createElement() {
    const el = document.createElement('div');
    el.className = 'word';
    el.dataset.originalWord = this.word;
    el.dataset.removed = '0';
    el.dataset.typedProgress = '';

    // Color each letter based on which thumb types it
    for (const char of this.word) {
      const span = document.createElement('span');
      const isLeft = leftLetters.has(char.toLowerCase());
      span.className = isLeft ? 'thumb-left' : 'thumb-right';
      span.textContent = char;
      el.appendChild(span);
    }

    return el;
  }

  highlightProgress(progress) {
    const word = this.el.dataset.originalWord;

    if (progress.length === 0) {
      // Re-render base word with each letter colored
      this.el.textContent = '';
      for (const char of word) {
        const span = document.createElement('span');
        const isLeft = leftLetters.has(char.toLowerCase());
        span.className = isLeft ? 'thumb-left' : 'thumb-right';
        span.textContent = char;
        this.el.appendChild(span);
      }
      return;
    }

    // Render with typed progress highlighted
    this.el.textContent = '';
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const span = document.createElement('span');
      const isLeft = leftLetters.has(char.toLowerCase());
      const thumbClass = isLeft ? 'thumb-left' : 'thumb-right';

      if (i < progress.length) {
        span.className = `typed ${thumbClass}`;
      } else {
        span.className = thumbClass;
      }

      span.textContent = char;
      this.el.appendChild(span);
    }
  }

  setActive(isActive) {
    if (isActive) {
      this.el.classList.add('active-word');
    } else {
      this.el.classList.remove('active-word');
    }
  }

  setPosition(left, fallDuration) {
    this.el.style.left = `${left}px`;
    this.el.style.setProperty('--fall-duration', `${fallDuration}ms`);
  }

  flashCorrect(callback) {
    this.el.classList.add('correct-thumb');
    setTimeout(() => {
      this.el.classList.remove('correct-thumb');
      if (callback) callback();
    }, 420);
  }

  flashWrong(callback) {
    this.el.classList.add('wrong-thumb');
    setTimeout(() => {
      this.el.classList.remove('wrong-thumb');
      if (callback) callback();
    }, 480);
  }

  flashError() {
    this.el.classList.add('wrong-flash');
    setTimeout(() => this.el.classList.remove('wrong-flash'), 200);
  }

  pop() {
    // Forward to remove() for consistent cleanup
    this.remove();
  }

  remove() {
    // Perform cleanup before removing element
    this.el.dataset.removed = '1';
    this.el.style.animationPlayState = 'paused';
    this.el.classList.add('popped');
    
    // Remove event listener to prevent memory leaks
    if (this.missHandler) {
      this.el.removeEventListener('animationend', this.missHandler);
      this.missHandler = null;
    }
    
    this.el.remove();
  }

  isRemoved() {
    return this.el.dataset.removed === '1';
  }

  pause() {
    this.el.style.animationPlayState = 'paused';
  }

  resume() {
    this.el.style.animationPlayState = 'running';
  }
}
