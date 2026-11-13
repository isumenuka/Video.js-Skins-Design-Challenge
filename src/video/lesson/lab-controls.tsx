/** @jsxImportSource react */

'use client';

import { usePlayer } from '@videojs/react/video';

import { Menu } from '@videojs/react';

import { MagnifierIcon, QuillIcon } from '../desk-icons';
import { CheckIcon } from '../icons';
import { Button } from '../shared/button';
import { ButtonTooltip } from '../shared/tooltip';
import { type StudyModes, useLesson } from './lesson-context';

const STUDY_MODES: Array<{ mode: keyof StudyModes; label: string; hint: string }> = [
  { mode: 'pause', label: 'Pause after new words', hint: 'Stop at the end of each line worth learning.' },
  { mode: 'repeat', label: 'Repeat each line twice', hint: 'Hear every line once more before moving on.' },
  { mode: 'slow', label: 'Slow lines to 0.75×', hint: 'Speech slows down; the gaps between keep pace.' },
];

/**
 * The quill: opens the study modes on a paper slip. It carries a drop of ink, and a count, when any mode is on.
 * The menu is the Video.js Menu primitive, so it opens and closes from the keyboard and Escape returns focus here.
 */
export function StudyMenu() {
  const lab = useLesson();
  if (!lab) return null;
  const { study, setStudy, setReviewOpen, collected, heard, pages } = lab;
  const reviewCount = new Set(
    pages.flatMap((p) => p.words.map((w) => w.lemma)).filter((l) => collected.has(l) || heard.has(l))
  ).size;
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
          <p className="voca-study-heading" aria-hidden="true">
            ✒ Study
          </p>
          {STUDY_MODES.map(({ mode, label, hint }) => (
            <Menu.CheckboxItem
              key={mode}
              className="media-menu-item voca-menu-checkbox voca-study-item"
              checked={study[mode]}
              onCheckedChange={(on) => setStudy(mode, on)}
            >
              <span className="voca-study-check" aria-hidden="true">
                <Menu.ItemIndicator checked={study[mode]}>
                  <CheckIcon className="voca-study-check-icon" />
                </Menu.ItemIndicator>
              </span>
              <span className="voca-study-text">
                <span className="voca-study-label">{label}</span>
                <span className="voca-study-hint">{hint}</span>
              </span>
            </Menu.CheckboxItem>
          ))}
          <Menu.Separator className="media-menu-separator voca-study-separator" />
          <Menu.Item className="media-menu-item voca-study-item voca-study-review" onSelect={() => setReviewOpen(true)}>
            <span className="voca-study-check voca-study-review-mark" aria-hidden="true">
              ✦
            </span>
            <span className="voca-study-text">
              <span className="voca-study-label">Review collected words ({reviewCount})</span>
              <span className="voca-study-hint">Again, Hard, Good or Easy — as on Vocapedia.</span>
            </span>
          </Menu.Item>
        </Menu.Content>
      </Menu.Popup>
    </Menu.Root>
  );
}

/**
 * Experience, as on the Vocapedia dashboard: "✦ 120 XP" on the desk, with each award drifting up from it.
 * The count is text, so it's read in place; the drifting "+10" is decoration.
 */
export function XpCounter() {
  const lab = useLesson();
  if (!lab) return null;
  const { xp, xpBurst } = lab;
  return (
    <span className="voca-xp">
      <span className="voca-xp-star" aria-hidden="true">
        ✦
      </span>
      <span className="voca-sr-only">Experience: </span>
      <span className="voca-xp-value">{xp}</span> XP
      {xpBurst && (
        <span className="voca-xp-burst" key={xpBurst.key} aria-hidden="true">
          +{xpBurst.amount} XP
        </span>
      )}
    </span>
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
