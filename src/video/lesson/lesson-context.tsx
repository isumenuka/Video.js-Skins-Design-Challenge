/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { type Cue, type Gloss, type Lesson, type LinePage, linePages, type Occurrence, occurrences } from './lesson-data';
import {
  cueText,
  glossText,
  isLangCode,
  type LangCode,
  TRANSLATION_LANGUAGES,
  type TranslationLanguage,
} from './translations';
import { definitionIn } from './definitions';

/** How long a tab stays pulled out after its word is spoken. */
const POP_SECONDS = 4;

export interface LessonState {
  lesson: Lesson;
  /** The cue on screen now, if any. */
  activeCue: Cue | undefined;
  /** The most recent cue that has started. */
  currentCue: Cue | undefined;
  /** Media time, in seconds. */
  currentTime: number;
  paused: boolean;
  /** Every special-word occurrence in the film, in order. */
  occurrences: Occurrence[];
  /** Lemmas the viewer has heard so far: the glossary derives from this, so seeking back un-writes words. */
  heard: ReadonlySet<string>;
  /** The latest special word spoken. */
  latest: Occurrence | undefined;
  /** A special word spoken in the last few seconds: its A–Z tab is pulled out. */
  popped: Occurrence | undefined;
  /** The lines with special words, one card page each. */
  pages: LinePage[];
  /** The page the card shows when it's live: the latest line with special words that has begun. */
  livePage: LinePage | undefined;
  /** The study modes the quill switches on: each changes how the film plays around its lines. */
  study: StudyModes;
  setStudy: (mode: keyof StudyModes, on: boolean) => void;
  /** A word just chosen from the glossary: its row and entry flash. */
  focusLemma: string | undefined;
  /** Replays the line where a word is first spoken. */
  playWord: (lemma: string) => void;
  /** The A–Z section open on the dictionary page, if any. */
  openLetter: string | null;
  setOpenLetter: (letter: string | null) => void;
  /** The language of the translation line and the dictionary; English is always the spoken line. */
  translation: TranslationLanguage;
  setTranslation: (code: LangCode) => void;
  /** A spoken line, in the chosen translation language. */
  lineIn: (cue: Cue) => string;
  /** A word, in the chosen translation language. */
  wordIn: (gloss: Gloss) => string;
  /** A word's short definition, written in the chosen translation language. */
  defineIn: (gloss: Gloss) => string;
  /** True when the popped word is being heard for the first time in the film: its tab sends up embers. */
  poppedIsNew: boolean;
  /** Every word the viewer has ever collected here, kept in this browser across visits. */
  collected: ReadonlySet<string>;
  /** Experience points, as on the Vocapedia dashboard: ten for each new word, more for reviewing. */
  xp: number;
  /** The latest award, for the "+10 XP" that drifts up from the counter. */
  xpBurst: { amount: number; key: number } | null;
  awardXp: (amount: number) => void;
  /** The Again / Hard / Good / Easy review of collected words, shown on the dictionary page. */
  reviewOpen: boolean;
  setReviewOpen: (open: boolean) => void;
  subtitlesOn: boolean;
  setSubtitlesOn: (on: boolean) => void;
  seekTo: (time: number, play?: boolean) => void;
}

const COLLECTED_KEY = 'vocapedia-lab:collected';
const XP_KEY = 'vocapedia-lab:xp';

function readCollected(): Set<string> {
  try {
    const saved = JSON.parse(localStorage.getItem(COLLECTED_KEY) ?? '[]');
    return new Set(Array.isArray(saved) ? saved.filter((v) => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

function readXp(): number {
  try {
    const saved = Number(localStorage.getItem(XP_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : 0;
  } catch {
    return 0;
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; progress still counts for this visit.
  }
}

const LANGUAGE_KEY = 'vocapedia-lab:translation';

function readLanguage(): LangCode {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return isLangCode(saved) ? saved : 'FR';
  } catch {
    return 'FR';
  }
}

export interface StudyModes {
  /** Pause at the end of every line with special words. */
  pause: boolean;
  /** Play every spoken line twice. */
  repeat: boolean;
  /** Slow the film to 0.75× while a line is spoken. */
  slow: boolean;
}

const SLOW_RATE = 0.75;

const LessonContext = createContext<LessonState | null>(null);

/** The lesson the skin's pages read. Without a provider, the skin plays as a plain player. */
export function useLesson() {
  return useContext(LessonContext);
}

/** Must sit inside the player (such as `<VideoPlayer>`), since it reads time from and seeks the player's store. */
export function LessonProvider({ lesson, children }: { lesson: Lesson; children: ReactNode }) {
  const store = usePlayer();
  const currentTime = usePlayer((s) => s.currentTime) ?? 0;
  const paused = usePlayer((s) => s.paused) ?? true;
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const rate = usePlayer((s) => s.playbackRate) ?? 1;
  const [study, setStudyState] = useState<StudyModes>({ pause: false, repeat: false, slow: false });
  const setStudy = useCallback((mode: keyof StudyModes, on: boolean) => {
    setStudyState((current) => ({ ...current, [mode]: on }));
  }, []);
  const [focusLemma, setFocusLemma] = useState<string | undefined>();
  const [openLetter, setOpenLetter] = useState<string | null>(null);
  const [translationCode, setTranslationCode] = useState<LangCode>(readLanguage);
  const setTranslation = useCallback((code: LangCode) => {
    setTranslationCode(code);
    try {
      localStorage.setItem(LANGUAGE_KEY, code);
    } catch {
      // Storage can be blocked; the choice still holds for this visit.
    }
  }, []);
  const translation = TRANSLATION_LANGUAGES.find((l) => l.code === translationCode) ?? TRANSLATION_LANGUAGES[0];
  const lineIn = useCallback((cue: Cue) => cueText(cue, translationCode), [translationCode]);
  const wordIn = useCallback((gloss: Gloss) => glossText(gloss, translationCode), [translationCode]);
  const defineIn = useCallback((gloss: Gloss) => definitionIn(gloss, translationCode), [translationCode]);

  const { cues } = lesson;
  const all = useMemo(() => occurrences(lesson), [lesson]);

  const currentIndex = useMemo(() => {
    let index = -1;
    for (let i = 0; i < cues.length; i++) {
      if (cues[i].start <= currentTime + 0.05) index = i;
      else break;
    }
    return index;
  }, [cues, currentTime]);

  const currentCue = currentIndex >= 0 ? cues[currentIndex] : undefined;
  const activeCue = currentCue && currentTime < currentCue.end ? currentCue : undefined;

  // The number of occurrences already spoken; everything else follows from it.
  const spoken = useMemo(() => {
    let count = 0;
    while (count < all.length && all[count].time <= currentTime) count++;
    return count;
  }, [all, currentTime]);

  const heard = useMemo(() => new Set(all.slice(0, spoken).map((o) => o.gloss.lemma)), [all, spoken]);
  const latest = spoken > 0 ? all[spoken - 1] : undefined;
  const popped = latest && currentTime - latest.time < POP_SECONDS ? latest : undefined;

  // Where each word is first spoken: that occurrence is the moment it's collected.
  const firstIndex = useMemo(() => {
    const map = new Map<string, number>();
    for (const occurrence of all) if (!map.has(occurrence.gloss.lemma)) map.set(occurrence.gloss.lemma, occurrence.index);
    return map;
  }, [all]);
  const poppedIsNew = Boolean(popped && firstIndex.get(popped.gloss.lemma) === popped.index);

  // Collected words and experience persist in this browser, like a reader's progress on Vocapedia.
  const [collected, setCollected] = useState<Set<string>>(readCollected);
  const collectedRef = useRef(collected);
  collectedRef.current = collected;
  const [xp, setXp] = useState<number>(readXp);
  const [xpBurst, setXpBurst] = useState<{ amount: number; key: number } | null>(null);
  const awardXp = useCallback((amount: number) => {
    if (amount <= 0) return;
    setXp((current) => {
      const next = current + amount;
      save(XP_KEY, String(next));
      return next;
    });
    setXpBurst({ amount, key: performance.now() });
  }, []);

  // A word is collected when it's heard for the first time while the film plays (not skipped past by a seek).
  const lastCollected = useRef(-1);
  useEffect(() => {
    if (!latest || latest.index === lastCollected.current) return;
    lastCollected.current = latest.index;
    const lemma = latest.gloss.lemma;
    if (firstIndex.get(lemma) !== latest.index || currentTime - latest.time > 2) return;
    if (collectedRef.current.has(lemma)) return;
    const next = new Set(collectedRef.current);
    next.add(lemma);
    collectedRef.current = next;
    setCollected(next);
    save(COLLECTED_KEY, JSON.stringify([...next]));
    awardXp(10);
  }, [latest?.index]);

  const pages = useMemo(() => linePages(lesson), [lesson]);
  const livePage = useMemo(() => {
    let page: LinePage | undefined;
    // The page turns as its line begins; the gold markers then fill in as each word is reached.
    for (const p of pages) {
      if (p.cue.start - 0.5 <= currentTime) page = p;
      else break;
    }
    return page;
  }, [pages, currentTime]);

  // Study modes act as playback crosses the end of a line: repeat it once, then (if asked) pause on lines with special
  // words. Each fires once per line, so pressing play carries on past it; a big seek starts afresh.
  const previousTime = useRef(currentTime);
  const stoppedAt = useRef<number | undefined>(undefined);
  const repeated = useRef(new Set<number>());
  const ownSeek = useRef(false);
  useEffect(() => {
    const before = previousTime.current;
    previousTime.current = currentTime;
    const jump = currentTime - before;
    if (Math.abs(jump) > 2) {
      // Our own jump back for a repeat isn't the viewer seeking; anything else starts the repeats afresh.
      if (ownSeek.current) ownSeek.current = false;
      else repeated.current.clear();
      return;
    }
    if (paused || jump <= 0) return;
    const ended = cues.find((cue) => before < cue.end && currentTime >= cue.end);
    if (!ended) return;

    if (study.repeat && !repeated.current.has(ended.id)) {
      repeated.current.add(ended.id);
      ownSeek.current = true;
      void store.seek(ended.start);
      return;
    }

    const page = pages.find((p) => p.cue.id === ended.id);
    if (study.pause && page && stoppedAt.current !== page.index) {
      stoppedAt.current = page.index;
      store.pause();
    }
  }, [cues, currentTime, pages, paused, store, study.pause, study.repeat]);

  useEffect(() => {
    if (!study.repeat) repeated.current.clear();
  }, [study.repeat]);

  // Slow lines: while a line is spoken the film plays at 0.75×, then returns to the viewer's own rate. We only undo a
  // rate we set ourselves, so a speed chosen in Settings mid-line is respected.
  const ownRate = useRef<number | null>(null);
  const speaking = Boolean(activeCue);
  useEffect(() => {
    if (study.slow && speaking) {
      if (ownRate.current === null && rate !== SLOW_RATE) {
        ownRate.current = rate;
        store.setPlaybackRate(SLOW_RATE);
      }
    } else if (ownRate.current !== null) {
      if (rate === SLOW_RATE) store.setPlaybackRate(ownRate.current);
      ownRate.current = null;
    }
  }, [rate, speaking, store, study.slow]);

  const seekTo = useCallback(
    (time: number, play = true) => {
      void store.seek(time);
      if (play) void store.play();
    },
    [store]
  );

  // Opening the review pauses the film, so the reader isn't racing it.
  const [reviewOpen, setReviewOpenState] = useState(false);
  const setReviewOpen = useCallback(
    (open: boolean) => {
      if (open) store.pause();
      setReviewOpenState(open);
    },
    [store]
  );

  const focusTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const playWord = useCallback(
    (lemma: string) => {
      const page = pages.find((p) => p.words.some((w) => w.lemma === lemma));
      if (!page) return;
      stoppedAt.current = undefined;
      seekTo(Math.max(0, page.cue.start - 0.4));
      setFocusLemma(lemma);
      clearTimeout(focusTimer.current);
      focusTimer.current = setTimeout(() => setFocusLemma(undefined), 2600);
    },
    [pages, seekTo]
  );
  useEffect(() => () => clearTimeout(focusTimer.current), []);

  const value = useMemo<LessonState>(
    () => ({
      lesson,
      activeCue,
      currentCue,
      currentTime,
      paused,
      occurrences: all,
      heard,
      latest,
      popped,
      pages,
      livePage,
      study,
      setStudy,
      focusLemma,
      playWord,
      openLetter,
      setOpenLetter,
      translation,
      setTranslation,
      lineIn,
      wordIn,
      defineIn,
      poppedIsNew,
      collected,
      xp,
      xpBurst,
      awardXp,
      reviewOpen,
      setReviewOpen,
      subtitlesOn,
      setSubtitlesOn,
      seekTo,
    }),
    [
      activeCue,
      all,
      currentCue,
      currentTime,
      focusLemma,
      heard,
      latest,
      lesson,
      livePage,
      openLetter,
      pages,
      translation,
      setTranslation,
      lineIn,
      wordIn,
      defineIn,
      poppedIsNew,
      collected,
      xp,
      xpBurst,
      awardXp,
      reviewOpen,
      setReviewOpen,
      paused,
      playWord,
      popped,
      seekTo,
      study,
      setStudy,
      subtitlesOn,
    ]
  );

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}
