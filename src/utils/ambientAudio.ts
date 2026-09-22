/**
 * Soft, elegant procedural ambient wedding soundscape generator using Web Audio API.
 * Plays delicate, relaxing harp & acoustic string-like warm chord arpeggios in key of D Major.
 * Completely standalone, no external mp3 or network dependencies required.
 */
class AmbientWeddingAudio {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: any = null;
  private masterGain: GainNode | null = null;
  private chordIndex = 0;

  // D Major romantic progression chords (Frequencies in Hz)
  private chords = [
    [146.83, 220.00, 293.66, 369.99, 440.00, 587.33], // D maj (D3, A3, D4, F#4, A4, D5)
    [164.81, 246.94, 329.63, 392.00, 493.88, 659.25], // E min (E3, B3, E4, G4, B4, E5)
    [185.00, 277.18, 369.99, 440.00, 554.37, 739.99], // F# min (F#3, C#4, F#4, A4, C#5, F#5)
    [196.00, 293.66, 392.00, 493.88, 587.33, 783.99], // G maj (G3, D4, G4, B4, D5, G5)
    [220.00, 277.18, 329.63, 440.00, 554.37, 659.25], // A maj (A3, C#4, E4, A4, C#5, E5)
    [123.47, 185.00, 246.94, 293.66, 369.99, 493.88], // B min (B2, F#3, B3, D4, F#4, B4)
  ];

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  private playTone(freq: number, timeOffset = 0, duration = 3.5) {
    if (!this.ctx || !this.masterGain) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Warm acoustic string / bell timbre
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + timeOffset);

      // Add soft warm overtone
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime + timeOffset);
      filter.Q.setValueAtTime(1, this.ctx.currentTime + timeOffset);

      const startTime = this.ctx.currentTime + timeOffset;
      noteGain.gain.setValueAtTime(0, startTime);
      // Gentle pluck attack
      noteGain.gain.linearRampToValueAtTime(0.08, startTime + 0.08);
      // Long romantic bell decay
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.1);
    } catch {
      // Audio context might be suspended
    }
  }

  public play() {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = true;

    // Trigger gentle arpeggio every 2.4 seconds
    const playChordStep = () => {
      if (!this.isPlaying || !this.ctx) return;
      const currentChord = this.chords[this.chordIndex % this.chords.length];
      this.chordIndex++;

      // Play soft arpeggiated notes
      currentChord.forEach((freq, idx) => {
        const offset = idx * 0.28 + (Math.random() * 0.04);
        this.playTone(freq, offset, 3.2);
      });
    };

    playChordStep();
    this.intervalId = setInterval(playChordStep, 2600);
    return true;
  }

  public pause() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      return this.play();
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const ambientAudio = new AmbientWeddingAudio();
