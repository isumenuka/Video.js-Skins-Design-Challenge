/** @jsxImportSource react */

import { Time, Controls, Tooltip, VolumeSlider, MuteButton as MuteButtonPrimitive } from '@videojs/react';
import { usePlayer } from '@videojs/react/video';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { InkwellIcon } from '../desk-icons';
import { ReviewButton, StudyMenu, SubtitlesToggle } from '../lesson/lab-controls';
import { Button } from './button';
import { NextLineButton, PreviousLineButton } from './line-button';
import { LiveButton } from './live-button';
import { AudioPlayButton, PlayButton } from './play-button';
import { FullscreenButton } from './screen-controls';
import { StopButton } from './stop-button';
import { TimeSlider } from './time-slider';
import { type ThumbnailSlot } from './time-slider';
import { ButtonTooltip } from './tooltip';
import { VolumePopover } from './volume-popover';

/**
 * The inkwell: its ink level is the volume, and pressing it corks the well (mute). The slider beside it is a line of
 * ink drawn across the desk. Narrow players keep only the well.
 */
function InlineVolume() {
  const volume = usePlayer((s) => s.volume) ?? 1;
  const muted = usePlayer((s) => s.muted) ?? false;
  return (
    <div className={'voca-volume'}>
      <ButtonTooltip>
        <MuteButtonPrimitive render={<Button className={'voca-desk-button voca-inkwell'} />}>
          <InkwellIcon className={'voca-desk-icon'} level={volume} muted={muted} />
        </MuteButtonPrimitive>
      </ButtonTooltip>
      <VolumeSlider.Root className={'voca-volume-slider'} orientation="horizontal" thumbAlignment="edge">
        <VolumeSlider.Track className={'voca-volume-slider-track'}>
          <VolumeSlider.Fill className={'voca-volume-slider-fill'} />
        </VolumeSlider.Track>
        <VolumeSlider.Thumb className={'voca-volume-slider-thumb'} />
      </VolumeSlider.Root>
    </div>
  );
}

export function ControlsRow({
  audio = false,
  captions,
  live = false,
  menu,
  rate,
  seekBackward,
  seekForward,
}: ControlsSlots & { audio?: boolean; live?: boolean; menu?: ReactNode } = {}) {
  return (
    <Controls.Group className={'video-controls-row'}>
      <Controls.Group className={cn('video-controls-group', 'video-controls-start')}>
        {audio ? <AudioPlayButton /> : <PlayButton />}
        {/* The transport tray: stop, then the ways through the text, from the line before to the line after. */}
        {!audio && !live ? (
          <div className={'voca-transport'} role="group" aria-label="Navigation">
            <StopButton />
            <span className={'voca-transport-rule'} aria-hidden="true" />
            <PreviousLineButton />
            {seekBackward}
            {seekForward}
            <NextLineButton />
          </div>
        ) : (
          <>
            {seekBackward}
            {seekForward}
          </>
        )}
        {live && <LiveButton />}
        {!live && (
          <Time.Group className={'media-time-group voca-pages'}>
            <PageNumbers />
            <span className={'voca-pages-time'}>
              <Time.Value className={'media-time-current-value'} type="current" />
              <Time.Separator className={'media-time-separator'} />
              <Time.Value className={'media-time-duration-value'} type="duration" />
            </span>
          </Time.Group>
        )}
        {!audio && <InlineVolume />}
      </Controls.Group>

      <span className={'voca-desk-fleuron'} aria-hidden="true">
        ❦
      </span>

      <Controls.Group className={cn('video-controls-group', 'video-controls-end')}>
        {!audio && <StudyMenu />}
        {!audio && <ReviewButton />}
        {captions}
        {rate}
        {menu ?? (audio && <VolumePopover />)}
        {!audio && <FullscreenButton />}
      </Controls.Group>
    </Controls.Group>
  );
}

/** The time as page numbers, a page a second: "p. 150 of 887". The real time sits beneath it, and is what's read out. */
function PageNumbers() {
  const currentTime = usePlayer((s) => s.currentTime) ?? 0;
  const duration = usePlayer((s) => s.duration) ?? 0;
  return (
    <span className={'voca-pages-number'} aria-hidden="true">
      <span className={'voca-pages-p'}>p.</span>
      <span>{Math.floor(currentTime) + 1}</span>
      <span className={'voca-pages-of'}>of</span>
      <span className={'voca-pages-total'}>{duration ? Math.ceil(duration) : '—'}</span>
    </span>
  );
}

export interface ControlsSlots extends ThumbnailSlot {
  /** The captions toggle, supplied by the video presets because the audio presets have no text track feature. */
  captions?: ReactNode;
  /** The playback-rate control, supplied by the on-demand audio preset. */
  rate?: ReactNode;
  /** The skip-back control, supplied by the presets that have a timeline. */
  seekBackward?: ReactNode;
  /** The skip-forward control, supplied by the presets that have a timeline. */
  seekForward?: ReactNode;
}

/**
 * The controls sit on the volume's cover, below the open pages, so they never cover the picture: the page edges (seek
 * bar) first, then the strip of buttons.
 */
export function ControlsContent({
  audio = false,
  captions,
  live = false,
  menu,
  rate,
  renderThumbnail,
  seekBackward,
  seekForward,
}: ControlsSlots & { audio?: boolean; live?: boolean; menu?: ReactNode } = {}) {
  return (
    <Controls.Content className={cn('video-controls-content', audio && 'audio-controls-content')}>
      <Tooltip.Provider>
        <div
          data-interactive
          className={cn(
            'video-controls-bottom',
            audio && 'audio-controls-bottom',
            !audio && 'video-controls-video-bottom',
          )}
        >
          {!live && <TimeSlider audio={audio} renderThumbnail={renderThumbnail} />}
          <ControlsRow
            audio={audio}
            captions={captions ?? (!audio && <SubtitlesToggle />)}
            live={live}
            menu={menu}
            rate={rate}
            seekBackward={seekBackward}
            seekForward={seekForward}
          />
        </div>
      </Tooltip.Provider>
    </Controls.Content>
  );
}
