/** @jsxImportSource react */

'use client';

import { useEffect, useMemo, useRef } from 'react';

import { useLesson } from './lesson-context';
import { type Gloss, formatTime, letterOf } from './lesson-data';

/** The id of a glossary letter section, so the A–Z tabs can open the page at it. */
export const glossaryLetterId = (letter: string) => `voca-glossary-${letter}`;

/**
 * The left page of the open volume: the viewer's own dictionary. At the top, the word just heard as a full entry,
 * turning over like a page for each new word. Below, an A–Z glossary that writes itself in as the film speaks; it's
 * derived from the playback time, so seeking back un-writes the words not yet heard.
 */
export function EntryPage() {
  const lab = useLesson();
  const listRef = useRef<HTMLDivElement>(null);

  // Every special word in the lesson, filed under its letter.
  const sections = useMemo(() => {
    if (!lab) return [];
    const byLetter = new Map<string, Gloss[]>();
    for (const { gloss } of lab.occurrences) {
      const letter = letterOf(gloss);
      const list = byLetter.get(letter) ?? [];
      if (!list.includes(gloss)) list.push(gloss);
      byLetter.set(letter, list);
    }
    return [...byLetter.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, words]) => ({ letter, words: words.sort((a, b) => a.lemma.localeCompare(b.lemma)) }));
  }, [lab?.occurrences]);

  const newest = lab?.popped?.gloss.lemma;

  // Bring the word being written into view inside the glossary, without scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    const row = newest ? list?.querySelector<HTMLElement>(`[data-lemma="${CSS.escape(newest)}"]`) : null;
    if (!list || !row) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = row.offsetTop - list.offsetTop - list.clientHeight / 2 + row.clientHeight / 2;
    list.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }, [newest]);

  if (!lab) return null;
  const { lesson, latest, heard, occurrences } = lab;
  const native = lesson.nativeLanguage;
  const translation = lesson.translationLanguage;
  const quote = latest ? lesson.cues.find((c) => c.id === latest.cueId)?.native : undefined;

  return (
    <section className="voca-entry" data-interactive aria-label="Your glossary">
      <header className="voca-running-head" aria-hidden="true">
        <span>Vocapedia</span>
        <span>
          Glossary · {native.code}–{translation.code}
        </span>
      </header>

      <div className="voca-just-heard" aria-live="polite" aria-atomic="true">
        {latest ? (
          <article className="voca-entry-leaf voca-card" key={latest.index}>
            <p className="voca-card-kicker">
              <span>Just heard</span>
              <span className="voca-card-time">{formatTime(latest.time)}</span>
            </p>
            <h2 className="voca-card-headword">
              <span lang={native.code.toLowerCase()}>{latest.gloss.term}</span>{' '}
              <span className="voca-card-pos">{latest.gloss.pos}</span>
            </h2>
            <p className="voca-card-ipa">{latest.gloss.ipa}</p>
            <p className="voca-card-definition">{latest.gloss.definition}</p>
            <p className="voca-card-translation">
              <abbr className="voca-entry-label" title={translation.name}>
                {translation.code}.
              </abbr>{' '}
              <i lang={translation.code.toLowerCase()}>{latest.gloss.translation}</i>
            </p>
            {quote && (
              <p className="voca-card-quote" lang={native.code.toLowerCase()}>
                “{quote}”
              </p>
            )}
          </article>
        ) : (
          <article className="voca-entry-leaf voca-card voca-title-page" key="title">
            <p className="voca-title-kicker">An entry in moving pictures</p>
            <h2 className="voca-title-name">Sintel</h2>
            <p className="voca-title-note">
              Words are written here as Sintel speaks — the first at {formatTime(occurrences[0]?.time ?? 0)}.
            </p>
          </article>
        )}
      </div>

      <p className="voca-glossary-count" aria-hidden="true">
        ❦ <span>{heard.size}</span> of {sections.reduce((n, s) => n + s.words.length, 0)} words collected ❦
      </p>

      <div className="voca-glossary" ref={listRef}>
        {sections.map(({ letter, words }) => {
          const collected = words.filter((w) => heard.has(w.lemma));
          return (
            <div
              key={letter}
              id={glossaryLetterId(letter)}
              className="voca-glossary-section"
              data-empty={collected.length === 0 || undefined}
            >
              <h3 className="voca-glossary-letter" aria-hidden={collected.length === 0}>
                {letter}
              </h3>
              {collected.length > 0 && (
                <dl className="voca-glossary-words">
                  {collected.map((gloss) => (
                    <div
                      key={gloss.lemma}
                      className="voca-glossary-row"
                      data-lemma={gloss.lemma}
                      data-new={gloss.lemma === newest || undefined}
                    >
                      <dt>
                        <b lang={native.code.toLowerCase()} title={gloss.pos}>
                          {gloss.lemma}
                        </b>
                      </dt>
                      <span className="voca-leader" aria-hidden="true" />
                      <dd lang={translation.code.toLowerCase()}>{gloss.translation}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
