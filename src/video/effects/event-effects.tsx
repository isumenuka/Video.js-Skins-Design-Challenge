/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useState } from 'react';

import { useActiveEffect } from './effects-context';

/** How long each one-off effect stays mounted: a little longer than its animation. */
const EFFECT_MS = { skip: 1000, line: 900 } as const;
/** The skip corner folds shut over this long at the end of its time. */
const CLOSE_MS = 260;

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Book-themed feedback drawn over the plate, inside the (aria-hidden) indicator group: `StatusAnnouncer` already speaks
 * these events, so this layer is purely visual and never takes pointer input.
 *
 * - Skip, line: fired through the effects bus by the buttons that cause them. Play, pause and stop show nothing over
 *   the plate.
 * - Scrubbing: a large folio number on the plate; the tilt and riffle are CSS, keyed off the slider's `data-dragging`.
 */
export function EventEffects() {
  const currentTime = usePlayer((s) => s.currentTime) ?? 0;
  const effect = useActiveEffect();

  // Each effect unmounts once played, so the plate stays clear.
  // A skip corner folds shut on its own once the clicks stop, so a run of skips keeps it open.
  const [shown, setShown] = useState(effect);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    setShown(effect);
    setClosing(false);
    if (!effect || effect.kind === 'stop') return;
    const ms = EFFECT_MS[effect.kind];
    const close = setTimeout(() => setClosing(true), ms - CLOSE_MS);
    const remove = setTimeout(() => setShown(null), ms);
    return () => {
      clearTimeout(close);
      clearTimeout(remove);
    };
  }, [effect]);

  // Which way the reader is scrubbing: the plate leans that way while the ribbon is dragged.
  const [direction, setDirection] = useState<'back' | 'forward'>('forward');
  const previousTime = useRef(currentTime);
  useEffect(() => {
    const delta = currentTime - previousTime.current;
    previousTime.current = currentTime;
    if (Math.abs(delta) > 0.75) setDirection(delta > 0 ? 'forward' : 'back');
  }, [currentTime]);

  return (
    <div className="voca-fx" data-drag-direction={direction}>
      {/* While scrubbing: the folio the ribbon has turned to, printed large across the plate. */}
      <div className="voca-fx-folio">
        <span className="voca-fx-folio-page">p. {Math.floor(currentTime) + 1}</span>
        <span className="voca-fx-folio-time">{formatTime(currentTime)}</span>
      </div>

      {shown?.kind === 'skip' && (
        <span
          key={shown.id}
          className="voca-fx-corner"
          data-direction={shown.direction}
          data-closing={closing || undefined}
        >
          <span className="voca-fx-corner-leaf">
            <span key={shown.seconds} className="voca-fx-corner-value">
              {shown.direction === 'back' ? '−' : '+'}
              {shown.seconds}s
            </span>
          </span>
        </span>
      )}

      {shown?.kind === 'line' && (
        <span key={shown.id} className="voca-fx-leaf" data-direction={shown.direction}>
          <span className="voca-fx-leaf-label">{shown.direction === 'back' ? '‹ previous line' : 'next line ›'}</span>
        </span>
      )}
    </div>
  );
}
