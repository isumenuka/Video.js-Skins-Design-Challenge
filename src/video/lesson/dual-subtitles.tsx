/** @jsxImportSource react */

'use client';

import { useEffect, useState } from 'react';

import { useLesson } from './lesson-context';
import type { Cue } from './lesson-data';

/** The plate's subtitles: the spoken line in serif, its translation beneath. */
export function DualSubtitles() {
  const lab = useLesson();
  const [lastCue, setLastCue] = useState<Cue | undefined>();

  // Keep the last line mounted while it fades, so it never vanishes mid-read.
  useEffect(() => {
    if (lab?.activeCue) setLastCue(lab.activeCue);
  }, [lab?.activeCue]);

  if (!lab) return null;
  const { activeCue, subtitlesOn, lesson } = lab;
  const cue = activeCue ?? lastCue;
  const visible = Boolean(activeCue) && subtitlesOn;

  return (
    <div className="voca-subtitles" data-visible={visible || undefined} aria-hidden="true">
      {cue && (
        <div className="voca-subtitles-inner" key={cue.id}>
          <p className="voca-subtitles-native" lang={lesson.nativeLanguage.code.toLowerCase()}>
            {cue.native}
          </p>
          <p className="voca-subtitles-translation" lang={lesson.translationLanguage.code.toLowerCase()}>
            {cue.translation}
          </p>
        </div>
      )}
    </div>
  );
}
