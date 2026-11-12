# Skin design spec — Vocapedia: The Living Encyclopedia

Status: **built** (Video.js 10.3.0, React + plain CSS, from Scaffold; theme `data-theme="vocapedia"`).

## Concept
Vocapedia calls itself "the free encyclopedia of languages", so the player *is* an encyclopedia: an open volume bound in Vocapedia cobalt.
- **Left page, the Entry:** turns over for each spoken line. It sets the line as a headword, with the French translation and the words worth keeping.
- **Right page, the Plate:** the film, as an engraved plate.
- **Page edges, the timeline:** a silk ribbon marks your place. Each line of dialogue is a dog-ear on the edges, and A–Z thumb-index tabs gild as the film goes on.
- **Cover:** the controls sit on the cover, led by a wax-seal play button.
- **Art:** every ornament is CSS or inline SVG, with no images.

**Submission blurb:** The Living Encyclopedia is a Video.js 10 skin for Vocapedia, the free encyclopedia of languages. The player is an open volume bound in Vocapedia cobalt. The film plays as an engraved plate on the right page, and the left page turns to a new encyclopedia entry for each spoken line, with its translation and the words worth keeping. The page edges are the timeline, with a silk ribbon as the bookmark, and play/pause is a wax seal. On a phone the volume closes down to its gilt edge, and the picture fills the frame.

## Palette (from vocapedia.base44.app's CSS)
| Role | Value |
| --- | --- |
| Cloth | cobalt `#1f30ff` → `#08105a` → navy `#040929` (ground `#020513`) |
| Gilt | `hsl(43 74% 60%)` (site chart gold), light `#f6e3a1`, deep `#a57a24` |
| Paper / edge | `#f0efe9` / `#e4e1d6` / `#b9b6ad` |
| Ink / rubric | `#17130c` / `#8a2a20` |
| Type | Source Serif 4 (headwords, time, folios), Inter (UI) |

## Layout
`.media-skin` is a grid with the areas `"entry spine plate index" / "rail rail rail rail"`.
- The media, poster, buffering indicator, indicators and subtitles share the `plate` area, inset by the printed margin.
- `.video-controls-content` is `display: contents`, so the rail sits on the cover below the pages and never covers the picture.
- **Focus order:** wax seal → −10 → +10 → (time toggle at narrow sizes) → mute → volume → subtitles → settings (Speed, Quality) → fullscreen.

## Responsive (container queries)
- **≥ 52rem:** the open book (entry 34cqi, spine, plate with margins and caption, thumb index, fleurons).
- **< 52rem:** the trim. Only the cloth edge with its gilt rule shows around a full-bleed plate, and the rail stays below it.
- **< 34rem:** volume shrinks to the mute button.
- **< 30rem:** ±10 hides (double-tap and the arrow keys still seek), and the seal shrinks to 44px.

## Accessibility
- **Focus:** a gilt focus ring on the cloth and a cobalt ring on the paper menus. Touch targets are 44px under `pointer: coarse`.
- **Entry page:** a labelled `section` holding the line and its translation. The plate subtitles are `aria-hidden`, since they duplicate it.
- **Gestures:** the pages and rail are marked `data-interactive`, so clicking the paper doesn't toggle playback.
- **Reduced motion:** the page turn becomes a fade and the ribbon stops swaying. Forced colors are handled.

## Media (submission info)
- **Mux playback ID:** `fNEeWPY4UUEkfCFd9617w8gvYFEsFOv72rPQj3qKG700` (public). Keep the asset live through judging.
- **Video:** "Sintel" © copyright Blender Foundation | durian.blender.org, CC BY 3.0. The credit is in the page footer and on the title page. The official EN/FR subtitles are in `src/video/lesson/lesson-data.ts`.

## Notes
- The Vite dev server fails while the folder name contains `#`. Use `npm run build`, then `npx vite preview --port 4173`.
