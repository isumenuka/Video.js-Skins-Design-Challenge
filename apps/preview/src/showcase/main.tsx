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

        <section className="sc-keys-bar" aria-label="Keyboard shortcuts">
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
