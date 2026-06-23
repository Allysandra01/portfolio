/**
 * Retro Arcade Audio Synthesizer
 * Generates 8-bit sound effects using the Web Audio API.
 */

class RetroAudio {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggle(enabled?: boolean) {
    if (enabled !== undefined) {
      this.enabled = enabled;
    } else {
      this.enabled = !this.enabled;
    }
    return this.enabled;
  }

  public isEnabled() {
    return this.enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1, delay: number = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

    // Hard retro envelope
    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  /**
   * Sound played when a piece is picked up or selected
   */
  public select() {
    this.playTone(300, 'square', 0.08, 0.05);
  }

  /**
   * Classic laser/bleep move sound
   */
  public move() {
    this.init();
    if (!this.ctx || !this.enabled) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(600, time + 0.12);

    gainNode.gain.setValueAtTime(0.08, time);
    gainNode.gain.linearRampToValueAtTime(0.001, time + 0.12);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.13);
  }

  /**
   * Retro snap move for AI
   */
  public aiMove() {
    this.init();
    if (!this.ctx || !this.enabled) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(400, time);
    osc.frequency.exponentialRampToValueAtTime(200, time + 0.15);

    gainNode.gain.setValueAtTime(0.05, time);
    gainNode.gain.linearRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  /**
   * Retro crunch sound for captures
   */
  public capture() {
    this.init();
    if (!this.ctx || !this.enabled) return;

    // Noise/crunch simulation using a rapid descending triangle tone with distorted gain
    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const noiseOsc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.linearRampToValueAtTime(60, time + 0.18);

    noiseOsc.type = 'triangle';
    noiseOsc.frequency.setValueAtTime(120, time);
    noiseOsc.frequency.linearRampToValueAtTime(20, time + 0.18);

    gainNode.gain.setValueAtTime(0.12, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gainNode);
    noiseOsc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(time);
    noiseOsc.start(time);
    osc.stop(time + 0.19);
    noiseOsc.stop(time + 0.19);
  }

  /**
   * High pitch alert for Check state
   */
  public check() {
    this.playTone(880, 'square', 0.15, 0.08, 0);
    this.playTone(880, 'square', 0.15, 0.08, 0.18);
  }

  /**
   * Buzzer error sound for invalid moves or UI actions
   */
  public error() {
    this.init();
    if (!this.ctx || !this.enabled) return;

    const time = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.linearRampToValueAtTime(95, time + 0.25);

    gainNode.gain.setValueAtTime(0.12, time);
    gainNode.gain.linearRampToValueAtTime(0.001, time + 0.25);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.26);
  }

  /**
   * Sound played when starting a new game (powering up the arcade cabinet)
   */
  public powerUp() {
    const tones = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    tones.forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.12, 0.04, idx * 0.07);
    });
  }

  /**
   * Dramatic game over tune
   */
  public gameOver(isWin: boolean) {
    if (isWin) {
      // Victory Fanfare
      const notes = [523.25, 523.25, 523.25, 523.25, 659.25, 587.33, 659.25, 783.99, 1046.50];
      const durations = [0.1, 0.1, 0.1, 0.2, 0.2, 0.1, 0.1, 0.1, 0.6];
      let delay = 0;
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'square', durations[idx], 0.06, delay);
        delay += durations[idx] + 0.02;
      });
    } else {
      // Loss Fanfare
      const notes = [392.00, 369.99, 349.23, 293.66];
      const durations = [0.15, 0.15, 0.15, 0.6];
      let delay = 0;
      notes.forEach((freq, idx) => {
        this.playTone(freq, 'sawtooth', durations[idx], 0.08, delay);
        delay += durations[idx] + 0.04;
      });
    }
  }

  /**
   * Classic retro double chime coin sound
   */
  public coin() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    const time = this.ctx.currentTime;
    
    // First chime
    this.playTone(987.77, 'square', 0.08, 0.06, 0);
    // Second chime (higher pitch, delayed)
    this.playTone(1318.51, 'square', 0.25, 0.06, 0.08);
  }

  /**
   * Beautiful victory cheer / happy rising arpeggio plus harmonies and retro sparkle
   */
  public cheer() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    
    // Sparkling major chord arpeggio sweeping upward
    const arpeggio = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00];
    arpeggio.forEach((freq, idx) => {
      // Square wave for the main pulse
      this.playTone(freq, 'square', 0.15, 0.04, idx * 0.05);
      // Triangle wave harmony for warmth
      this.playTone(freq * 1.5, 'triangle', 0.12, 0.02, idx * 0.05 + 0.02);
    });

    // Retro sparkling high-pitch bursts at the peak
    setTimeout(() => {
      if (!this.enabled) return;
      this.playTone(2500, 'square', 0.05, 0.02, 0);
      this.playTone(3000, 'square', 0.05, 0.02, 0.04);
      this.playTone(2800, 'square', 0.05, 0.02, 0.08);
    }, 350);
  }
}

export const audio = new RetroAudio();
