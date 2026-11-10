/** @jsxImportSource react */

'use client';

import './fonts.css';
import '../styles/video/scaffold.css';
import './skin.css';
import './arcade/assets.css';
import './arcade.css';
import { Container as ContainerPrimitive, Poster as PosterPrimitive, Slider as SliderPrimitive } from '@videojs/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/resolve-class-name';

import { VideoGestures } from './behaviors/gestures';
import { VideoHotkeys } from './behaviors/hotkeys';
import { Ambient } from './arcade/ambient';
import { ArcadeAttract, ArcadeBoot, ArcadeCrt, ArcadeGlass, CabinetDoor, CabinetFrame } from './arcade/cabinet';
import { MarqueeSparks } from './arcade/marquee';
import { ScreenRatio } from './arcade/screen-ratio';
import { VideoControls } from './controls';
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
      className={cn('media-skin', 'media-arcade', 'media-container', 'media-video', className)}
      data-theme="scaffold"
      data-preset="video"
      {...props}
    >
      {children}
      <CabinetFrame />
      <Poster renderImage={renderPoster} />
      <ArcadeAttract />
      <ErrorDialog />
      <ArcadeCrt />
      <VideoControls renderThumbnail={renderThumbnail} />
      <ArcadeBoot />
      <ArcadeGlass />
      <CabinetDoor />
      <MarqueeSparks />
      <ScreenRatio />
      <Ambient />

      <VideoHotkeys />
      <VideoGestures />
      <StatusAnnouncer />
      <Indicators>
        <SeekIndicator />
      </Indicators>
    </ContainerPrimitive>
  );
}
