# Skin design spec — Vocapedia: The Living Encyclopedia

Status: **built** (Video.js 10.3.0, React + plain CSS, from Scaffold; theme `data-theme="vocapedia"`).

## Concept
Vocapedia calls itself "the free encyclopedia of languages", so the player *is* an encyclopedia: an open volume bound in Vocapedia cobalt, and a dictionary that writes itself as the film speaks.

- **Karaoke subtitles:** on the plate, the English line sweeps word by word. The timing is estimated from word length across each subtitle line. Special words turn gold, with an underline that draws in and a ✦ spark. The French line sits beneath.
- **A–Z thumb index:** when a special word is spoken, its letter's tab pulls out past the fore-edge like a drawer, with the word written on it in gilt. Letters already heard stay gilt, and letters the film never uses are dimmed. Pressing a tab jumps to that letter's first word and opens the glossary there. It is one Tab stop; the arrow keys move between letters.
- **Right page, "Your Glossary"** (the film is the left page; the old A–Z glossary list was removed):
  - **Just heard:** one page per spoken line, not per word, so it's readable while the film plays. The page turns as a line with special words begins. It quotes the line and lists each special word in it (headword, part of speech, IPA, definition, French), with a gold marker filling in as the karaoke sweep reaches each word.
  - **Paging:** ‹ › buttons page back through earlier lines ("Earlier", with "● Back to live").
  - **Hold:** while the pointer or keyboard focus is on the page, the card holds still and a rubric "Held" ribbon hangs from it. On release, it jumps to the live line.
- **Study mode:** the "Study" bookmark on the cover pauses the video at the end of every line with special words. The wax seal glows until it's pressed to read on.
- **Seek bar:** the page edges, gilt where read, with a silk ribbon bookmark and a dog-ear for every line of dialogue.
- **Play/pause:** a wax seal.
- **Phones:** the book folds down to its gilt trim. A word slip ("✦ dragon · dragon") slides in at the corner of the plate.
- **Art:** every ornament is CSS or inline SVG, with no images.

**Submission blurb:** The Living Encyclopedia is a Video.js 10 skin for Vocapedia, the free encyclopedia of languages. The player is an open volume bound in Vocapedia cobalt, with the film as an engraved plate. As each line is spoken, the subtitle sweeps word by word, and every word worth learning turns gold. Its A–Z thumb tab pulls out with the word written on it, and the right page turns to its dictionary entry. The page edges are the timeline, with a silk ribbon as the bookmark, and play/pause is a wax seal.

## Latest interactions
- **Page turn:** the whole right page turns like a real leaf on every change of line, letter section or ‹ › page. A copy of the old page swings over the spine with its paper back and shading, while the new page waits underneath. Going back brings a leaf over from the left. Under reduced motion the page simply changes.
- **A–Z tabs open a section:** clicking a tab opens that letter's section on the dictionary page, listing every word under the letter in one place (definition, IPA, French, and a ▶ time button that replays its line). Words not heard yet are lighter. Clicking the tab again, or "✕ Close", turns back. The open tab shows in cobalt.
- **Hover translation:** hovering a gold word in the subtitles shows a paper slip with its French and part of speech.
- **Drawer labels:** long words in the pulled-out tabs are no longer clipped (the page clips at the window edge, not at the book).

## The scholar's desk (controls)
The controls are objects from a lexicographer's desk, set into brass-rimmed recesses in the leather, below the page-edge timeline. Each is an inline SVG (`src/video/desk-icons.tsx`) inside a real button with a tooltip and a gilt focus ring.

| Control | Object |
| --- | --- |
| Play / pause | Cobalt wax seal |
| −10 s / +10 s | Dog-eared page corners with "10" written on them |
| Time | Page numbers, "p. 151 of 888" (a page a second), with the clock time beneath |
| Mute / volume | An inkwell whose ink level is the volume (corked when muted), with a line of ink as the slider |
| Subtitles | A magnifying glass over two lines of print (gilt-ringed when on) |
| Study | A quill, which opens the study modes; inked, with a count, when any is on |
| Settings | A brass compass-dial (the needle turns when open) |
| Fullscreen | An open book (enter) / a closed book (exit) |

**Study modes** (quill menu, all can be combined):
- **Pause after new words:** stops at the end of each line with special words.
- **Repeat each line twice:** plays every line once more before moving on.
- **Slow lines to 0.75×:** slows the speech, then returns to the viewer's own speed between lines.

## Translation language
English is always the spoken line. **Settings (the brass dial) → Translation** chooses the line beneath it from eight languages, all from Sintel's official subtitles (durian.blender.org, CC BY 3.0): Français, Español, Deutsch, Italiano, Português, Nederlands, Polski, Русский. The source files were mixed encodings (UTF-8, Latin-1, Mac Roman) and are converted to UTF-8 in `src/video/lesson/sintel-translations.ts`.

The whole dictionary follows the choice: the subtitle line, the line-page and A–Z entries (the `ES.` / `DE.` … labels), the hover slips, the phone word slip, the running head and the cover's "EN–XX" label. Word translations for the 32 special words are in `src/video/lesson/translations.ts`. The choice is remembered in this browser (`localStorage`, with a fallback when storage is blocked), and `lang` attributes switch with it for screen readers.

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
