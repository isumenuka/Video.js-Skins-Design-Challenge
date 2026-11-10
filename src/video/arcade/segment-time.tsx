/** @jsxImportSource react */

import { Time } from '@videojs/react';

/** Every digit becomes 8 — the unlit segments a real 7-segment display shows behind the lit ones. */
const ghost = (text: string) => text.replace(/\d/g, '8');

/**
 * Time on a 7-segment readout. The values are Video.js `Time.Value`s (labels, `data-*` state and the narrow-width
 * toggle all come from the library); the render prop only adds the unlit "88:88" ghost as a data attribute that CSS
 * paints behind the digits.
 */
export function SegmentTime() {
  return (
    <Time.Group className={'media-time-group arc-readout'}>
      <Time.Value
        className={'media-time-toggle arc-seg'}
        type="current"
        toggle
        render={(props, state) => <button {...props} data-ghost={ghost(state.text)} />}
      />
      <Time.Value
        className={'media-time-current-value arc-seg'}
        type="current"
        render={(props, state) => <span {...props} data-ghost={ghost(state.text)} />}
      />
      <Time.Separator className={'media-time-separator'} />
      <Time.Value
        className={'media-time-duration-value arc-seg'}
        type="duration"
        render={(props, state) => <span {...props} data-ghost={ghost(state.text)} />}
      />
    </Time.Group>
  );
}
