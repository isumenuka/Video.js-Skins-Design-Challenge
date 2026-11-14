/** @jsxImportSource react */

import { SeekButton as SeekButtonPrimitive } from '@videojs/react';
import { SeekArrowIcon } from '@/video/desk-icons';
import type { ClassValue } from 'cn';

import { useFireEffect } from '@/video/effects/effects-context';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

import { Button } from './button';
import { ButtonTooltip } from './tooltip';

/**
 * Skips playback by a fixed amount. `seconds` has to match the arrow-key hotkey the skin registers, or the engine will
 * not mirror `aria-keyshortcuts` onto the button.
 */
export function SeekButton({
  className,
  iconClassName,
  seconds,
  tooltip = true,
}: {
  className?: ClassValue;
  iconClassName?: ClassValue;
  seconds: number;
  tooltip?: boolean;
}) {
  const backward = seconds < 0;
  const fire = useFireEffect();

  return (
    <ButtonTooltip disabled={!tooltip}>
      <SeekButtonPrimitive
        render={<Button className={'voca-desk-button'} />}
        className={(state) => cn(resolveClassName(className, state))}
        seconds={seconds}
        onClick={() => fire({ kind: 'skip', direction: backward ? 'back' : 'forward', seconds: Math.abs(seconds) })}
      >
        {/* A brass circular arrow, the seconds written inside it. */}
        <SeekArrowIcon
          className={cn('voca-desk-icon', 'voca-seek-arrow', iconClassName)}
          data-direction={backward ? 'back' : 'forward'}
          direction={backward ? 'back' : 'forward'}
        />
      </SeekButtonPrimitive>
    </ButtonTooltip>
  );
}
