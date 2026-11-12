/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import { ExternalIcon, ListenIcon, StarIcon } from '../icons';
import { useLesson } from './lesson-context';
import { type Cue, type Gloss, glossFor, tokenize, vocapediaUrl } from './lesson-data';

const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function speak(text: string, lang: string) {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

/**
 * The language-lab caption layer: the spoken line, its translation, and a gloss for each word worth learning.
 * Glossed words are buttons. Hovering or focusing one previews its translation; pressing it pauses the video and
 * pins the gloss open with a link to the word's Vocapedia article and a button to save it. Escape closes it.
 */
export function DualSubtitles() {
  const lab = useLesson();
  const [lastCue, setLastCue] = useState<Cue | undefined>();
  const rootRef = useRef<HTMLDivElement>(null);

  // Track the control bar's height, which changes as its rows wrap, so the lines always sit just above it.
  useEffect(() => {
    const skin = rootRef.current?.closest<HTMLElement>('.media-skin');
    const bar = skin?.querySelector<HTMLElement>('.video-controls-bottom');
    if (!skin || !bar || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => skin.style.setProperty('--voca-bar-height', `${bar.offsetHeight}px`));
    observer.observe(bar);
    return () => observer.disconnect();
  }, [lab !== null]);

  // Keep the last line mounted while it fades, so it never vanishes mid-read.
  useEffect(() => {
    if (lab?.activeCue) setLastCue(lab.activeCue);
  }, [lab?.activeCue]);

  if (!lab) return null;
  const { activeCue, mode, subtitlesOn, lesson } = lab;
  const cue = activeCue ?? lastCue;
  const visible = Boolean(activeCue) && subtitlesOn;

  return (
    <div ref={rootRef} className="voca-subtitles" data-visible={visible || undefined} data-mode={mode} aria-hidden={!visible}>
      {cue && (
        <div className="voca-subtitles-inner" key={cue.id}>
          {mode !== 'translation' && (
            <p className="voca-subtitles-native" lang={lesson.nativeLanguage.code.toLowerCase()}>
              <Line cue={cue} interactive={visible} />
              {canSpeak() && (
                <button
                  type="button"
                  className="voca-listen"
                  aria-label={`Listen to “${cue.native}”`}
                  tabIndex={visible ? 0 : -1}
                  onClick={() => speak(cue.native, 'en-US')}
                >
                  <ListenIcon className="voca-listen-icon" />
                </button>
              )}
            </p>
          )}
          {mode !== 'native' && (
            <p className="voca-subtitles-translation" lang={lesson.translationLanguage.code.toLowerCase()}>
              {cue.translation}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Line({ cue, interactive }: { cue: Cue; interactive: boolean }) {
  const lab = useLesson()!;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // A new line closes any open gloss.
  useEffect(() => setOpenIndex(null), [cue.id]);

  return (
    <span className="voca-line">
      {tokenize(cue.native).map((token, index) => {
        if (!token.word) return <span key={index}>{token.text}</span>;
        const gloss = glossFor(lab.lesson, token.text);
        if (!gloss) return <span key={index}>{token.text}</span>;
        return (
          <GlossedWord
            key={index}
            text={token.text}
            gloss={gloss}
            interactive={interactive}
            pinned={openIndex === index}
            anotherPinned={openIndex !== null && openIndex !== index}
            onPinnedChange={(pinned) => setOpenIndex(pinned ? index : null)}
          />
        );
      })}
    </span>
  );
}

function GlossedWord({
  text,
  gloss,
  interactive,
  pinned,
  anotherPinned,
  onPinnedChange,
}: {
  text: string;
  gloss: Gloss;
  interactive: boolean;
  pinned: boolean;
  /** While another word's gloss is pinned open, hovering this one doesn't stack a second popover over it. */
  anotherPinned: boolean;
  onPinnedChange: (pinned: boolean) => void;
}) {
  const lab = useLesson()!;
  const store = usePlayer();
  const id = useId();
  const wordRef = useRef<HTMLButtonElement>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [previewing, setPreviewing] = useState(false);
  const saved = lab.saved.has(gloss.term);
  const open = pinned || (previewing && !anotherPinned);

  // Split trailing punctuation off, so only the word itself is underlined.
  const match = /^(.*?[\p{L}'’]+)([^\p{L}'’]*)$/u.exec(text);
  const word = match ? match[1] : text;
  const trail = match ? match[2] : '';

  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) onPinnedChange(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [onPinnedChange, pinned]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      // Keep Escape from also leaving fullscreen or reaching the player's hotkeys.
      event.stopPropagation();
      event.preventDefault();
      setPreviewing(false);
      onPinnedChange(false);
      wordRef.current?.focus();
    }
  };

  return (
    <span
      ref={wrapRef}
      className="voca-word-wrap"
      onPointerEnter={() => setPreviewing(true)}
      onPointerLeave={() => setPreviewing(false)}
      onKeyDown={onKeyDown}
    >
      <button
        ref={wordRef}
        type="button"
        className="voca-word"
        data-saved={saved || undefined}
        aria-expanded={pinned}
        aria-describedby={open ? id : undefined}
        tabIndex={interactive ? 0 : -1}
        onFocus={() => setPreviewing(true)}
        onBlur={(event) => {
          if (!wrapRef.current?.contains(event.relatedTarget as Node)) setPreviewing(false);
        }}
        onClick={() => {
          if (!pinned) store.pause();
          onPinnedChange(!pinned);
        }}
      >
        {word}
      </button>
      {trail}
      <span
        id={id}
        role="tooltip"
        className="voca-gloss"
        data-open={open || undefined}
        data-pinned={pinned || undefined}
        hidden={!open}
      >
        <span className="voca-gloss-term">
          <b>{gloss.term}</b>
          <span className="voca-gloss-pos"> {gloss.pos}</span>
          <span className="voca-gloss-dot" aria-hidden="true">
            {' '}
            •{' '}
          </span>
          <span className="voca-gloss-translation" lang="fr">
            {gloss.translation}
          </span>
        </span>
        {pinned && (
          <span className="voca-gloss-actions">
            <a
              className="voca-gloss-action"
              href={vocapediaUrl(gloss, lab.lesson.nativeLanguage.code)}
              target="_blank"
              rel="noreferrer"
            >
              Vocapedia
              <ExternalIcon className="voca-gloss-action-icon" />
              <span className="voca-sr-only"> (opens in a new tab)</span>
            </a>
            <button
              type="button"
              className="voca-gloss-action"
              aria-pressed={saved}
              onClick={() => lab.toggleSaved(gloss)}
            >
              <StarIcon className="voca-gloss-action-icon voca-star" filled={saved} />
              {saved ? 'Saved' : 'Save'}
            </button>
          </span>
        )}
      </span>
    </span>
  );
}
