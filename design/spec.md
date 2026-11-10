# Skin design spec — "Console"

A sci-fi lab machine built around a Video.js 10 player:
- **The screen** is an armoured monitor, shaped to the film.
- **The deck** below holds every control. It never covers the picture and never hides, except in fullscreen, where it becomes a HUD.
- **Look:** the reference image the user supplied set the style. The art, icons and code are original. The lab background was generated from a text prompt only (invideo AI).

## Signature ideas
- **Phosphor colour.** One public token, `--media-accent-color`, recolours the whole machine (green #7cff3a / amber #ffb020 / cyan #3fe6ff). Every glow, dim tone and text tint is derived from it with `color-mix`. The showcase has a three-key switch.
- **Ambient light.** While playing, the armour around the screen picks up the film's colours from a 16×9 sample of the frame (`console/ambient.tsx`). The colours are registered with `@property`, so they glide.
- **A screen that fits the film.** `--con-screen-ratio` comes from the media's frame size (`console/screen-ratio.tsx`), clamped between 4:3 and 2.4:1, so there are no letterbox bars. The host can pass the ratio up front to avoid a jump.
- **Chapter LEDs.** The seek bar is an LED segment strip, split into Sintel's 8 chapters. The hover tag shows the chapter name above the time.
- **7-segment time readout,** with an unlit "88:88" ghost (`console/segment-time.tsx`).
- **Live oscilloscope** of the film's audio (`console/oscilloscope.tsx`).
- **Physical controls:**
  - The captions key is a flip switch; its lever rises when captions are on.
  - Playback speed is a click-stop rotary knob (`console/speed-knob.tsx`). It's an ARIA slider with arrows, PgUp/PgDn, Home and End, click to advance, and drag to turn. Its label comes from the Video.js translation.
- **Power and signal states:**
  - First play boots the monitor (scan sweep, flash, progress bar).
  - The end of the film is a CRT power-off: the picture collapses to a line, then a dot, then dark, and the replay key is lit. Replay boots again.
  - Buffering shows phosphor static.
  - Errors show a "signal lost" static screen with a red-framed dialog.
  - Paused dims the edges to standby.
- **Living hardware:**
  - Neon tube around the bezel, with sparks circling it.
  - Current pulses through the conduits; turbines turn.
  - "+" lamps hum, and the status LEDs show power, signal and standby.
  - A bridge cartridge fills with playback progress, next to a volume meter.
- **Fullscreen HUD.** The frame steps away. The deck floats as a blurred steel bar and hides with the controls.

## Layout (source order = focus order)
1. **Screen:** title tag, power key (centre play), indicators, buffering, boot and CRT overlays.
2. **Hinge (decorative):** turbines, vents, bridge (progress cartridge plus volume meter).
3. **Deck, readout row:** the chapter LED seek strip.
4. **Deck, key row:**
   - Play/pause;
   - Skip −10 / +10;
   - 7-segment time;
   - oscilloscope;
   - speed knob;
   - Mute plus fader;
   - Captions switch, Settings, AirPlay/Cast (when available), PiP, Fullscreen.

## Type, icons, colour
- **Labels:** Chakra Petch 500/600.
- **Readouts:** DSEG7 Classic. Both fonts are OFL and embedded as Latin subsets.
- **Icons:** an original stencil set, 20px grid, 2px square-cap strokes. The only fill is the LED.
- **Text contrast:** at least 16:1 on the deck in every phosphor. Every phosphor colour is at least 11:1 on black.

## Accessibility
- **Focus:** one ring on every focusable part, a 2px phosphor outline plus a black halo. 13 tab stops checked.
- **Touch:** keys are 40px, or 44px on coarse pointers. All targets measured at 44px or more on touch.
- **Text:** all UI text comes from Video.js i18n. The knob's name is translated (checked in Spanish).
- **Reduced motion:** no animation runs (boot, CRT, sparks, current, flicker, static and knob are all still). The scope drops to 4fps.
- **Contrast preferences:** `prefers-contrast: more` raises the dim tokens and drops the scanlines. Forced colors hide the decoration and map LEDs and fills to system colours.
- **Decoration:** marked `aria-hidden`. State is never colour alone: the LEDs pair with icon changes and the lever position.

## Responsive (container queries)
| Width | Change |
| --- | --- |
| below 62rem | oscilloscope hidden |
| below 58rem | speed knob hidden (speed stays in the settings menu) |
| below 46rem | skip keys hidden; fader and readout compact; side plates and conduits hidden |
| below 36rem | toggles wrap to a second key row |
| below 34rem | thinner frame; status LEDs hidden |
| below 26rem | fader hidden (mute stays) |
| below 20rem | time collapses to Scaffold's toggle |

## Media
- *Sintel* on Mux, public playback ID `fNEeWPY4UUEkfCFd9617w8gvYFEsFOv72rPQj3qKG700`.
- **Captions:** `apps/preview/public/sintel-en.vtt` (official English subtitles).
- **Chapters:** `sintel-chapters.vtt` (8 chapters, marked from the film's scenes).
- **Credit:** "Sintel © Blender Foundation | durian.blender.org, CC BY 3.0", shown on the page.

## Verification (local, Chrome)
- The state audit passes 29 of 29 checks:
  - **Playback:** plays; captions and cue; chapters and hover name; ambient sampled.
  - **Speed knob:** keys don't seek; click advances.
  - **Keyboard and menus:** menus and Esc with focus return; visible focus on all stops.
  - **Power states:** CRT on end; replay reboots.
  - **Fullscreen:** HUD hides when idle.
  - **Signal states:** buffering; error.
  - **Locale:** Spanish labels.
  - **Layout:** the deck fits at 1240/896/650/380/300px.
  - **Touch, motion and axe:** 44px touch targets; reduced motion; axe clean.
- No console errors.

## Submission assets
`design/submission/`:
- desktop showcase;
- player playing;
- chapter hover;
- settings menu;
- amber and cyan variants;
- phone;
- `console-demo.mp4` (15s).
