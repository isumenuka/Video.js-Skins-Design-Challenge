/** @jsxImportSource react */

import { playText } from '@videojs/core/i18n/text/buttons';
import { useTranslator } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useState } from 'react';

import { MarqueeLogos } from './marquee';

/**
 * The cabinet around the screen, built from photoreal renders: the hood (two speakers either side of a lit marquee),
 * the side posts and the recessed CRT bezel. The control panel and front face are drawn behind the controls.
 * Entirely decorative (`aria-hidden`); every control lives on the control panel. The marquee is a flickering neon
 * sign of the Video.js, Mux and sparkle marks (`MarqueeLogos`). The speakers glow and pulse with the film's audio level (`--arc-level`, set
 * by the oscilloscope), and the screen's light spills onto the cabinet (`--arc-ambient`, set by `<Ambient />`).
 */
export function CabinetFrame() {
  return (
    <div className={'arc-frame'} aria-hidden="true">
      <div className={'arc-body'} />

      <div className={'arc-top'}>
        <span className={'arc-speaker arc-speaker-start'} />
        <span className={'arc-marquee'}>
          <MarqueeLogos />
        </span>
        <span className={'arc-speaker arc-speaker-end'} />
      </div>

      <div className={'arc-bezel'}>
        <span className={'arc-rim'} />
      </div>
    </div>
  );
}

/**
 * Lamps over the two coin doors on the front face (the doors themselves are in the front-face render). They light
 * while the film plays. Layered over the control panel, decorative.
 */
export function CabinetDoor() {
  const paused = usePlayer((s) => s.paused);
  return (
    <div className={'arc-doors'} data-playing={paused ? undefined : ''} aria-hidden="true">
      <i className={'arc-door-lamp arc-door-lamp-start'} />
      <i className={'arc-door-lamp arc-door-lamp-end'} />
    </div>
  );
}

/**
 * The tube's glass: a curved reflection that drifts slowly across the screen and a spherical shading for the bulge.
 * Over the picture and the on-screen controls (glass is in front of everything), with no pointer events. Still under
 * reduced motion.
 */
export function ArcadeGlass() {
  return (
    <div className={'arc-glass'} aria-hidden="true">
      <span className={'arc-glass-sheen'} />
    </div>
  );
}

/** A pixel coin, drawn for this skin. */
function Coin() {
  return (
    <svg className={'arc-attract-coin'} viewBox="0 0 12 12" width="12" height="12" focusable="false">
      <path d="M4 0h4v1h2v1h1v2h1v4h-1v2h-1v1H8v1H4v-1H2v-1H1V8H0V4h1V2h1V1h2z" fill="currentColor" />
      <path d="M5 3h2v6H5z" fill="#000" opacity="0.45" />
    </svg>
  );
}

/**
 * Attract mode: before the first play the tube shows the film's poster (dimmed, with scanlines) and, like a cabinet
 * waiting for a coin, a blinking pixel prompt at the bottom — a coin and Video.js's own translated "Play" label —
 * while the panel's buttons blink in turn. Decorative (`aria-hidden`, no pointer events): the real play button stays
 * the control, and a tap on the screen still plays through the skin's own gestures.
 */
export function ArcadeAttract() {
  const started = usePlayer((s) => s.started);
  const t = useTranslator();
  if (started) return null;
  return (
    <div className={'arc-attract'} aria-hidden="true">
      <span className={'arc-attract-prompt'}>
        <Coin />
        {t(playText)}
        <Coin />
      </span>
    </div>
  );
}

/**
 * Boot sequence: when playback starts, the tube powers on — a scan line sweeps the screen behind a green flash and a
 * progress bar fills. Glyphs only, no text. Never under reduced motion.
 */
export function ArcadeBoot() {
  const paused = usePlayer((s) => s.paused);
  const ended = usePlayer((s) => s.ended);
  const [state, setState] = useState<'idle' | 'booting' | 'done'>('idle');
  const timer = useRef(0);

  // When the film ends the tube powers off, so the next play boots it again.
  useEffect(() => {
    if (ended) setState('idle');
  }, [ended]);

  useEffect(() => {
    if (paused || state !== 'idle') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setState('done');
      return;
    }
    setState('booting');
    timer.current = window.setTimeout(() => setState('done'), 900);
  }, [paused, state]);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (state !== 'booting') return null;
  return (
    <div className={'arc-boot'} aria-hidden="true">
      <span className={'arc-boot-scan'} />
      <span className={'arc-boot-bar'} />
    </div>
  );
}

/**
 * CRT power-off: when the film ends, the picture collapses to a glowing line, then a dot, and the screen goes dark
 * while the start button waits, lit. Glyphs only. Under reduced motion it goes straight to the dark screen.
 */
export function ArcadeCrt() {
  const ended = usePlayer((s) => s.ended);
  if (!ended) return null;
  return (
    <div className={'arc-crt'} aria-hidden="true">
      <span className={'arc-crt-line'} />
    </div>
  );
}
