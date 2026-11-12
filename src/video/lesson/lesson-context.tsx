/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { type Cue, type Lesson, type LinePage, linePages, type Occurrence, occurrences } from './lesson-data';

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
  subtitlesOn: boolean;
  setSubtitlesOn: (on: boolean) => void;
  seekTo: (time: number, play?: boolean) => void;
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
