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
import { ArcadeCaptions } from './arcade/arcade-captions';
import { ArcadeContext } from './arcade/context';
import { CrtShader } from './arcade/crt-shader';
import { ArcadeOptions } from './arcade/options';
import { ArcadeFeedback } from './arcade/feedback';
import { ScreenRatio } from './arcade/screen-ratio';
import { SecretMode } from './arcade/secret';
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
  /** Arcade: an image or short silent video looped on the tube before the first play (for example Mux's animated preview). */
  attractLoop?: string;
}

export function VideoSkin({
  children,
  className,
  renderPoster,
  renderThumbnail,
  attractLoop,
  ...props
}: VideoSkinProps = {}) {
  return (
    <ArcadeContext.Provider value={{ attractLoop }}>
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
        <CrtShader />
        <SecretMode />
        <ArcadeCaptions />
        <ErrorDialog />
        <ArcadeCrt />
        <VideoControls renderThumbnail={renderThumbnail} />
        <ArcadeOptions />
        <ArcadeBoot />
        <ArcadeGlass />
        <CabinetDoor />
        <MarqueeSparks />
        <ArcadeFeedback />
        <ScreenRatio />
        <Ambient />

        <VideoHotkeys />
        <VideoGestures />
        <StatusAnnouncer />
        <Indicators>
          <SeekIndicator />
        </Indicators>
      </ContainerPrimitive>
    </ArcadeContext.Provider>
  );
}
