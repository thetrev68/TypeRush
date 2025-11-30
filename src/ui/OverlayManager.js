export class OverlayManager {
  constructor(overlay, overlayTitle, overlayMsg, overlayRestart) {
    this.overlay = overlay;
    this.overlayTitle = overlayTitle;
    this.overlayMsg = overlayMsg;
    this.overlayRestart = overlayRestart;
  }

  show(title, message) {
    this.overlayTitle.textContent = title;
    this.overlayMsg.textContent = message;
    this.overlay.classList.remove('hidden');
  }

  hide() {
    this.overlay.classList.add('hidden');
  }

  showLevelUpPause(level) {
    this.overlayTitle.textContent = `Level ${level} Complete!`;
    this.overlayMsg.textContent = 'Take a quick break. Tap Play to continue.';
    this.overlayRestart.textContent = 'Continue';
    this.show(this.overlayTitle.textContent, this.overlayMsg.textContent);
  }

  showGameOver(unlockMsg) {
    const title = unlockMsg ? 'Success!' : 'Game Over';
    const message = unlockMsg || 'Game over';
    this.overlayRestart.textContent = 'Play';
    this.show(title, message);
  }

  showReady() {
    this.overlayRestart.textContent = 'Play';
    this.show('Ready?', 'Tap start to play.');
  }

  setupRestartButton(onRestart) {
    this.overlayRestart.addEventListener('click', onRestart);
  }
}
