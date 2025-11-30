/**
 * SoundEffects - Synthesizes game sounds using Web Audio API
 */
export class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Create and connect a gain node for volume control
   */
  createGain(volume = 1.0) {
    if (!this.audioContext) return null;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(this.audioContext.destination);
    return gainNode;
  }

  /**
   * Play a short tick sound (keyboard press)
   */
  playTick(volume = 0.3) {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.createGain(volume);

    osc.type = 'sine';
    osc.frequency.value = 800;

    osc.connect(gain);

    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Play a pleasant chord for correct word
   */
  playCorrect(volume = 0.4) {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const duration = 0.3;

    // C major chord (C-E-G)
    const frequencies = [523.25, 659.25, 783.99];

    frequencies.forEach((freq, index) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.createGain(volume * 0.3);

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(gain);

      // Slight delay for each note to create a pleasant cascade
      const startTime = now + (index * 0.03);
      gain.gain.setValueAtTime(volume * 0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * Play an error sound (dissonant tone)
   */
  playError(volume = 0.3) {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.createGain(volume);

    osc.type = 'sawtooth';
    osc.frequency.value = 200;

    osc.connect(gain);

    const now = this.audioContext.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Play a fanfare for level up
   */
  playLevelUp(volume = 0.5) {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Ascending fanfare: C-E-G-C
    const notes = [
      { freq: 523.25, time: 0 },
      { freq: 659.25, time: 0.15 },
      { freq: 783.99, time: 0.3 },
      { freq: 1046.50, time: 0.45 }
    ];

    notes.forEach(note => {
      const osc = this.audioContext.createOscillator();
      const gain = this.createGain(volume * 0.4);

      osc.type = 'triangle';
      osc.frequency.value = note.freq;

      osc.connect(gain);

      const startTime = now + note.time;
      const duration = 0.2;

      gain.gain.setValueAtTime(volume * 0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * Play a bright chime for high score
   */
  playHighScore(volume = 0.5) {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // Bright high-pitched chime
    const frequencies = [1046.50, 1318.51, 1567.98]; // C6-E6-G6

    frequencies.forEach((freq, index) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.createGain(volume * 0.25);

      osc.type = 'sine';
      osc.frequency.value = freq;

      osc.connect(gain);

      const startTime = now + (index * 0.02);
      const duration = 0.5;

      gain.gain.setValueAtTime(volume * 0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.initialized = false;
    }
  }
}
