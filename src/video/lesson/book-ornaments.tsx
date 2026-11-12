/** @jsxImportSource react */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Fleuron } from '../icons';
import { ContraLogo, MuxLogo, VideoJsLogo } from '../partner-logos';
import { useLesson } from './lesson-context';
import { formatTime, letterOf, type Occurrence } from './lesson-data';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * The binding, all decoration: marbled endpaper around the pages, the spine crease with its headbands, brass corner
 * guards, gilt fleurons, and the leather title label on the top edge.
 */
export function BookOrnaments() {
  // The cover swings open once, when the volume first appears; under reduced motion the book is simply open.
  const [coverClosed, setCoverClosed] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  return (
    <>
      <div className="voca-endpaper" aria-hidden="true" />
      {coverClosed && (
        <div
          className="voca-cover-flap"
          aria-hidden="true"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setCoverClosed(false);
          }}
        >
          <div className="voca-cover-flap-face">
            <span className="voca-cover-flap-rule" />
            <span className="voca-cover-flap-mark">❦</span>
            <span className="voca-cover-flap-title">Vocapedia</span>
            <span className="voca-cover-flap-sub">A Dictionary in Moving Pictures</span>
            <span className="voca-cover-flap-mark">❦</span>
          </div>
        </div>
      )}
      <div className="voca-spine" data-interactive aria-hidden="true">
        <span className="voca-headband" />
        <span className="voca-headband voca-headband-tail" />
      </div>
      <div className="voca-fleurons" aria-hidden="true">
        <Fleuron className="voca-fleuron" data-corner="tl" />
        <Fleuron className="voca-fleuron" data-corner="tr" />
        <Fleuron className="voca-fleuron" data-corner="bl" />
        <Fleuron className="voca-fleuron" data-corner="br" />
        <span className="voca-corner" data-corner="tl" />
        <span className="voca-corner" data-corner="tr" />
        <span className="voca-corner" data-corner="bl" />
        <span className="voca-corner" data-corner="br" />
      </div>
      <div className="voca-title-label" aria-hidden="true">
        <span className="voca-title-label-name">
          <span className="voca-title-label-mark">❦</span>
          Vocapedia
          <span className="voca-title-label-mark">❦</span>
        </span>
        <span className="voca-title-label-logos">
          <VideoJsLogo className="voca-partner voca-partner-vjs" />
          <span className="voca-title-label-dot">·</span>
          <MuxLogo className="voca-partner voca-partner-mux" />
          <span className="voca-title-label-dot">·</span>
          <ContraLogo className="voca-partner voca-partner-contra" />
        </span>
      </div>
    </>
  );
}

/**
 * The A–Z thumb index down the fore-edge. When a special word is spoken, its letter's tab slides out like a pulled
 * drawer with the word written on it. Tabs for words already heard stay gilt; letters the film never uses are dimmed.
 * Pressing a tab opens that letter's section on the dictionary page, every word under the letter in one place;
 * pressing it again closes it.
 *
 * It's one Tab stop (a toolbar with a roving tabindex): the arrow keys move between letters. Their listener is
 * native and prevents the default, so the player's arrow-key seek hotkeys, which listen on the container, stay out.
 */
export function ThumbIndex() {
  const lab = useLesson();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const [focusIndex, setFocusIndex] = useState(0);

  // The first occurrence of each letter, and every word filed under it.
  const byLetter = useMemo(() => {
    const map = new Map<string, { first: Occurrence; words: string[] }>();
    for (const occurrence of lab?.occurrences ?? []) {
      const letter = letterOf(occurrence.gloss);
      const entry = map.get(letter);
      if (!entry) map.set(letter, { first: occurrence, words: [occurrence.gloss.lemma] });
      else if (!entry.words.includes(occurrence.gloss.lemma)) entry.words.push(occurrence.gloss.lemma);
    }
    return map;
  }, [lab?.occurrences]);

  const usable = LETTERS.map((letter) => byLetter.has(letter));

  // Start the roving stop on the first letter that has words.
  useEffect(() => {
    const first = usable.indexOf(true);
    if (first >= 0) setFocusIndex((index) => (usable[index] ? index : first));
  }, [byLetter]);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const step = ({ ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 } as Record<string, number>)[event.key];
      const edge = event.key === 'Home' ? 'first' : event.key === 'End' ? 'last' : undefined;
      if (!step && !edge) return;
      event.preventDefault();
      const current = buttons.current.findIndex((b) => b === document.activeElement);
      let next = current < 0 ? 0 : current;
      if (edge === 'first') next = usable.indexOf(true);
      else if (edge === 'last') next = usable.lastIndexOf(true);
      else {
        do next = (next + step! + LETTERS.length) % LETTERS.length;
        while (!usable[next] && next !== current);
      }
      setFocusIndex(next);
      buttons.current[next]?.focus();
    };
    toolbar.addEventListener('keydown', onKeyDown);
    return () => toolbar.removeEventListener('keydown', onKeyDown);
  }, [byLetter]);

  if (!lab) return null;
  const { heard, popped, openLetter, setOpenLetter } = lab;
  const poppedLetter = popped ? letterOf(popped.gloss) : undefined;

  const open = (letter: string) => {
    if (!byLetter.has(letter)) return;
    setOpenLetter(openLetter === letter ? null : letter);
  };

  return (
    <div
      ref={toolbarRef}
      className="voca-thumb-index"
      role="toolbar"
      aria-orientation="vertical"
      aria-label="A to Z word index"
      data-interactive
    >
      {LETTERS.map((letter, index) => {
        const entry = byLetter.get(letter);
        const wasHeard = entry?.words.some((w) => heard.has(w)) ?? false;
        const isPopped = letter === poppedLetter;
        return (
          <button
            key={letter}
            ref={(el) => {
              buttons.current[index] = el;
            }}
            type="button"
            className="voca-thumb-tab"
            tabIndex={index === focusIndex ? 0 : -1}
            aria-disabled={!entry || undefined}
            aria-pressed={entry ? openLetter === letter : undefined}
            aria-label={
              entry
                ? `${letter}: ${entry.words.join(', ')}. Show the ${letter} words`
                : `${letter}: no words in this film`
            }
            data-heard={wasHeard || undefined}
            data-popped={isPopped || undefined}
            onFocus={() => setFocusIndex(index)}
            onClick={() => open(letter)}
          >
            <span className="voca-thumb-letter" aria-hidden="true">
              {letter}
            </span>
            {isPopped && (
              <span className="voca-thumb-word" key={popped!.index} aria-hidden="true">
                {popped!.gloss.lemma}
              </span>
            )}
          </button>
        );
      })}
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
