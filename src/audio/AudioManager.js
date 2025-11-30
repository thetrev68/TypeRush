import { SoundEffects } from './SoundEffects.js';
import { BackgroundMusic } from './BackgroundMusic.js';
import { TextToSpeech } from './TextToSpeech.js';

/**
 * AudioManager - Coordinates all audio systems with settings
 */
export class AudioManager {
  constructor(settings) {
    this.settings = settings;
    this.sfx = new SoundEffects();
    this.music = new BackgroundMusic();
    this.tts = new TextToSpeech();
    this.initialized = false;
  }

  /**
   * Initialize all audio systems (call after user interaction)
   */
  init() {
    if (this.initialized) return;

    this.sfx.init();
    this.music.init();
    this.tts.init();

    // Apply initial TTS setting
    if (this.settings.ttsEnabled) {
      this.tts.enable();
    } else {
      this.tts.disable();
    }

    this.initialized = true;
  }

  /**
   * Start background music if enabled
   */
  startMusic() {
    if (this.settings.musicEnabled) {
      const volume = this.settings.masterVolume * this.settings.musicVolume;
      this.music.start(volume);
    }
  }

  /**
   * Stop background music
   */
  stopMusic() {
    this.music.stop();
  }

  /**
   * Play tick sound for key press
   */
  playTick() {
    if (!this.settings.sfxEnabled) return;
    this.sfx.playTick(this.settings.masterVolume);
  }

  /**
   * Play correct word sound
   */
  playCorrect() {
    if (!this.settings.sfxEnabled) return;
    this.sfx.playCorrect(this.settings.masterVolume);
  }

  /**
   * Play error sound
   */
  playError() {
    if (!this.settings.sfxEnabled) return;
    this.sfx.playError(this.settings.masterVolume);
  }

  /**
   * Play level up fanfare
   */
  playLevelUp() {
    if (!this.settings.sfxEnabled) return;
    this.sfx.playLevelUp(this.settings.masterVolume);
  }

  /**
   * Play high score chime
   */
  playHighScore() {
    if (!this.settings.sfxEnabled) return;
    this.sfx.playHighScore(this.settings.masterVolume);
  }

  /**
   * Speak a word aloud
   */
  speakWord(word) {
    if (!this.settings.ttsEnabled) return;
    this.tts.speak(word, 1.2, 1.0, this.settings.masterVolume);
  }

  /**
   * Update settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };

    // Update TTS state
    if (this.settings.ttsEnabled) {
      this.tts.enable();
    } else {
      this.tts.disable();
    }

    // Update music volume or stop/start as needed
    if (this.settings.musicEnabled && this.music.isPlaying) {
      const volume = this.settings.masterVolume * this.settings.musicVolume;
      this.music.setVolume(volume);
    } else if (this.settings.musicEnabled && !this.music.isPlaying) {
      this.startMusic();
    } else if (!this.settings.musicEnabled && this.music.isPlaying) {
      this.stopMusic();
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.sfx.dispose();
    this.music.dispose();
    this.tts.cancel();
    this.initialized = false;
  }
}
