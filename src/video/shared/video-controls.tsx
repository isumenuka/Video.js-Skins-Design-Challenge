/** @jsxImportSource react */

import { Controls } from '@videojs/react';
import type { ReactNode } from 'react';

import { LabTopBar } from '../lesson/lab-controls';
import { ControlsContent, type ControlsSlots } from './controls';
import { VideoBufferingIndicator } from './video-feedback';

export function VideoControlsContent({
  live = false,
  menu,
  renderThumbnail,
  seekBackward,
  seekForward,
}: ControlsSlots & { live?: boolean; menu?: ReactNode } = {}) {
  return (
    <>
      <Controls.Backdrop className={'video-controls-backdrop'} />
      <VideoBufferingIndicator />
      <ControlsContent
        live={live}
        menu={menu}
        renderThumbnail={renderThumbnail}
        seekBackward={seekBackward}
        seekForward={seekForward}
        top={<LabTopBar />}
      />
    </>
  );
}
