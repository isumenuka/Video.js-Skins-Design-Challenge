/** @jsxImportSource react */

import { seekText } from '@videojs/core/i18n/text/slider';
import { positionText } from '@videojs/core/i18n/text/time';
import { labelText as volumeLabelText, mutedValueText } from '@videojs/core/i18n/text/volume';
import { useTranslator } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { type PointerEvent, type ReactNode, useEffect, useRef } from 'react';

const DEAD_ZONE = 0.14; // deflection below this does nothing while held
const THROW_PX = 44; // pointer travel for a full tilt
const TICK_MS = 50;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** "1:05" or "1:02:05", the way the time display writes it. */
function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

interface StickProps {
  axis: 'x' | 'y';
  className: string;
  label: string;
  min: number;
  max: number;
  now: number;
  valueText: string;
  disabled?: boolean;
  /** Handle a key; return the direction it pushed (for the stick's flick), or 0 if the key isn't the stick's. */
  onKey: (key: string) => number;
  /** Called every tick while the stick is held past the dead zone, with its deflection (-1…1) and the elapsed seconds. */
  onHold: (deflection: number, dt: number) => void;
  /** A press and release without moving: nudge one step towards the side that was pressed. */
  onTap: (direction: 1 | -1) => void;
  onHoldStart?: () => void;
  children?: ReactNode;
}

/**
 * An arcade joystick that is a real control: an ARIA slider that keyboard, mouse and touch can all drive.
 *
 * - Keys step the value (and flick the stick); they are handled by a native listener and stopped there, so the
 *   player's own arrow-key hotkeys don't act twice while the stick has focus.
 * - Holding and pushing it repeats the action at a speed set by how far it is pushed; letting go springs it back.
 * - A tap nudges one step towards the side that was pressed.
 */
function Stick({ axis, className, label, min, max, now, valueText, disabled, onKey, onHold, onTap, onHoldStart, children }: StickProps) {
  const el = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onKey, onHold, onTap, onHoldStart, disabled });
  handlers.current = { onKey, onHold, onTap, onHoldStart, disabled };
  const hold = useRef<{ id: number; deflection: number; moved: boolean; x: number; y: number; last: number; timer: number } | null>(null);
  const flickTimer = useRef(0);

  const tilt = (value: number) => el.current?.style.setProperty('--arc-tilt', value.toFixed(3));
  const flick = (direction: number) => {
    tilt(direction * 0.7);
    clearTimeout(flickTimer.current);
    flickTimer.current = window.setTimeout(() => tilt(0), 140);
  };

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (handlers.current.disabled) return;
      const direction = handlers.current.onKey(event.key);
      if (!direction) return;
      event.preventDefault();
      event.stopPropagation();
      flick(direction);
    };
    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      clearTimeout(flickTimer.current);
      if (hold.current) clearInterval(hold.current.timer);
    };
  }, []);

  const deflectionOf = (event: PointerEvent<HTMLDivElement>) => {
    const start = hold.current!;
    const offset = axis === 'x' ? event.clientX - start.x : start.y - event.clientY;
    return { offset, deflection: clamp(offset / THROW_PX, -1, 1) };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    const timer = window.setInterval(() => {
      const h = hold.current;
      if (!h) return;
      const t = performance.now();
      const dt = (t - h.last) / 1000;
      h.last = t;
      if (Math.abs(h.deflection) > DEAD_ZONE) handlers.current.onHold(h.deflection, dt);
    }, TICK_MS);
    hold.current = { id: event.pointerId, deflection: 0, moved: false, x: event.clientX, y: event.clientY, last: performance.now(), timer };
    el.current?.setAttribute('data-held', '');
    handlers.current.onHoldStart?.();
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const h = hold.current;
    if (!h || h.id !== event.pointerId) return;
    const { offset, deflection } = deflectionOf(event);
    if (Math.abs(offset) > 6) h.moved = true;
    h.deflection = deflection;
    tilt(deflection);
  };

  const release = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const h = hold.current;
    if (!h || h.id !== event.pointerId) return;
    clearInterval(h.timer);
    hold.current = null;
    el.current?.removeAttribute('data-held');
    tilt(0);
    if (cancelled || h.moved) return;
    // A tap: nudge towards the side of the stick that was pressed.
    const rect = event.currentTarget.getBoundingClientRect();
    const direction = axis === 'x'
      ? (event.clientX < rect.left + rect.width / 2 ? -1 : 1)
      : (event.clientY < rect.top + rect.height / 2 ? 1 : -1);
    handlers.current.onTap(direction);
    flick(direction);
  };

  return (
    <div
      ref={el}
      className={`arc-stick arc-stick-${axis} ${className}`}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-orientation={axis === 'x' ? 'horizontal' : 'vertical'}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={now}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => release(e)}
      onPointerCancel={(e) => release(e, true)}
    >
      <span className={'arc-stick-plate'} aria-hidden="true" />
      <span className={'arc-stick-lever'} aria-hidden="true" />
      {children}
    </div>
  );
}

/**
 * Left stick: seeking. ←/→ (and ↑/↓) skip 5 s, Page Up/Down 30 s, Home/End jump to the start or end. Held over to one
 * side it scrubs, faster the further it's pushed (a full push crosses the whole film in about 20 s).
 */
export function SeekStick() {
  const store = usePlayer();
  const currentTime = usePlayer((s) => s.currentTime) ?? 0;
  const duration = usePlayer((s) => s.duration) ?? 0;
  const t = useTranslator();
  const latest = useRef({ currentTime, duration, target: currentTime });
  latest.current.currentTime = currentTime;
  latest.current.duration = duration;

  const seekTo = (time: number) => {
    const d = latest.current.duration;
    if (!d) return;
    latest.current.target = clamp(time, 0, d);
    void store.seek(latest.current.target);
  };
  const nudge = (delta: number) => seekTo(latest.current.currentTime + delta);

  const steps: Record<string, number> = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: 30, PageDown: -30 };

  return (
    <Stick
      axis="x"
      className={'arc-stick-seek'}
      label={t(seekText)}
      min={0}
      max={Math.round(duration)}
      now={Math.round(currentTime)}
      valueText={t(positionText, { current: clock(currentTime), duration: clock(duration) })}
      disabled={!duration}
      onKey={(key) => {
        if (key === 'Home') return seekTo(0), -1;
        if (key === 'End') return seekTo(latest.current.duration), 1;
        const step = steps[key];
        if (!step) return 0;
        nudge(step);
        return Math.sign(step);
      }}
      onHoldStart={() => (latest.current.target = latest.current.currentTime)}
      onHold={(d, dt) => {
        const speed = Math.max(10, latest.current.duration / 20); // seconds of film per second at full push
        seekTo(latest.current.target + Math.sign(d) * d * d * speed * dt);
      }}
      onTap={(direction) => nudge(direction * 5)}
    />
  );
}

const LEVELS = 10;

/**
 * Right stick: volume. ↑/→ and ↓/← change it by 5 %, Page Up/Down by 10 %, Home/End to silent or full. Held up or
 * down it keeps turning the volume up or down. A ten-step LED meter beside it shows the level (and goes dark when
 * muted), so the value is never shown by the stick alone.
 */
export function VolumeStick() {
  const store = usePlayer();
  const volume = usePlayer((s) => s.volume) ?? 1;
  const muted = usePlayer((s) => s.muted) ?? false;
  const availability = usePlayer((s) => s.volumeAvailability);
  const t = useTranslator();
  const latest = useRef({ volume, muted, target: volume });
  latest.current.volume = volume;
  latest.current.muted = muted;

  const setLevel = (value: number) => {
    const next = clamp(value, 0, 1);
    latest.current.target = next;
    if (latest.current.muted && next > 0) store.setMuted(false);
    store.setVolume(next);
  };

  const pct = Math.round(volume * 100);
  const lit = muted ? 0 : Math.round(volume * LEVELS);
  const steps: Record<string, number> = { ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05, PageUp: 0.1, PageDown: -0.1 };

  if (availability === 'unsupported') return null;

  return (
    <Stick
      axis="y"
      className={'arc-stick-volume'}
      label={t(volumeLabelText)}
      min={0}
      max={100}
      now={muted ? 0 : pct}
      valueText={muted ? t(mutedValueText, { percent: `${pct}%` }) : `${pct}%`}
      disabled={availability !== 'available'}
      onKey={(key) => {
        if (key === 'Home') return setLevel(0), -1;
        if (key === 'End') return setLevel(1), 1;
        const step = steps[key];
        if (!step) return 0;
        setLevel(latest.current.volume + step);
        return Math.sign(step);
      }}
      onHoldStart={() => (latest.current.target = latest.current.volume)}
      onHold={(d, dt) => setLevel(latest.current.target + d * 0.8 * dt)}
      onTap={(direction) => setLevel(latest.current.volume + direction * 0.05)}
    >
      <span className={'arc-meter'} aria-hidden="true" data-muted={muted ? '' : undefined}>
        {Array.from({ length: LEVELS }, (_, i) => (
          <i key={i} data-lit={i < lit ? '' : undefined} />
        ))}
      </span>
    </Stick>
  );
}
