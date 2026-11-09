/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useState } from 'react';

const SEGMENTS = 16;

/** A turbine rotor: six chamfered blades in a ring. Spins while the film plays (CSS, off under reduced motion). */
function Turbine() {
  return (
    <svg className={'con-turbine'} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <g className={'con-turbine-rotor'}>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <path key={a} d="M12 12 12 3.5l3 1.5-1.5 5.5z" fill="currentColor" transform={`rotate(${a} 12 12)`} />
        ))}
      </g>
      <circle cx="12" cy="12" r="2.25" fill="var(--con-black, #0b0d0c)" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * The machine around the screen: bezel, port lights, status LEDs and the hinge between screen and deck, whose meter
 * mirrors the volume and whose turbines turn while playing. Entirely decorative (`aria-hidden`); every control lives in
 * the deck.
 */
export function ConsoleFrame() {
  const paused = usePlayer((s) => s.paused);
  const volume = usePlayer((s) => s.volume) ?? 1;
  const muted = usePlayer((s) => s.muted) ?? false;
  const lit = muted ? 0 : Math.round(volume * SEGMENTS);

  return (
    <div className={'con-frame'} data-playing={paused ? undefined : ''} aria-hidden="true">
      <div className={'con-bezel'}>
        <span className={'con-bezel-strip'} />
        <span className={'con-port con-port-start'} />
        <span className={'con-port con-port-end'} />
        <span className={'con-status'}>
          <i className={'con-status-led con-status-power'} />
          <i className={'con-status-led con-status-signal'} />
          <i className={'con-status-led con-status-alert'} />
        </span>
      </div>
      <div className={'con-hinge'}>
        <Turbine />
        <span className={'con-vent'} />
        <span className={'con-meter'}>
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <i key={i} className={'con-meter-seg'} data-lit={i < lit ? '' : undefined} data-zone={i >= SEGMENTS - 3 ? 'hot' : i >= SEGMENTS - 6 ? 'warm' : undefined} />
          ))}
        </span>
        <span className={'con-vent'} />
        <Turbine />
      </div>
    </div>
  );
}

/**
 * Boot sequence: the first time playback starts, the monitor "powers on" — a scan line sweeps the screen behind a
 * green flash, and a progress bar fills. Glyphs only, no text. Shown once; never under reduced motion.
 */
export function ConsoleBoot() {
  const paused = usePlayer((s) => s.paused);
  const [state, setState] = useState<'idle' | 'booting' | 'done'>('idle');
  const timer = useRef(0);

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
    <div className={'con-boot'} aria-hidden="true">
      <span className={'con-boot-scan'} />
      <span className={'con-boot-bar'} />
    </div>
  );
}
