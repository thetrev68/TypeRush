/**
 * TextToSpeech - Wrapper for Web Speech API to read words aloud
 */
export class TextToSpeech {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voice = null;
    this.enabled = false;
  }

  /**
   * Initialize and select a voice
   */
  init() {
    if (!this.synthesis) {
      console.warn('Speech Synthesis API not supported');
      return;
    }

    // Wait for voices to load
    const setVoice = () => {
      const voices = this.synthesis.getVoices();

      // Prefer English voices
      this.voice = voices.find(v => v.lang.startsWith('en-')) || voices[0];
    };

    // Voices may load asynchronously
    if (this.synthesis.getVoices().length > 0) {
      setVoice();
    } else {
      this.synthesis.addEventListener('voiceschanged', setVoice, { once: true });
    }
  }

  /**
   * Speak a word
   */
  speak(text, rate = 1.2, pitch = 1.0, volume = 0.8) {
    if (!this.synthesis || !this.enabled) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (this.voice) {
      utterance.voice = this.voice;
    }

    utterance.rate = rate;      // Speed (0.1 to 10, default 1)
    utterance.pitch = pitch;    // Pitch (0 to 2, default 1)
    utterance.volume = volume;  // Volume (0 to 1, default 1)

    this.synthesis.speak(utterance);
  }

  /**
   * Enable text-to-speech
   */
  enable() {
    this.enabled = true;
  }

  /**
   * Disable text-to-speech
   */
  disable() {
    this.enabled = false;
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Cancel any ongoing speech
   */
  cancel() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}
