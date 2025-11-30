import { saveAudioSettings } from '../utils/storage.js';

/**
 * SettingsManager - Manages audio/haptic settings UI
 */
export class SettingsManager {
  constructor(settingsContainer, audioManager, hapticManager, settings) {
    this.container = settingsContainer;
    this.audioManager = audioManager;
    this.hapticManager = hapticManager;
    this.settings = settings;
  }

  /**
   * Render the settings UI
   */
  render() {
    this.container.innerHTML = `
      <details class="settings-details">
        <summary class="settings-summary">Audio & Haptic Settings</summary>
        <div class="settings-content">
          <div class="settings-section">
            <label class="setting-item">
              <input type="checkbox" id="sfxToggle" ${this.settings.sfxEnabled ? 'checked' : ''} />
              <span>Sound Effects</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="musicToggle" ${this.settings.musicEnabled ? 'checked' : ''} />
              <span>Background Music</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="ttsToggle" ${this.settings.ttsEnabled ? 'checked' : ''} />
              <span>Read Words Aloud</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" id="hapticsToggle" ${this.settings.hapticsEnabled ? 'checked' : ''} />
              <span>Haptic Feedback</span>
            </label>
          </div>
          <div class="settings-section">
            <label class="setting-slider">
              <span>Master Volume</span>
              <input type="range" id="masterVolumeSlider" min="0" max="100" value="${this.settings.masterVolume * 100}" />
              <span id="masterVolumeValue">${Math.round(this.settings.masterVolume * 100)}%</span>
            </label>
            <label class="setting-slider">
              <span>Music Volume</span>
              <input type="range" id="musicVolumeSlider" min="0" max="100" value="${this.settings.musicVolume * 100}" />
              <span id="musicVolumeValue">${Math.round(this.settings.musicVolume * 100)}%</span>
            </label>
          </div>
        </div>
      </details>
    `;
  }

  /**
   * Setup event listeners for all settings controls
   */
  setupEventListeners() {
    const sfxToggle = document.getElementById('sfxToggle');
    const musicToggle = document.getElementById('musicToggle');
    const ttsToggle = document.getElementById('ttsToggle');
    const hapticsToggle = document.getElementById('hapticsToggle');
    const masterVolumeSlider = document.getElementById('masterVolumeSlider');
    const musicVolumeSlider = document.getElementById('musicVolumeSlider');
    const masterVolumeValue = document.getElementById('masterVolumeValue');
    const musicVolumeValue = document.getElementById('musicVolumeValue');

    // Toggle handlers
    sfxToggle?.addEventListener('change', (e) => {
      this.settings.sfxEnabled = e.target.checked;
      this.save();
    });

    musicToggle?.addEventListener('change', (e) => {
      this.settings.musicEnabled = e.target.checked;
      this.save();
    });

    ttsToggle?.addEventListener('change', (e) => {
      this.settings.ttsEnabled = e.target.checked;
      this.save();
    });

    hapticsToggle?.addEventListener('change', (e) => {
      this.settings.hapticsEnabled = e.target.checked;
      this.save();
    });

    // Volume slider handlers
    masterVolumeSlider?.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) / 100;
      this.settings.masterVolume = value;
      masterVolumeValue.textContent = `${Math.round(value * 100)}%`;
      this.save();
    });

    musicVolumeSlider?.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) / 100;
      this.settings.musicVolume = value;
      musicVolumeValue.textContent = `${Math.round(value * 100)}%`;
      this.save();
    });
  }

  /**
   * Save settings and update managers
   */
  save() {
    saveAudioSettings(this.settings);
    this.audioManager.updateSettings(this.settings);
    this.hapticManager.updateSettings(this.settings);
  }
}
