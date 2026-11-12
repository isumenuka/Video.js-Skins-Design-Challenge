/** @jsxImportSource react */

/*
 * The Vocapedia Language Lab icon set: a 24px grid, 2px round strokes, filled only where a glyph needs weight to
 * read over video (play, pause, the speaker body). Exports keep the names of the Video.js icon modules, so skin
 * parts swap sets by changing one import.
 */

import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7.5 5.3v13.4a1 1 0 0 0 1.52.85l10.7-6.7a1 1 0 0 0 0-1.7L9.02 4.45A1 1 0 0 0 7.5 5.3Z" fill="currentColor" />
  </Icon>
);

export const PauseIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="6" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" />
    <rect x="14" y="4.5" width="4" height="15" rx="1.2" fill="currentColor" />
  </Icon>
);

export const RestartIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3.5 3.5V8H8" />
  </Icon>
);

/** Points forward; the skin mirrors it for a backward seek. */
export const SeekIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
    <path d="M20.5 3.5V8H16" />
  </Icon>
);

const Speaker = () => <path d="M10.5 5.2 6.3 8.6H3.5v6.8h2.8l4.2 3.4Z" fill="currentColor" />;

export const VolumeHighIcon = (props: IconProps) => (
  <Icon {...props}>
    <Speaker />
    <path d="M14.5 9a4.2 4.2 0 0 1 0 6" />
    <path d="M17.5 6a8.2 8.2 0 0 1 0 12" />
  </Icon>
);

export const VolumeLowIcon = (props: IconProps) => (
  <Icon {...props}>
    <Speaker />
    <path d="M14.5 9a4.2 4.2 0 0 1 0 6" />
  </Icon>
);

export const VolumeOffIcon = (props: IconProps) => (
  <Icon {...props}>
    <Speaker />
    <path d="m15 9.5 5 5" />
    <path d="m20 9.5-5 5" />
  </Icon>
);

export const CaptionsOnIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="2.5" y="5" width="19" height="14" rx="3" fill="currentColor" stroke="none" />
    <path d="M10 10.2a2.2 2.2 0 1 0 0 3.6M16.5 10.2a2.2 2.2 0 1 0 0 3.6" stroke="var(--voca-ground, #020513)" />
  </Icon>
);

export const CaptionsOffIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="5.5" width="18" height="13" rx="3" />
    <path d="M10 10.2a2.2 2.2 0 1 0 0 3.6M16.5 10.2a2.2 2.2 0 1 0 0 3.6" />
  </Icon>
);

export const GearIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z" />
    <circle cx="12" cy="12" r="3" />
  </Icon>
);

export const FullscreenEnterIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15" />
  </Icon>
);

export const FullscreenExitIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M9 4v3.5A1.5 1.5 0 0 1 7.5 9H4M20 9h-3.5A1.5 1.5 0 0 1 15 7.5V4M15 20v-3.5a1.5 1.5 0 0 1 1.5-1.5H20M4 15h3.5A1.5 1.5 0 0 1 9 16.5V20" />
  </Icon>
);

export const PipEnterIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M21 11V6.5A2.5 2.5 0 0 0 18.5 4h-13A2.5 2.5 0 0 0 3 6.5v11A2.5 2.5 0 0 0 5.5 20H10" />
    <rect x="13" y="13" width="9" height="7" rx="1.5" fill="currentColor" stroke="none" />
  </Icon>
);

export const PipExitIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M9 15l6-6M10 9h5v5" />
  </Icon>
);

export const CastEnterIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3 8V6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5H14" />
    <path d="M3 12a8 8 0 0 1 8 8M3 16a4 4 0 0 1 4 4M3 20h.01" />
  </Icon>
);

export const CastExitIcon = CastEnterIcon;

export const AirPlayEnterIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M6 17H5.5A2.5 2.5 0 0 1 3 14.5v-8A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v8a2.5 2.5 0 0 1-2.5 2.5H18" />
    <path d="m12 15 5 6H7Z" fill="currentColor" />
  </Icon>
);

export const AirPlayExitIcon = AirPlayEnterIcon;

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Icon>
);

export const ChevronIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

export const SpinnerIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M21 12a9 9 0 1 1-6.2-8.56" />
  </Icon>
);

export const SpeedIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4.2 17.5a9 9 0 1 1 15.6 0" />
    <path d="m12 13 4-4.5" />
    <circle cx="12" cy="13.5" r="1.2" fill="currentColor" />
  </Icon>
);

export const SwitchesIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Icon>
);

export const QualityIcon = SwitchesIcon;

export const SpeechIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M20 12.5a7.5 7.5 0 0 1-10.9 6.7L4 20.5l1.3-4.6A7.5 7.5 0 1 1 20 12.5Z" />
  </Icon>
);

/* Language-lab glyphs. */

export const BookmarkIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <Icon {...props}>
    <path d="M6.5 3.5h11a1 1 0 0 1 1 1v16l-6.5-4.2-6.5 4.2v-16a1 1 0 0 1 1-1Z" fill={filled ? 'currentColor' : 'none'} />
  </Icon>
);

export const RepeatIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m17 2.5 3 3-3 3" />
    <path d="M4 11.5v-1a5 5 0 0 1 5-5h11" />
    <path d="m7 21.5-3-3 3-3" />
    <path d="M20 12.5v1a5 5 0 0 1-5 5H4" />
  </Icon>
);

export const ReplayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    <path d="M3.5 3.5V8H8" />
    <path d="M10.5 9.2v5.6l4.4-2.8Z" fill="currentColor" />
  </Icon>
);

export const NextLineIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M5.5 5.6v12.8a.9.9 0 0 0 1.38.76l9.6-6.4a.9.9 0 0 0 0-1.52l-9.6-6.4a.9.9 0 0 0-1.38.76Z" fill="currentColor" />
    <path d="M19 5v14" />
  </Icon>
);

export const ListenIcon = VolumeHighIcon;

export const StarIcon = ({ filled, ...props }: IconProps & { filled?: boolean }) => (
  <Icon {...props}>
    <path
      d="m12 3.2 2.7 5.5 6 .9-4.35 4.25 1.03 6-5.38-2.83-5.38 2.83 1.03-6L3.3 9.6l6-.9Z"
      fill={filled ? 'currentColor' : 'none'}
    />
  </Icon>
);

export const ExternalIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M14 4h6v6M20 4l-9 9" />
    <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </Icon>
);

export const PauseLineIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M4 6h10M4 12h7M4 18h10" />
    <path d="M17 13v6M21 13v6" />
  </Icon>
);

/** A gilt corner ornament for the cover: a double rule that curls into a leaf. Drawn for the top-left corner. */
export const Fleuron = (props: IconProps) => (
  <svg viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="currentColor" aria-hidden="true" focusable="false" {...props}>
    <path d="M4 60V12a8 8 0 0 1 8-8h48" strokeWidth="1.6" />
    <path d="M10 60V18a8 8 0 0 1 8-8h42" strokeWidth="0.8" opacity="0.8" />
    <path
      d="M18 18c6-1 10 2 10 7 0 4-3 6-6 5-2.5-.8-2.8-4-.6-5 1.6-.7 3 .6 2.6 2"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
    <path d="M28 25c5-6 12-8 20-7M25 28c-6 5-8 12-7 20" strokeWidth="1.1" strokeLinecap="round" />
    <path d="M40 17.5c2.5-3 6-3.8 8.5-2-2.2 2.6-5.4 3.2-8.5 2ZM17.5 40c-3 2.5-3.8 6-2 8.5 2.6-2.2 3.2-5.4 2-8.5Z" fill="currentColor" stroke="none" />
    <circle cx="4" cy="4" r="2.2" fill="currentColor" stroke="none" />
  </svg>
);

/** The emboss on the wax-seal play button: the Vocapedia V inside a ring of dots. */
export const WaxSealMark = (props: IconProps) => (
  <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" aria-hidden="true" focusable="false" {...props}>
    <circle cx="24" cy="24" r="19" strokeWidth="1.2" strokeDasharray="0.1 3.6" strokeLinecap="round" />
    <circle cx="24" cy="24" r="15.5" strokeWidth="0.8" opacity="0.7" />
  </svg>
);

/** The Vocapedia mark: a "V" cut from two strokes, after the site's logo. */
export const VocapediaMark = (props: IconProps) => (
  <Icon strokeWidth={2.4} {...props}>
    <path d="M4 4.5 12 20l8-15.5" />
    <path d="M8.5 4.5 12 12" opacity="0.55" />
  </Icon>
);
