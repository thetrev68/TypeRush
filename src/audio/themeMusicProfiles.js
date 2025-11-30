/**
 * Theme-specific music profiles
 * Each theme has unique melody, scale, tempo, and instrument characteristics
 */

export const themeMusicProfiles = {
  default: {
    name: 'Upbeat & Friendly',
    tempo: 0.3,           // Beat duration in seconds
    waveType: 'triangle',
    volume: 0.1,
    bassVolume: 0.08,

    // C major pentatonic scale (C-D-E-G-A)
    scale: [523.25, 587.33, 659.25, 783.99, 880.00],

    // 16-beat melodic phrase
    melody: [
      { note: 0, beat: 0, duration: 1 },    // C5
      { note: 1, beat: 1, duration: 1 },    // D5
      { note: 2, beat: 2, duration: 1 },    // E5
      { note: 3, beat: 3, duration: 1 },    // G5
      { note: 4, beat: 4, duration: 2 },    // A5
      { note: 3, beat: 6, duration: 1 },    // G5
      { note: 2, beat: 7, duration: 1 },    // E5
      { note: 1, beat: 8, duration: 1 },    // D5
      { note: 2, beat: 9, duration: 1 },    // E5
      { note: 0, beat: 10, duration: 2 },   // C5
      { note: 2, beat: 12, duration: 1 },   // E5
      { note: 3, beat: 13, duration: 1 },   // G5
      { note: 4, beat: 14, duration: 2 }    // A5
    ],

    // Bass line (root notes, octave lower)
    bass: [
      { freq: 261.63, beat: 0, duration: 4 },    // C4
      { freq: 392.00, beat: 4, duration: 4 },    // G4
      { freq: 329.63, beat: 8, duration: 4 },    // E4
      { freq: 293.66, beat: 12, duration: 4 }    // D4
    ]
  },

  space: {
    name: 'Ethereal & Expansive',
    tempo: 0.4,           // Slower, more ambient
    waveType: 'sine',
    volume: 0.08,
    bassVolume: 0.06,
    useLFO: true,         // Add vibrato/warble effect

    // Lydian mode (C-D-E-F#-G-A-B) - bright, dreamy
    scale: [523.25, 587.33, 659.25, 739.99, 783.99, 880.00, 987.77],

    melody: [
      { note: 0, beat: 0, duration: 2 },    // C5
      { note: 4, beat: 2, duration: 2 },    // G5
      { note: 2, beat: 4, duration: 2 },    // E5
      { note: 6, beat: 6, duration: 2 },    // B5
      { note: 5, beat: 8, duration: 2 },    // A5
      { note: 3, beat: 10, duration: 2 },   // F#5
      { note: 4, beat: 12, duration: 2 },   // G5
      { note: 0, beat: 14, duration: 2 }    // C5
    ],

    bass: [
      { freq: 261.63, beat: 0, duration: 8 },    // C4 (long sustained)
      { freq: 392.00, beat: 8, duration: 8 }     // G4
    ]
  },

  ocean: {
    name: 'Flowing & Rhythmic',
    tempo: 0.35,
    waveType: 'sawtooth',
    volume: 0.09,
    bassVolume: 0.07,
    useFilter: true,      // Add low-pass filter for watery sound

    // Dorian mode (D-E-F-G-A-B-C) - flowing, minor
    scale: [587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50],

    melody: [
      { note: 0, beat: 0, duration: 1 },    // D5
      { note: 2, beat: 1, duration: 1 },    // F5
      { note: 4, beat: 2, duration: 1 },    // A5
      { note: 3, beat: 3, duration: 1 },    // G5
      { note: 1, beat: 4, duration: 1.5 },  // E5
      { note: 4, beat: 5.5, duration: 0.5 },// A5
      { note: 5, beat: 6, duration: 1 },    // B5
      { note: 4, beat: 7, duration: 1 },    // A5
      { note: 3, beat: 8, duration: 1 },    // G5
      { note: 1, beat: 9, duration: 1 },    // E5
      { note: 2, beat: 10, duration: 2 },   // F5
      { note: 0, beat: 12, duration: 2 },   // D5
      { note: 4, beat: 14, duration: 2 }    // A5
    ],

    bass: [
      { freq: 293.66, beat: 0, duration: 4 },    // D4
      { freq: 392.00, beat: 4, duration: 4 },    // G4
      { freq: 329.63, beat: 8, duration: 4 },    // E4
      { freq: 293.66, beat: 12, duration: 4 }    // D4
    ]
  },

  racing: {
    name: 'Fast & Energetic',
    tempo: 0.25,          // Faster tempo
    waveType: 'square',
    volume: 0.11,
    bassVolume: 0.09,
    useDistortion: true,  // Add slight distortion/drive

    // Phrygian mode (E-F-G-A-B-C-D) - dark, driving
    scale: [659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66],

    melody: [
      { note: 0, beat: 0, duration: 0.5 },   // E5
      { note: 0, beat: 0.5, duration: 0.5 }, // E5
      { note: 2, beat: 1, duration: 0.5 },   // G5
      { note: 2, beat: 1.5, duration: 0.5 }, // G5
      { note: 4, beat: 2, duration: 1 },     // B5
      { note: 3, beat: 3, duration: 1 },     // A5
      { note: 2, beat: 4, duration: 0.5 },   // G5
      { note: 1, beat: 4.5, duration: 0.5 }, // F5
      { note: 0, beat: 5, duration: 1 },     // E5
      { note: 2, beat: 6, duration: 0.5 },   // G5
      { note: 4, beat: 6.5, duration: 0.5 }, // B5
      { note: 6, beat: 7, duration: 1 },     // D6
      { note: 4, beat: 8, duration: 2 },     // B5
      { note: 2, beat: 10, duration: 1 },    // G5
      { note: 3, beat: 11, duration: 1 },    // A5
      { note: 2, beat: 12, duration: 1 },    // G5
      { note: 1, beat: 13, duration: 1 },    // F5
      { note: 0, beat: 14, duration: 2 }     // E5
    ],

    bass: [
      { freq: 329.63, beat: 0, duration: 2 },    // E4 (staccato)
      { freq: 329.63, beat: 2, duration: 2 },    // E4
      { freq: 392.00, beat: 4, duration: 2 },    // G4
      { freq: 392.00, beat: 6, duration: 2 },    // G4
      { freq: 261.63, beat: 8, duration: 4 },    // C4
      { freq: 293.66, beat: 12, duration: 4 }    // D4
    ]
  }
};
