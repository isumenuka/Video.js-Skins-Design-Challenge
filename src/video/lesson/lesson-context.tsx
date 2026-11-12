/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import type { Cue, Lesson } from './lesson-data';

export interface LessonState {
  lesson: Lesson;
  /** The cue on screen now, if any. */
  activeCue: Cue | undefined;
  /** The most recent cue that has started; the entry page keeps showing it between lines. */
  currentCue: Cue | undefined;
  subtitlesOn: boolean;
  setSubtitlesOn: (on: boolean) => void;
  seekToCue: (cue: Cue, play?: boolean) => void;
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
  const [subtitlesOn, setSubtitlesOn] = useState(true);

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

  const seekToCue = useCallback(
    (cue: Cue, play = true) => {
      void store.seek(cue.start);
      if (play) void store.play();
    },
    [store]
  );

  const value = useMemo<LessonState>(
    () => ({ lesson, activeCue, currentCue, subtitlesOn, setSubtitlesOn, seekToCue }),
    [activeCue, currentCue, lesson, seekToCue, subtitlesOn]
  );

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}
