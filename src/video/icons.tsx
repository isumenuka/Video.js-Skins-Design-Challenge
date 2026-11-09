/** @jsxImportSource react */

/**
 * Console icon set — drawn for this skin.
 *
 * One grid: 20×20 viewBox, rendered at 20px (`--con-icon`).
 * One pen: 2px stroke, square caps, mitred joins, chamfered corners — stencilled hardware labels.
 * The only filled shape is the LED (`.con-led`), which the skin lights green.
 *
 * Exports use the names of `@videojs/react/icons/scaffold`, so the skin's components only swap the import path.
 */

import { forwardRef, type ReactNode, type SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function createIcon(name: string, children: ReactNode) {
  const Icon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      ref={ref}
      {...props}
    >
      {children}
    </svg>
  ));
  Icon.displayName = name;
  return Icon;
}

function Led({ x, y, s = 3 }: { x: number; y: number; s?: number }) {
  return <rect className="con-led" x={x} y={y} width={s} height={s} fill="currentColor" stroke="none" />;
}

const SPEAKER = 'M3 7.5h3l4-3.5v12l-4-3.5H3z';
const PANEL = 'M4 4h12l2 2v8l-2 2H4l-2-2V6z';

/* Transport */
export const PlayIcon = createIcon('PlayIcon', <path d="M6 4.5 15.5 10 6 15.5z" />);
export const PauseIcon = createIcon('PauseIcon', <path d="M7 5v10M13 5v10" />);
export const RestartIcon = createIcon(
  'RestartIcon',
  <>
    <path d="M4 10a6 6 0 1 0 1.76-4.24" />
    <path d="M4 3.5V7h3.5" />
  </>
);
/** Clockwise arrow; the skin mirrors it for skipping back and prints the seconds inside. */
export const SeekIcon = createIcon(
  'SeekIcon',
  <>
    <path d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6" />
    <path d="M16.5 2.5v3.5H13" />
  </>
);

/* Volume */
export const VolumeHighIcon = createIcon(
  'VolumeHighIcon',
  <>
    <path d={SPEAKER} />
    <path d="M13 7.5a3.5 3.5 0 0 1 0 5M15.5 5a7 7 0 0 1 0 10" />
  </>
);
export const VolumeLowIcon = createIcon(
  'VolumeLowIcon',
  <>
    <path d={SPEAKER} />
    <path d="M13 7.5a3.5 3.5 0 0 1 0 5" />
  </>
);
export const VolumeOffIcon = createIcon(
  'VolumeOffIcon',
  <>
    <path d={SPEAKER} />
    <path d="m13.5 8 4 4m0-4-4 4" />
  </>
);

/* Captions: "on" shows the text lines, "off" strikes the panel through. */
export const CaptionsOnIcon = createIcon(
  'CaptionsOnIcon',
  <>
    <path d={PANEL} />
    <path d="M5.5 9h3m2 0h4M5.5 12h5m2 0h2" />
  </>
);
export const CaptionsOffIcon = createIcon(
  'CaptionsOffIcon',
  <>
    <path d={PANEL} />
    <path d="m6 14 8-8" />
  </>
);

/* Screen */
export const FullscreenEnterIcon = createIcon(
  'FullscreenEnterIcon',
  <path d="M3 7.5V3h4.5m5 0H17v4.5m0 5V17h-4.5m-5 0H3v-4.5" />
);
export const FullscreenExitIcon = createIcon(
  'FullscreenExitIcon',
  <path d="M7.5 3v4.5H3m14 0h-4.5V3m0 14v-4.5H17M3 12.5h4.5V17" />
);
export const PipEnterIcon = createIcon(
  'PipEnterIcon',
  <>
    <path d={PANEL} />
    <path d="M10.5 10h4v3h-4z" />
  </>
);
export const PipExitIcon = createIcon(
  'PipExitIcon',
  <>
    <path d={PANEL} />
    <path d="m13.5 12.5-5-5m0 3v-3h3" />
  </>
);
const MONITOR = 'M5.5 15H3V4h14v11h-2.5';
export const AirPlayEnterIcon = createIcon(
  'AirPlayEnterIcon',
  <>
    <path d={MONITOR} />
    <path d="m10 11.5 3.5 5h-7z" />
  </>
);
export const AirPlayExitIcon = createIcon(
  'AirPlayExitIcon',
  <>
    <path d={MONITOR} />
    <path d="m10 11.5 3.5 5h-7z" />
    <Led x={8.5} y={6.5} />
  </>
);
const CAST = 'M2.5 7V4h15v12H11';
const WAVES = 'M2.5 10a6 6 0 0 1 6 6M2.5 13a3 3 0 0 1 3 3';
export const CastEnterIcon = createIcon(
  'CastEnterIcon',
  <>
    <path d={CAST} />
    <path d={WAVES} />
  </>
);
export const CastExitIcon = createIcon(
  'CastExitIcon',
  <>
    <path d={CAST} />
    <path d={WAVES} />
    <Led x={12} y={8} />
  </>
);

/* Menus */
/** Settings is a hex nut — hardware, not a cog. */
export const GearIcon = createIcon(
  'GearIcon',
  <>
    <path d="M10 2.5 16.5 6.25v7.5L10 17.5l-6.5-3.75v-7.5z" />
    <path d="M8 8h4v4H8z" />
  </>
);
export const SpeedIcon = createIcon(
  'SpeedIcon',
  <>
    <path d="M3 15a7 7 0 1 1 14 0" />
    <path d="m10 15 3.5-4.5" />
  </>
);
export const SpeechIcon = createIcon('SpeechIcon', <path d="M3 4h14v9h-7l-4 3v-3H3z" />);
export const SwitchesIcon = createIcon(
  'SwitchesIcon',
  <>
    <path d="M3 6.5h2m5 0h7M3 13.5h7m5 0h2" />
    <path d="M6 5h3v3H6zM11 12h3v3h-3z" />
  </>
);
export const QualityIcon = SwitchesIcon;
/** A selected menu row is marked with a lit LED. */
export const CheckIcon = createIcon('CheckIcon', <Led x={6.5} y={6.5} s={7} />);
export const ChevronIcon = createIcon('ChevronIcon', <path d="m7.5 5 5 5-5 5" />);

/** Buffering: a segmented ring that turns through `--media-spinner-animation` (set to `none` under reduced motion). */
export const SpinnerIcon = createIcon(
  'SpinnerIcon',
  <>
    <style>{'@keyframes con-spin{to{transform:rotate(360deg)}}'}</style>
    <circle
      cx="10"
      cy="10"
      r="7"
      strokeDasharray="3.5 2"
      strokeLinecap="butt"
      style={{
        transformBox: 'view-box',
        transformOrigin: 'center',
        animation: 'var(--media-spinner-animation, con-spin 1.2s steps(8) infinite)',
      }}
    />
  </>
);
