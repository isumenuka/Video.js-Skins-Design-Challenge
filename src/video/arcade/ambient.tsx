/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef } from 'react';

const W = 16;
const H = 9;

type RGB = [number, number, number];

/** Brightens dim averages so the spill reads, but keeps dark scenes dark. */
function lift([r, g, b]: RGB): string {
  const peak = Math.max(r, g, b, 1);
  const target = Math.min(220, Math.max(36, peak * 1.7));
  const k = target / peak;
  return `rgb(${Math.round(r * k)} ${Math.round(g * k)} ${Math.round(b * k)})`;
}

function average(data: Uint8ClampedArray, x0: number, x1: number): RGB {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let y = 0; y < H; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * 4;
      r += data[i]!;
      g += data[i + 1]!;
      b += data[i + 2]!;
      n++;
    }
  }
  return [r / n, g / n, b / n];
}

/**
 * Ambient light: the machine picks up the film's colours, like a TV that lights the wall behind it. While playing,
 * a few times a second it reads a tiny 16×9 copy of the frame and sets `--arc-ambient`, `--arc-ambient-start` and
 * `--arc-ambient-end` on the player; the armour around the screen glows with them. Decorative only. If the frame
 * can't be read (for example a cross-origin source without CORS), it stops quietly and the skin keeps its own colours.
 */
export function Ambient() {
  const anchor = useRef<HTMLSpanElement>(null);
  const paused = usePlayer((s) => s.paused);

  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.media-skin');
    const video = root?.querySelector('video');
    if (!root || !video) return;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d', { willReadFrequently: true });
    if (!g) return;

    let timer = 0;
    let broken = false;

    const sample = () => {
      if (broken || video.readyState < 2 || document.hidden) return;
      try {
        g.drawImage(video, 0, 0, W, H);
        const { data } = g.getImageData(0, 0, W, H);
        root.style.setProperty('--arc-ambient-start', lift(average(data, 0, 4)));
        root.style.setProperty('--arc-ambient-end', lift(average(data, W - 4, W)));
        root.style.setProperty('--arc-ambient', lift(average(data, 0, W)));
        root.setAttribute('data-ambient', '');
      } catch {
        broken = true; // tainted canvas: leave the skin's own colours alone
        clearInterval(timer);
      }
    };

    sample();
    video.addEventListener('loadeddata', sample);
    video.addEventListener('seeked', sample);
    if (!paused) timer = window.setInterval(sample, 400);

    return () => {
      clearInterval(timer);
      video.removeEventListener('loadeddata', sample);
      video.removeEventListener('seeked', sample);
    };
  }, [paused]);

  return <span ref={anchor} hidden />;
}
