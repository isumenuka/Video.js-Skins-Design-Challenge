/** @jsxImportSource react */

import type { ReactNode } from 'react';

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
      <VideoBufferingIndicator />
      <ControlsContent
        live={live}
        menu={menu}
        renderThumbnail={renderThumbnail}
        seekBackward={seekBackward}
        seekForward={seekForward}
      />
    </>
  );
}
