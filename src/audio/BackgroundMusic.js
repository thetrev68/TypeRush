import { themeMusicProfiles } from './themeMusicProfiles.js';

/**
 * BackgroundMusic - Generates theme-specific looping melodies using Web Audio API
 */
export class BackgroundMusic {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
    this.isPlaying = false;
    this.masterGain = null;
    this.loopTimeout = null;
    this.currentTheme = 'default';
    this.lfoNode = null;  // For space theme vibrato
  }

  /**
   * Initialize audio context
   */
  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Play a single note with theme-specific characteristics
   */
  playNote(frequency, startTime, duration, volume, profile) {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = profile.waveType;
    osc.frequency.value = frequency;

    // Space theme: Add LFO for vibrato effect
    if (profile.useLFO) {
      const lfo = this.audioContext.createOscillator();
      const lfoGain = this.audioContext.createGain();

      lfo.type = 'sine';
      lfo.frequency.value = 5; // 5 Hz vibrato
      lfoGain.gain.value = 8;  // Vibrato depth

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      lfo.start(startTime);
      lfo.stop(startTime + duration);
    }

    gain.gain.value = 0;

    // Ocean theme: Add filter for watery sound
    if (profile.useFilter) {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 2000;
      filter.Q.value = 1;

      osc.connect(filter);
      filter.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.masterGain);

    // ADSR envelope
    const attackTime = 0.05;
    const decayTime = 0.1;
    const sustainLevel = volume * 0.7;
    const releaseTime = 0.1;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + attackTime);
    gain.gain.linearRampToValueAtTime(sustainLevel, startTime + attackTime + decayTime);
    gain.gain.setValueAtTime(sustainLevel, startTime + duration - releaseTime);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  /**
   * Play the melody loop for current theme
   */
  playLoop() {
    if (!this.audioContext || !this.isPlaying) return;

    const profile = themeMusicProfiles[this.currentTheme];
    const now = this.audioContext.currentTime;
    const beatDuration = profile.tempo;

    // Play melody
    profile.melody.forEach(({ note, beat, duration }) => {
      const frequency = profile.scale[note];
      this.playNote(
        frequency,
        now + (beat * beatDuration),
        duration * beatDuration,
        profile.volume,
        profile
      );
    });

    // Play bass
    profile.bass.forEach(({ freq, beat, duration }) => {
      this.playNote(
        freq,
        now + (beat * beatDuration),
        duration * beatDuration,
        profile.bassVolume,
        profile
      );
    });

    // Schedule next loop (16 beats for all themes)
    const loopDuration = 16 * beatDuration;
    this.loopTimeout = setTimeout(() => this.playLoop(), loopDuration * 1000);
  }

  /**
   * Set the current theme
   */
  setTheme(theme) {
    const wasPlaying = this.isPlaying;
    const currentVolume = this.masterGain ? this.masterGain.gain.value : 0.4;

    // Stop current music
    if (wasPlaying) {
      this.stop();
    }

    // Update theme
    this.currentTheme = theme in themeMusicProfiles ? theme : 'default';

    // Restart music with new theme if it was playing
    if (wasPlaying) {
      this.start(currentVolume);
    }
  }

  /**
   * Start playing background music
   */
  start(volume = 0.4) {
    if (!this.initialized) this.init();
    if (!this.audioContext || this.isPlaying) return;

    this.isPlaying = true;
    this.masterGain.gain.value = volume;
    this.playLoop();
  }

  /**
   * Stop playing background music
   */
  stop() {
    this.isPlaying = false;
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.initialized = false;
    }
  }
}
