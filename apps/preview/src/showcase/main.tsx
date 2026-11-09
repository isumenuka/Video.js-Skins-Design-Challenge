import { StrictMode } from 'react';
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

function Showcase() {
  return (
    <>
      <picture className="sc-bg" aria-hidden="true">
        <source media="(max-aspect-ratio: 3/4)" srcSet="./showcase/lab-tall.webp" />
        <img src="./showcase/lab-wide.webp" alt="" decoding="async" />
      </picture>

      <main className="sc-page">
        <header className="sc-header">
          <p className="sc-kicker">
            <span className="sc-led" aria-hidden="true" /> Video.js 10 skin
          </p>
          <h1 className="sc-title">Console</h1>
        </header>

        <section className="sc-stage" aria-label="Video player">
          <Player />
        </section>

        <section className="sc-notes">
          <div className="sc-card">
            <h2>Design notes</h2>
            <p>
              Console turns the player into a piece of lab hardware: an armoured monitor above a control deck that never
              hides and never covers the picture. Time runs on a 7-segment readout with its unlit “88:88” ghost, the seek
              bar is an LED strip, and a live oscilloscope traces the film’s real audio. Every toggle key carries a status
              LED, and the icon changes too, so state is never colour alone.
            </p>
            <p>
              Keys are 40&nbsp;px (44&nbsp;px on touch), every control shares one green focus ring, and the deck re-flows
              with container queries down to phone widths. With reduced motion on, the boot sequence, turbines, flicker
              and scope animation all stand still.
            </p>
          </div>

          <div className="sc-card">
            <h2>Try it with a keyboard</h2>
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
            <p className="sc-links">
              <a href="./workbench.html">Open the workbench</a> to test any size, language or direction.
            </p>
          </div>
        </section>

        <footer className="sc-footer">
          <p>
            Film: <FilmCredit />. Streamed by Mux. Background art generated with invideo AI. Fonts: Chakra Petch and DSEG7 (SIL OFL).
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
