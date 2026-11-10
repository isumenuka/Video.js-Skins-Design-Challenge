/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef } from 'react';

/**
 * A live audio oscilloscope for the deck. Purely decorative (`aria-hidden`).
 *
 * On the first play it routes the `<video>` through one AnalyserNode. It only connects once the AudioContext is
 * actually running, so a blocked context can never silence the film; any failure leaves a flat trace and the audio
 * untouched. It draws only while playing, and at ~4 fps under reduced motion.
 *
 * It also reports the loudness as `--arc-level` (0–1) on the cabinet's top housing, so the speaker grilles pulse with
 * the film's sound.
 */

interface Tap {
  analyser: AnalyserNode;
  data: Uint8Array<ArrayBuffer>;
}

const taps = new WeakMap<HTMLMediaElement, Tap | null>();

async function tapAudio(video: HTMLMediaElement): Promise<Tap | null> {
  if (taps.has(video)) return taps.get(video) ?? null;
  taps.set(video, null); // claim it: a media element can only ever have one MediaElementSource
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    if (ctx.state !== 'running') await ctx.resume().catch(() => {});
    if (ctx.state !== 'running') {
      void ctx.close();
      taps.delete(video); // try again on a later play, with a fresh user gesture
      return null;
    }
    const source = ctx.createMediaElementSource(video);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const tap = { analyser, data: new Uint8Array(new ArrayBuffer(analyser.fftSize)) };
    taps.set(video, tap);
    return tap;
  } catch {
    return null;
  }
}

function readColor(el: Element, name: string, fallback: string) {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

export function Oscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paused = usePlayer((s) => s.paused);
  const tapRef = useRef<Tap | null>(null);

  // Keep the backing store matched to the CSS size.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      draw(canvas, null);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(canvas);
    fit();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (paused) {
      // Idle: a flat trace, repainted now and then so a phosphor change recolours it.
      draw(canvas, null);
      const idle = window.setInterval(() => draw(canvas, null), 1000);
      return () => clearInterval(idle);
    }
    const root = canvas.closest('.media-skin');
    const video = root?.querySelector('video');
    const speakers = root?.querySelector<HTMLElement>('.arc-top');
    let frame = 0;
    let timer = 0;
    let stopped = false;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const tick = () => {
      if (stopped) return;
      const level = draw(canvas, tapRef.current);
      speakers?.style.setProperty('--arc-level', level.toFixed(2));
      if (reduced) timer = window.setTimeout(tick, 250);
      else frame = requestAnimationFrame(tick);
    };

    if (video) {
      void tapAudio(video).then((tap) => {
        tapRef.current = tap;
      });
    }
    tick();

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      speakers?.style.setProperty('--arc-level', '0');
    };
  }, [paused]);

  return (
    <div className={'arc-scope'} aria-hidden="true">
      <canvas ref={canvasRef} className={'arc-scope-canvas'} />
    </div>
  );
}

/** Draws the trace and returns the loudness (RMS, scaled to 0–1). */
function draw(canvas: HTMLCanvasElement, tap: Tap | null): number {
  const g = canvas.getContext('2d');
  if (!g) return 0;
  let level = 0;
  const { width: w, height: h } = canvas;
  const green = readColor(canvas, '--arc-green', '#7cff3a');
  const dpr = w / Math.max(1, canvas.clientWidth);

  g.clearRect(0, 0, w, h);

  // Graticule: the phosphor colour, faint.
  g.globalAlpha = 0.14;
  g.strokeStyle = green;
  g.lineWidth = 1;
  g.beginPath();
  const step = 12 * dpr;
  for (let x = step; x < w; x += step) {
    g.moveTo(Math.round(x) + 0.5, 0);
    g.lineTo(Math.round(x) + 0.5, h);
  }
  g.moveTo(0, Math.round(h / 2) + 0.5);
  g.lineTo(w, Math.round(h / 2) + 0.5);
  g.stroke();
  g.globalAlpha = 1;

  // Trace.
  g.strokeStyle = green;
  g.lineWidth = 1.5 * dpr;
  g.shadowColor = green;
  g.shadowBlur = 6 * dpr;
  g.beginPath();
  if (tap) {
    tap.analyser.getByteTimeDomainData(tap.data);
    const n = tap.data.length;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * w;
      const v = (tap.data[i]! - 128) / 128;
      level += v * v;
      const y = h / 2 + v * (h / 2) * 0.9;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
  } else {
    g.moveTo(0, h / 2);
    g.lineTo(w, h / 2);
  }
  g.stroke();
  g.shadowBlur = 0;
  return tap ? Math.min(1, Math.sqrt(level / tap.data.length) * 4) : 0;
}
