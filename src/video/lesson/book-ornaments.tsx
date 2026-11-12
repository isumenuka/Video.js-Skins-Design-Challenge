/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';

import { Fleuron } from '../icons';
import { useLesson } from './lesson-context';
import { formatTime } from './lesson-data';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** The gilt corner fleurons and the spine crease: pure decoration. */
export function BookOrnaments() {
  return (
    <>
      <div className="voca-spine" data-interactive aria-hidden="true">
        <span className="voca-headband" />
        <span className="voca-headband voca-headband-tail" />
      </div>
      <div className="voca-fleurons" aria-hidden="true">
        <Fleuron className="voca-fleuron" data-corner="tl" />
        <Fleuron className="voca-fleuron" data-corner="tr" />
        <Fleuron className="voca-fleuron" data-corner="bl" />
        <Fleuron className="voca-fleuron" data-corner="br" />
      </div>
    </>
  );
}

/** A–Z thumb-index tabs down the fore-edge; each lights in gold as playback passes its share of the film. */
export function ThumbIndex() {
  const currentTime = usePlayer((s) => s.currentTime) ?? 0;
  const duration = usePlayer((s) => s.duration) ?? 0;
  const reached = duration ? Math.min(LETTERS.length, Math.floor((currentTime / duration) * LETTERS.length) + 1) : 0;

  return (
    <div className="voca-thumb-index" data-interactive aria-hidden="true">
      {LETTERS.map((letter, index) => (
        <span key={letter} className="voca-thumb-tab" data-reached={index < reached || undefined}>
          {letter}
        </span>
      ))}
    </div>
  );
}

/** "Plate 7 · 02:14": the caption engraved under the video. */
export function PlateCaption() {
  const lab = useLesson();
  const cue = lab?.currentCue;
  return (
    <p className="voca-plate-caption" data-interactive aria-hidden="true">
      <span className="voca-plate-label">Plate {cue ? cue.id : 'I'}</span>
      <span className="voca-plate-sep">·</span>
      <span>{cue ? formatTime(cue.start) : 'Sintel, 2010'}</span>
    </p>
  );
}
