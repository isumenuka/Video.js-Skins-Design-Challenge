/** @jsxImportSource react */

import { Controls } from '@videojs/react';

import { SeekButton } from './shared/seek-button';
import { SettingsMenu } from './shared/settings-menu';
import type { ThumbnailSlot } from './shared/time-slider';
import { VideoControlsContent } from './shared/video-controls';

export function VideoControls({ renderThumbnail }: ThumbnailSlot = {}) {
  return (
    <Controls.Root>
      <VideoControlsContent
        center
        menu={<SettingsMenu />}
        renderThumbnail={renderThumbnail}
        seekBackward={<SeekButton className={'arc-btn-seek'} seconds={-10} />}
        seekForward={<SeekButton className={'arc-btn-seek'} seconds={10} />}
      />
    </Controls.Root>
  );
}
