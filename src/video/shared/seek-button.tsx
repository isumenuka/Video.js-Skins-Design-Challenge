/** @jsxImportSource react */

import { SeekButton as SeekButtonPrimitive } from '@videojs/react';
import { DogEarIcon } from '@/video/desk-icons';
import type { ClassValue } from 'cn';

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

  return (
    <ButtonTooltip disabled={!tooltip}>
      <SeekButtonPrimitive
        render={<Button className={'voca-desk-button'} />}
        className={(state) => cn(resolveClassName(className, state))}
        seconds={seconds}
      >
        {/* A dog-eared page corner, the seconds written on it. */}
        <DogEarIcon
          className={cn('voca-desk-icon', 'voca-dog-ear', iconClassName)}
          direction={backward ? 'back' : 'forward'}
        />
      </SeekButtonPrimitive>
    </ButtonTooltip>
  );
}
