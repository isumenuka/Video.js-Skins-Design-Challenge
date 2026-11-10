# Skin design spec — "Arcade"

A Video.js 10 player built as an arcade cabinet:
- **Top housing:** a lit marquee between two speaker grilles.
- **Screen:** a curved CRT with a glowing phosphor rim.
- **Control panel:** two working joysticks and round arcade buttons. It never hides and never covers the picture; in fullscreen it becomes a floating HUD.

The cabinet idea came from a poster the user shared. The art, wording, icons and code are original. The cabinet art was generated from text prompts only (invideo AI, GPT Image 2.5).

## Signature ideas
- **Joysticks that are real controls.** Both are ARIA sliders that keyboard, mouse and touch can drive (`arcade/joystick.tsx`).
  - **Left stick, seek:**
    - ←/→ skip 5s;
    - PgUp/PgDn skip 30s;
    - Home/End jump to the start or end;
    - holding it scrubs, faster the further it's pushed;
    - a tap nudges 5s.
  - **Right stick, volume:**
    - ↑/↓ change it by 5%;
    - holding it keeps turning the volume up or down;
    - a 10-LED meter shows the level and turns red when muted.
  - **Behaviour:**
    - The sticks spring back when released.
    - Their labels ("Seek", "Volume") come from Video.js i18n.
    - Their keys are handled before the player's hotkeys, so nothing fires twice.
- **Arcade buttons.**
  - Every button is still a Video.js component, inside a chrome collar with a cap that sinks when pressed. The cap is the generated render, tinted.
  - **Colour:** the start button is phosphor green and mute is pink. All other caps are mint.
  - **On-states:** they light a ring as well as changing the icon. The start button pulses when the film ends.
- **Attract mode.** Before the first play, the tube shows the film's title in big condensed type, then "Play →" pointing at the start button. The only words are the media title and Video.js's "Play" label.
- **A tube that fits the film.** `--arc-screen-ratio` comes from the media's frame size, clamped between 4:3 and 2.4:1. Overlays follow the tube's curve.
- **Kept from Console:**
  - CRT power-on boot, and the CRT collapse (picture, line, dot, dark) when the film ends;
  - ambient light from the film onto the cabinet;
  - the chapter LED seek strip (8 Sintel chapters, named on hover);
  - the 7-segment time readout;
  - the live oscilloscope.
- **Living hardware:**
  - The speakers pulse with the audio level (`--arc-level`, from the oscilloscope).
  - The coin-door lamp lights while the film plays.
- **One colour token.** `--media-accent-color` recolours the phosphor: tube rim, attract screen, start button, LEDs and readouts.

## Layout (source order = focus order)
1. **Cabinet (decorative):** marquee with the media title, speakers, bezel, ledge, coin door.
2. **Screen:**
   - title tag;
   - centre start button (moves to the right during attract mode);
   - indicators;
   - buffering, boot, CRT and attract overlays.
3. **Control panel:**
   - **Seek strip:** the chapter LED strip.
   - **Left:** the seek stick.
   - **Centre:** Back 10, Play/Pause, Forward 10, then the 7-segment time and the scope.
   - **Right:** the volume stick plus meter, and Mute.
4. **Front face:** Captions, Settings, AirPlay/Cast (when available), PiP and Fullscreen, beside the coin door.

## Type, icons, colour
- **Display:** Anton (marquee, attract screen, title tag, chapter names).
- **Labels:** Chakra Petch.
- **Readouts:** DSEG7 Classic.
- **Font sources:** all OFL, embedded as Latin subsets.
- **Icons:** an original stencil set, 20px grid, 2px strokes, dark ink on the light caps.
- **Contrast:** dark ink on the phosphor-green start button is at least 12:1. Panel text is at least 7:1.

## Accessibility
- **Focus:** one ring on every focusable part (3px phosphor outline, 3px offset), including the sticks.
- **Touch:** small buttons are 44px and the sticks are at least 72×80px. Every target measured at least 44px on touch.
- **Text:** all UI text comes from Video.js i18n. The stick labels were checked in Spanish ("Buscar", "Volumen").
- **Reduced motion:**
  - no animations run: boot, flicker, blink, arrow nudge, static, end pulse, speaker pulse and spring-back are all still;
  - the CRT goes straight to dark.
- **Contrast preferences:**
  - `prefers-contrast: more` drops the scanlines and raises the dim tokens.
  - Forced colors hide the cabinet and map the buttons, sticks and LEDs to system colours.
- **Decoration:** `aria-hidden`. State is never colour alone: rings pair with icon changes, and the meter pairs with `aria-valuetext`.

## Responsive (container queries)
| Width | Change |
| --- | --- |
| below 56rem | oscilloscope hidden |
| below 44rem | smaller housing, sticks and buttons; tighter gaps |
| below 30rem | the sticks take their own row above the transport |
| below 26rem | coin door hidden; the front buttons close up |

## Art (`src/video/arcade/assets.css`, embedded WebP)
- **Origin:** photoreal 3D renders generated with invideo AI (GPT Image 2.5) from text prompts. After the first piece, every render used the hood as its material reference, so they match.
- **Cabinet:**
  - the hood with speakers, 3-sliced;
  - the control deck with its chrome lip, 3-sliced;
  - the front face with two coin doors, 3-sliced;
  - the powder-coat material tile;
  - the marquee plate.
  - **3-slice:** the caps keep their shape and the middle stretches, so the cabinet holds from 1240px down to 300px.
- **Controls:**
  - green and purple arcade buttons in chrome rings, each with an unlit and a lit render;
  - a silver bat-top joystick lever;
  - a chrome joystick base with a dust washer.
- **Backdrops:** `apps/preview/public/showcase/arcade-wide.webp` and `arcade-tall.webp`.
- **Fallbacks:** every piece has a CSS fallback.
- **Live layers:**
  - **Screen light:** spills onto the side posts, hood, bezel and deck.
  - **Speakers:** glow with the audio level.
  - **Glass:** a curved reflection drifts across it.
  - **Buttons:** light from inside (crossfading to the lit render with a bloom) and sink when pressed.
  - **Attract mode:** types the title in pixel letters (Silkscreen, OFL), flashes, and blinks the panel buttons in turn.

## Verification (local, Chrome)
The state audit passes 41 of 41 checks, with no console errors:
- **Attract screen:** shown before play, gone after.
- **Playback:** ratio; plays.
- **Chapters:** 8 rendered; name on hover.
- **Ambient:** colour sampled.
- **Captions:** on, with the cue showing.
- **Seek stick:**
  - a key skips 5s once;
  - `aria-valuetext` is right;
  - holding scrubs;
  - it springs back.
- **Volume stick:**
  - a key changes volume by 5%;
  - `aria-valuetext` is right;
  - the meter shows the level;
  - mute turns it red.
- **Menus:** Esc closes them and focus returns.
- **Focus:** visible on all 13 stops.
- **End of film:** CRT on end; replay reboots.
- **Fullscreen:** enters; the HUD hides when idle.
- **Signal states:** buffering; error.
- **Locale:** Spanish and right-to-left; translated stick labels.
- **Layout:** fits at 1240/896/650/380/300px.
- **Touch:** targets at least 44px.
- **Motion:** reduced motion runs no animations.
- **Accent:** the token recolours the rim.
- **Accessibility scan:** axe clean.

## Media
- *Sintel* on Mux, public playback ID `fNEeWPY4UUEkfCFd9617w8gvYFEsFOv72rPQj3qKG700`.
- English captions and 8 chapters are served from `apps/preview/public/`.
- **Credit:** "Sintel © Blender Foundation | durian.blender.org, CC BY 3.0", shown on the page.
