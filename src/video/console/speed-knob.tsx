/** @jsxImportSource react */

import { speedText } from '@videojs/core/i18n/text/menu';
import { useTranslator } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { type CSSProperties, type PointerEvent, useEffect, useRef } from 'react';

const STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const SWEEP = 270; // degrees from the lowest to the highest step
const DRAG_STEP_PX = 18;

const nearest = (rate: number) =>
  STEPS.reduce((best, step, i) => (Math.abs(step - rate) < Math.abs(STEPS[best]! - rate) ? i : best), 0);

/**
 * Playback speed as a click-stop rotary knob on the deck.
 *
 * It is an ARIA slider: arrows, Page Up/Down, Home and End step through the rates; a click advances one stop (and
 * wraps); dragging up or down turns it. Its name is Video.js's own "Speed" string, so it is translated with the rest of
 * the player, and the value is announced as "1.5×". Key presses don't reach the player's arrow-key hotkeys while the
 * knob has focus. Speed is also still in the settings menu.
 */
export function SpeedKnob() {
  const store = usePlayer();
  const rate = usePlayer((s) => s.playbackRate) ?? 1;
  const availability = usePlayer((s) => s.playbackRateAvailability);
  const t = useTranslator();
  const drag = useRef<{ y: number; index: number; moved: boolean } | null>(null);
  const knob = useRef<HTMLDivElement>(null);
  const index = nearest(rate);
  const setIndex = (i: number) => store.setPlaybackRate(STEPS[Math.min(STEPS.length - 1, Math.max(0, i))]!);

  // A native listener, so the key is handled (and stopped) before the player's own hotkeys see it bubble up.
  const latest = useRef({ index, setIndex });
  latest.current = { index, setIndex };
  useEffect(() => {
    const el = knob.current;
    if (!el) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const { index: i, setIndex: set } = latest.current;
      const keys: Record<string, number> = {
        ArrowUp: i + 1,
        ArrowRight: i + 1,
        PageUp: i + 1,
        ArrowDown: i - 1,
        ArrowLeft: i - 1,
        PageDown: i - 1,
        Home: 0,
        End: STEPS.length - 1,
      };
      const next = keys[event.key];
      if (next === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      set(next);
    };
    el.addEventListener('keydown', onKeyDown);
    return () => el.removeEventListener('keydown', onKeyDown);
  }, [availability]);

  if (availability === 'unsupported') return null;

  const angle = -SWEEP / 2 + (index * SWEEP) / (STEPS.length - 1);
  const valueText = `${rate}×`;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { y: event.clientY, index, moved: false };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const steps = Math.round((drag.current.y - event.clientY) / DRAG_STEP_PX);
    if (steps !== 0) drag.current.moved = true;
    if (drag.current.moved) setIndex(drag.current.index + steps);
  };

  const onPointerUp = () => {
    if (drag.current && !drag.current.moved) setIndex((index + 1) % STEPS.length);
    drag.current = null;
  };

  return (
    <div className={'con-speed'} data-availability={availability}>
      <div
        className={'con-knob'}
        role="slider"
        tabIndex={availability === 'available' ? 0 : -1}
        aria-label={t(speedText.key, { default: speedText.text })}
        aria-valuemin={STEPS[0]}
        aria-valuemax={STEPS[STEPS.length - 1]}
        aria-valuenow={rate}
        aria-valuetext={valueText}
        aria-disabled={availability !== 'available' || undefined}
        ref={knob}
        style={{ '--con-knob-angle': `${angle}deg` } as CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        <span className={'con-knob-cap'} aria-hidden="true" />
      </div>
      <span className={'con-knob-readout'} aria-hidden="true">
        {rate.toFixed(2)}
      </span>
    </div>
  );
}
