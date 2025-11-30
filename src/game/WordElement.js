import { leftLetters } from '../config/constants.js';

export class WordElement {
  constructor(word, onMiss) {
    this.word = word.toLowerCase();
    this.el = this.createElement();
    this.missHandler = () => onMiss(this.el);
    this.el.addEventListener('animationend', this.missHandler);
  }

  createElement() {
    const el = document.createElement('div');
    el.className = 'word';
    el.textContent = this.word;
    el.dataset.originalWord = this.word;
    el.dataset.removed = '0';
    el.dataset.typedProgress = '';

    // Add thumb indicator to first letter
    const firstLetter = this.word[0];
    const isLeft = leftLetters.has(firstLetter.toLowerCase());
    const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';
    el.innerHTML = `<span class="${firstLetterClass}">${firstLetter}</span>${this.word.substring(1)}`;

    return el;
  }

  highlightProgress(progress) {
    const word = this.el.dataset.originalWord || this.el.textContent;
    this.el.dataset.originalWord = word;

    if (progress.length === 0) {
      const firstLetter = word[0];
      const isLeft = leftLetters.has(firstLetter.toLowerCase());
      const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';
      this.el.innerHTML = `<span class="${firstLetterClass}">${firstLetter}</span>${word.substring(1)}`;
      return;
    }

    const typed = word.substring(0, progress.length);
    const remaining = word.substring(progress.length);
    const firstLetter = word[0];
    const isLeft = leftLetters.has(firstLetter.toLowerCase());
    const firstLetterClass = isLeft ? 'first-letter-left' : 'first-letter-right';

    if (progress.length === 1) {
      this.el.innerHTML = `<span class="typed ${firstLetterClass}">${typed}</span>${remaining}`;
    } else {
      this.el.innerHTML = `<span class="typed">${typed}</span>${remaining}`;
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
    this.el.dataset.removed = '1';
    this.el.style.animationPlayState = 'paused';
    this.el.classList.add('popped');
    if (this.missHandler) {
      this.el.removeEventListener('animationend', this.missHandler);
    }
  }

  remove() {
    this.el.remove();
  }

  isRemoved() {
    return this.el.dataset.removed === '1';
  }
}
