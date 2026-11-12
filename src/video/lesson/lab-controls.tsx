/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef } from 'react';

import { Button } from '../shared/button';
import { ButtonTooltip } from '../shared/tooltip';
import { CaptionsOffIcon, CaptionsOnIcon, NextLineIcon, RepeatIcon, ReplayIcon, VocapediaMark } from '../icons';
import { type SubtitleMode, useLesson } from './lesson-context';
import { vocapediaHome } from './lesson-data';

/** The chips along the top of the video: the lesson's languages, and the sentence tools. */
export function LabTopBar() {
  const lab = useLesson();
  if (!lab) return null;
  const { lesson, repeat, setRepeat, replay } = lab;

  return (
    <>
      <div className="voca-chip voca-language-chip">
        <span className="voca-language-code" aria-hidden="true">
          {lesson.nativeLanguage.code}
        </span>
        <span className="voca-chip-label">
          <span className="voca-sr-only">Learning </span>
          {lesson.nativeLanguage.name}
          <span className="voca-language-arrow" aria-hidden="true">
            {' '}
            →{' '}
          </span>
          <span className="voca-sr-only">, translated to </span>
          {lesson.translationLanguage.name}
        </span>
      </div>

      <div className="voca-top-actions">
        <button
          type="button"
          className="voca-chip voca-chip-button"
          aria-pressed={repeat}
          onClick={() => setRepeat(!repeat)}
        >
          <RepeatIcon className="voca-chip-icon" />
          <span className="voca-chip-label">Repeat segment</span>
          <span className="voca-chip-state" aria-hidden="true">
            {repeat ? 'On' : 'Off'}
          </span>
        </button>
        <button type="button" className="voca-chip voca-chip-button" onClick={replay}>
          <ReplayIcon className="voca-chip-icon" />
          <span className="voca-chip-label">Replay sentence</span>
        </button>
      </div>
    </>
  );
}

/** Jumps to the start of the next line of dialogue. */
export function NextLineButton() {
  const lab = useLesson();
  if (!lab) return null;
  return (
    <ButtonTooltip label="Next sentence">
      <Button className="voca-next-button" aria-label="Next sentence" disabled={!lab.nextCue} onClick={lab.next}>
        <NextLineIcon className="media-button-icon" />
      </Button>
    </ButtonTooltip>
  );
}

/** Shows or hides the lesson subtitles. */
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

const MODES: Array<{ value: SubtitleMode; label: string; long: string }> = [
  { value: 'native', label: 'Native', long: 'Native line only' },
  { value: 'translation', label: 'Trans.', long: 'Translation only' },
  { value: 'both', label: 'Both', long: 'Native line and translation' },
];

/**
 * A segmented radio group: Tab reaches the selected option, arrow keys move between options. The key listener is
 * native, so it runs before the player's hotkeys (which listen on the container) and keeps the arrows from seeking.
 */
export function SubtitleModeGroup() {
  const lab = useLesson();
  const groupRef = useRef<HTMLDivElement>(null);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const latest = useRef(lab);
  latest.current = lab;

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const current = latest.current;
      const step = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[event.key];
      if (!current || !step) return;
      event.preventDefault();
      const rtl = getComputedStyle(group).direction === 'rtl';
      const horizontal = event.key === 'ArrowRight' || event.key === 'ArrowLeft';
      const selected = MODES.findIndex((m) => m.value === current.mode);
      const next = (selected + (rtl && horizontal ? -step : step) + MODES.length) % MODES.length;
      current.setMode(MODES[next].value);
      if (!current.subtitlesOn) current.setSubtitlesOn(true);
      refs.current[next]?.focus();
    };
    group.addEventListener('keydown', onKeyDown);
    return () => group.removeEventListener('keydown', onKeyDown);
  }, [lab !== null]);

  if (!lab) return null;
  const { mode, setMode, subtitlesOn } = lab;

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Subtitle language"
      className="voca-segmented"
      data-disabled={!subtitlesOn || undefined}
    >
      {MODES.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="button"
          role="radio"
          aria-checked={mode === option.value}
          aria-label={option.long}
          tabIndex={mode === option.value ? 0 : -1}
          className="voca-segment"
          onClick={() => {
            setMode(option.value);
            if (!subtitlesOn) lab.setSubtitlesOn(true);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** "Pause per line": stops at the end of every sentence so the learner can say it back. */
export function AutoPauseSwitch() {
  const lab = useLesson();
  if (!lab) return null;
  const { autoPause, setAutoPause } = lab;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={autoPause}
      className="voca-switch"
      onClick={() => setAutoPause(!autoPause)}
    >
      <span className="voca-switch-label">Pause per line</span>
      <span className="voca-switch-track" aria-hidden="true">
        <span className="voca-switch-thumb" />
      </span>
    </button>
  );
}

/** Each line of dialogue drawn as a dash along the seek bar; the current line lights up. */
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
          style={{
            insetInlineStart: `${(cue.start / duration) * 100}%`,
            width: `max(4px, ${((cue.end - cue.start) / duration) * 100}%)`,
          }}
        />
      ))}
    </div>
  );
}

/** The brand mark in the corner of the video. */
export function Watermark() {
  return (
    <a className="voca-watermark" href={vocapediaHome} target="_blank" rel="noreferrer">
      <VocapediaMark className="voca-watermark-icon" />
      <span>vocapedia</span>
      <span className="voca-sr-only"> (opens in a new tab)</span>
    </a>
  );
}
