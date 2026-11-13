/** @jsxImportSource react */

'use client';

import type { ReactNode } from 'react';

import { PlayIcon } from '../icons';
import { falseFriendFor, folioFor } from './folio-data';
import { folioLabels, posName } from './folio-i18n';
import type { LessonState } from './lesson-context';
import { type Cue, formatTime, type Gloss, letterOf } from './lesson-data';

/*
 * A word set as a Vocapedia article, in the site's folio style: an illuminated initial, the definition in the
 * reader's language, and — behind "More about this word" — a hairline infobox, the word's origin, a false friend to
 * watch for, and related words. Section titles are plain words in the reader's language.
 */

/** A rubric section title between hairline rules: "—— ORIGIN ——". */
export function Rubric({ children }: { children: ReactNode }) {
  return (
    <p className="voca-rubric-label" aria-hidden="true">
      <span>{children}</span>
    </p>
  );
}

/** The headword with its first letter illuminated in rubric on a gilt-ruled square, as in the site's drop caps. */
export function Headword({ gloss, lang }: { gloss: Gloss; lang: string }) {
  const term = gloss.term;
  // "to travel" illuminates the T of "to"; that's how the headword is filed in the glossary too.
  return (
    <span className="voca-headword" lang={lang}>
      <span className="voca-initial" aria-hidden="true">
        {term.charAt(0)}
      </span>
      <span aria-hidden="true">{term.slice(1)}</span>
      {/* Read as one word, not as an initial and the rest. */}
      <span className="voca-sr-only">{term}</span>
    </span>
  );
}

function Difficulty({ level, label }: { level: number; label: string }) {
  return (
    <span className="voca-dots" role="img" aria-label={`${label}: ${level} / 3`}>
      {[1, 2, 3].map((n) => (
        <span key={n} className="voca-dot" data-on={n <= level || undefined} />
      ))}
    </span>
  );
}

/** The site's hairline infobox: part of speech, register and difficulty, labelled in the reader's language. */
export function Infobox({ lab, gloss }: { lab: LessonState; gloss: Gloss }) {
  const facts = folioFor(gloss.lemma);
  const labels = folioLabels(lab.translation.code);
  const lang = lab.translation.code.toLowerCase();
  return (
    <dl className="voca-infobox" lang={lang}>
      <div>
        <dt>{labels.partOfSpeech}</dt>
        <dd>{posName(gloss.pos, lab.translation.code)}</dd>
      </div>
      {facts && (
        <div>
          <dt>{labels.register}</dt>
          <dd>{labels.registers[facts.register]}</dd>
        </div>
      )}
      {facts && (
        <div>
          <dt>{labels.difficulty}</dt>
          <dd>
            <Difficulty level={facts.difficulty} label={labels.difficulty} />
          </dd>
        </div>
      )}
    </dl>
  );
}

/** Origin: the word's descent in dictionary notation, "← OFr dragon ← Lat dracō ← Gk drákōn". */
export function Origo({ lab, gloss }: { lab: LessonState; gloss: Gloss }) {
  const facts = folioFor(gloss.lemma);
  if (!facts) return null;
  const labels = folioLabels(lab.translation.code);
  return (
    <>
      <Rubric>{labels.origin}</Rubric>
      <p className="voca-origo">
        {facts.origin.map(([from, form], i) =>
          from ? (
            <span key={i} className="voca-origo-step">
              <span aria-hidden="true">← </span>
              <abbr title={labels.origins[from]} lang={lab.translation.code.toLowerCase()}>
                {from}
              </abbr>{' '}
              <i>{form}</i>{' '}
            </span>
          ) : (
            <span key={i} className="voca-origo-step">
              {form}{' '}
            </span>
          )
        )}
      </p>
    </>
  );
}

/** False friend: a look-alike in the reader's language, in one line: "lame ≠ English lame (= boiteux·se)". */
export function FalsiAmici({ lab, gloss }: { lab: LessonState; gloss: Gloss }) {
  const friend = falseFriendFor(gloss.lemma, lab.translation.code);
  if (!friend) return null;
  const labels = folioLabels(lab.translation.code);
  const lang = lab.translation.code.toLowerCase();
  return (
    <>
      <Rubric>{labels.falseFriend}</Rubric>
      <p className="voca-falsi" lang={lang}>
        <b>{friend.learner}</b> ≠ {labels.english} <i lang="en">{friend.english}</i>{' '}
        <span className="voca-falsi-means">(= {friend.englishMeans})</span>
      </p>
    </>
  );
}

/** See also: related English words; one that is itself in the lesson opens its letter section. */
export function VideEtiam({ lab, gloss, interactive }: { lab: LessonState; gloss: Gloss; interactive: boolean }) {
  const facts = folioFor(gloss.lemma);
  if (!facts?.related.length) return null;
  const labels = folioLabels(lab.translation.code);
  const lessonWords = new Map<string, Gloss>();
  for (const page of lab.pages) for (const g of page.words) lessonWords.set(g.lemma, g);
  return (
    <>
      <Rubric>{labels.seeAlso}</Rubric>
      <p className="voca-vide" lang="en">
        {facts.related.map((word) => {
          const inLesson = lessonWords.get(word);
          return inLesson && interactive ? (
            <button
              key={word}
              type="button"
              className="voca-vide-chip"
              data-link=""
              aria-label={`See ${word}`}
              onClick={() => lab.setOpenLetter(letterOf(inLesson))}
            >
              → {word}
            </button>
          ) : (
            <span key={word} className="voca-vide-chip">
              {word}
            </span>
          );
        })}
      </p>
    </>
  );
}

/**
 * One word's entry. `reached` lights its initial once the karaoke sweep gets to it; `action` is an optional control in
 * the head row (the letter sections put the "first heard ▶" button there).
 */
export function WordEntry({
  lab,
  gloss,
  reached = true,
  focus = false,
  interactive = false,
  compact = false,
  action,
}: {
  lab: LessonState;
  gloss: Gloss;
  reached?: boolean;
  focus?: boolean;
  interactive?: boolean;
  compact?: boolean;
  action?: ReactNode;
}) {
  const native = lab.lesson.nativeLanguage.code.toLowerCase();
  const lang = lab.translation.code.toLowerCase();
  return (
    <section
      className="voca-word-entry"
      data-reached={reached || undefined}
      data-focus={focus || undefined}
      data-compact={compact || undefined}
      aria-label={gloss.term}
    >
      <div className="voca-word-head">
        <Headword gloss={gloss} lang={native} />
        <span className="voca-card-pos">{gloss.pos}</span>
        <span className="voca-card-ipa">{gloss.ipa}</span>
        {action}
      </div>
      <p className="voca-word-def">
        <span lang={lang}>{lab.defineIn(gloss)}</span>{' '}
        <span className="voca-card-fr">
          <abbr className="voca-entry-label" title={lab.translation.name}>
            {lab.translation.code}.
          </abbr>{' '}
          <i lang={lang}>{lab.wordIn(gloss)}</i>
        </span>
      </p>
      {/* The extra detail waits behind one click, so the card stays readable while the film plays. */}
      <details className="voca-word-more">
        <summary lang={lang}>{folioLabels(lab.translation.code).more}</summary>
        <Infobox lab={lab} gloss={gloss} />
        <Origo lab={lab} gloss={gloss} />
        <FalsiAmici lab={lab} gloss={gloss} />
        {!compact && <VideEtiam lab={lab} gloss={gloss} interactive={interactive} />}
      </details>
    </section>
  );
}

/** The line from the film, its official translation, and a way to hear it again. */
export function Exempla({ lab, cue, interactive }: { lab: LessonState; cue: Cue; interactive: boolean }) {
  const lang = lab.translation.code.toLowerCase();
  return (
    <div className="voca-exempla">
      <blockquote className="voca-exempla-line">
        <p lang={lab.lesson.nativeLanguage.code.toLowerCase()}>“{cue.native}”</p>
        <p className="voca-exempla-translation" lang={lang}>
          {lab.lineIn(cue)}
        </p>
      </blockquote>
      {interactive && (
        <button
          type="button"
          className="voca-letter-play voca-exempla-play"
          aria-label={`Play this line again, at ${formatTime(cue.start)}`}
          onClick={() => lab.seekTo(Math.max(0, cue.start - 0.3))}
        >
          <PlayIcon className="voca-letter-play-icon" />
          {formatTime(cue.start)}
        </button>
      )}
    </div>
  );
}
