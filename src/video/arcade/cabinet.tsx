/** @jsxImportSource react */

import { playText } from '@videojs/core/i18n/text/buttons';
import { useTranslator } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

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

/**
 * Attract mode: before the first play the screen loops like a cabinet waiting for a player — the film's title types
 * itself out in pixel letters, flashes, and an arrow points at the start button while the panel's buttons blink in
 * turn. The only words are the media title and Video.js's own "Play"
 * label. It is decorative (`aria-hidden`, no pointer events): the real play button stays the control, and a tap on the
 * screen still plays through the skin's own gestures.
 */
export function ArcadeAttract() {
  const started = usePlayer((s) => s.started);
  const title = usePlayer((s) => s.title);
  const t = useTranslator();
  if (started) return null;
  return (
    <div className={'arc-attract'} aria-hidden="true">
      <span className={'arc-attract-title'} style={{ '--arc-letters': (title || t(playText)).length } as CSSProperties}>
        {title || t(playText)}
      </span>
      <span className={'arc-attract-cue'}>
        <span className={'arc-attract-play'}>{t(playText)}</span>
        <svg className={'arc-attract-arrow'} viewBox="0 0 48 24" width="48" height="24" focusable="false">
          <path d="M2 12h40M32 3l10 9-10 9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
        </svg>
        <span className={'arc-attract-cursor'} />
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
