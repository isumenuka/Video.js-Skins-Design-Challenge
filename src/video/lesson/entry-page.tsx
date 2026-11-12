/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ChevronIcon, PlayIcon } from '../icons';
import { type LessonState, useLesson } from './lesson-context';
import { formatTime, type Gloss, letterOf } from './lesson-data';

/**
 * What the dictionary page shows: a spoken line's page (-1 is the title page), an A–Z letter section, the "How to
 * read this volume" guide, or the Finis colophon when the film ends.
 */
type View =
  | { kind: 'page'; index: number }
  | { kind: 'letter'; letter: string }
  | { kind: 'guide' }
  | { kind: 'finis' };

const viewKey = (view: View) =>
  view.kind === 'page' ? `p${view.index}` : view.kind === 'letter' ? `l${view.letter}` : view.kind;

/** Opening a letter, the guide or the colophon turns forward, closing turns back; pages turn in reading order. */
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
 * The right page of the open volume: the dictionary. One page per spoken line, listing every special word in it, so
 * it turns once per line instead of once per word. It holds still while the pointer or keyboard focus is on it, and
 * its ‹ › buttons page back through earlier lines.
 *
 * Every change of page is a real page turn: a copy of the leaf swings over the spine (showing its paper back halfway
 * round) while the next page waits beneath it. Under reduced motion the page simply changes.
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
  const ended = usePlayer((s) => s.ended) ?? false;

  // The guide opens from the ⓘ button or the ? key anywhere in the player, and closes the same way.
  const [guideOpen, setGuideOpen] = useState(false);
  useEffect(() => {
    const skin = sectionRef.current?.closest<HTMLElement>('.media-skin');
    if (!skin) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, [contenteditable="true"]')) return;
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setGuideOpen((open) => !open);
      } else if (event.key === 'Escape' && guideRef.current) {
        setGuideOpen(false);
      }
    };
    skin.addEventListener('keydown', onKeyDown);
    return () => skin.removeEventListener('keydown', onKeyDown);
  }, []);
  const guideRef = useRef(guideOpen);
  guideRef.current = guideOpen;

  const view: View = guideOpen
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
      <div className="voca-page">
        {baseView.kind === 'guide' ? (
          <GuideFace lab={lab} onClose={() => setGuideOpen(false)} />
        ) : baseView.kind === 'finis' ? (
          <FinisFace lab={lab} interactive />
        ) : baseView.kind === 'letter' ? (
          <LetterFace lab={lab} letter={baseView.letter} interactive />
        ) : (
          <PageFace
            lab={lab}
            index={baseView.index}
            liveIndex={liveIndex}
            nav={nav}
            following={viewIndex === null && frozenIndex === null}
            held={held && viewIndex === null}
            onGuide={() => setGuideOpen(true)}
          />
        )}
      </div>

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
          <div className="voca-page voca-leaf-front">
            {leafView.kind === 'guide' ? (
              <GuideFace lab={lab} />
            ) : leafView.kind === 'finis' ? (
              <FinisFace lab={lab} />
            ) : leafView.kind === 'letter' ? (
              <LetterFace lab={lab} letter={leafView.letter} />
            ) : (
              <PageFace lab={lab} index={leafView.index} liveIndex={liveIndex} />
            )}
          </div>
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
  const { lesson, occurrences, pages, currentTime, focusLemma } = lab;
  const native = lesson.nativeLanguage;
  const translation = lab.translation;
  const page = index >= 0 ? pages[index] : undefined;
  const isLive = index === liveIndex;

  return (
    <>
      <header className="voca-running-head" aria-hidden="true">
        <span>Vocapedia</span>
        <span>
          Dictionary · {native.code}–{translation.code}
        </span>
      </header>

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

            {/* Announced only while the page follows playback. */}
            <div aria-live={nav && following ? 'polite' : 'off'} aria-atomic="true" className="voca-card-stage">
              <article className="voca-card">
                <p className="voca-card-kicker">
                  <span>{isLive ? 'Just heard' : 'Earlier'}</span>
                  <span className="voca-card-time">
                    § {page.cue.id} · {formatTime(page.cue.start)}
                  </span>
                </p>
                <p className="voca-card-quote" lang={native.code.toLowerCase()}>
                  “{page.cue.native}”
                </p>
                <dl className="voca-card-words">
                  {page.words.map((gloss, i) => (
                    <div
                      key={gloss.lemma}
                      className="voca-card-word"
                      data-reached={(isLive && page.wordTimes[i] <= currentTime) || !isLive || undefined}
                      data-focus={(nav && gloss.lemma === focusLemma) || undefined}
                    >
                      <dt>
                        <b lang={native.code.toLowerCase()}>{gloss.term}</b>{' '}
                        <span className="voca-card-pos">{gloss.pos}</span>{' '}
                        <span className="voca-card-ipa">{gloss.ipa}</span>
                      </dt>
                      <dd>
                        <span lang={translation.code.toLowerCase()}>{lab.defineIn(gloss)}</span>{' '}
                        <span className="voca-card-fr">
                          <abbr className="voca-entry-label" title={translation.name}>
                            {translation.code}.
                          </abbr>{' '}
                          <i lang={translation.code.toLowerCase()}>{lab.wordIn(gloss)}</i>
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            </div>
            {held && (
              <span className="voca-held-ribbon" aria-hidden="true">
                Held
              </span>
            )}
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
  const { lesson, pages, heard, focusLemma, playWord, setOpenLetter } = lab;
  const native = lesson.nativeLanguage;
  const translation = lab.translation;

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
      <header className="voca-running-head" aria-hidden="true">
        <span>Vocapedia</span>
        <span>
          Dictionary · {native.code}–{translation.code}
        </span>
      </header>

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
          <article className="voca-card">
            <h2 className="voca-sr-only">Words under {letter}</h2>
            <dl className="voca-card-words">
              {entries.map(({ gloss, start }) => (
                <div
                  key={gloss.lemma}
                  className="voca-card-word voca-letter-word"
                  data-reached={heard.has(gloss.lemma) || undefined}
                  data-unheard={!heard.has(gloss.lemma) || undefined}
                  data-focus={(interactive && gloss.lemma === focusLemma) || undefined}
                >
                  <dt>
                    <b lang={native.code.toLowerCase()}>{gloss.term}</b>{' '}
                    <span className="voca-card-pos">{gloss.pos}</span>{' '}
                    <span className="voca-card-ipa">{gloss.ipa}</span>
                  </dt>
                  <dd>
                    <span lang={translation.code.toLowerCase()}>{lab.defineIn(gloss)}</span>{' '}
                    <span className="voca-card-fr">
                      <abbr className="voca-entry-label" title={translation.name}>
                        {translation.code}.
                      </abbr>{' '}
                      <i lang={translation.code.toLowerCase()}>{lab.wordIn(gloss)}</i>
                    </span>
                  </dd>
                  {interactive ? (
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
                  )}
                </div>
              ))}
            </dl>
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
  ['Esc', 'Close a menu or this page'],
];

const GUIDE_PARTS: Array<[string, string]> = [
  ['The ribbon', 'drag the brass clip to turn to any moment; each tab is a spoken line.'],
  ['A–Z tabs', 'a tab pulls out when its word is spoken; press one to read every word under that letter.'],
  ['The quill', 'study modes: pause after new words, repeat each line, slow lines down.'],
  ['The inkwell', 'its ink is the volume; press it to cork the sound.'],
  ['The compass', 'settings: translation language, speed and quality.'],
  ['Double-tap', 'the left or right of the picture to go back or forward.'],
];

/** "How to read this volume": the keys, the gestures, and what each object on the desk does. */
function GuideFace({ lab, onClose }: { lab: LessonState; onClose?: () => void }) {
  const { lesson, translation } = lab;
  return (
    <>
      <header className="voca-running-head" aria-hidden="true">
        <span>Vocapedia</span>
        <span>
          Dictionary · {lesson.nativeLanguage.code}–{translation.code}
        </span>
      </header>
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

/** The colophon when the film ends: Finis, the words collected, and a way to read it again. */
function FinisFace({ lab, interactive = false }: { lab: LessonState; interactive?: boolean }) {
  const { heard, pages, translation, seekTo, lesson } = lab;
  const total = new Set(pages.flatMap((p) => p.words.map((w) => w.lemma))).size;
  return (
    <>
      <header className="voca-running-head" aria-hidden="true">
        <span>Vocapedia</span>
        <span>
          Dictionary · {lesson.nativeLanguage.code}–{translation.code}
        </span>
      </header>
      <div className="voca-just-heard">
        <article className="voca-card voca-finis">
          <p className="voca-finis-kicker">Here the volume closes</p>
          <h2 className="voca-finis-title">Finis</h2>
          <svg className="voca-finis-seal" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <path
              d="M32 4c4 3 7 1 10 3s3 6 6 8 6 1 7 5-1 6 1 9 4 4 3 8-5 4-6 7 0 7-3 9-6 0-9 2-4 5-8 5-5-3-9-3-6 3-9 1-2-6-5-8-6-1-7-5 1-6-1-9-4-4-3-8 5-4 6-7 0-7 3-9 6 0 9-2 4-5 8-5Z"
              fill="url(#voca-finis-gilt)"
            />
            <defs>
              <radialGradient id="voca-finis-gilt" cx="0.35" cy="0.3" r="0.8">
                <stop offset="0" stopColor="#f6e3a1" />
                <stop offset="0.55" stopColor="#d3a446" />
                <stop offset="1" stopColor="#8a6418" />
              </radialGradient>
            </defs>
            <circle cx="32" cy="32" r="17" fill="none" stroke="#7a5a16" strokeWidth="1.2" strokeDasharray="0.5 3" strokeLinecap="round" />
            <path d="M23 22 32 43l9-21" fill="none" stroke="#5f430f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="voca-finis-count">
            You collected <b>{heard.size}</b> of {total} words
          </p>
          <p className="voca-finis-note">
            Read in {lesson.nativeLanguage.name}, with notes in <span lang={translation.code.toLowerCase()}>{translation.name}</span>.
          </p>
          {interactive && (
            <button type="button" className="voca-finis-again" onClick={() => seekTo(0)}>
              ↺ Read again
            </button>
          )}
        </article>
      </div>
    </>
  );
}
