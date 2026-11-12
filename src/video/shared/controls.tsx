/** @jsxImportSource react */

import { Time, Controls, Tooltip, VolumeSlider } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { SubtitlesToggle } from '../lesson/lab-controls';
import { LiveButton } from './live-button';
import { MuteButton } from './mute-button';
import { AudioPlayButton, PlayButton } from './play-button';
import { FullscreenButton } from './screen-controls';
import { TimeSlider } from './time-slider';
import { type ThumbnailSlot } from './time-slider';
import { ButtonTooltip } from './tooltip';
import { VolumePopover } from './volume-popover';

/** Mute plus an inline slider; narrow players keep only the mute button. */
function InlineVolume() {
  return (
    <div className={'voca-volume'}>
      <ButtonTooltip>
        <MuteButton />
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
        {seekBackward}
        {seekForward}
        {live && <LiveButton />}
        {!live && (
          <Time.Group className={'media-time-group'}>
            <Time.Value className={'media-time-toggle'} type="current" toggle />
            <Time.Value className={'media-time-current-value'} type="current" />
            <Time.Separator className={'media-time-separator'} />
            <Time.Value className={'media-time-duration-value'} type="duration" />
          </Time.Group>
        )}
        {!audio && <InlineVolume />}
      </Controls.Group>

      <Controls.Group className={cn('video-controls-group', 'video-controls-end')}>
        {captions}
        {rate}
        {menu ?? (audio && <VolumePopover />)}
        {!audio && <FullscreenButton />}
      </Controls.Group>
    </Controls.Group>
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
            !audio && 'video-controls-video-bottom'
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
