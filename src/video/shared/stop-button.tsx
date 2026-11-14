/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';

import { ClaspIcon } from '@/video/desk-icons';
import { useFireEffect } from '@/video/effects/effects-context';

import { Button } from './button';
import { ButtonTooltip } from './tooltip';

/** The brass clasp: stops the film and closes the book back at its first page. */
export function StopButton() {
  const store = usePlayer();
  const fire = useFireEffect();
  return (
    <ButtonTooltip label="Stop">
      <Button
        className="voca-desk-button voca-stop-button"
        aria-label="Stop"
        onClick={() => {
          fire({ kind: 'stop' });
          store.pause();
          void store.seek(0);
        }}
      >
        <ClaspIcon className="voca-desk-icon" />
      </Button>
    </ButtonTooltip>
  );
}
