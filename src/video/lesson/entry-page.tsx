/** @jsxImportSource react */

'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ChevronIcon, PlayIcon } from '../icons';
import { type LessonState, useLesson } from './lesson-context';
import { formatTime, type Gloss, letterOf } from './lesson-data';

/** What the dictionary page shows: a spoken line's page (-1 is the title page), or an A–Z letter section. */
type View = { kind: 'page'; index: number } | { kind: 'letter'; letter: string };

const viewKey = (view: View) => (view.kind === 'page' ? `p${view.index}` : `l${view.letter}`);

/** Opening a letter turns forward, closing it turns back; pages and letters each turn in reading order. */
function turnDirection(from: View, to: View): 'forward' | 'back' {
  if (from.kind === 'page' && to.kind === 'page') return to.index > from.index ? 'forward' : 'back';
  if (from.kind === 'letter' && to.kind === 'letter') return to.letter > from.letter ? 'forward' : 'back';
  return to.kind === 'letter' ? 'forward' : 'back';
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
  const view: View = openLetter ? { kind: 'letter', letter: openLetter } : { kind: 'page', index: shownIndex };
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
        {baseView.kind === 'letter' ? (
          <LetterFace lab={lab} letter={baseView.letter} interactive />
        ) : (
          <PageFace
            lab={lab}
            index={baseView.index}
            liveIndex={liveIndex}
            nav={nav}
            following={viewIndex === null && frozenIndex === null}
            held={held && viewIndex === null}
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
            {leafView.kind === 'letter' ? (
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
}: {
  lab: LessonState;
  index: number;
  liveIndex: number;
  nav?: Nav;
  following?: boolean;
  held?: boolean;
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
