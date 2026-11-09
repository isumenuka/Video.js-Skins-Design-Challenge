/** @jsxImportSource react */

import { VolumeSlider } from '@videojs/react';

import { MuteButton } from '../shared/mute-button';
import { ButtonTooltip } from '../shared/tooltip';

/**
 * Mute key plus an inline mixing-desk fader, in place of Scaffold's volume popover. Both are Video.js components, so
 * labels, keyboard control (arrows, Home/End) and `aria-valuetext` come from the library.
 */
export function VolumeFader() {
  return (
    <div className={'con-volume'}>
      <ButtonTooltip>
        <MuteButton />
      </ButtonTooltip>
      <VolumeSlider.Root className={'media-volume-slider con-fader'} orientation="horizontal" thumbAlignment="edge">
        <VolumeSlider.Track className={'media-volume-slider-track con-fader-track'}>
          <VolumeSlider.Fill className={'media-volume-slider-fill con-fader-fill'} />
        </VolumeSlider.Track>
        <VolumeSlider.Thumb className={'media-volume-slider-thumb con-fader-thumb'} />
      </VolumeSlider.Root>
    </div>
  );
}
