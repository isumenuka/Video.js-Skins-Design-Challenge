import { I18nProvider } from '@videojs/react/i18n';
import { type CSSProperties, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './preview.css';
import { playbackProps, playerStyles } from '../shell/params';
import { initialParams, onParamsChange } from './frame';
import { Player } from './player';

const framed = window.self !== window.top;

/** The workbench shares this origin; another site embedding the player (such as Vocapedia) doesn't. */
function inWorkbench() {
  if (!framed) return false;
  try {
    return window.parent.location.origin === window.location.origin;
  } catch {
    return false;
  }
}
const workbench = inWorkbench();

// Embedded in another page (the workbench, or a site such as Vocapedia), the host page carries the film credit and its
// own margins, so the player drops its credit line and outer padding to give the volume every pixel it can.
if (framed) document.documentElement.dataset.framed = '';

function Preview() {
  const [params, setParams] = useState(initialParams);

  useEffect(() => onParamsChange(setParams), []);

  return (
    // The provider loads Video.js's built-in translations for the selected language.
    <I18nProvider locale={params.locale}>
      {/* Inside the workbench the options panel sizes the player; anywhere else, the player fits its window. */}
      <Player
        media={playbackProps(params)}
        style={(workbench ? playerStyles(params) : undefined) as CSSProperties | undefined}
      />
    </I18nProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>
);
