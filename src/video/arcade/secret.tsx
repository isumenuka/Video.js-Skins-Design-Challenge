/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useState } from 'react';

import { arcadeText, useArcadeTranslator } from './i18n';
import { getArcadePrefs, setArcadePref, useArcadePrefs } from './prefs';
import { buzz, playSfx } from './sfx';

const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const W = 160; // the pixel mode's horizontal resolution
const LEVELS = 4; // colour steps per channel — a 64-colour palette

/**
 * The secret: typing ↑ ↑ ↓ ↓ ← → ← → B A while the player has focus toggles an 8-bit mode — the film is redrawn on a
 * tiny canvas with a reduced palette and blown up with hard pixels, and the marquee cycles through colours. A banner
 * says so, and the change is announced to screen readers. If the frame can't be read (a cross-origin source without
 * CORS), the mode falls back to a CSS pixel grid over the film.
 */
export function SecretMode() {
  const { secret } = useArcadePrefs();
  const muted = usePlayer((s) => s.muted) ?? false;
  const paused = usePlayer((s) => s.paused);
  const t = useArcadeTranslator();
  const anchor = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [banner, setBanner] = useState<'on' | 'off' | null>(null);
  const [tainted, setTainted] = useState(false);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  // Listen for the code on the player (keys bubble up from any focused control).
  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.media-skin');
    if (!root) return;
    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = key === CODE[pos] ? pos + 1 : key === CODE[0] ? 1 : 0;
      if (pos < CODE.length) return;
      pos = 0;
      const on = !getArcadePrefs().secret;
      setArcadePref('secret', on);
      setBanner(on ? 'on' : 'off');
      playSfx('secret', mutedRef.current);
      buzz([30, 40, 30, 40, 60]);
    };
    root.addEventListener('keydown', onKey, true);
    return () => root.removeEventListener('keydown', onKey, true);
  }, []);

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => setBanner(null), 2600);
    return () => clearTimeout(timer);
  }, [banner]);

  // Draw the pixel film while the mode is on.
  useEffect(() => {
    const c = canvas.current;
    const video = anchor.current?.closest('.media-skin')?.querySelector('video');
    if (!secret || !c || !video || tainted) return;
    const g = c.getContext('2d', { willReadFrequently: true });
    if (!g) return;
    let frame = 0;
    let timer = 0;
    const step = 255 / (LEVELS - 1);
    const draw = () => {
      if (video.readyState >= 2 && video.videoWidth) {
        const h = Math.max(1, Math.round((W * video.videoHeight) / video.videoWidth));
        if (c.width !== W || c.height !== h) {
          c.width = W;
          c.height = h;
        }
        try {
          g.drawImage(video, 0, 0, W, h);
          const img = g.getImageData(0, 0, W, h);
          const d = img.data;
          for (let i = 0; i < d.length; i += 4) {
            d[i] = Math.round(d[i]! / step) * step;
            d[i + 1] = Math.round(d[i + 1]! / step) * step;
            d[i + 2] = Math.round(d[i + 2]! / step) * step;
          }
          g.putImageData(img, 0, 0);
        } catch {
          setTainted(true);
          return;
        }
      }
      if (paused) timer = window.setTimeout(draw, 250);
      else frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [secret, paused, tainted]);

  // Mirror the mode on the player for CSS.
  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.media-skin');
    root?.toggleAttribute('data-secret', secret);
    root?.toggleAttribute('data-secret-fallback', secret && tainted);
  }, [secret, tainted]);

  return (
    <>
      <span ref={anchor} hidden />
      {secret && !tainted && <canvas ref={canvas} className={'arc-pixel'} aria-hidden="true" />}
      <div className={'arc-visually-hidden'} role="status" aria-live="polite">
        {banner === 'on' ? t(arcadeText.secretUnlocked) : banner === 'off' ? t(arcadeText.secretOff) : ''}
      </div>
      {banner && (
        <div className={'arc-banner'} aria-hidden="true">
          {banner === 'on' ? t(arcadeText.secretUnlocked) : t(arcadeText.secretOff)}
        </div>
      )}
    </>
  );
}
