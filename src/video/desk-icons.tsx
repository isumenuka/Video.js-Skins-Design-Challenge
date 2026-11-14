/** @jsxImportSource react */

/*
 * The scholar's desk: each control drawn as an object from a lexicographer's desk, in brass, ink and paper.
 * Drawn on a 40px grid with fills (not just strokes) so they read as objects on the cobalt leather, not glyphs.
 * Decorative: the buttons that hold them carry the accessible names.
 */

import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement>;

const BRASS_LIGHT = '#f6e3a1';
const BRASS = '#d3a446';
const BRASS_DEEP = '#8a6418';
const PAPER = '#f3e8cc';
const PAPER_SHADE = '#e4d5b2';
const INK = '#241a12';
const COBALT = '#1f30ff';

function Svg({ children, ...props }: Props) {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false" {...props}>
      {children}
    </svg>
  );
}

/**
 * A brass circular arrow around "10": a seek control readable at a glance. The arc and arrowhead are mirrored for
 * going back; the number is not, so it always reads "10".
 */
export function SeekArrowIcon({ direction, ...props }: Props & { direction: 'back' | 'forward' }) {
  // The arc runs clockwise from the upper right, round the bottom, to the top, where the arrowhead points on.
  const arc = 'M28.5 12.5A12 12 0 1 1 20 9';
  const head = 'M18.2 4.2 25 9l-6.8 4.8Z';
  const arrow = (
    <g>
      <path d={arc} fill="none" stroke={BRASS_DEEP} strokeWidth="5" strokeLinecap="round" />
      <path d={arc} fill="none" stroke={BRASS} strokeWidth="3" strokeLinecap="round" />
      <path d={arc} fill="none" stroke={BRASS_LIGHT} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <path d={head} fill={BRASS} stroke={BRASS_DEEP} strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  );
  return (
    <Svg {...props}>
      {direction === 'back' ? <g transform="translate(40 0) scale(-1 1)">{arrow}</g> : arrow}
      <text
        x="20"
        y="25"
        textAnchor="middle"
        fontFamily="'Source Serif 4', Georgia, serif"
        fontWeight="700"
        fontSize="11"
        fill={BRASS_LIGHT}
      >
        10
      </text>
    </Svg>
  );
}

/** A glass inkwell with a brass collar; the ink level is the volume. Muted: drained, with a cork in it. */
export function InkwellIcon({ level, muted, ...props }: Props & { level: number; muted?: boolean }) {
  const ink = muted ? 0 : Math.max(0, Math.min(1, level));
  const top = 33 - ink * 16;
  return (
    <Svg {...props}>
      <defs>
        <clipPath id="voca-inkwell-glass">
          <path d="M9 18a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3Z" />
        </clipPath>
        <linearGradient id="voca-inkwell-ink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4bff" />
          <stop offset="1" stopColor="#0a1466" />
        </linearGradient>
      </defs>
      {/* glass */}
      <path
        d="M9 18a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3Z"
        fill="rgb(240 239 233 / 0.18)"
      />
      <rect
        x="8"
        y={top}
        width="24"
        height="20"
        fill="url(#voca-inkwell-ink)"
        clipPath="url(#voca-inkwell-glass)"
        style={{ transition: 'y 200ms ease-out' }}
      />
      <path
        d="M9 18a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H12a3 3 0 0 1-3-3Z"
        fill="none"
        stroke={PAPER}
        strokeWidth="1.3"
        opacity="0.85"
      />
      <path d="M12 18.5v11" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity="0.45" />
      {/* brass collar */}
      <rect x="14" y="10" width="12" height="5" rx="1.2" fill={BRASS} stroke={BRASS_DEEP} strokeWidth="0.8" />
      <rect x="15.5" y="11" width="9" height="1.2" rx="0.6" fill={BRASS_LIGHT} opacity="0.8" />
      {muted ? (
        // a cork stopper: no ink, no sound
        <path d="M16 4.5h8l-1 5.5h-6Z" fill="#b07a45" stroke="#6e4720" strokeWidth="0.8" />
      ) : (
        // a nib dipped in the well
        <g>
          <path d="M23 2.5 19.6 11.8" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M19.6 11.8 18.7 14.5 20.8 12.4Z" fill={BRASS} />
        </g>
      )}
    </Svg>
  );
}

/** A brass-rimmed magnifying glass over two lines of print. On: the lens glints gold. */
export function MagnifierIcon({ on, ...props }: Props & { on?: boolean }) {
  return (
    <Svg {...props}>
      <path d="M5 30h17M5 34h12" stroke={PAPER} strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      <circle cx="18" cy="16" r="9" fill={on ? 'rgb(246 227 161 / 0.35)' : 'rgb(240 239 233 / 0.12)'} />
      {on && <path d="M13.5 12.5a6 6 0 0 1 5-3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />}
      <path
        d="M12.5 15h11M12.5 18.5h8"
        stroke={on ? INK : PAPER}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={on ? 0.9 : 0.55}
      />
      <circle cx="18" cy="16" r="9" fill="none" stroke={BRASS} strokeWidth="2.4" />
      <circle cx="18" cy="16" r="10.3" fill="none" stroke={BRASS_DEEP} strokeWidth="0.6" />
      <path d="M24.6 22.6 33 31" stroke={BRASS_DEEP} strokeWidth="4.4" strokeLinecap="round" />
      <path d="M24.6 22.6 33 31" stroke="#5a3a17" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}

/** A quill pen. Inked: a drop of cobalt ink hangs from the nib. */
export function QuillIcon({ inked, ...props }: Props & { inked?: boolean }) {
  return (
    <Svg {...props}>
      {/* the vane */}
      <path
        d="M34 4c-9 1.5-17 7-21 15.5-1.2 2.6-2 5.2-2.4 7.8l3.4-2.2c1.8-.2 3.6-.9 5-2-1.2.1-2.4 0-3.4-.4 2.3-.4 4.4-1.4 6-2.9-1.1 0-2.2-.2-3.1-.6 2.3-.6 4.4-1.9 6-3.6-1 0-2-.2-2.8-.6C27.5 12.5 31.5 8.7 34 4Z"
        fill={PAPER}
        stroke={BRASS_DEEP}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path d="M31 7 12.5 27.5" stroke={BRASS_DEEP} strokeWidth="1" strokeLinecap="round" />
      {/* the cut nib */}
      <path d="M12.5 27.5 8 34.5l6.6-4.6Z" fill={inked ? COBALT : INK} />
      {inked && <path d="M7.6 35.6c0 1.6-1 2.6-2 2.6s-2-1-2-2.6c0-1.3 2-3.6 2-3.6s2 2.3 2 3.6Z" fill={COBALT} />}
    </Svg>
  );
}

/** A brass compass-dial: settings. */
export function DialIcon(props: Props) {
  return (
    <Svg {...props}>
      <circle cx="20" cy="20" r="14" fill={BRASS} stroke={BRASS_DEEP} strokeWidth="1.2" />
      <circle cx="20" cy="20" r="11" fill={PAPER} stroke={BRASS_DEEP} strokeWidth="0.8" />
      <path
        d="M20 10.5v2M20 27.5v2M10.5 20h2M27.5 20h2M13.3 13.3l1.4 1.4M25.3 25.3l1.4 1.4M13.3 26.7l1.4-1.4M25.3 14.7l1.4-1.4"
        stroke={INK}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <g className="voca-dial-needle" style={{ transformOrigin: '20px 20px' }}>
        <path d="M20 12.5 22 20h-4Z" fill="#8a2a20" />
        <path d="M20 27.5 18 20h4Z" fill={INK} />
      </g>
      <circle cx="20" cy="20" r="1.5" fill={BRASS_LIGHT} stroke={BRASS_DEEP} strokeWidth="0.6" />
      <circle cx="20" cy="4" r="2.2" fill={BRASS} stroke={BRASS_DEEP} strokeWidth="0.8" />
    </Svg>
  );
}

/** An open book, spreading its pages: go full page. */
export function OpenBookIcon(props: Props) {
  return (
    <Svg {...props}>
      <path
        d="M20 11c-4-3-9-3.5-15-2.5v22c6-1 11-.5 15 2.5Z"
        fill={PAPER}
        stroke={BRASS_DEEP}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M20 11c4-3 9-3.5 15-2.5v22c-6-1-11-.5-15 2.5Z"
        fill={PAPER}
        stroke={BRASS_DEEP}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M8 13.5c3-.4 6 0 9 1.5M8 17.5c3-.4 6 0 9 1.5M8 21.5c3-.4 6 0 9 1.5M23 15c3-1.5 6-1.9 9-1.5M23 19c3-1.5 6-1.9 9-1.5M23 23c3-1.5 6-1.9 9-1.5"
        stroke={PAPER_SHADE}
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path d="M5 30.5c6-1 11-.5 15 2.5 4-3 9-3.5 15-2.5v2.5c-6-1-11-.5-15 2.5-4-3-9-3.5-15-2.5Z" fill={COBALT} />
      <path d="M20 11v22" stroke={BRASS_DEEP} strokeWidth="1" />
    </Svg>
  );
}

/** A closed book: leave full page. */
export function ClosedBookIcon(props: Props) {
  return (
    <Svg {...props}>
      <rect x="10" y="6" width="21" height="28" rx="2" fill={COBALT} stroke="#0a1466" strokeWidth="1" />
      <rect x="10" y="6" width="4" height="28" rx="1.5" fill="#0d189a" />
      <path d="M31 9v22" stroke={PAPER} strokeWidth="2" />
      <rect x="17" y="12" width="10" height="5" rx="0.8" fill="none" stroke={BRASS} strokeWidth="1" />
      <path d="M18.5 14.5h7" stroke={BRASS} strokeWidth="0.8" />
      <path d="M22 26v8l2-1.6 2 1.6v-8" fill="#8a2a20" />
    </Svg>
  );
}

/** A brass book clasp snapped shut over the fore-edge: stop, and close the book at its first page. */
export function ClaspIcon(props: Props) {
  return (
    <Svg {...props}>
      <rect x="7" y="8" width="20" height="24" rx="2" fill={COBALT} stroke="#0a1466" strokeWidth="1" />
      <rect x="7" y="8" width="3.5" height="24" rx="1.4" fill="#0d189a" />
      <path d="M27 10.5v19" stroke={PAPER} strokeWidth="2" />
      <path
        d="M20 16h11.5a2.5 2.5 0 0 1 2.5 2.5v3a2.5 2.5 0 0 1-2.5 2.5H20Z"
        fill={BRASS}
        stroke={BRASS_DEEP}
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M21 17.3h10" stroke={BRASS_LIGHT} strokeWidth="0.8" strokeLinecap="round" opacity="0.8" />
      <circle cx="30.5" cy="20" r="1.6" fill={BRASS_DEEP} />
      <rect x="15" y="17.5" width="3.5" height="5" rx="0.6" fill={INK} opacity="0.75" />
    </Svg>
  );
}

/**
 * A silk line-marker with an arrowhead: jump to the previous or next spoken line. Mirrored for going back; the
 * printed lines it points along are not.
 */
export function LineMarkIcon({ direction, ...props }: Props & { direction: 'back' | 'forward' }) {
  const mark = (
    <g>
      <path d="M8 9h4v22l-2-2-2 2Z" fill="#9d2b1b" stroke="#5e170d" strokeWidth="0.8" strokeLinejoin="round" />
      <path d="M17 20h11" stroke={BRASS} strokeWidth="3" strokeLinecap="round" />
      <path d="M26 14.5 33 20l-7 5.5Z" fill={BRASS} stroke={BRASS_DEEP} strokeWidth="1.1" strokeLinejoin="round" />
    </g>
  );
  return (
    <Svg {...props}>
      <path d="M15 12h12M15 28h12" stroke={PAPER} strokeWidth="1.6" strokeLinecap="round" opacity="0.75" />
      {direction === 'back' ? <g transform="translate(40 0) scale(-1 1)">{mark}</g> : mark}
    </Svg>
  );
}

/** A fanned stack of word cards, the front one marked with a rubric "A" and a brass corner: review collected words. */
export function ReviewCardsIcon(props: Props) {
  return (
    <Svg {...props}>
      <rect
        x="9"
        y="7"
        width="17"
        height="23"
        rx="1.8"
        fill={PAPER_SHADE}
        stroke={BRASS_DEEP}
        strokeWidth="0.9"
        transform="rotate(-14 17.5 18.5)"
      />
      <rect
        x="12"
        y="7.5"
        width="17"
        height="23"
        rx="1.8"
        fill={PAPER_SHADE}
        stroke={BRASS_DEEP}
        strokeWidth="0.9"
        transform="rotate(-5 20.5 19)"
      />
      <rect
        x="15"
        y="9"
        width="17"
        height="23"
        rx="1.8"
        fill={PAPER}
        stroke={BRASS_DEEP}
        strokeWidth="1.1"
        transform="rotate(6 23.5 20.5)"
      />
      <g transform="rotate(6 23.5 20.5)">
        <path
          d="M19.5 22.5 23.5 12.5l4 10M21 19h5"
          fill="none"
          stroke="#8a2a20"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M18.5 26.5h10" stroke={PAPER_SHADE} strokeWidth="1.1" strokeLinecap="round" />
        <path d="M27.5 32h4.5v-4.5Z" fill={BRASS} stroke={BRASS_DEEP} strokeWidth="0.6" strokeLinejoin="round" />
      </g>
    </Svg>
  );
}
