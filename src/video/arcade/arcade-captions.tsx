/** @jsxImportSource react */

import { type CSSProperties, useEffect, useRef, useState } from 'react';

import { useArcadePrefs } from './prefs';

/**
 * Arcade captions (Settings → Arcade): the showing captions track is drawn as a retro game dialogue box — a pixel
 * border, a bright phosphor text and a typewriter reveal for each new line — instead of the browser's native captions,
 * which are hidden while this is on. Off by default; plain captions stay the readable default. Under reduced motion
 * the text appears at once. The box is `aria-hidden` because the native track is still the accessible source.
 */
export function ArcadeCaptions() {
  const { arcadeCaptions } = useArcadePrefs();
  const anchor = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.media-skin');
    root?.toggleAttribute('data-arcade-captions', arcadeCaptions);
    const video = root?.querySelector('video');
    if (!arcadeCaptions || !video) {
      setLines(null);
      return;
    }
    let track: TextTrack | undefined;
    const update = () => {
      const cues = track?.activeCues ? [...track.activeCues] : [];
      if (!cues.length) return setLines(null);
      const text = cues.map((c) => (c as VTTCue).text.replace(/<[^>]+>/g, '')).join('\n');
      setLines({ id: `${cues[0]!.startTime}`, text });
    };
    const pick = () => {
      track?.removeEventListener('cuechange', update);
      track = [...video.textTracks].find((t) => (t.kind === 'captions' || t.kind === 'subtitles') && t.mode === 'showing');
      track?.addEventListener('cuechange', update);
      update();
    };
    pick();
    video.textTracks.addEventListener('change', pick);
    return () => {
      video.textTracks.removeEventListener('change', pick);
      track?.removeEventListener('cuechange', update);
    };
  }, [arcadeCaptions]);

  return (
    <>
      <span ref={anchor} hidden />
      {arcadeCaptions && lines && (
        <div className={'arc-captions'} aria-hidden="true">
          <span key={lines.id} className={'arc-captions-text'} style={{ '--arc-chars': lines.text.length } as CSSProperties}>
            {lines.text}
          </span>
        </div>
      )}
    </>
  );
}
