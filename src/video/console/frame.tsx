/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useState } from 'react';

const VOLUME_SEGMENTS = 12;
const PROGRESS_SEGMENTS = 24;

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

function Segments({ count, lit, className, zones = false }: { count: number; lit: number; className: string; zones?: boolean }) {
  return (
    <span className={className}>
      {Array.from({ length: count }, (_, i) => (
        <i
          key={i}
          data-lit={i < lit ? '' : undefined}
          data-zone={zones ? (i >= count - 2 ? 'hot' : i >= count - 4 ? 'warm' : undefined) : undefined}
        />
      ))}
    </span>
  );
}

/** The bridge unit under the screen: an LED cartridge that fills with playback progress, plus a small volume meter. */
function Bridge() {
  const currentTime = usePlayer((s) => s.currentTime) ?? 0;
  const duration = usePlayer((s) => s.duration) ?? 0;
  const volume = usePlayer((s) => s.volume) ?? 1;
  const muted = usePlayer((s) => s.muted) ?? false;
  const progress = duration > 0 ? Math.ceil((currentTime / duration) * PROGRESS_SEGMENTS) : 0;

  return (
    <span className={'con-bridge'}>
      <i className={'con-bridge-lamp'} />
      <Segments className={'con-cartridge'} count={PROGRESS_SEGMENTS} lit={progress} />
      <Segments className={'con-meter'} count={VOLUME_SEGMENTS} lit={muted ? 0 : Math.round(volume * VOLUME_SEGMENTS)} zones />
      <i className={'con-bridge-lamp'} />
    </span>
  );
}

/** One side armour plate: a recessed slot with stacked green cells. */
function SidePlate({ side }: { side: 'start' | 'end' }) {
  return (
    <span className={`con-side con-side-${side}`}>
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

/**
 * The machine around the screen: armour body, top housing with two "+" lamps, side plates, bezel, corner blocks,
 * neon conduits, and the bridge unit between screen and deck. Entirely decorative (`aria-hidden`);
 * every control lives in the deck.
 */
export function ConsoleFrame() {
  const paused = usePlayer((s) => s.paused);

  return (
    <div className={'con-frame'} data-playing={paused ? undefined : ''} aria-hidden="true">
      <div className={'con-body'} />

      <div className={'con-housing'}>
        <span className={'con-lamp'} />
        <span className={'con-housing-vent'} />
        <span className={'con-lamp'} />
      </div>

      <SidePlate side="start" />
      <SidePlate side="end" />

      <div className={'con-bezel'}>
        <span className={'con-bezel-strip'} />
        <span className={'con-corner con-corner-tl'} />
        <span className={'con-corner con-corner-tr'} />
        <span className={'con-corner con-corner-bl'} />
        <span className={'con-corner con-corner-br'} />
        <span className={'con-status'}>
          <i className={'con-status-led con-status-power'} />
          <i className={'con-status-led con-status-signal'} />
          <i className={'con-status-led con-status-alert'} />
        </span>
      </div>

      <div className={'con-hinge'}>
        <Turbine />
        <span className={'con-vent'} />
        <Bridge />
        <span className={'con-vent'} />
        <Turbine />
      </div>

      {/* Neon: a current that orbits the bezel, and conduits along the armour with pulses running through them. */}
      <svg className={'con-orbit'} aria-hidden="true" focusable="false">
        <rect className={'con-orbit-track'} x="0" y="0" width="100%" height="100%" pathLength="100" />
        <rect className={'con-orbit-spark'} x="0" y="0" width="100%" height="100%" pathLength="100" />
      </svg>
      <span className={'con-conduit con-conduit-top'} />
      <span className={'con-conduit con-conduit-start'} />
      <span className={'con-conduit con-conduit-end'} />
    </div>
  );
}

/**
 * Boot sequence: the first time playback starts, the monitor "powers on" — a scan line sweeps the screen behind a
 * green flash, and a progress bar fills. Glyphs only, no text. Shown once; never under reduced motion.
 */
export function ConsoleBoot() {
  const paused = usePlayer((s) => s.paused);
  const ended = usePlayer((s) => s.ended);
  const [state, setState] = useState<'idle' | 'booting' | 'done'>('idle');
  const timer = useRef(0);

  // When the film ends the monitor powers off, so the next play boots it again.
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
    <div className={'con-boot'} aria-hidden="true">
      <span className={'con-boot-scan'} />
      <span className={'con-boot-bar'} />
    </div>
  );
}

/**
 * CRT power-off: when the film ends, the picture collapses to a glowing line, then a dot, and the screen goes dark
 * while the replay key waits. Glyphs only. Under reduced motion it goes straight to the dark screen.
 */
export function ConsoleCrt() {
  const ended = usePlayer((s) => s.ended);
  if (!ended) return null;
  return (
    <div className={'con-crt'} aria-hidden="true">
      <span className={'con-crt-line'} />
    </div>
  );
}
