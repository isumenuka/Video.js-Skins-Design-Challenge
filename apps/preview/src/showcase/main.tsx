import { StrictMode, useLayoutEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './showcase.css';
import { FilmCredit, Player } from '../frame/player';

const KEYS: [string, string][] = [
  ['Space / K', 'Play or pause'],
  ['← →', 'Skip 10 s'],
  ['↑ ↓', 'Volume'],
  ['M', 'Mute'],
  ['C', 'Captions'],
  ['F', 'Fullscreen'],
  ['I', 'Picture-in-picture'],
];

const STICKS: [string, string][] = [
  ['Left stick', 'Hold to scrub, tap to skip 5 s'],
  ['Right stick', 'Hold up or down for volume'],
];

const MAX_WIDTH = 1040;
const MIN_ZOOM = 0.45;

/**
 * Fits the cabinet in its cell so the whole page is one screen with no scrolling. The cabinet keeps the layout it has
 * at the full available width (its hood and control panel have fixed heights, so making it narrower wouldn't make it
 * short enough), and the stage is zoomed down evenly until its height fits. Re-runs when the window resizes; the zoom
 * is lifted in fullscreen. If the window is too short even at the smallest zoom, the page falls back to scrolling
 * (`html.sc-tight`).
 */
function useFitStage() {
  const cell = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const box = cell.current;
    const el = stage.current;
    if (!box || !el) return;
    let frame = 0;

    const fit = () => {
      // Fullscreen: the player fills the screen by itself, unzoomed.
      if (document.fullscreenElement) {
        el.style.zoom = '';
        return;
      }
      const availW = Math.floor(Math.min(MAX_WIDTH, box.clientWidth));
      // The window's height minus everything around the cell (header, key hints, credits, gaps). Measured this way
      // it stays the same whether or not the page has fallen back to scrolling.
      const page = box.parentElement!;
      const around = page.getBoundingClientRect().height - box.getBoundingClientRect().height;
      const availH = window.innerHeight - around;
      // Natural size at the full width, then the zoom that makes it fit.
      el.style.zoom = '';
      el.style.setProperty('--sc-stage-width', `${availW}px`);
      const natural = el.getBoundingClientRect().height;
      const zoom = Math.min(1, availH / natural);
      el.style.zoom = String(Math.max(MIN_ZOOM, zoom));
      document.documentElement.classList.toggle('sc-tight', zoom < MIN_ZOOM);
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };

    fit();
    const ro = new ResizeObserver(schedule);
    ro.observe(box);
    window.addEventListener('resize', schedule);
    document.fonts?.ready.then(schedule);
    document.addEventListener('fullscreenchange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      document.removeEventListener('fullscreenchange', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return { cell, stage };
}

function Showcase() {
  const { cell, stage } = useFitStage();
  return (
    <>
      <picture className="sc-bg" aria-hidden="true">
        <source media="(max-aspect-ratio: 3/4)" srcSet="./showcase/arcade-tall.webp" />
        <img src="./showcase/arcade-wide.webp" alt="" decoding="async" />
      </picture>

      <main className="sc-page">
        {/* No visible heading: the cabinet is the page. The heading stays for screen readers. */}
        <h1 className="sc-visually-hidden">Arcade, a Video.js 10 skin</h1>

        <div className="sc-stage-cell" ref={cell}>
          <section className="sc-stage" aria-label="Video player" ref={stage}>
            <Player />
          </section>
        </div>

        <section className="sc-keys-bar" aria-label="Controls">
          <dl className="sc-keys">
            {STICKS.map(([key, action]) => (
              <div key={key}>
                <dt>
                  <kbd className="sc-stick">{key}</kbd>
                </dt>
                <dd>{action}</dd>
              </div>
            ))}
          </dl>
          <dl className="sc-keys">
            {KEYS.map(([key, action]) => (
              <div key={key}>
                <dt>
                  <kbd>{key}</kbd>
                </dt>
                <dd>{action}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="sc-footer">
          <p title="Film: Sintel (CC) Blender Foundation | durian.blender.org · CC BY 3.0. Streamed by Mux. Cabinet and background art generated with invideo AI. Fonts: Anton, Chakra Petch and DSEG7 (SIL OFL).">
            Film: <FilmCredit />. Streamed by Mux. Cabinet and background art generated with invideo AI. Fonts: Anton, Chakra
            Petch and DSEG7 (SIL OFL).
          </p>
        </footer>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Showcase />
  </StrictMode>
);
