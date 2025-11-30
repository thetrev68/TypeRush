/**
 * HapticManager - Manages haptic feedback using Vibration API
 */
export class HapticManager {
  constructor(settings) {
    this.settings = settings;
    this.vibrate = navigator.vibrate?.bind(navigator) || null;

    if (!this.vibrate) {
      console.warn('Vibration API not supported');
    }
  }

  /**
   * Trigger a short pulse for key press
   */
  pulse() {
    if (!this.settings.hapticsEnabled || !this.vibrate) return;
    this.vibrate(10); // 10ms pulse
  }

  /**
   * Trigger a double pulse for correct word
   */
  success() {
    if (!this.settings.hapticsEnabled || !this.vibrate) return;
    this.vibrate([20, 10, 20]); // pulse-gap-pulse pattern
  }

  /**
   * Trigger an error vibration
   */
  error() {
    if (!this.settings.hapticsEnabled || !this.vibrate) return;
    this.vibrate([50, 30, 50]); // longer, more noticeable pattern
  }

  /**
   * Trigger a celebration pattern for level up
   */
  celebrate() {
    if (!this.settings.hapticsEnabled || !this.vibrate) return;
    this.vibrate([30, 20, 30, 20, 30]); // triple pulse pattern
  }

  /**
   * Update settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Cancel ongoing vibration
   */
  cancel() {
    if (this.vibrate) {
      this.vibrate(0);
    }
  }
}
