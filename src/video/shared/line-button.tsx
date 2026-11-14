/** @jsxImportSource react */

import { useCallback, useEffect, useRef } from 'react';

import { LineMarkIcon } from '@/video/desk-icons';
import { type EffectDirection, useFireEffect } from '@/video/effects/effects-context';
import { type LessonState, useLesson } from '@/video/lesson/lesson-context';

import { Button } from './button';
import { ButtonTooltip } from './tooltip';

/** Within this many seconds of a line's start, "previous" goes to the line before; later, it restarts this line. */
const RESTART_GRACE = 1.5;

function targetTime(lab: LessonState, direction: EffectDirection): number | undefined {
  const { cues } = lab.lesson;
  const t = lab.currentTime;
  if (direction === 'forward') return cues.find((cue) => cue.start > t + 0.05)?.start;
  let index = -1;
  for (let i = 0; i < cues.length; i++) if (cues[i].start <= t + 0.05) index = i;
  if (index < 0) return undefined;
  if (t - cues[index].start > RESTART_GRACE) return cues[index].start;
  return index > 0 ? cues[index - 1].start : undefined;
}

/** Turns to a spoken line, keeping play or pause as it was, and sweeps a leaf across the plate. */
function useLineJump() {
  const lab = useLesson();
  const fire = useFireEffect();
  return useCallback(
    (direction: EffectDirection) => {
      if (!lab) return false;
      const time = targetTime(lab, direction);
      if (time === undefined) return false;
      lab.seekTo(time, !lab.paused);
      fire({ kind: 'line', direction });
      return true;
    },
    [fire, lab],
  );
}

function LineButton({ direction }: { direction: EffectDirection }) {
  const lab = useLesson();
  const jump = useLineJump();
  if (!lab) return null;
  const label = direction === 'back' ? 'Previous line' : 'Next line';
  const disabled = targetTime(lab, direction) === undefined;
  return (
    <ButtonTooltip label={`${label} (Shift + ${direction === 'back' ? '←' : '→'})`}>
      <Button
        className="voca-desk-button voca-line-button"
        aria-label={label}
        aria-keyshortcuts={direction === 'back' ? 'Shift+ArrowLeft' : 'Shift+ArrowRight'}
        aria-disabled={disabled || undefined}
        data-direction={direction}
        onClick={() => {
          if (!disabled) jump(direction);
        }}
      >
        <LineMarkIcon className="voca-desk-icon" direction={direction} />
      </Button>
    </ButtonTooltip>
  );
}

export function PreviousLineButton() {
  return <LineButton direction="back" />;
}

export function NextLineButton() {
  return (
    <>
      <LineButton direction="forward" />
      <LineHotkeys />
    </>
  );
}

/**
 * Shift + ← / → turn to the previous or next line. Listened for on the player, in the capture phase so the plain
 * arrow-key seek doesn't also run; ignored in fields, menus and sliders, which use the arrows themselves.
 */
function LineHotkeys() {
  const anchor = useRef<HTMLSpanElement>(null);
  const jump = useLineJump();
  const jumpRef = useRef(jump);
  jumpRef.current = jump;
  useEffect(() => {
    const skin = anchor.current?.closest<HTMLElement>('.media-skin');
    if (!skin) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, [contenteditable="true"], [role="slider"], [role^="menu"], [role="toolbar"]',
        )
      )
        return;
      const rtl = getComputedStyle(skin).direction === 'rtl';
      const forward = (event.key === 'ArrowRight') !== rtl;
      event.preventDefault();
      event.stopPropagation();
      jumpRef.current(forward ? 'forward' : 'back');
    };
    skin.addEventListener('keydown', onKeyDown, true);
    return () => skin.removeEventListener('keydown', onKeyDown, true);
  }, []);
  return <span ref={anchor} hidden />;
}
