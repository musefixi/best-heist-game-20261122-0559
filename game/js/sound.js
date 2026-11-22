// Vaultbreak — a tiny WebAudio synth.
//
// No audio files: every sound is an oscillator shaped in code. The
// bank starts on the first key press (browsers want a gesture before
// audio), and every method guards on a missing context so the game
// plays the same with sound off.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.lastStep = 0;
  }

  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') void this.ctx.resume();
  }

  tone(freq, dur, type, gain, when = 0, slideTo = null) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const amp = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp);
    amp.connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // step is a soft tap, lower and quieter while sneaking.
  step(sneaking, now) {
    if (!this.ctx || now - this.lastStep < (sneaking ? 420 : 260)) return;
    this.lastStep = now;
    this.tone(sneaking ? 140 : 190, 0.06, 'sine', sneaking ? 0.03 : 0.05);
  }

  // loot is a bright two-note chime.
  loot() {
    this.tone(880, 0.12, 'triangle', 0.12);
    this.tone(1318, 0.18, 'triangle', 0.1, 0.09);
  }

  // ping warns that the alarm is past half.
  ping() {
    this.tone(660, 0.14, 'square', 0.05);
    this.tone(660, 0.14, 'square', 0.05, 0.18);
  }

  // puff is the smoke pellet going off.
  puff() {
    this.tone(320, 0.3, 'sine', 0.08, 0, 90);
  }

  // caught is a low buzz as the lights come up.
  caught() {
    this.tone(220, 0.5, 'sawtooth', 0.09, 0, 110);
    this.tone(110, 0.6, 'sawtooth', 0.07, 0.1, 55);
  }

  // clear is the little arpeggio for finishing a floor.
  clear() {
    [523, 659, 784].forEach((freq, i) => this.tone(freq, 0.16, 'triangle', 0.1, i * 0.09));
  }

  // win is the getaway fanfare.
  win() {
    [523, 659, 784, 1046, 1318].forEach((freq, i) => this.tone(freq, 0.22, 'triangle', 0.11, i * 0.11));
  }
}
