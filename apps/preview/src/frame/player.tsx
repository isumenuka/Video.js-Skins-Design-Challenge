import { MuxVideo } from '@videojs/react/media/mux-video';
import { VideoPlayer } from '@videojs/react/video';
import type { CSSProperties } from 'react';

import { LessonProvider } from '@/video/lesson/lesson-context';
import { sintelLesson } from '@/video/lesson/lesson-data';
import { VideoSkin } from '@/video/skin';

import type { PlaybackProps } from '../shell/params';
import { LabCredit } from './lab-page';

// What the preview plays: "Sintel" hosted on Mux (public playback ID, used for the challenge's Mux bonus).
// Sintel © copyright Blender Foundation | durian.blender.org — licensed CC BY 3.0.
const PLAYBACK_ID = 'fNEeWPY4UUEkfCFd9617w8gvYFEsFOv72rPQj3qKG700';
const SRC = `https://stream.mux.com/${PLAYBACK_ID}.m3u8`;
const POSTER = `https://image.mux.com/${PLAYBACK_ID}/thumbnail.webp?time=118`;

/**
 * `media` carries the workbench's playback options: autoplay, muted, loop, and preload. The lesson provider sits
 * inside the player so the skin's entry page and subtitles read the same playback.
 */
export function Player({ media, style }: { media?: PlaybackProps; style?: CSSProperties }) {
  return (
    <VideoPlayer poster={POSTER} defaultPlaybackRates={[0.5, 0.75, 1, 1.25, 1.5]}>
      <LessonProvider lesson={sintelLesson}>
        <div className="lab">
          <div className="lab-desk">
            <div className="preview-player" style={style}>
              <VideoSkin>
                <MuxVideo {...media} src={SRC} playsInline crossOrigin="" />
              </VideoSkin>
            </div>
          </div>
          <LabCredit />
        </div>
      </LessonProvider>
    </VideoPlayer>
  );
}
