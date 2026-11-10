/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef } from 'react';

import { buzz, playSfx } from './sfx';

/**
 * Arcade feedback for the whole panel, in one place: a click and a short vibration when an arcade button is pressed,
 * a thunk when a joystick is grabbed, the tube's power-on hum when the film starts and its power-off when it ends.
 * Sounds follow the skin's "Sound effects" option and stay silent while the film is muted; vibration follows
 * "Vibration" and reduced motion. Renders nothing.
 */
export function ArcadeFeedback() {
  const anchor = useRef<HTMLSpanElement>(null);
  const muted = usePlayer((s) => s.muted) ?? false;
  const paused = usePlayer((s) => s.paused);
  const ended = usePlayer((s) => s.ended);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const wasPlaying = useRef(false);
  const touched = useRef(false);

  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.media-skin');
    if (!root) return;
    const onDown = (e: PointerEvent) => {
      touched.current = true;
      const el = e.target as HTMLElement;
      if (el.closest('.arc-stick')) {
        playSfx('thunk', mutedRef.current);
        buzz(14);
      } else if (el.closest('.video-controls-bottom .media-button, .video-controls-center-button')) {
        playSfx('click', mutedRef.current);
        buzz(8);
      }
    };
    const onKey = () => {
      touched.current = true;
    };
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('keydown', onKey);
    return () => {
      root.removeEventListener('pointerdown', onDown);
      root.removeEventListener('keydown', onKey);
    };
  }, []);

  // Power on when playback starts from stopped; power off when the film ends. Only after a viewer interaction.
  useEffect(() => {
    if (!touched.current) return;
    if (!paused && !wasPlaying.current) playSfx('boot', mutedRef.current);
    wasPlaying.current = !paused;
  }, [paused]);

  useEffect(() => {
    if (ended && touched.current) playSfx('off', mutedRef.current);
    if (ended) wasPlaying.current = false;
  }, [ended]);

  return <span ref={anchor} hidden />;
}
