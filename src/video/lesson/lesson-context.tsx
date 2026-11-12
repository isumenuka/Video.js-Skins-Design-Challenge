/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { type Cue, type Lesson, type Occurrence, occurrences } from './lesson-data';

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
  subtitlesOn: boolean;
  setSubtitlesOn: (on: boolean) => void;
  seekTo: (time: number, play?: boolean) => void;
}

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

  const seekTo = useCallback(
    (time: number, play = true) => {
      void store.seek(time);
      if (play) void store.play();
    },
    [store]
  );

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
      subtitlesOn,
      setSubtitlesOn,
      seekTo,
    }),
    [activeCue, all, currentCue, currentTime, heard, latest, lesson, paused, popped, seekTo, subtitlesOn]
  );

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}
