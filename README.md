# Arcade: a Video.js 10 skin

**Arcade** turns the Video.js player into a photoreal arcade cabinet.
- **Cabinet:** a lit neon marquee, a curved CRT tube, a control deck with two working joysticks and real arcade buttons,.
- **Under the art:** every control is still a Video.js component, and every new one is a real, labelled, keyboard-operable control.

Live demo: https://arcade-skin.vercel.app · Film: *Sintel* (CC BY 3.0, Blender Foundation), streamed by Mux.

## What makes it different

| | Feature | How it works |
| --- | --- | --- |
| 🕹️ | **Joysticks that are real controls** | <ul><li>**Left stick:** seeks. Hold it to scrub; the speed follows how far you push.</li><li>**Right stick:** sets the volume, with a 10-LED meter.</li><li>Both are ARIA sliders, with arrow, Page and Home/End keys, drag and tap. They spring back when released.</li></ul> |
| 🗺️ | **Level select** | <ul><li>The film's chapters as a game level grid ("1-1 … 1-8"), each with a frame from the Mux storyboard.</li><li>A Video.js `Dialog`: focus is trapped, arrows move, Enter jumps, Esc returns focus.</li></ul> |
| ⚡ | **TURBO + quality** | <ul><li>**Turbo:** a button that cycles 1× → 1.5× → 2×, lit while faster.</li><li>**Quality:** the stream's renditions in Settings.</li></ul> |
| ⚙️ | **Arcade options on the screen** | Settings → Arcade opens a card on the tube, like Level select, with big switches: Curved CRT, Sound effects, Arcade captions and Vibration. Each is a real `role="switch"`. |
| 📺 | **Curved CRT** | A WebGL shader bends the picture like curved glass, with an RGB phosphor mask and scanlines. The `<video>` stays the media underneath. |
| 👾 | **Secret 8-bit mode** | Type ↑↑↓↓←→←→BA: the film redraws in 64-colour pixels, the marquee turns rainbow, and the change is announced to screen readers. |
| 🔊 | **Synthesised sound + haptics** | <ul><li>**Sound:** Web Audio clicks, a coin clink, joystick thunks and the tube's power-on and power-off. No audio files. Silent until you interact, and silent while the film is muted.</li><li>**Haptics:** short vibrations on phones.</li><li>Both can be switched off.</li></ul> |
| 🎚️ | **Living cabinet** | <ul><li>The film's colours light the cabinet (ambient sampling).</li><li>The neon sign, speakers and buttons pulse with the soundtrack (an audio analyser).</li><li>A reflection drifts across the glass.</li></ul> |
| 🎞️ | **Attract mode** | Before play, a silent loop from the film plays behind a blinking pixel prompt, while the panel buttons light in turn. The CRT collapses to a dot at the end. |
| 💬 | **Arcade captions** | An optional retro dialogue box with a typewriter reveal. Plain captions stay the default for readability. |
| 🎨 | **Cartridges** | One public token, `--arc-cabinet-filter` (with `--media-accent-color`), recolours the cabinet: Green, Red, Blue or Gold. |
| 📊 | **Mux Data** | The `<MuxData />` extension reports views, startup time and rebuffering. Mux-hosted playback needs no env key. |

## Accessibility

- **Video.js parts throughout:** buttons, sliders, menus and dialogs keep their roles, translated labels and state attributes.
- **Focus:** keyboard order matches visual order, and one visible focus ring covers every control, the joysticks included.
- **New strings:** all of them go through Video.js i18n. Spanish is included (`useArcadeTranslator`, `src/video/arcade/i18n.ts`).
- **Reduced motion:** stops every animation (boot, flicker, ticker, sparks, glass, typing) and the audio pulse.
- **Contrast and forced colours:** `prefers-contrast` and forced-colours modes are handled. Decorative art is `aria-hidden`.
- **Touch:** targets are 44px or more.
- **Audit:** an automated audit (65 checks: states, sizes 300–1240px, keyboard, touch, RTL, Spanish, axe) passes in Chrome.

## Develop

```sh
npm run build && npx vite preview --port 4173
```

The project folder's name contains `#`, which breaks the Vite dev server, so preview the build. Rename the folder and `npm run dev` works.

- **Showcase:** `/` is the showcase page (it fits one screen).
- **Workbench:** `/workbench.html` is the workbench, where you can set the width, ratio, direction and language.
- **Player only:** `/preview.html` shows the player alone.

## Deploy

```sh
npm run deploy
```

It builds the site and deploys it to Vercel production (project `challenge-skin`).

## Where things live

- **`src/video/`:** the skin.
  - `skin.tsx` composes the parts.
  - `arcade.css` holds the styles.
  - `arcade/` holds the cabinet, joysticks, levels, secret, scores, CRT shader, captions, sound, i18n and the embedded art (`assets.css`).
  - `shared/` holds the controls, settings menu and buttons.
- **`apps/preview/`:** the showcase and workbench. `src/frame/player.tsx` sets the film, Mux Data and the attract loop.
- **`design/spec.md`:** the design spec. `design/submission/` holds the screenshots and the demo video.

## Credits

- **Film:** *Sintel* © Blender Foundation, durian.blender.org, CC BY 3.0.
- **Cabinet and background art:** generated for this skin with invideo AI (GPT Image 2.5), from text prompts.
- **Fonts:** Anton, Chakra Petch, DSEG7 and Silkscreen (SIL OFL).
- **Marquee marks:** supplied by the author.
