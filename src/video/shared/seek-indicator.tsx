/** @jsxImportSource react */

import { SeekIndicator as SeekIndicatorPrimitive } from '@videojs/react';

import { cn } from '@/lib/resolve-class-name';

/**
 * Feedback for the arrow-key and double-tap seeks: the same folded page corner the ±10 buttons show, on the side it
 * seeks towards, with the (accumulating) seconds written on its back.
 */
export function SeekIndicator() {
  return (
    <SeekIndicatorPrimitive.Root className={cn('media-indicator', 'media-seek-indicator', 'voca-fx-corner')}>
      <span className={'voca-fx-corner-leaf'}>
        <SeekIndicatorPrimitive.Value className={cn('media-seek-indicator-value', 'voca-fx-corner-value')} />
      </span>
    </SeekIndicatorPrimitive.Root>
  );
}
