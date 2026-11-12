/** @jsxImportSource react */

import { Poster as PosterPrimitive } from '@videojs/react';
import { BufferingIndicator as BufferingIndicatorPrimitive, Controls } from '@videojs/react';
import { QuillIcon } from '@/video/desk-icons';
import { SpinnerIcon as SpinnerIconPrimitive } from '@/video/icons';
import type { ClassValue } from 'cn';

import { cn, resolveClassName } from '@/lib/resolve-class-name';

export function Poster({ renderImage }: { renderImage?: PosterPrimitive.ImageProps['render'] } = {}) {
  return (
    <PosterPrimitive.Root className={'media-poster'}>
      <PosterPrimitive.Image render={renderImage} className={'media-poster-image'} />
    </PosterPrimitive.Root>
  );
}

export function BufferingIndicator({ className }: { className?: ClassValue } = {}) {
  return (
    <BufferingIndicatorPrimitive
      className={(state) => cn('media-buffering-indicator', resolveClassName(className, state))}
    >
      <SpinnerIconPrimitive className={'media-buffering-indicator-spinner-icon'} />
      {/* While the film loads, a quill writes a line of ink across the plate. */}
      <span className={'voca-writing'} aria-hidden="true">
        <span className={'voca-writing-line'}>
          <QuillIcon className={'voca-writing-quill'} inked />
        </span>
        <span className={'voca-writing-text'}>turning the page…</span>
      </span>
    </BufferingIndicatorPrimitive>
  );
}

export function VideoBufferingIndicator() {
  return (
    <Controls.Group className={'media-buffering-indicator-controls'}>
      <BufferingIndicator className={'media-buffering-indicator-backdrop'} />
    </Controls.Group>
  );
}
