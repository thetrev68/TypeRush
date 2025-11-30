/**
 * BackgroundMusic - Generates a simple looping melody using Web Audio API
 */
export class BackgroundMusic {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
    this.isPlaying = false;
    this.masterGain = null;
    this.loopTimeout = null;
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
   * Play a single note
   */
  playNote(frequency, startTime, duration, volume = 0.15) {
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.value = frequency;

    gain.gain.value = 0;
    osc.connect(gain);
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
   * Play the melody loop
   */
  playLoop() {
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;
    const beatDuration = 0.3; // 200 BPM

    // Simple upbeat melody in C major pentatonic (C-D-E-G-A)
    // 16-beat phrase
    const melody = [
      { note: 523.25, beat: 0, duration: 1 },    // C5
      { note: 587.33, beat: 1, duration: 1 },    // D5
      { note: 659.25, beat: 2, duration: 1 },    // E5
      { note: 783.99, beat: 3, duration: 1 },    // G5

      { note: 880.00, beat: 4, duration: 2 },    // A5
      { note: 783.99, beat: 6, duration: 1 },    // G5
      { note: 659.25, beat: 7, duration: 1 },    // E5

      { note: 587.33, beat: 8, duration: 1 },    // D5
      { note: 659.25, beat: 9, duration: 1 },    // E5
      { note: 523.25, beat: 10, duration: 2 },   // C5

      { note: 659.25, beat: 12, duration: 1 },   // E5
      { note: 783.99, beat: 13, duration: 1 },   // G5
      { note: 880.00, beat: 14, duration: 2 }    // A5
    ];

    // Bass line (one octave lower)
    const bass = [
      { note: 261.63, beat: 0, duration: 4 },    // C4
      { note: 392.00, beat: 4, duration: 4 },    // G4
      { note: 329.63, beat: 8, duration: 4 },    // E4
      { note: 293.66, beat: 12, duration: 4 }    // D4
    ];

    // Play melody
    melody.forEach(({ note, beat, duration }) => {
      this.playNote(note, now + (beat * beatDuration), duration * beatDuration, 0.1);
    });

    // Play bass
    bass.forEach(({ note, beat, duration }) => {
      this.playNote(note, now + (beat * beatDuration), duration * beatDuration, 0.08);
    });

    // Schedule next loop
    const loopDuration = 16 * beatDuration; // 16 beats
    this.loopTimeout = setTimeout(() => this.playLoop(), loopDuration * 1000);
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
