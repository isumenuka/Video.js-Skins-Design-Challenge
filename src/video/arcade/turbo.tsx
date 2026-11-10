/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';

import { cn } from '@/lib/resolve-class-name';

import { ButtonTooltip } from '../shared/tooltip';
import { arcadeText, useArcadeTranslator } from './i18n';

const RATES = [1, 1.5, 2] as const;

/** A lightning bolt, drawn on the skin's 20px icon grid. */
function BoltIcon() {
  return (
    <svg className={'media-button-icon'} viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinejoin="miter" aria-hidden="true" focusable="false">
      <path d="M11 2 4 11h5l-1 7 7-9h-5z" />
    </svg>
  );
}

/**
 * TURBO: one press speeds the film up — 1× → 1.5× → 2× → back to 1×. It lights while faster than normal, and its name
 * says the rate ("Turbo, 1.5×"). Speed is also in the settings menu.
 */
export function TurboButton() {
  const store = usePlayer();
  const rate = usePlayer((s) => s.playbackRate) ?? 1;
  const availability = usePlayer((s) => s.playbackRateAvailability);
  const t = useArcadeTranslator();
  if (availability === 'unsupported') return null;
  const index = RATES.findIndex((r) => Math.abs(r - rate) < 0.01);
  const next = RATES[(index + 1) % RATES.length] ?? 1;
  const label = `${t(arcadeText.turbo)}, ${rate}×`;
  return (
    <ButtonTooltip label={label}>
      <button
        type="button"
        className={cn('media-button', 'arc-btn-turbo')}
        aria-label={label}
        aria-pressed={rate > 1}
        data-active={rate > 1 ? '' : undefined}
        disabled={availability !== 'available'}
        onClick={() => store.setPlaybackRate(next)}
      >
        <BoltIcon />
      </button>
    </ButtonTooltip>
  );
}
