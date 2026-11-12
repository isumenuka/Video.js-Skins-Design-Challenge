import { I18nProvider } from '@videojs/react/i18n';
import { type CSSProperties, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import '@/skin.css';
import './preview.css';
import { playbackProps, playerStyles } from '../shell/params';
import { initialParams, onParamsChange } from './frame';
import { Player } from './player';

const framed = window.self !== window.top;

function Preview() {
  const [params, setParams] = useState(initialParams);

  useEffect(() => onParamsChange(setParams), []);

  return (
    // The provider loads Video.js's built-in translations for the selected language.
    <I18nProvider locale={params.locale}>
      {/* Inside the workbench the options panel sizes the player; on its own, the player fills its column. */}
      <Player
        media={playbackProps(params)}
        style={(framed ? playerStyles(params) : undefined) as CSSProperties | undefined}
      />
    </I18nProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>
);
