/** @jsxImportSource react */

'use client';

import { useLesson } from './lesson-context';
import { type Gloss, formatTime, glossFor, tokenize } from './lesson-data';

function wordsIn(line: string, lookup: (word: string) => Gloss | undefined) {
  const seen = new Set<string>();
  const words: Gloss[] = [];
  for (const { text, word } of tokenize(line)) {
    const gloss = word ? lookup(text) : undefined;
    if (gloss && !seen.has(gloss.term)) {
      seen.add(gloss.term);
      words.push(gloss);
    }
  }
  return words;
}

/**
 * The left page of the open volume: the encyclopedia entry for the line being spoken. It keeps the last line between
 * lines, shows a title page before the first, and turns over (keyed by cue) when a new line begins.
 */
export function EntryPage() {
  const lab = useLesson();
  if (!lab) return null;
  const { lesson, currentCue } = lab;
  const native = lesson.nativeLanguage;
  const translation = lesson.translationLanguage;

  return (
    <section className="voca-entry" data-interactive aria-label="Encyclopedia entry for the current line">
      <header className="voca-running-head" aria-hidden="true">
        <span>Vocapedia</span>
        <span>
          Vol. {native.code}–{translation.code}
        </span>
      </header>

      {currentCue ? (
        <article className="voca-entry-leaf" key={currentCue.id}>
          <p className="voca-entry-kicker">
            <span className="voca-entry-section">§ {currentCue.id}</span>
            <span className="voca-entry-time">{formatTime(currentCue.start)}</span>
          </p>
          <h2 className="voca-entry-headword" lang={native.code.toLowerCase()}>
            {currentCue.native}
          </h2>
          <p className="voca-entry-translation">
            <abbr className="voca-entry-label" title={translation.name}>
              {translation.code}.
            </abbr>{' '}
            <i lang={translation.code.toLowerCase()}>{currentCue.translation}</i>
          </p>
          {(() => {
            const words = wordsIn(currentCue.native, (w) => glossFor(lesson, w));
            if (!words.length) return null;
            return (
              <>
                <p className="voca-entry-rule" aria-hidden="true">
                  ❦
                </p>
                <dl className="voca-entry-words">
                  {words.map((gloss) => (
                    <div key={gloss.term} className="voca-entry-word">
                      <dt>
                        <b lang={native.code.toLowerCase()}>{gloss.term}</b> <span className="voca-entry-pos">{gloss.pos}</span>
                      </dt>
                      <dd lang={translation.code.toLowerCase()}>{gloss.translation}</dd>
                    </div>
                  ))}
                </dl>
              </>
            );
          })()}
        </article>
      ) : (
        <article className="voca-entry-leaf voca-title-page" key="title">
          <p className="voca-title-kicker">An entry in moving pictures</p>
          <h2 className="voca-title-name">Sintel</h2>
          <p className="voca-title-rule" aria-hidden="true">
            ❦
          </p>
          <p className="voca-title-note">
            Read along in {native.name} with {translation.name} notes. The first line is spoken at{' '}
            {formatTime(lesson.cues[0]?.start ?? 0)}.
          </p>
          <p className="voca-title-credit">© Blender Foundation · CC BY 3.0</p>
        </article>
      )}

      <footer className="voca-folio" aria-hidden="true">
        {currentCue ? `${currentCue.id} / ${lesson.cues.length}` : 'i'}
      </footer>
    </section>
  );
}
