/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { Cue, Gloss, Lesson } from './lesson-data';

export type SubtitleMode = 'native' | 'translation' | 'both';

export interface LessonState {
  lesson: Lesson;
  /** The cue on screen now, if any. */
  activeCue: Cue | undefined;
  /** The most recent cue that has started: what "replay sentence" and "repeat" act on between lines. */
  currentCue: Cue | undefined;
  nextCue: Cue | undefined;
  mode: SubtitleMode;
  setMode: (mode: SubtitleMode) => void;
  subtitlesOn: boolean;
  setSubtitlesOn: (on: boolean) => void;
  /** Loops the current sentence. */
  repeat: boolean;
  setRepeat: (on: boolean) => void;
  /** Pauses at the end of every sentence, so the learner can repeat it aloud. */
  autoPause: boolean;
  setAutoPause: (on: boolean) => void;
  saved: ReadonlySet<string>;
  toggleSaved: (gloss: Gloss) => void;
  seekToCue: (cue: Cue, play?: boolean) => void;
  replay: () => void;
  next: () => void;
}

const LessonContext = createContext<LessonState | null>(null);

/** The lesson the skin's language-lab controls act on. Without a provider, the skin plays as a plain player. */
export function useLesson() {
  return useContext(LessonContext);
}

const SAVED_KEY = 'vocapedia-lab:saved';

function readSaved(): Set<string> {
  try {
    const value = localStorage.getItem(SAVED_KEY);
    return new Set(value ? (JSON.parse(value) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Must sit inside the player (such as `<VideoPlayer>`), since it reads time from and seeks the player's store. */
export function LessonProvider({ lesson, children }: { lesson: Lesson; children: ReactNode }) {
  const store = usePlayer();
  const currentTime = usePlayer((s) => s.currentTime) ?? 0;

  const [mode, setMode] = useState<SubtitleMode>('both');
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [repeat, setRepeatState] = useState(false);
  const [autoPause, setAutoPause] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(readSaved);

  const { cues } = lesson;
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
  const nextCue = cues[currentIndex + 1];

  const seekToCue = useCallback(
    (cue: Cue, play = true) => {
      void store.seek(cue.start);
      if (play) void store.play();
    },
    [store]
  );

  // The sentence "repeat" loops: fixed when repeat turns on, so playback past its end jumps back to it.
  const loopCue = useRef<Cue | undefined>(undefined);
  const setRepeat = useCallback(
    (on: boolean) => {
      loopCue.current = on ? (currentCue ?? cues[0]) : undefined;
      setRepeatState(on);
    },
    [cues, currentCue]
  );

  const previousTime = useRef(currentTime);
  useEffect(() => {
    const before = previousTime.current;
    previousTime.current = currentTime;

    const loop = loopCue.current;
    if (repeat && loop) {
      // A jump of more than a couple of seconds is the learner seeking: follow them to the line they chose.
      if (currentTime < loop.start - 2 || currentTime > loop.end + 2) {
        loopCue.current = currentCue;
      } else if (currentTime >= loop.end + 0.2) {
        void store.seek(loop.start);
      }
      return;
    }

    if (autoPause) {
      const ended = cues.find((cue) => before < cue.end && currentTime >= cue.end && currentTime - before < 2);
      if (ended) store.pause();
    }
  }, [autoPause, cues, currentCue, currentTime, repeat, store]);

  const replay = useCallback(() => {
    const cue = activeCue ?? currentCue ?? cues[0];
    if (cue) seekToCue(cue);
  }, [activeCue, cues, currentCue, seekToCue]);

  const next = useCallback(() => {
    const cue = cues.find((c) => c.start > currentTime + 0.1);
    if (cue) {
      if (repeat) loopCue.current = cue;
      seekToCue(cue);
    }
  }, [cues, currentTime, repeat, seekToCue]);

  const toggleSaved = useCallback((gloss: Gloss) => {
    setSaved((previous) => {
      const updated = new Set(previous);
      if (updated.has(gloss.term)) updated.delete(gloss.term);
      else updated.add(gloss.term);
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify([...updated]));
      } catch {
        // Storage can be blocked; saving still works for this visit.
      }
      return updated;
    });
  }, []);

  const value = useMemo<LessonState>(
    () => ({
      lesson,
      activeCue,
      currentCue,
      nextCue,
      mode,
      setMode,
      subtitlesOn,
      setSubtitlesOn,
      repeat,
      setRepeat,
      autoPause,
      setAutoPause,
      saved,
      toggleSaved,
      seekToCue,
      replay,
      next,
    }),
    [
      activeCue,
      autoPause,
      currentCue,
      lesson,
      mode,
      next,
      nextCue,
      repeat,
      replay,
      saved,
      seekToCue,
      setRepeat,
      subtitlesOn,
      toggleSaved,
    ]
  );

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}
