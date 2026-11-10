import { getArcadePrefs, reducedMotion } from './prefs';
// "Arcade UI 6" by floraphonic (Pixabay Content License), embedded so the skin needs no audio file path.
import { arcadeButtonSound as buttonSound } from './sounds/arcade-button';

/*
 * Arcade sound effects with the Web Audio API: arcade button presses play a recorded retro UI sound (embedded),
 * and the rest — joystick, the tube's power-on and power-off, the secret jingle — are synthesised. Nothing is created until the viewer
 * interacts (browsers require a gesture anyway), sounds are quiet and short, they respect the skin's "Sound effects"
 * preference, and they stay silent while the film itself is muted. Also: short vibrations on phones that support it.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let button: AudioBuffer | null = null;
let loading = false;

/** Decodes the button sound once, the first time audio starts. Until then (or if it fails) a synthesised click plays. */
function loadButton(ac: AudioContext) {
  if (button || loading) return;
  loading = true;
  fetch(buttonSound)
    .then((r) => r.arrayBuffer())
    .then((data) => ac.decodeAudioData(data))
    .then((buffer) => {
      button = buffer;
    })
    .catch(() => {});
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    loadButton(ctx);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export type Sfx = 'click' | 'thunk' | 'boot' | 'off' | 'secret' | 'select';

/** Plays a sound effect. `filmMuted` silences it alongside the film. Call only from a user interaction or after one. */
export function playSfx(name: Sfx, filmMuted = false) {
  if (!getArcadePrefs().sfx || filmMuted) return;
  const ac = audio();
  if (!ac || !master) return;
  const t = ac.currentTime;
  const tone = (type: OscillatorType, from: number, to: number, start: number, dur: number, vol = 1) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(from, t + start);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, to), t + start + dur);
    g.gain.setValueAtTime(0.0001, t + start);
    g.gain.exponentialRampToValueAtTime(vol, t + start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
    o.connect(g).connect(master!);
    o.start(t + start);
    o.stop(t + start + dur + 0.02);
  };
  switch (name) {
    case 'click':
      if (button) {
        // The recorded arcade button, its pitch varied a little so repeated presses don't sound mechanical.
        const src = ac.createBufferSource();
        const g = ac.createGain();
        src.buffer = button;
        src.playbackRate.value = 0.96 + Math.random() * 0.08;
        g.gain.value = 2.2; // the master bus is quiet; this lifts the sample to sit with the synth sounds
        src.connect(g).connect(master);
        src.start(t);
      } else tone('square', 1800, 900, 0, 0.03, 0.35);
      break;
    case 'select':
      tone('square', 660, 660, 0, 0.05, 0.4);
      tone('square', 990, 990, 0.05, 0.07, 0.4);
      break;
    case 'thunk':
      tone('triangle', 160, 60, 0, 0.08, 0.8);
      break;
    case 'boot':
      tone('sawtooth', 60, 900, 0, 0.35, 0.25);
      tone('sine', 15000, 15000, 0.05, 0.4, 0.04); // the tube's whine
      break;
    case 'off':
      tone('sawtooth', 900, 40, 0, 0.45, 0.25);
      break;
    case 'secret':
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone('square', f, f, i * 0.09, 0.09, 0.45));
      break;
  }
}

/** A short vibration on phones that support it, when the viewer allows it and isn't asking for reduced motion. */
export function buzz(pattern: number | number[] = 12) {
  if (!getArcadePrefs().haptics || reducedMotion()) return;
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* not allowed here */
    }
  }
}

/** True once an AudioContext exists (for tests: none before the first gesture). */
export const sfxStarted = () => ctx !== null;
