/** @jsxImportSource react */

import { useEffect, useRef } from 'react';

const MIN_RATIO = 4 / 3;
const MAX_RATIO = 2.4;

/**
 * Shapes the cabinet's screen to the film: once the media reports its frame size, sets `--arc-screen-ratio` on the
 * player, so a widescreen film fills the monitor instead of sitting between black bars. Hosts can pass the ratio up
 * front (style `--arc-screen-ratio`) to avoid a jump before metadata loads.
 */
export function ScreenRatio() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.media-skin');
    const video = root?.querySelector('video');
    if (!root || !video) return;

    const apply = () => {
      if (!video.videoWidth || !video.videoHeight) return;
      const ratio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, video.videoWidth / video.videoHeight));
      root.style.setProperty('--arc-screen-ratio', ratio.toFixed(4));
    };

    apply();
    video.addEventListener('loadedmetadata', apply);
    video.addEventListener('resize', apply);
    return () => {
      video.removeEventListener('loadedmetadata', apply);
      video.removeEventListener('resize', apply);
    };
  }, []);

  return <span ref={anchor} hidden />;
}
