/** @jsxImportSource react */

import { Time, Controls, BufferingIndicator, Tooltip } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { SeekStick, VolumeStick } from '../arcade/joystick';
import { Oscilloscope } from '../arcade/oscilloscope';
import { SegmentTime } from '../arcade/segment-time';
import { LiveButton } from './live-button';
import { MuteButton } from './mute-button';
import { AudioPlayButton, PlayButton } from './play-button';
import { TimeSlider } from './time-slider';
import { type ThumbnailSlot } from './time-slider';
import { ButtonTooltip } from './tooltip';
import { VolumePopover } from './volume-popover';

export function ControlsRow({
  audio = false,
  captions,
  live = false,
  menu,
  rate,
  screen,
  seekBackward,
  seekForward,
}: ControlsSlots & { audio?: boolean; live?: boolean; menu?: ReactNode; screen?: ReactNode } = {}) {
  if (audio) {
    return (
      <Controls.Group className={'video-controls-row'}>
        <Controls.Group className={cn('video-controls-group', 'video-controls-start')}>
          <AudioPlayButton />
          {seekBackward}
          {seekForward}
          {!live && (
            <Time.Group className={'media-time-group'}>
              <Time.Value className={'media-time-current-value'} type="current" />
              <Time.Separator className={'media-time-separator'} />
              <Time.Value className={'media-time-duration-value'} type="duration" />
            </Time.Group>
          )}
        </Controls.Group>
        <Controls.Group className={'video-controls-group'}>
          {rate}
          {menu ?? <VolumePopover />}
        </Controls.Group>
      </Controls.Group>
    );
  }

  // The arcade control panel, in focus order (= reading order): seek stick, the big transport buttons with the
  // readouts under them, the volume stick and mute, then the row of small buttons along the front.
  return (
    <Controls.Group className={'video-controls-row arc-panel'}>
      <div className={'arc-cluster arc-cluster-seek'}>{!live && <SeekStick />}</div>
      <div className={'arc-center'}>
        <Controls.Group className={cn('video-controls-group', 'video-controls-start', 'arc-transport')}>
          {seekBackward}
          <PlayButton className={'arc-btn-play'} />
          {seekForward}
          {live && <LiveButton />}
        </Controls.Group>
        <div className={'arc-readouts'}>
          {!live && <SegmentTime />}
          <Oscilloscope />
        </div>
      </div>
      <div className={'arc-cluster arc-cluster-volume'}>
        <VolumeStick />
        <ButtonTooltip>
          <MuteButton />
        </ButtonTooltip>
      </div>
      <Controls.Group className={cn('video-controls-group', 'arc-small')}>
        {captions}
        {rate}
        {menu}
        {screen}
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

export function ControlsContent({
  audio = false,
  captions,
  center = false,
  live = false,
  menu,
  rate,
  renderThumbnail,
  screen,
  seekBackward,
  seekForward,
  top,
}: ControlsSlots & {
  audio?: boolean;
  center?: boolean;
  live?: boolean;
  menu?: ReactNode;
  screen?: ReactNode;
  top?: ReactNode;
} = {}) {
  return (
    <Controls.Content className={cn('video-controls-content', audio && 'audio-controls-content')}>
      <Tooltip.Provider>
        {top && <Controls.Group className={'video-controls-top'}>{top}</Controls.Group>}
        {center && (
          <BufferingIndicator className={'video-controls-buffering'}>
            <Controls.Group className={'video-controls-center'}>
              <PlayButton
                className={cn('video-controls-center-button', 'video-controls-center-play')}
                iconClassName={'video-controls-center-play-icon'}
                tooltip={false}
              />
            </Controls.Group>
          </BufferingIndicator>
        )}
        <div
          className={cn(
            'video-controls-bottom',
            audio && 'audio-controls-bottom',
            !audio && 'video-controls-video-bottom'
          )}
        >
          {!live && <TimeSlider audio={audio} renderThumbnail={renderThumbnail} />}
          <ControlsRow
            audio={audio}
            captions={captions}
            live={live}
            menu={menu}
            rate={rate}
            screen={screen}
            seekBackward={seekBackward}
            seekForward={seekForward}
          />
        </div>
      </Tooltip.Provider>
    </Controls.Content>
  );
}
