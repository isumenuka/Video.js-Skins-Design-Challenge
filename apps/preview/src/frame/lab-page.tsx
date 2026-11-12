import { type KeyboardEvent, useEffect, useRef, useState } from 'react';

import { ExternalIcon, StarIcon, VocapediaMark } from '@/video/icons';
import { useLesson } from '@/video/lesson/lesson-context';
import { formatTime, type Gloss, vocabularyIn, vocapediaHome, vocapediaUrl } from '@/video/lesson/lesson-data';

const LOGO = './vocapedia-logo.png';

export function LabHeader() {
  const lab = useLesson();
  return (
    <header className="lab-header">
      <a className="lab-brand" href={vocapediaHome} target="_blank" rel="noreferrer">
        <img src={LOGO} alt="" width="28" height="28" className="lab-brand-logo" />
        <span className="lab-brand-name">Vocapedia</span>
        <span className="voca-sr-only"> (opens in a new tab)</span>
      </a>
      <span className="lab-pill">Language Lab</span>
      <h1 className="lab-title">{lab?.lesson.title}</h1>
    </header>
  );
}

export function LabFooter() {
  return (
    <footer className="lab-footer">
      <p>
        <strong>Vocapedia Language Lab</strong> is a Video.js 10 skin for learning a language from film. The spoken
        line sits in Source Serif, like a dictionary headword, with its translation beneath; every word worth learning
        is a button that opens its Vocapedia gloss. Sentence tools (repeat, replay, pause per line) and cue marks on the
        timeline turn the player into a study desk, in Vocapedia&rsquo;s cobalt on deep navy.
      </p>
      <p className="lab-credit">
        &ldquo;Sintel&rdquo; &copy; copyright Blender Foundation |{' '}
        <a href="https://durian.blender.org" target="_blank" rel="noreferrer">
          durian.blender.org
        </a>{' '}
        &mdash; licensed{' '}
        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
          CC BY 3.0
        </a>
        . Streamed by Mux. Subtitles from the Durian project.
      </p>
    </footer>
  );
}

type Tab = 'transcript' | 'vocabulary';

export function LabPanel() {
  const lab = useLesson();
  const [tab, setTab] = useState<Tab>('transcript');
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ transcript: null, vocabulary: null });
  if (!lab) return null;

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'transcript', label: 'Transcript' },
    { id: 'vocabulary', label: 'Vocabulary' },
  ];

  const onTabKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const index = tabs.findIndex((t) => t.id === tab);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setTab(tabs[next].id);
    tabRefs.current[tabs[next].id]?.focus();
  };

  return (
    <aside className="lab-panel" aria-label="Language Lab">
      <section className="lab-card lab-card-tabs">
        <h2 className="lab-card-title">Language Lab</h2>
        <div role="tablist" aria-label="Lesson" className="lab-tabs" onKeyDown={onTabKeyDown}>
          {tabs.map((t) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`lab-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`lab-tabpanel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              className="lab-tab"
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`lab-tabpanel-${tab}`}
          aria-labelledby={`lab-tab-${tab}`}
          className="lab-tabpanel"
        >
          {tab === 'transcript' ? <Transcript /> : <AllVocabulary />}
        </div>
      </section>

      <SceneVocabulary />
    </aside>
  );
}

function Transcript() {
  const lab = useLesson()!;
  const listRef = useRef<HTMLOListElement>(null);
  const currentId = lab.currentCue?.id;

  // Keep the current line in view inside the list, without scrolling the page.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>('[data-current]');
    if (!list || !item) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = item.offsetTop - list.offsetTop - list.clientHeight / 2 + item.clientHeight / 2;
    list.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }, [currentId]);

  return (
    <ol className="lab-transcript" ref={listRef}>
      {lab.lesson.cues.map((cue) => {
        const active = cue.id === lab.activeCue?.id;
        return (
          <li key={cue.id} data-current={cue.id === currentId || undefined}>
            <button
              type="button"
              className="lab-cue"
              data-active={active || undefined}
              aria-current={active ? 'true' : undefined}
              onClick={() => lab.seekToCue(cue)}
            >
              <span className="lab-cue-time">{formatTime(cue.start)}</span>
              <span className="lab-cue-text">
                <span className="lab-cue-native" lang="en">
                  {cue.native}
                </span>
                <span className="lab-cue-translation" lang="fr">
                  {cue.translation}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function VocabRow({ gloss }: { gloss: Gloss }) {
  const lab = useLesson()!;
  const saved = lab.saved.has(gloss.term);
  return (
    <li className="lab-vocab-row">
      <a
        className="lab-vocab-link"
        href={vocapediaUrl(gloss, lab.lesson.nativeLanguage.code)}
        target="_blank"
        rel="noreferrer"
      >
        <b>{gloss.term}</b> <span className="lab-vocab-pos">({gloss.pos})</span>{' '}
        <span aria-hidden="true">•</span>{' '}
        <span lang="fr" className="lab-vocab-translation">
          {gloss.translation}
        </span>
        <ExternalIcon className="lab-vocab-external" />
        <span className="voca-sr-only"> — open in Vocapedia (new tab)</span>
      </a>
      <button
        type="button"
        className="lab-star"
        aria-pressed={saved}
        aria-label={`Save “${gloss.term}”`}
        onClick={() => lab.toggleSaved(gloss)}
      >
        <StarIcon filled={saved} className="lab-star-icon" />
      </button>
    </li>
  );
}

function SceneVocabulary() {
  const lab = useLesson()!;
  const { cues } = lab.lesson;
  const index = lab.currentCue ? cues.indexOf(lab.currentCue) : 0;
  const scene = cues.slice(Math.max(0, index - 1), index + 2);
  const words = vocabularyIn(lab.lesson, scene);

  return (
    <section className="lab-card" aria-labelledby="lab-scene-vocab">
      <h2 className="lab-card-subtitle" id="lab-scene-vocab">
        Vocabulary from this scene
      </h2>
      {words.length ? (
        <ul className="lab-vocab">
          {words.map((gloss) => (
            <VocabRow key={gloss.term} gloss={gloss} />
          ))}
        </ul>
      ) : (
        <p className="lab-empty">No new words in this scene. Press play — Sintel speaks from 1:47.</p>
      )}
    </section>
  );
}

function AllVocabulary() {
  const lab = useLesson()!;
  const words = vocabularyIn(lab.lesson, lab.lesson.cues);
  const saved = words.filter((w) => lab.saved.has(w.term));
  return (
    <div className="lab-all-vocab">
      <h3 className="lab-group-title">
        <StarIcon filled className="lab-group-icon" /> Saved ({saved.length})
      </h3>
      {saved.length ? (
        <ul className="lab-vocab">
          {saved.map((gloss) => (
            <VocabRow key={gloss.term} gloss={gloss} />
          ))}
        </ul>
      ) : (
        <p className="lab-empty">Star a word in the subtitles or below to keep it here.</p>
      )}
      <h3 className="lab-group-title">
        <VocapediaMark className="lab-group-icon" /> All words in this film ({words.length})
      </h3>
      <ul className="lab-vocab">
        {words.map((gloss) => (
          <VocabRow key={gloss.term} gloss={gloss} />
        ))}
      </ul>
    </div>
  );
}
