import { MuxVideo } from '@videojs/react/media/mux-video';
import { VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';

import type { PlaybackProps } from '../shell/params';

// What the preview plays: "Sintel" hosted on Mux (public playback ID, used for the challenge's Mux bonus).
// Sintel © copyright Blender Foundation | durian.blender.org — licensed CC BY 3.0.
const PLAYBACK_ID = 'fNEeWPY4UUEkfCFd9617w8gvYFEsFOv72rPQj3qKG700';
const SRC = `https://stream.mux.com/${PLAYBACK_ID}.m3u8`;
const POSTER = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.webp?time=120`;

/** `media` carries the workbench's playback options: autoplay, muted, loop, and preload. */
export function Player({ media }: { media?: PlaybackProps }) {
  return (
    <VideoPlayer poster={POSTER}>
      <VideoSkin>
        <MuxVideo {...media} src={SRC} playsInline crossOrigin="" />
      </VideoSkin>
    </VideoPlayer>
  );
}
