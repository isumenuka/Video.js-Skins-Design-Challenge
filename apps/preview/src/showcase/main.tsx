import { type CSSProperties, StrictMode, useEffect, useState } from 'react';
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

/** Phosphor colours: the skin's one public colour token, `--media-accent-color`, recolours the whole machine. */
const PHOSPHORS = [
  { id: 'green', label: 'Green', color: '#7cff3a' },
  { id: 'amber', label: 'Amber', color: '#ffb020' },
  { id: 'cyan', label: 'Cyan', color: '#3fe6ff' },
] as const;
type Phosphor = (typeof PHOSPHORS)[number]['id'];

const STORAGE_KEY = 'console-phosphor';

function readPhosphor(): Phosphor {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (PHOSPHORS.some((p) => p.id === saved)) return saved as Phosphor;
  } catch {
    /* storage unavailable: use the default */
  }
  return 'green';
}

function Showcase() {
  const [phosphor, setPhosphor] = useState<Phosphor>(readPhosphor);
  const accent = PHOSPHORS.find((p) => p.id === phosphor)!.color;

  useEffect(() => {
    document.documentElement.dataset.phosphor = phosphor;
    try {
      localStorage.setItem(STORAGE_KEY, phosphor);
    } catch {
      /* storage unavailable: the choice just isn't remembered */
    }
  }, [phosphor]);

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

        <section className="sc-stage" aria-label="Video player" style={{ '--media-accent-color': accent } as CSSProperties}>
          <Player />
        </section>

        <fieldset className="sc-phosphor">
          <legend>Phosphor</legend>
          {PHOSPHORS.map((p) => (
            <label key={p.id} style={{ '--sc-swatch': p.color } as CSSProperties}>
              <input
                type="radio"
                name="phosphor"
                value={p.id}
                checked={phosphor === p.id}
                onChange={() => setPhosphor(p.id)}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </fieldset>

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
