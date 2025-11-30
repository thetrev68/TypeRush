import { RAMP_MS } from '../config/constants.js';

export class GameLoop {
  constructor(state, wordSpawner, overlayManager, hud, activeWordTracker, audioManager, hapticManager) {
    this.state = state;
    this.wordSpawner = wordSpawner;
    this.overlayManager = overlayManager;
    this.hud = hud;
    this.activeWordTracker = activeWordTracker;
    this.audioManager = audioManager;
    this.hapticManager = hapticManager;
    this.rampTimer = null;
    this.positionTimer = null;
  }

  start() {
    // Clear any existing timers to prevent leaks
    this.stop();

    this.wordSpawner.startTimer(() => {
      if (this.state.falling.length === 1) {
        this.activeWordTracker.update(this.state.falling);
      }
    });

    this.rampTimer = setInterval(() => this.levelUp(), RAMP_MS);
    this.positionTimer = setInterval(() => {
      if (this.state.falling.length > 1) {
        this.activeWordTracker.update(this.state.falling);
      }
    }, 100);
  }

  levelUp() {
    this.state.level += 1;
    this.hud.update(this.state);
    this.wordSpawner.stopTimer();

    // Play level up sound and haptic
    if (this.audioManager) {
      this.audioManager.playLevelUp();
    }
    if (this.hapticManager) {
      this.hapticManager.celebrate();
    }

    this.showLevelUpPause();
  }

  showLevelUpPause() {
    this.state.running = false;
    this.stop();

    // Remove all falling words during level up
    this.state.falling.forEach(wordObj => {
      if (wordObj.wordElement && wordObj.wordElement.remove) {
        wordObj.wordElement.remove();
      } else if (wordObj.el) {
        wordObj.el.remove();
      }
    });
    this.state.falling = [];

    this.overlayManager.showLevelUpPause(this.state.level);
  }

  stop() {
    this.wordSpawner.stopTimer();
    if (this.rampTimer) {
      clearInterval(this.rampTimer);
      this.rampTimer = null;
    }
    if (this.positionTimer) {
      clearInterval(this.positionTimer);
      this.positionTimer = null;
    }
  }
}