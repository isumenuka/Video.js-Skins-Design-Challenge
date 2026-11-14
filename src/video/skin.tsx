/** @jsxImportSource react */

'use client';

import '../styles/video/scaffold.css';
import './skin.css';
import './vocapedia.css';
import './effects/effects.css';
import { Container as ContainerPrimitive, Poster as PosterPrimitive, Slider as SliderPrimitive } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { VideoGestures } from './behaviors/gestures';
import { VideoHotkeys } from './behaviors/hotkeys';
import { VideoControls } from './controls';
import { EffectsProvider } from './effects/effects-context';
import { EventEffects } from './effects/event-effects';
import { BookOrnaments, PlateCaption, ThumbIndex } from './lesson/book-ornaments';
import { DualSubtitles } from './lesson/dual-subtitles';
import { EntryPage } from './lesson/entry-page';
import { ErrorDialog } from './shared/error-dialog';
import { Indicators } from './shared/indicators';
import { SeekIndicator } from './shared/seek-indicator';
import { StatusAnnouncer } from './shared/status-announcer';
import { Poster } from './shared/video-feedback';

export interface VideoSkinProps extends Omit<ContainerPrimitive.Props, 'children'> {
  children?: ReactNode;
  renderPoster?: PosterPrimitive.ImageProps['render'];
  renderThumbnail?: SliderPrimitive.Thumbnail.ImageProps['render'];
}

export function VideoSkin({ children, className, renderPoster, renderThumbnail, ...props }: VideoSkinProps = {}) {
  return (
    <ContainerPrimitive
      className={cn('media-skin', 'media-container', 'media-video', className)}
      data-theme="vocapedia"
      data-preset="video"
      {...props}
    >
      <EffectsProvider>
        {/* The open volume: the entry page, the spine, then the plate that holds the picture. */}
        <EntryPage />
        <BookOrnaments />
        <div className="voca-plate-frame" aria-hidden="true" />
        {children}
        <Poster renderImage={renderPoster} />
        <DualSubtitles />
        <PlateCaption />
        <ThumbIndex />
        <ErrorDialog />
        <VideoControls renderThumbnail={renderThumbnail} />

        <VideoHotkeys />
        <VideoGestures />
        <StatusAnnouncer />
        <Indicators>
          <SeekIndicator />
          <EventEffects />
        </Indicators>
      </EffectsProvider>
    </ContainerPrimitive>
  );
}
