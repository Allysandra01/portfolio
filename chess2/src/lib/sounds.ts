// Web Audio API synthesized 8-bit/chiptune sound effects.
// All sounds are programmatic — no external assets.

let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
}
export function isMuted() {
  return muted;
}

type ToneOpts = {
  freq: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  delay?: number;
  filter?: number; // low-pass cutoff
  slideTo?: number;
};

function tone({ freq, duration, type = "square", volume = 0.18, delay = 0, filter = 1800, slideTo }: ToneOpts) {
  const c = getCtx();
  if (!c || muted) return;
  const start = c.currentTime + delay;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = filter;

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(lp).connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sfx = {
  select: () => tone({ freq: 880, duration: 0.08, type: "square", volume: 0.1, filter: 2400 }),
  move: () => {
    tone({ freq: 520, duration: 0.09, type: "triangle", volume: 0.16 });
    tone({ freq: 320, duration: 0.06, type: "sine", volume: 0.1, delay: 0.04 });
  },
  capture: () => {
    tone({ freq: 220, duration: 0.08, type: "sawtooth", volume: 0.18, filter: 1200 });
    tone({ freq: 660, duration: 0.12, type: "square", volume: 0.18, delay: 0.07, filter: 2200 });
    tone({ freq: 880, duration: 0.1, type: "square", volume: 0.14, delay: 0.16, filter: 2400 });
  },
  check: () => {
    tone({ freq: 740, duration: 0.18, type: "square", volume: 0.16 });
    tone({ freq: 880, duration: 0.22, type: "square", volume: 0.16, delay: 0.18 });
  },
  victory: () => {
    [523, 659, 784, 1046].forEach((f, i) =>
      tone({ freq: f, duration: 0.14, type: "square", volume: 0.18, delay: i * 0.1 }),
    );
  },
  cheer: () => {
    // Happy fanfare: rising arpeggio + sparkle
    const melody = [523, 659, 784, 880, 1046, 1318];
    melody.forEach((f, i) =>
      tone({ freq: f, duration: 0.12, type: "triangle", volume: 0.18, delay: i * 0.07 }),
    );
    // Harmony
    [392, 523, 659].forEach((f, i) =>
      tone({ freq: f, duration: 0.18, type: "square", volume: 0.12, delay: 0.5 + i * 0.08 }),
    );
    // Sparkle on top
    [1568, 2093, 1760].forEach((f, i) =>
      tone({ freq: f, duration: 0.09, type: "sine", volume: 0.1, delay: 0.8 + i * 0.06, filter: 4000 }),
    );
  },
  coin: () => {
    tone({ freq: 988, duration: 0.07, type: "square", volume: 0.15, filter: 3000 });
    tone({ freq: 1318, duration: 0.18, type: "square", volume: 0.15, delay: 0.06, filter: 3000 });
  },
  defeat: () => {
    [784, 659, 523, 392].forEach((f, i) =>
      tone({ freq: f, duration: 0.18, type: "triangle", volume: 0.18, delay: i * 0.12 }),
    );
  },
  click: () => tone({ freq: 600, duration: 0.05, type: "square", volume: 0.1, filter: 2000 }),
};
