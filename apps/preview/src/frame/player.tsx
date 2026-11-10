import { MuxData } from '@videojs/react/extensions/mux-data';
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
/** A short silent loop from the film for the cabinet's attract screen (Mux's animated preview). */
const ATTRACT = `https://image.mux.com/${FILM.playbackId}/animated.webp?start=300&end=306&width=640&fps=15`;
/** Mux Data: Mux-hosted playback needs no environment key (views go to the environment that owns the playback ID). */
const MUX_DATA_ENV_KEY = (import.meta.env.VITE_MUX_DATA_ENV_KEY as string | undefined) || undefined;

/** `media` carries the workbench's playback options: autoplay, muted, loop, and preload. */
export function Player({ media }: { media?: PlaybackProps }) {
  return (
    <VideoPlayer poster={POSTER} title={FILM.title}>
      <VideoSkin style={{ '--arc-screen-ratio': FILM.aspect } as CSSProperties} attractLoop={ATTRACT}>
        <MuxVideo {...media} src={SRC} playsInline crossOrigin="">
          {FILM.captions && <track kind="captions" srcLang="en" label="English" src={FILM.captions} />}
          {FILM.chapters && <track kind="chapters" srcLang="en" label="Chapters" src={FILM.chapters} default />}
        </MuxVideo>
        <MuxData {...(MUX_DATA_ENV_KEY ? { envKey: MUX_DATA_ENV_KEY } : {})} />
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
