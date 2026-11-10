import { type CSSProperties, StrictMode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './showcase.css';
import { FilmCredit, Player } from '../frame/player';

/**
 * Game cartridges: each recolours the cabinet through the skin's public tokens, `--arc-cabinet-filter` (the paint)
 * and `--media-accent-color` (the phosphor).
 */
const CARTRIDGES = [
  { id: 'green', label: 'Green', accent: '#7cff3a', filter: 'none' },
  { id: 'red', label: 'Red', accent: '#ff4d5e', filter: 'hue-rotate(-150deg) saturate(1.2)' },
  { id: 'blue', label: 'Blue', accent: '#3fc8ff', filter: 'hue-rotate(70deg) saturate(1.1)' },
  { id: 'gold', label: 'Gold', accent: '#ffc93a', filter: 'hue-rotate(-105deg) saturate(1.6) brightness(1.15)' },
] as const;
type Cartridge = (typeof CARTRIDGES)[number]['id'];
const CARTRIDGE_KEY = 'arcade-cartridge';

function readCartridge(): Cartridge {
  try {
    const saved = localStorage.getItem(CARTRIDGE_KEY);
    if (CARTRIDGES.some((c) => c.id === saved)) return saved as Cartridge;
  } catch {
    /* storage unavailable */
  }
  return 'green';
}

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
  const [cartridge, setCartridge] = useState<Cartridge>(readCartridge);
  const cart = CARTRIDGES.find((c) => c.id === cartridge)!;
  useEffect(() => {
    document.documentElement.dataset.cartridge = cartridge;
    try {
      localStorage.setItem(CARTRIDGE_KEY, cartridge);
    } catch {
      /* storage unavailable: the choice just isn't remembered */
    }
  }, [cartridge]);
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
          <section
            className="sc-stage"
            aria-label="Video player"
            ref={stage}
            style={{ '--media-accent-color': cart.accent, '--arc-cabinet-filter': cart.filter } as CSSProperties}
          >
            <Player />
          </section>
        </div>

        <details className="sc-drawer">
          <summary>
            <span>Cartridges</span>
            <svg className="sc-drawer-chevron" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </summary>
          <section className="sc-keys-bar" aria-label="Cartridges">
          <fieldset className="sc-carts">
            <legend>Cartridge</legend>
            {CARTRIDGES.map((c) => (
              <label key={c.id} style={{ '--sc-cart': c.accent } as CSSProperties}>
                <input
                  type="radio"
                  name="cartridge"
                  value={c.id}
                  checked={cartridge === c.id}
                  onChange={() => setCartridge(c.id)}
                />
                <span>{c.label}</span>
              </label>
            ))}
          </fieldset>
          </section>
        </details>

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
