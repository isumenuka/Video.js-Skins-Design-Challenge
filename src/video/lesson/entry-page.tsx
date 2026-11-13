/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ChevronIcon, PlayIcon } from '../icons';
import { passportUrl } from './folio-data';
import { Exempla, WordEntry } from './folio';
import { type LessonState, useLesson } from './lesson-context';
import { formatTime, type Gloss, letterOf } from './lesson-data';
import { ReviewFace } from './review';

/**
 * What the dictionary page shows: a spoken line's page (-1 is the title page), an A–Z letter section, the "How to
 * read this volume" guide, the review of collected words, or the Finis passport page when the film ends.
 */
type View =
  | { kind: 'page'; index: number }
  | { kind: 'letter'; letter: string }
  | { kind: 'guide' }
  | { kind: 'review' }
  | { kind: 'finis' };

const viewKey = (view: View) =>
  view.kind === 'page' ? `p${view.index}` : view.kind === 'letter' ? `l${view.letter}` : view.kind;

/** Opening a letter, the guide, the review or the colophon turns forward, closing turns back; pages turn in order. */
function turnDirection(from: View, to: View): 'forward' | 'back' {
  if (from.kind === 'page' && to.kind === 'page') return to.index > from.index ? 'forward' : 'back';
  if (from.kind === 'letter' && to.kind === 'letter') return to.letter > from.letter ? 'forward' : 'back';
  return to.kind === 'page' ? 'back' : 'forward';
}

interface Turn {
  /** The view being turned away from, and the one being turned to. */
  from: View;
  to: View;
  /** Forward lifts the right page over the spine; back brings the previous leaf over from the left. */
  dir: 'forward' | 'back';
  key: number;
}

/**
 * The right page of the open volume: the dictionary, set like a Vocapedia article. One page per spoken line, with the
 * line as its example and an entry for every special word in it, so it turns once per line instead of once per word.
 * It holds still while the pointer or keyboard focus is on it, and its ‹ › buttons page back through earlier lines.
 *
 * Every change of page is a real page turn: a copy of the leaf swings up to the spine while the next page waits
 * beneath it. Under reduced motion the page simply changes.
 */
export function EntryPage() {
  const lab = useLesson();
  const sectionRef = useRef<HTMLElement>(null);

  // Browsing (‹ ›) and holding both stop the page following playback.
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [pointerIn, setPointerIn] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const [frozenIndex, setFrozenIndex] = useState<number | null>(null);
  const held = pointerIn || focusIn;
  const liveIndex = lab?.livePage?.index ?? -1;

  useEffect(() => {
    setFrozenIndex(held ? liveIndex : null);
    // Only the moment the hold starts or ends matters; the live page moving on is what the hold is for.
  }, [held]);

  // Choosing a word (from the A–Z tabs) returns the page to live, where that word's line is about to play.
  useEffect(() => {
    if (lab?.focusLemma) {
      setViewIndex(null);
      setFrozenIndex(null);
    }
  }, [lab?.focusLemma]);

  const shownIndex = viewIndex ?? (frozenIndex ?? liveIndex);
  const openLetter = lab?.openLetter ?? null;
  const reviewOpen = lab?.reviewOpen ?? false;
  const ended = usePlayer((s) => s.ended) ?? false;

  // The guide opens from the ⓘ button or the ? key anywhere in the player; Escape closes the guide or the review.
  const [guideOpen, setGuideOpen] = useState(false);
  const guideRef = useRef(guideOpen);
  guideRef.current = guideOpen;
  const reviewRef = useRef({ open: reviewOpen, close: () => lab?.setReviewOpen(false) });
  reviewRef.current = { open: reviewOpen, close: () => lab?.setReviewOpen(false) };
  useEffect(() => {
    const skin = sectionRef.current?.closest<HTMLElement>('.media-skin');
    if (!skin) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setGuideOpen((open) => !open);
      } else if (event.key === 'Escape' && reviewRef.current.open) {
        reviewRef.current.close();
      } else if (event.key === 'Escape' && guideRef.current) {
        setGuideOpen(false);
      }
    };
    skin.addEventListener('keydown', onKeyDown);
    return () => skin.removeEventListener('keydown', onKeyDown);
  }, []);

  const view: View = reviewOpen
    ? { kind: 'review' }
    : guideOpen
      ? { kind: 'guide' }
      : ended
        ? { kind: 'finis' }
        : openLetter
          ? { kind: 'letter', letter: openLetter }
          : { kind: 'page', index: shownIndex };
  const key = viewKey(view);

  // Start a turn whenever the view changes. A layout effect, so the leaf covers the page in the same frame the new
  // content arrives and the reader never sees it swap.
  const [turn, setTurn] = useState<Turn | null>(null);
  const previousView = useRef(view);
  useLayoutEffect(() => {
    const from = previousView.current;
    previousView.current = view;
    if (viewKey(from) === key) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setTurn({ from, to: view, dir: turnDirection(from, view), key: performance.now() });
  }, [key]);

  if (!lab) return null;

  // Turning back, the old page stays visible beneath until the incoming leaf lands on it.
  const baseView = turn?.dir === 'back' ? turn.from : view;
  const leafView = turn ? (turn.dir === 'forward' ? turn.from : turn.to) : undefined;
  const isLive = shownIndex === liveIndex;

  const nav = {
    canBack: shownIndex > 0,
    canForward: !isLive,
    browsing: viewIndex !== null,
    goBack: () => setViewIndex(Math.max(0, shownIndex - 1)),
    goForward: () => setViewIndex(shownIndex + 1 >= liveIndex ? null : shownIndex + 1),
    goLive: () => setViewIndex(null),
  };

  const face = (v: View, interactive: boolean) =>
    v.kind === 'review' ? (
      <ReviewFace lab={lab} interactive={interactive} />
    ) : v.kind === 'guide' ? (
      <GuideFace lab={lab} onClose={interactive ? () => setGuideOpen(false) : undefined} />
    ) : v.kind === 'finis' ? (
      <FinisFace lab={lab} interactive={interactive} />
    ) : v.kind === 'letter' ? (
      <LetterFace lab={lab} letter={v.letter} interactive={interactive} />
    ) : interactive ? (
      <PageFace
        lab={lab}
        index={v.index}
        liveIndex={liveIndex}
        nav={nav}
        following={viewIndex === null && frozenIndex === null}
        held={held && viewIndex === null}
        onGuide={() => setGuideOpen(true)}
      />
    ) : (
      <PageFace lab={lab} index={v.index} liveIndex={liveIndex} />
    );

  return (
    <section
      ref={sectionRef}
      className="voca-entry"
      data-interactive
      data-turning={turn?.dir}
      aria-label="Dictionary"
      onPointerEnter={(event) => event.pointerType === 'mouse' && setPointerIn(true)}
      onPointerLeave={() => setPointerIn(false)}
      onFocus={() => setFocusIn(true)}
      onBlur={(event) => {
        if (!sectionRef.current?.contains(event.relatedTarget as Node)) setFocusIn(false);
      }}
    >
      <div className="voca-page">{face(baseView, true)}</div>

      {turn && leafView && (
        <div
          className="voca-leaf"
          data-dir={turn.dir}
          key={turn.key}
          aria-hidden="true"
          inert
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) setTurn(null);
          }}
        >
          <div className="voca-page voca-leaf-front">{face(leafView, false)}</div>
          <div className="voca-leaf-back" />
        </div>
      )}
    </section>
  );
}

interface Nav {
  canBack: boolean;
  canForward: boolean;
  browsing: boolean;
  goBack: () => void;
  goForward: () => void;
  goLive: () => void;
}

function RunningHead({ lab, title = 'Dictionary' }: { lab: LessonState; title?: string }) {
  return (
    <header className="voca-running-head" aria-hidden="true">
      <span>Vocapedia</span>
      <span>
        {title} · {lab.lesson.nativeLanguage.code}–{lab.translation.code}
      </span>
    </header>
  );
}

/**
 * One side of the dictionary leaf. With `nav` it's the live, interactive page; without it, it's the printed copy the
 * turning leaf carries, with the same layout and no controls.
 */
function PageFace({
  lab,
  index,
  liveIndex,
  nav,
  following = false,
  held = false,
  onGuide,
}: {
  lab: LessonState;
  index: number;
  liveIndex: number;
  nav?: Nav;
  following?: boolean;
  held?: boolean;
  onGuide?: () => void;
}) {
  const { occurrences, pages, currentTime, focusLemma } = lab;
  const page = index >= 0 ? pages[index] : undefined;
  const isLive = index === liveIndex;
  const interactive = Boolean(nav);

  return (
    <>
      <RunningHead lab={lab} />

      <div className="voca-just-heard" data-held={held || undefined}>
        {page ? (
          <>
            <nav className="voca-card-nav" aria-label={nav ? 'Pages of words heard' : undefined}>
              {nav ? (
                <button
                  type="button"
                  className="voca-card-turn"
                  aria-label="Previous line"
                  disabled={!nav.canBack}
                  onClick={nav.goBack}
                >
                  <ChevronIcon className="voca-card-turn-icon voca-card-turn-back" />
                </button>
              ) : (
                <span className="voca-card-turn" />
              )}
              <span className="voca-card-count">
                {index + 1} / {Math.max(liveIndex + 1, 1)}
              </span>
              {nav ? (
                <button
                  type="button"
                  className="voca-card-turn"
                  aria-label="Next line"
                  disabled={!nav.canForward}
                  onClick={nav.goForward}
                >
                  <ChevronIcon className="voca-card-turn-icon" />
                </button>
              ) : (
                <span className="voca-card-turn" />
              )}
              {nav?.browsing && (
                <button type="button" className="voca-card-live" onClick={nav.goLive}>
                  <span aria-hidden="true">●</span> Back to live
                </button>
              )}
              {onGuide && <GuideButton onClick={onGuide} />}
            </nav>

            {/* A short spoken summary while the page follows playback; the full article is there to read. */}
            {interactive && (
              <p className="voca-sr-only" aria-live={following ? 'polite' : 'off'}>
                {isLive ? 'Just heard: ' : ''}
                {page.words.map((g) => `${g.term}, ${lab.wordIn(g)}`).join('; ')}
              </p>
            )}

            <div className="voca-card-stage">
              <article className="voca-card voca-folio">
                <p className="voca-card-kicker">
                  <span>{isLive ? 'Just heard' : 'Earlier'}</span>
                  <span className="voca-card-time">
                    § {page.cue.id} · {formatTime(page.cue.start)}
                  </span>
                </p>
                <Exempla lab={lab} cue={page.cue} interactive={interactive} />
                {page.words.map((gloss, i) => (
                  <WordEntry
                    key={gloss.lemma}
                    lab={lab}
                    gloss={gloss}
                    reached={!isLive || page.wordTimes[i] <= currentTime}
                    focus={interactive && gloss.lemma === focusLemma}
                    interactive={interactive}
                  />
                ))}
              </article>
            </div>
          </>
        ) : (
          <article className="voca-card voca-title-page">
            <p className="voca-title-kicker">An entry in moving pictures</p>
            <h2 className="voca-title-name">Sintel</h2>
            <p className="voca-title-note">
              Words are written here as Sintel speaks — the first at {formatTime(occurrences[0]?.time ?? 0)}.
            </p>
          </article>
        )}
      </div>
    </>
  );
}

/**
 * An A–Z section of the dictionary: every word under one letter in one place, opened from the thumb tabs. Each entry
 * can replay the line where it's spoken; words not heard yet are shown lighter.
 */
function LetterFace({ lab, letter, interactive = false }: { lab: LessonState; letter: string; interactive?: boolean }) {
  const { pages, heard, focusLemma, playWord, setOpenLetter } = lab;

  // Each word under this letter, once, with the line it's first spoken in.
  const entries: Array<{ gloss: Gloss; start: number }> = [];
  for (const page of pages) {
    for (const gloss of page.words) {
      if (letterOf(gloss) === letter && !entries.some((e) => e.gloss === gloss)) {
        entries.push({ gloss, start: page.cue.start });
      }
    }
  }
  entries.sort((a, b) => a.gloss.lemma.localeCompare(b.gloss.lemma));
  const count = entries.length === 1 ? '1 word' : `${entries.length} words`;

  return (
    <>
      <RunningHead lab={lab} />

      <div className="voca-just-heard">
        <nav className="voca-card-nav" aria-label={interactive ? `Section ${letter}` : undefined}>
          <span className="voca-letter-title">
            <span className="voca-letter-initial" aria-hidden="true">
              {letter}
            </span>
            <span>{count}</span>
          </span>
          {interactive && (
            <button type="button" className="voca-card-live" onClick={() => setOpenLetter(null)}>
              <span aria-hidden="true">✕</span> Close {letter}
            </button>
          )}
        </nav>

        <div className="voca-card-stage">
          <article className="voca-card voca-folio">
            <h2 className="voca-sr-only">Words under {letter}</h2>
            {entries.map(({ gloss, start }) => (
              <div key={gloss.lemma} className="voca-letter-entry" data-unheard={!heard.has(gloss.lemma) || undefined}>
                <WordEntry
                  lab={lab}
                  gloss={gloss}
                  compact
                  interactive={interactive}
                  focus={interactive && gloss.lemma === focusLemma}
                  action={
                    interactive ? (
                      <button
                        type="button"
                        className="voca-letter-play"
                        aria-label={`Play the line with “${gloss.lemma}” at ${formatTime(start)}`}
                        onClick={() => playWord(gloss.lemma)}
                      >
                        <PlayIcon className="voca-letter-play-icon" />
                        {formatTime(start)}
                      </button>
                    ) : (
                      <span className="voca-letter-play">{formatTime(start)}</span>
                    )
                  }
                />
              </div>
            ))}
          </article>
        </div>
      </div>
    </>
  );
}

/** The ⓘ that opens "How to read this volume". */
function GuideButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="voca-guide-button" onClick={onClick} aria-label="How to read this volume (?)">
      <span aria-hidden="true">i</span>
    </button>
  );
}

const GUIDE_KEYS: Array<[string, string]> = [
  ['Space · K', 'Play or pause'],
  ['← · →', 'Back or forward 10 seconds'],
  ['↑ · ↓', 'Volume'],
  ['M', 'Mute'],
  ['F', 'Full page'],
  ['?', 'This guide'],
  ['Esc', 'Close a menu, the review or this page'],
];

const GUIDE_PARTS: Array<[string, string]> = [
  ['The ribbon', 'drag the brass clip to turn to any moment; each tab is a spoken line.'],
  ['A–Z tabs', 'a tab pulls out, with rising embers, when a new word is spoken; press one to read every word under it.'],
  ['The quill', 'study modes (pause, repeat, slow), and a review of the words you have collected.'],
  ['XP', 'ten points for every new word you catch, more for every word you review.'],
  ['The inkwell', 'its ink is the volume; press it to cork the sound.'],
  ['The compass', 'settings: translation language, speed and quality.'],
  ['Double-tap', 'the left or right of the picture to go back or forward.'],
];

/** "How to read this volume": the keys, the gestures, and what each object on the desk does. */
function GuideFace({ lab, onClose }: { lab: LessonState; onClose?: () => void }) {
  return (
    <>
      <RunningHead lab={lab} />
      <div className="voca-just-heard">
        <nav className="voca-card-nav" aria-label={onClose ? 'How to read this volume' : undefined}>
          <span className="voca-letter-title">
            <span className="voca-letter-initial" aria-hidden="true">
              ?
            </span>
            <span>How to read this volume</span>
          </span>
          {onClose && (
            <button type="button" className="voca-card-live" onClick={onClose}>
              <span aria-hidden="true">✕</span> Close
            </button>
          )}
        </nav>
        <div className="voca-card-stage">
          <article className="voca-card voca-guide">
            <h2 className="voca-guide-heading">Keys</h2>
            <dl className="voca-guide-keys">
              {GUIDE_KEYS.map(([keys, what]) => (
                <div key={keys} className="voca-guide-row">
                  <dt>
                    {keys.split(' · ').map((k, i) => (
                      <kbd key={i}>{k}</kbd>
                    ))}
                  </dt>
                  <dd>{what}</dd>
                </div>
              ))}
            </dl>
            <h2 className="voca-guide-heading">On the desk</h2>
            <dl className="voca-guide-parts">
              {GUIDE_PARTS.map(([part, what]) => (
                <div key={part} className="voca-guide-row">
                  <dt>{part}</dt>
                  <dd>{what}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
      </div>
    </>
  );
}

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** The passport stamp, inked in rubric: the film, the language pair, and today's date. */
function PassportStamp({ lab }: { lab: LessonState }) {
  const now = new Date();
  const date = `${now.getDate()} · ${ROMAN_MONTHS[now.getMonth()]} · ${now.getFullYear()}`;
  const pair = `${lab.lesson.nativeLanguage.code} → ${lab.translation.code}`;
  return (
    <svg className="voca-stamp" viewBox="0 0 220 112" role="img" aria-label={`Stamped: Sintel, ${pair}, ${date}`}>
      <defs>
        {/* Uneven ink: a little noise eats into the stamp, as real ink does. */}
        <filter id="voca-stamp-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" result="mask" />
          <feComposite in="SourceGraphic" in2="mask" operator="in" result="inked" />
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" seed="3" result="warp" />
          <feDisplacementMap in="inked" in2="warp" scale="2.5" />
        </filter>
      </defs>
      <g filter="url(#voca-stamp-ink)" fill="none" stroke="currentColor">
        <rect x="4" y="4" width="212" height="104" rx="10" strokeWidth="3" />
        <rect x="11" y="11" width="198" height="90" rx="6" strokeWidth="1.2" />
        <g fill="currentColor" stroke="none" fontFamily="'Source Serif 4', Georgia, serif" textAnchor="middle">
          <text x="110" y="31" fontSize="9" fontWeight="700" letterSpacing="2">
            VOCAPEDIA · PHRASE PASSPORT
          </text>
          <text x="110" y="64" fontSize="28" fontWeight="700" letterSpacing="6">
            SINTEL
          </text>
          <text x="110" y="88" fontSize="11" fontWeight="600" letterSpacing="2">
            {pair} · {date}
          </text>
        </g>
      </g>
    </svg>
  );
}

/** The colophon when the film ends, as a Phrase passport page: the stamp, the words collected, and what next. */
function FinisFace({ lab, interactive = false }: { lab: LessonState; interactive?: boolean }) {
  const { heard, collected, pages, translation, seekTo, lesson, xp, setReviewOpen } = lab;
  const lemmas = new Set(pages.flatMap((p) => p.words.map((w) => w.lemma)));
  const total = lemmas.size;
  const gathered = [...lemmas].filter((l) => heard.has(l) || collected.has(l)).length;
  return (
    <>
      <RunningHead lab={lab} title="Phrase passport" />
      <div className="voca-just-heard">
        <article className="voca-card voca-finis">
          <p className="voca-finis-kicker">Here the volume closes</p>
          <h2 className="voca-finis-title">Finis</h2>
          <PassportStamp lab={lab} />
          <p className="voca-finis-count">
            You collected <b>{gathered}</b> of {total} words · <span className="voca-finis-xp">✦ {xp} XP</span>
          </p>
          <p className="voca-finis-note">
            Read in {lesson.nativeLanguage.name}, with notes in{' '}
            <span lang={translation.code.toLowerCase()}>{translation.name}</span>.
          </p>
          {interactive && (
            <div className="voca-finis-actions">
              <button type="button" className="voca-finis-again" onClick={() => setReviewOpen(true)}>
                ✦ Review {gathered} {gathered === 1 ? 'word' : 'words'}
              </button>
              <button type="button" className="voca-finis-secondary" onClick={() => seekTo(0)}>
                ↺ Read again
              </button>
              <a className="voca-finis-secondary" href={passportUrl(translation.code)} target="_blank" rel="noreferrer">
                Open your phrase passport ↗<span className="voca-sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
