// Synthesized sound effects for the demo clips: a soft click, a page swish, a gold chime. 48 kHz mono 16-bit WAV.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const RATE = 48000;

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.max(-1, Math.min(1, s)) * 32767, i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

// A one-pole low-pass, so noise reads as felt rather than hiss.
function lowpass(samples, cutoff) {
  const a = 1 - Math.exp((-2 * Math.PI * cutoff) / RATE);
  let y = 0;
  return samples.map((x) => (y += a * (x - y)));
}
function highpass(samples, cutoff) {
  const low = lowpass(samples, cutoff);
  return samples.map((x, i) => x - low[i]);
}
const noise = (n) => Array.from({ length: n }, () => Math.random() * 2 - 1);
const seconds = (s) => Math.round(s * RATE);

// Click: a short, woody tap. Filtered noise with a 2 ms attack and a quick decay, plus a faint 1.2 kHz knock.
function click() {
  const n = seconds(0.09);
  const body = lowpass(highpass(noise(n), 400), 3200);
  return body.map((x, i) => {
    const t = i / RATE;
    const env = Math.min(1, t / 0.002) * Math.exp(-t * 70);
    const knock = Math.sin(2 * Math.PI * 1200 * t) * Math.exp(-t * 120) * 0.35;
    return (x * 0.9 + knock) * env * 0.55;
  });
}

// Swish: a page turning. Noise whose brightness sweeps up then down over ~350 ms.
function swish() {
  const n = seconds(0.4);
  const raw = noise(n);
  const out = new Array(n).fill(0);
  let y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    const cutoff = 600 + 3400 * Math.sin((Math.PI * t) / 0.4);
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / RATE);
    y += a * (raw[i] - y);
    const env = Math.sin((Math.PI * t) / 0.4) ** 1.6;
    out[i] = y * env * 0.5;
  }
  return highpass(out, 300);
}

// Chime: a small bell in gold. Two partials, the second slightly detuned, with a gentle 600 ms decay.
function chime() {
  const n = seconds(0.7);
  return Array.from({ length: n }, (_, i) => {
    const t = i / RATE;
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 5.5);
    return (Math.sin(2 * Math.PI * 1318.5 * t) * 0.6 + Math.sin(2 * Math.PI * 1975 * t) * 0.3 + Math.sin(2 * Math.PI * 2637 * t) * 0.1) * env * 0.4;
  });
}

for (const [name, fn] of Object.entries({ click, swish, chime })) {
  writeFileSync(join(here, `${name}.wav`), wav(fn()));
  console.log('wrote', name);
}
