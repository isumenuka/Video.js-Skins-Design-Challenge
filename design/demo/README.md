# Demo films

Three short, silent product films of the skin on the live site, made for the Video.js Skins Design Challenge submission. No voiceover: a gold cursor tours the pages, book-style caption cards name each control, key badges show the keyboard shortcuts, and the only sounds are a soft click, a page swish and a chime.

| File | Length | Shows |
| --- | --- | --- |
| `01-the-site.mp4` | ≈ 36 s | The encyclopedia: the flag globe, search, Article of the day, Recent changes, All languages, then **Watch & learn** and the reading room with the player. |
| `02-the-player.mp4` | ≈ 61 s | Every control on the desk: the wax seal (play/pause, Space), the clasp (stop), the page corners (±10 s, stacking, ← →), the line-markers (Shift + ← →), dragging the silk ribbon (riffle, tilt, folio), the folio counter, the inkwell (mute, volume, M), the magnifier (subtitles), the compass dial (translation, speed, quality), the open book (full page, F), Tab focus order and the `?` guide. |
| `03-learning.mp4` | ≈ 47 s | Learning on the site: a spoken word pulls out its A–Z tab, is filed in the reader's Vocapedia review queue (+XP, streak), the dictionary page, Study focus, the review cards (Again · Hard · Good · Easy), "Hear it in the film" and the word's article. |

Each film has a poster frame beside it (`*.png`). 1920 × 1080, H.264 + AAC, 30 fps.

## How they were made

- Recorded from the live pages with Playwright (Chromium, 1920 × 1080, `recordVideo`), driven by the scripts in `scripts/`. A small overlay (`scripts/overlay.js`) is injected into the page: the cursor, the click ripple, the caption cards, the key badges and the intro/outro cards. Nothing in the skin or the site was changed for the films.
- The three sound effects are synthesized by `scripts/sfx.mjs` (filtered noise and sine partials), so there is no licensed audio. The film itself is muted in the recordings.
- `scripts/finish.mjs` converts the WebM to MP4 with a portable `ffmpeg-static`, mixing each sound at the moment its click or caption happened, and cuts the poster frame.

### Re-recording

```sh
cd design/demo/scripts
npm init -y && npm i playwright ffmpeg-static
npx playwright install chromium ffmpeg
node sfx.mjs
DEMO_SPEED=0.7 node record-02-player.mjs      # also record-01-site.mjs (0.8), record-03-learning.mjs (0.8)
node finish.mjs 02-the-player --trim-start 4.6 --poster 14
```

`DEMO_SPEED` scales every pause and glide; `--trim-start` cuts the seconds before the intro card. The recorder uses the GPU through ANGLE/D3D11 (see `lib.mjs`), which the site's WebGL globe needs to run at full speed.

## Credits

Film: *Sintel* © Blender Foundation, [durian.blender.org](https://durian.blender.org), CC BY 3.0, streamed by Mux. Player: this skin on Video.js 10 (`@videojs/react`). Site: Vocapedia on Base44, [vocapedia.base44.app](https://vocapedia.base44.app).
