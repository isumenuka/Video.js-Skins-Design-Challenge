import { MuxVideo } from '@videojs/react/media/mux-video';
import { VideoPlayer } from '@videojs/react/video';
import type { CSSProperties } from 'react';

import { VideoSkin } from '@/video/skin';

import type { PlaybackProps } from '../shell/params';

/**
 * The film the player shows, hosted on Mux (public playback ID — the challenge's Mux bonus).
 * To switch films, change this one object; the showcase and preview credits read it too.
 */
export const FILM = {
  title: 'Sintel',
  playbackId: 'fNEeWPY4UUEkfCFd9617w8gvYFEsFOv72rPQj3qKG700',
  posterTime: 336,
  /** The film's frame shape (1920×818), so the cabinet's screen is the right shape before metadata loads. */
  aspect: 1920 / 818,
  /** English captions and chapter markers, served from `apps/preview/public`. */
  captions: './sintel-en.vtt' as string | null,
  chapters: './sintel-chapters.vtt' as string | null,
  credit: { owner: 'Blender Foundation', site: 'durian.blender.org', license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/' },
};

const SRC = `https://stream.mux.com/${FILM.playbackId}.m3u8`;
const POSTER = `https://image.mux.com/${FILM.playbackId}/thumbnail.webp?time=${FILM.posterTime}`;

/** `media` carries the workbench's playback options: autoplay, muted, loop, and preload. */
export function Player({ media }: { media?: PlaybackProps }) {
  return (
    <VideoPlayer poster={POSTER} title={FILM.title}>
      <VideoSkin style={{ '--arc-screen-ratio': FILM.aspect } as CSSProperties}>
        <MuxVideo {...media} src={SRC} playsInline crossOrigin="">
          {FILM.captions && <track kind="captions" srcLang="en" label="English" src={FILM.captions} />}
          {FILM.chapters && <track kind="chapters" srcLang="en" label="Chapters" src={FILM.chapters} default />}
        </MuxVideo>
      </VideoSkin>
    </VideoPlayer>
  );
}

/** The film's credit line (CC BY requires it wherever the film plays). */
export function FilmCredit() {
  const { owner, site, license, licenseUrl } = FILM.credit;
  return (
    <>
      <cite>{FILM.title}</cite> (CC) {owner} |{' '}
      <a href={`https://${site}`} target="_blank" rel="noreferrer">
        {site}
      </a>{' '}
      ·{' '}
      <a href={licenseUrl} target="_blank" rel="noreferrer">
        {license}
      </a>
    </>
  );
}
