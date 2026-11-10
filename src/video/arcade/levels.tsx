/** @jsxImportSource react */

import { Dialog } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { cn } from '@/lib/resolve-class-name';

import { ButtonTooltip } from '../shared/tooltip';
import { arcadeText, useArcadeTranslator } from './i18n';
import { playSfx } from './sfx';
import { usePlayerRoot } from './use-player-root';

interface Level {
  start: number;
  title: string;
  thumb?: { url: string; x: number; y: number; w: number; h: number } | undefined;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Chapters from the media's chapters track, each with its storyboard frame when the media has a thumbnails track. */
function readLevels(video: HTMLVideoElement | null | undefined): Level[] {
  if (!video) return [];
  const tracks = [...video.textTracks];
  const chapters = tracks.find((t) => t.kind === 'chapters');
  const thumbs = tracks.find((t) => t.kind === 'metadata' && /thumbnail/i.test(t.label));
  const thumbCues = thumbs?.cues ? [...thumbs.cues] : [];
  if (!chapters?.cues) return [];
  return [...chapters.cues].map((cue) => {
    const c = cue as VTTCue;
    const at = c.startTime + Math.min(8, (c.endTime - c.startTime) / 3);
    const tc = thumbCues.find((t) => at >= t.startTime && at < t.endTime) as VTTCue | undefined;
    let thumb: Level['thumb'];
    const m = tc?.text.match(/^(.*)#xywh=(\d+),(\d+),(\d+),(\d+)$/);
    if (m) {
      const base = (thumbs as TextTrack & { src?: string }).src;
      const url = base ? new URL(m[1]!, base).href : m[1]!;
      thumb = { url, x: +m[2]!, y: +m[3]!, w: +m[4]!, h: +m[5]! };
    }
    return { start: c.startTime, title: c.text, thumb };
  });
}

function GridIcon() {
  return (
    <svg
      className={'media-button-icon'}
      viewBox="0 0 20 20"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z" />
    </svg>
  );
}

/**
 * Level select: the film's chapters as an arcade level grid ("1-1 … 1-8"), each with a frame from the storyboard.
 * A Video.js Dialog, so focus moves in and is trapped, the rest of the player goes inert, Esc closes, and focus returns
 * to the Levels button. Arrow keys move between levels; Enter jumps to one and closes. Hidden when there are no chapters.
 */
export function LevelSelect() {
  const store = usePlayer();
  const currentTime = usePlayer((s) => s.currentTime) ?? 0;
  const duration = usePlayer((s) => s.duration) ?? 0;
  const muted = usePlayer((s) => s.muted) ?? false;
  const t = useArcadeTranslator();
  const anchor = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [levels, setLevels] = useState<Level[]>([]);
  const root = usePlayerRoot(anchor);

  // Chapters load with the media; re-read when tracks or their cues arrive.
  useEffect(() => {
    const video = anchor.current?.closest('.media-skin')?.querySelector('video');
    if (!video) return;
    const refresh = () => setLevels(readLevels(video));
    refresh();
    const tracks = video.textTracks;
    tracks.addEventListener('addtrack', refresh);
    tracks.addEventListener('change', refresh);
    video.addEventListener('loadedmetadata', refresh);
    const timer = window.setInterval(refresh, 1500);
    const stop = window.setTimeout(() => clearInterval(timer), 12000);
    return () => {
      tracks.removeEventListener('addtrack', refresh);
      tracks.removeEventListener('change', refresh);
      video.removeEventListener('loadedmetadata', refresh);
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [duration]);

  const current = levels.reduce((idx, l, i) => (currentTime >= l.start ? i : idx), 0);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('.arc-level')];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const cols = window.getComputedStyle(e.currentTarget).gridTemplateColumns.split(' ').length || 4;
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: cols,
      ArrowUp: -cols,
    };
    const move = moves[e.key];
    if (move === undefined && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    e.stopPropagation(); // keep the player's arrow-key hotkeys out of the grid
    const next =
      e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : Math.min(items.length - 1, Math.max(0, i + move!));
    items[next]?.focus();
    playSfx('click', muted);
  };

  return (
    <>
      <span ref={anchor} hidden />
      {levels.length > 0 && (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <ButtonTooltip label={t(arcadeText.levels)}>
            <Dialog.Trigger
              render={
                <button
                  type="button"
                  className={cn('media-button', 'arc-btn-levels')}
                  aria-label={t(arcadeText.levels)}
                />
              }
            >
              <GridIcon />
            </Dialog.Trigger>
          </ButtonTooltip>
          {root &&
            createPortal(
              <>
                <Dialog.Backdrop className={'media-dialog-backdrop arc-sheet-backdrop'} />
                <Dialog.Popup className={'media-dialog-popup arc-sheet'}>
                  <Dialog.Title className={'arc-sheet-title'}>{t(arcadeText.levels)}</Dialog.Title>
                  <div className={'arc-levels'} onKeyDown={onKeyDown}>
                    {levels.map((level, i) => (
                      <button
                        key={level.start}
                        type="button"
                        className={'arc-level'}
                        data-current={i === current ? '' : undefined}
                        autoFocus={i === current}
                        aria-current={i === current ? 'true' : undefined}
                        onClick={() => {
                          playSfx('select', muted);
                          void store.seek(level.start + 0.05);
                          setOpen(false);
                        }}
                      >
                        <span className={'arc-level-shot'} aria-hidden="true">
                          {level.thumb && (
                            <span
                              className={'arc-level-sprite'}
                              style={{
                                width: level.thumb.w,
                                height: level.thumb.h,
                                backgroundImage: `url("${level.thumb.url}")`,
                                backgroundPosition: `-${level.thumb.x}px -${level.thumb.y}px`,
                                scale: `${160 / level.thumb.w}`,
                              }}
                            />
                          )}
                          <span className={'arc-level-number'}>1-{i + 1}</span>
                        </span>
                        <span className={'arc-level-name'}>
                          <span className={'arc-visually-hidden'}>{`${t(arcadeText.level)} 1-${i + 1}: `}</span>
                          {level.title}
                        </span>
                        <span className={'arc-level-time'}>{clock(level.start)}</span>
                      </button>
                    ))}
                  </div>
                  <Dialog.Close
                    render={
                      <button
                        type="button"
                        className={'media-button arc-sheet-close'}
                        aria-label={t(arcadeText.close)}
                      />
                    }
                  >
                    <svg
                      className={'media-button-icon'}
                      viewBox="0 0 20 20"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path d="M5 5l10 10M15 5 5 15" />
                    </svg>
                  </Dialog.Close>
                </Dialog.Popup>
              </>,
              root,
            )}
        </Dialog.Root>
      )}
    </>
  );
}
