# Skin design spec — "Console"

A neon-green sci-fi machine:
- An armoured monitor (the screen) above a control deck.
- The deck is hardware: it never hides, and it never covers the picture.
- The style is inspired by a reference image the user supplied. Nothing is copied from it: the art, icons and code are original, and the background scene was generated from a text prompt only.

## Base
- Scaffold, React + plain CSS, video preset, Video.js 10.3.0.
- Skin rules live in `src/video/console.css` (`@layer console`, after Scaffold's `components`).
- Components in `src/video/console/`:
  - frame and boot: `frame.tsx`;
  - `segment-time.tsx`;
  - `volume-fader.tsx`;
  - `oscilloscope.tsx`.
- Icons are in `src/video/icons.tsx`.
- Fonts are embedded in `src/video/fonts.css`.

## Layout (source order = focus order)
1. **Screen.** 16:9; the machine grows around it, even when the host sets an aspect-ratio on the player box. Screen overlays:
   - the title tag (top left);
   - the power key (the centre play button);
   - indicators;
   - the buffering spinner;
   - the boot sequence.
2. **Hinge** (decorative): turbines that spin while playing, vents, and a 16-segment volume meter.
3. **Deck, readout row:** the seek bar as an LED segment strip.
4. **Deck, key row:**
   - Play/pause (wide key);
   - Skip −10 / +10;
   - 7-segment time `current / duration`;
   - the oscilloscope;
   - Mute plus the fader;
   - Captions*, Settings, AirPlay/Cast*, PiP, Fullscreen.

   \* only when available.

## Tokens
- **Steel:** #1b1f1c / #262b27 / #323833, edge #3d453e, black #0b0d0c.
- **Green:** `--con-green` = `var(--media-accent-color, #7cff3a)` — 13:1 on black. Dim #3f7d1f, deep #1a2e12.
- **Warnings:** amber #ffb020, red #ff4d3a.
- **Text:** #dcffd2 (17:1 on black); dim text #9fbf96.
- **Sizes:** keys 40px, or 44px on coarse pointers. Icons 20px on a 20-unit grid.
- **Geometry:** screen frame 16px, hinge 32px, deck 108px (148px in two-row mode).

## Type
- **Labels:** Chakra Petch 500/600, uppercase with tracking for tooltips, title and menu headings.
- **Time and seek preview:** DSEG7 Classic Bold, monospace segments, with a 10% "88:88" ghost.
- **Licences:** both OFL. They are embedded as base64 Latin subsets, because the project folder name contains `#`, which breaks `url()` file paths in Vite.

## Icons
- Original stencil set: 2px stroke, square caps, mitred joins, chamfered panels.
- **Settings** is a hex nut.
- **Captions:** "on" shows text lines; "off" strikes the panel through.
- **The only fill is the LED** (`.con-led`), used for the menu check and connected AirPlay/Cast.

## State
- Toggle keys carry a status LED:
  - Play: green while playing.
  - Mute: red when muted.
  - Captions, PiP, Fullscreen and Cast: green when active.
  - Settings: green while open.
- The icon also changes, so state is never shown by colour alone. An open popup's trigger is also outlined.

## Motion (all off or stepped under `prefers-reduced-motion: reduce`)
- **Boot (derived):** on the first play, a 900ms flash with a scanline sweep and a progress bar. Glyphs only; it doesn't render under reduced motion.
- **Turbines:** spin while playing.
- **Signal LED:** blinks while playing.
- **CRT flicker:** every 7s.
- **Oscilloscope:** redraws every frame; at 4fps under reduced motion.
- **Keys:** press translate of 1px.

## Accessibility
- **Focus ring:** one ring everywhere, a 2px green outline with an offset black halo and glow.
- **Contrast:** controls sit on an opaque deck. The screen overlays (title, power key, indicators) sit on black tags.
- **Labels:** hotkeys, gestures, status announcer, error dialog and all labels come from Video.js; there is no hardcoded UI copy.
- **Fader:** a real Video.js `VolumeSlider`, with arrow keys, Home/End and `aria-valuetext`.
- **Contrast preferences:** `prefers-contrast: more` raises dim tokens and drops the CRT layer. Forced colors hide the decoration and map the LEDs and fills to system colours.

## Responsive (container queries on the player)
| Width | Change |
| --- | --- |
| below 54rem | oscilloscope hidden |
| below 46rem | skip keys hidden; fader and readout compact |
| below 36rem | toggles wrap to a second key row; deck 148px |
| below 34rem | thinner frame; ports and status LEDs hidden |
| below 26rem | fader hidden, mute stays; arrow keys still change volume |
| below 20rem | time collapses to Scaffold's toggle |

## Derived (not in the reference — styled from its tokens)
- Menus, tooltips, the error dialog (red-framed), the seek preview, the indicators, the boot sequence and the focus ring.

## Media
- Mux public playback ID in `FILM.playbackId` (`apps/preview/src/frame/player.tsx`).
- The current film is *Sintel*; it switches to *Tears of Steel* when its ID arrives.
- English captions for *Tears of Steel* are ready at `apps/preview/public/tos-en.vtt`. Set `FILM.captions = './tos-en.vtt'`.
- The credit line renders from `FILM.credit` on the showcase and in the workbench.

## Pages
- `/` (showcase): generated lab background (invideo AI, GPT Image 2.5; prompt only), the player, design notes, the keyboard map and credits.
- `/workbench.html`: the Video.js workbench for size, language and direction tests.
