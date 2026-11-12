/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

import { useLesson } from './lesson-context';
import { type Cue, wordTimings } from './lesson-data';

/**
 * The plate's subtitles. The spoken line sweeps word by word like karaoke, and each special word turns gold as the
 * sweep reaches it; the translation sits beneath. The sweep is CSS animation with a per-word delay measured from an
 * anchor (the media time when the line appeared, re-taken after a seek or a speed change), so it stays smooth between
 * the player's time updates and pauses with the video.
 */
export function DualSubtitles() {
  const lab = useLesson();
  const seeking = usePlayer((s) => s.seeking) ?? false;
  const rate = usePlayer((s) => s.playbackRate) ?? 1;
  const [lastCue, setLastCue] = useState<Cue | undefined>();
  const timeRef = useRef(0);
  timeRef.current = lab?.currentTime ?? 0;

  const activeId = lab?.activeCue?.id;
  const [anchor, setAnchor] = useState({ key: '', time: 0 });

  useEffect(() => {
    if (lab?.activeCue) setLastCue(lab.activeCue);
  }, [lab?.activeCue]);

  useEffect(() => {
    if (activeId === undefined || seeking) return;
    setAnchor({ key: `${activeId}:${performance.now()}`, time: timeRef.current });
  }, [activeId, seeking, rate]);

  const cue = lab?.activeCue ?? lastCue;
  const tokens = useMemo(() => (lab && cue ? wordTimings(lab.lesson, cue) : []), [cue, lab?.lesson]);

  if (!lab) return null;
  const { activeCue, subtitlesOn, lesson, paused } = lab;
  const visible = Boolean(activeCue) && subtitlesOn;

  return (
    <>
      <div
        className="voca-subtitles"
        data-visible={visible || undefined}
        data-paused={paused || undefined}
        aria-hidden="true"
      >
        {cue && (
          <div className="voca-subtitles-inner" key={anchor.key || cue.id}>
            <p className="voca-subtitles-native" lang={lesson.nativeLanguage.code.toLowerCase()}>
              {tokens.map((token, index) =>
                token.word ? (
                  <span
                    key={index}
                    className="voca-k"
                    data-special={token.gloss ? '' : undefined}
                    style={{ '--d': `${(token.start - anchor.time) / rate}s` } as CSSProperties}
                  >
                    {token.text}
                  </span>
                ) : (
                  <span key={index}>{token.text}</span>
                )
              )}
            </p>
            <p className="voca-subtitles-translation" lang={lesson.translationLanguage.code.toLowerCase()}>
              {cue.translation}
            </p>
          </div>
        )}
      </div>
      <WordSlip />
    </>
  );
}

/** On the trim (phones), where the pages are folded away, the word just spoken slides in at the corner of the plate. */
function WordSlip() {
  const lab = useLesson();
  const popped = lab?.popped;
  if (!popped) return null;
  return (
    <p className="voca-word-slip" key={popped.index} aria-hidden="true">
      <span className="voca-word-slip-spark">✦</span>
      <b>{popped.gloss.lemma}</b>
      <span className="voca-word-slip-sep">·</span>
      <span lang="fr">{popped.gloss.translation}</span>
    </p>
  );
}
