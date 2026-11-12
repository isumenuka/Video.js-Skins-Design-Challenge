/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';

import { CaptionsOffIcon, CaptionsOnIcon } from '../icons';
import { Button } from '../shared/button';
import { ButtonTooltip } from '../shared/tooltip';
import { useLesson } from './lesson-context';

/** Shows or hides the subtitles on the plate. */
export function SubtitlesToggle() {
  const lab = useLesson();
  if (!lab) return null;
  const { subtitlesOn, setSubtitlesOn } = lab;
  return (
    <ButtonTooltip label={subtitlesOn ? 'Hide subtitles' : 'Show subtitles'}>
      <Button
        className="voca-subtitles-button"
        aria-label="Subtitles"
        aria-pressed={subtitlesOn}
        onClick={() => setSubtitlesOn(!subtitlesOn)}
      >
        {subtitlesOn ? <CaptionsOnIcon className="media-button-icon" /> : <CaptionsOffIcon className="media-button-icon" />}
      </Button>
    </ButtonTooltip>
  );
}

/** Each line of dialogue as a dog-ear tick along the page edges; the current line is gilt. */
export function CueMarks() {
  const lab = useLesson();
  const duration = usePlayer((s) => s.duration) ?? 0;
  if (!lab || !duration) return null;
  const { lesson, currentCue, activeCue } = lab;
  return (
    <div className="voca-cue-marks" aria-hidden="true">
      {lesson.cues.map((cue) => (
        <span
          key={cue.id}
          className="voca-cue-mark"
          data-active={cue.id === activeCue?.id || undefined}
          data-current={cue.id === currentCue?.id || undefined}
          style={{ insetInlineStart: `${(cue.start / duration) * 100}%` }}
        />
      ))}
    </div>
  );
}
