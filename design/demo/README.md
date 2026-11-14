# Demo films

Three short launch-style films of the skin on the live site, made for the Video.js Skins Design Challenge submission. No voiceover. Each film cuts between big words landing one at a time, one control cut out and enlarged in a glowing pill with the cursor pressing it, and the live screen tilted in perspective with a gold halo, with a "Vocapedia" wordmark top-left throughout. Sintel's own sound is heard whenever the player is on screen, aligned to what it is playing; a soft click, a page swish and a chime mark the presses and cards.

| File | Length | Shows |
| --- | --- | --- |
| `01-the-site.mp4` | ≈ 44 s | The encyclopedia: the flag globe, search, Article of the day, Recent changes, All languages, then **Watch & learn** and the reading room. |
| `02-the-player.mp4` | ≈ 88 s | Every control on the desk: the wax seal (play/pause), the clasp (stop), the page corners (±10 s, stacking), the line-markers, dragging the silk ribbon (riffle, tilt, folio), the folio counter, the inkwell (mute, volume), the magnifier (subtitles), the compass dial (translation, speed, quality), the open book (full page), Tab focus order and the `?` guide. |
| `03-learning.mp4` | ≈ 54 s | Learning on the site: a spoken word pulls out its A–Z tab and is filed in the reader's Vocapedia review queue (+XP, streak), the dictionary page, Study focus, the review cards (Again · Hard · Good · Easy), "Hear it in the film" and the word's article. |

Each film has a poster frame beside it (`*.png`). 1920 × 1080, H.264 + AAC stereo, 30 fps.

## How they were made

Everything is in `scripts/`; nothing in the skin or the site was changed for the films.

1. **Footage.** `record-*.mjs` drive the live pages with Playwright (Chromium on the GPU, 1920 × 1080, `recordVideo`) in `DEMO_FOOTAGE=1` mode: the injected overlay (`overlay.js`) draws only the gold cursor and its click ripple, every caption becomes a timeline **marker**, and the player's clock is sampled five times a second so the film's sound can be laid under the footage later. `crops.mjs` captures each control as a crisp PNG at device scale 3.
2. **Composition.** `comp/` is a 1920 × 1080 page that builds a timeline of beats (words → cut-out → screen) from a scene file in `scenes/` and the footage's markers, animated with the Web Animations API so that `seek(t)` shows any instant exactly.
3. **Render.** `render.mjs` steps the composition at 30 fps, screenshots every frame, and encodes H.264 with a portable `ffmpeg-static`.
4. **Sound.** `mix.mjs` pulls Sintel's audio from its Mux stream (once, to `sintel.wav`), cuts the runs that match what each screen beat shows, adds the synthesized effects from `sfx.mjs` at their cue times, normalizes to −16 LUFS and muxes.

### Re-recording

```sh
cd design/demo/scripts
npm init -y && npm i playwright ffmpeg-static
npx playwright install chromium ffmpeg
node sfx.mjs && node crops.mjs
DEMO_FOOTAGE=1 DEMO_SPEED=0.7 node record-02-player.mjs     # 01: 0.8, 03: 0.8
ffmpeg -i footage/02-the-player.webm -c:v libx264 -crf 17 -g 6 -an footage/02-the-player.mp4
node render.mjs 02 && node mix.mjs 02 02-the-player
```

## Credits

Film: *Sintel* © Blender Foundation, [durian.blender.org](https://durian.blender.org), CC BY 3.0, streamed by Mux. Player: this skin on Video.js 10 (`@videojs/react`). Site: Vocapedia on Base44, [vocapedia.base44.app](https://vocapedia.base44.app).
