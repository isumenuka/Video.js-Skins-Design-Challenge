/** @jsxImportSource react */

'use client';

import { useEffect, useRef, useState } from 'react';

import { vocapediaReviewUrl } from './folio-data';
import { Headword, Rubric } from './folio';
import type { LessonState } from './lesson-context';
import type { Gloss } from './lesson-data';

/*
 * A short review of the words collected while watching, with Vocapedia's own four answers: Again, Hard, Good, Easy.
 * Each word sits in a box (0 = new); answering moves it up or back, and the next review starts with the lowest boxes.
 * Boxes are kept in this browser; the full spaced-repetition queue lives on Vocapedia, linked at the end.
 */

const BOXES_KEY = 'vocapedia-lab:boxes';
const SESSION_SIZE = 10;

type Grade = 'again' | 'hard' | 'good' | 'easy';

const GRADES: Array<{ grade: Grade; label: string; xp: number }> = [
  { grade: 'again', label: 'Again', xp: 0 },
  { grade: 'hard', label: 'Hard', xp: 2 },
  { grade: 'good', label: 'Good', xp: 5 },
  { grade: 'easy', label: 'Easy', xp: 5 },
];

function readBoxes(): Record<string, number> {
  try {
    const saved = JSON.parse(localStorage.getItem(BOXES_KEY) ?? '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

function writeBoxes(boxes: Record<string, number>) {
  try {
    localStorage.setItem(BOXES_KEY, JSON.stringify(boxes));
  } catch {
    // Storage can be blocked; the session still works.
  }
}

/** The review page of the dictionary. Without `interactive` it's the printed copy a turning leaf carries. */
export function ReviewFace({ lab, interactive = false }: { lab: LessonState; interactive?: boolean }) {
  const { lesson, translation, pages, collected, heard, awardXp, setReviewOpen } = lab;
  const native = lesson.nativeLanguage.code.toLowerCase();
  const lang = translation.code.toLowerCase();

  // Every lesson word once, in the order the film first speaks it.
  const lessonWords: Gloss[] = [];
  for (const page of pages) for (const g of page.words) if (!lessonWords.includes(g)) lessonWords.push(g);

  // The session: words collected here (in any visit) or heard so far, lowest boxes first.
  const [queue, setQueue] = useState<string[]>(() => {
    const boxes = readBoxes();
    return lessonWords
      .filter((g) => collected.has(g.lemma) || heard.has(g.lemma))
      .sort((a, b) => (boxes[a.lemma] ?? 0) - (boxes[b.lemma] ?? 0))
      .slice(0, SESSION_SIZE)
      .map((g) => g.lemma);
  });
  const [total] = useState(queue.length);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(0);
  const [earned, setEarned] = useState(0);

  const current = lessonWords.find((g) => g.lemma === queue[0]);
  const line = current && pages.find((p) => p.words.includes(current))?.cue;

  // Keep the keyboard on the card: "Show answer" for a new card, "Good" once the answer shows.
  const showRef = useRef<HTMLButtonElement>(null);
  const goodRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!interactive) return;
    (revealed ? goodRef.current : showRef.current)?.focus();
  }, [interactive, queue[0], revealed]);

  const grade = (g: Grade) => {
    if (!current) return;
    const boxes = readBoxes();
    const box = boxes[current.lemma] ?? 0;
    boxes[current.lemma] = g === 'again' ? 0 : g === 'hard' ? Math.max(1, box) : g === 'good' ? box + 1 : box + 2;
    writeBoxes(boxes);
    const xp = GRADES.find((x) => x.grade === g)!.xp;
    awardXp(xp);
    setEarned((e) => e + xp);
    setQueue(([head, ...rest]) => {
      if (g === 'again') return [...rest.slice(0, 2), head, ...rest.slice(2)];
      if (g === 'hard') return [...rest, head];
      return rest;
    });
    if (g === 'good' || g === 'easy') setFinished((f) => f + 1);
    setRevealed(false);
  };

  const close = () => setReviewOpen(false);

  return (
    <>
      <header className="voca-running-head" aria-hidden="true">
        <span>Vocapedia</span>
        <span>Review · {lesson.nativeLanguage.code}–{translation.code}</span>
      </header>
      <div className="voca-just-heard">
        <nav className="voca-card-nav" aria-label={interactive ? 'Review' : undefined}>
          <span className="voca-letter-title">
            <span className="voca-letter-initial" aria-hidden="true">
              ✦
            </span>
            <span>{total ? `${Math.min(finished + 1, total)} / ${total}` : 'Review'}</span>
          </span>
          {interactive && (
            <button type="button" className="voca-card-live" onClick={close}>
              <span aria-hidden="true">✕</span> Close
            </button>
          )}
        </nav>
        <div className="voca-card-stage">
          <article className="voca-card voca-review">
            {!total ? (
              <p className="voca-review-empty">
                Nothing collected yet. Watch a scene, and every word worth learning is filed here for review.
              </p>
            ) : !current ? (
              <div className="voca-review-done">
                <p className="voca-finis-kicker">Review complete</p>
                <p className="voca-review-done-count">
                  {finished} {finished === 1 ? 'word' : 'words'} reviewed · <b>+{earned} XP</b>
                </p>
                {interactive && (
                  <a className="voca-review-link" href={vocapediaReviewUrl} target="_blank" rel="noreferrer">
                    Continue in your Vocapedia review ↗<span className="voca-sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className="voca-review-front">
                  <Headword gloss={current} lang={native} />
                  <span className="voca-card-pos">{current.pos}</span>
                  <span className="voca-card-ipa">{current.ipa}</span>
                </div>
                {line && (
                  <p className="voca-review-line" lang={native}>
                    “{line.native}”
                  </p>
                )}
                <div className="voca-review-answer" aria-live="polite">
                  {revealed && (
                    <>
                      <Rubric>Responsum</Rubric>
                      <p className="voca-review-translation" lang={lang}>
                        <abbr className="voca-entry-label" title={translation.name}>
                          {translation.code}.
                        </abbr>{' '}
                        <b>{lab.wordIn(current)}</b>
                      </p>
                      <p className="voca-word-def" lang={lang}>
                        {lab.defineIn(current)}
                      </p>
                      {line && (
                        <p className="voca-exempla-translation" lang={lang}>
                          {lab.lineIn(line)}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {interactive && (
                  <div className="voca-review-actions">
                    {!revealed ? (
                      <button ref={showRef} type="button" className="voca-review-show" onClick={() => setRevealed(true)}>
                        Show answer
                      </button>
                    ) : (
                      GRADES.map(({ grade: g, label, xp }) => (
                        <button
                          key={g}
                          ref={g === 'good' ? goodRef : undefined}
                          type="button"
                          className="voca-review-grade"
                          data-grade={g}
                          onClick={() => grade(g)}
                        >
                          {label}
                          {xp > 0 && <span className="voca-review-xp">+{xp}</span>}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
