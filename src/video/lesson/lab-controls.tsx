/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';

import { Menu } from '@videojs/react';

import { MagnifierIcon, QuillIcon, ReviewCardsIcon } from '../desk-icons';
import { Button } from '../shared/button';
import { ButtonTooltip } from '../shared/tooltip';
import { type LessonState, type StudyModes, useLesson } from './lesson-context';

const STUDY_MODES: Array<{ mode: keyof StudyModes; glyph: string; label: string; hint: string }> = [
  { mode: 'pause', glyph: '❙❙', label: 'Pause after new words', hint: 'Stop at the end of each line worth learning.' },
  { mode: 'repeat', glyph: '↻', label: 'Repeat each line twice', hint: 'Hear every line once more before moving on.' },
  { mode: 'slow', glyph: '¾', label: 'Slow lines to 0.75×', hint: 'Speech slows down; the gaps between keep pace.' },
];

/** The words collected or heard so far, counted once each: what the review will ask about. */
function useReviewCount(lab: LessonState | null) {
  if (!lab) return 0;
  const { pages, collected, heard } = lab;
  return new Set(pages.flatMap((p) => p.words.map((w) => w.lemma)).filter((l) => collected.has(l) || heard.has(l)))
    .size;
}

/**
 * The quill: opens the study modes on a paper slip. It carries a drop of ink, and a count, when any mode is on.
 * The menu is the Video.js Menu primitive, so it opens and closes from the keyboard and Escape returns focus here.
 */
export function StudyMenu() {
  const lab = useLesson();
  if (!lab) return null;
  const { study, setStudy } = lab;
  const count = STUDY_MODES.filter(({ mode }) => study[mode]).length;

  return (
    <Menu.Root side="top" align="center">
      <ButtonTooltip label={count ? `Study modes · ${count} on` : 'Study modes'}>
        <Menu.Trigger
          render={
            <Button
              className="voca-desk-button voca-study-button"
              aria-label={count ? `Study modes, ${count} on` : 'Study modes'}
              data-on={count > 0 || undefined}
              data-pause={study.pause || undefined}
            />
          }
        >
          <QuillIcon className="voca-desk-icon" inked={count > 0} />
          {count > 0 && (
            <span className="voca-study-badge" aria-hidden="true">
              {count}
            </span>
          )}
        </Menu.Trigger>
      </ButtonTooltip>
      <Menu.Popup className="media-popup media-popup-safe-area media-menu-popup voca-study-popup">
        <Menu.Content className="media-menu-content">
          <div className="voca-study-head">
            <p className="voca-study-heading" aria-hidden="true">
              <span>✒ Study focus</span>
              {count > 0 && <span className="voca-study-chip">{count} on</span>}
            </p>
            <p className="voca-study-intro" aria-hidden="true">
              Choose how the film helps you learn.
            </p>
          </div>
          {STUDY_MODES.map(({ mode, glyph, label, hint }) => (
            <Menu.CheckboxItem
              key={mode}
              className="media-menu-item voca-menu-checkbox voca-study-item"
              checked={study[mode]}
              onCheckedChange={(on) => setStudy(mode, on)}
            >
              <span className="voca-study-glyph" aria-hidden="true">
                {glyph}
              </span>
              <span className="voca-study-text">
                <span className="voca-study-label">{label}</span>
                <span className="voca-study-hint">{hint}</span>
              </span>
              <span className="voca-study-switch" aria-hidden="true">
                <span className="voca-study-knob" />
              </span>
            </Menu.CheckboxItem>
          ))}
        </Menu.Content>
      </Menu.Popup>
    </Menu.Root>
  );
}

/** The word cards: opens the review of the words collected so far, with a gilt count of them. */
export function ReviewButton() {
  const lab = useLesson();
  const count = useReviewCount(lab);
  if (!lab) return null;
  const empty = count === 0;
  return (
    <ButtonTooltip label={empty ? 'Collect words to review' : `Review collected words (${count})`}>
      <Button
        className="voca-desk-button voca-review-button"
        aria-label={empty ? 'Review collected words, none yet' : `Review collected words, ${count}`}
        aria-disabled={empty || undefined}
        onClick={() => {
          if (!empty) lab.setReviewOpen(true);
        }}
      >
        <ReviewCardsIcon className="voca-desk-icon" />
        {!empty && (
          <span className="voca-study-badge voca-review-badge" aria-hidden="true">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Button>
    </ButtonTooltip>
  );
}

/** The magnifying glass: shows or hides the subtitles on the plate. */
export function SubtitlesToggle() {
  const lab = useLesson();
  if (!lab) return null;
  const { subtitlesOn, setSubtitlesOn } = lab;
  return (
    <ButtonTooltip label={subtitlesOn ? 'Hide subtitles' : 'Show subtitles'}>
      <Button
        className="voca-desk-button voca-subtitles-button"
        aria-label="Subtitles"
        aria-pressed={subtitlesOn}
        onClick={() => setSubtitlesOn(!subtitlesOn)}
      >
        <MagnifierIcon className="voca-desk-icon" on={subtitlesOn} />
      </Button>
    </ButtonTooltip>
  );
}

/** Each line of dialogue as a dog-ear tick along the page edges; the current line is gilt. */
export function CueMarks() {
  const lab = useLesson();
  const duration = usePlayer((s) => s.duration) ?? 0;
  if (!lab || !duration) return null;
  const { lesson, currentCue, activeCue, currentTime, pages } = lab;
  return (
    <div className="voca-cue-marks" aria-hidden="true">
      {lesson.cues.map((cue) => {
        const isCurrent = cue.id === currentCue?.id;
        // The line being spoken shows its word to learn on the tab, when it has one.
        const word = isCurrent ? pages.find((p) => p.cue.id === cue.id)?.words[0]?.lemma : undefined;
        return (
          <span
            key={cue.id}
            className="voca-cue-mark"
            data-active={cue.id === activeCue?.id || undefined}
            data-current={isCurrent || undefined}
            data-passed={(!isCurrent && cue.end <= currentTime) || undefined}
            data-learn={pages.some((p) => p.cue.id === cue.id) || undefined}
            style={{ insetInlineStart: `${(cue.start / duration) * 100}%` }}
          >
            {word && <span className="voca-cue-word">{word}</span>}
          </span>
        );
      })}
    </div>
  );
}
