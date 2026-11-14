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
| Stop | A brass book clasp: pauses and returns to the first page. Sits with the line-markers and ±10 corners in one brass-rimmed transport tray |
| Previous / next line | Rubric silk line-markers with a brass arrow (Shift + ← / →); hidden below 44rem |
| Time | Page numbers, "p. 151 of 888" (a page a second), with the clock time beneath |
| Mute / volume | An inkwell whose ink level is the volume (corked when muted), with a line of ink as the slider |
| Subtitles | A magnifying glass over two lines of print (gilt-ringed when on) |
| Study | A quill, which opens the Study focus slip (a switch per mode); inked, with a count, when any is on |
| Review | A fan of word cards with a gilt count of collected words; opens the review, dimmed until a word is collected |
| Settings | A brass compass-dial (the needle turns when open) |
| Fullscreen | An open book (enter) / a closed book (exit) |

**Study modes** (quill menu, all can be combined):
- **Pause after new words:** stops at the end of each line with special words.
- **Repeat each line twice:** plays every line once more before moving on.
- **Slow lines to 0.75×:** slows the speech, then returns to the viewer's own speed between lines.

## Playback effects
Every event answers in the book's own materials, in about 300–700 ms, over the plate (inside the aria-hidden indicator group; `StatusAnnouncer` still speaks them). Under reduced motion each one is a short fade. Source: `src/video/effects/`.

- **Play / pause:** nothing is drawn over the middle of the picture; paused, the picture yellows slightly, like an old engraving, until play resumes.
- **±10 s (buttons, arrow keys, double-tap):** a page corner folds over on that side, with "+10s" / "−10s" written on its back in rubric. Repeated skips keep it open and count up (+20s, +30s). The brass arrow on the button turns as it's pressed.
- **Scrubbing the ribbon:** the gilt edges riffle like thumbed pages, a bright "wet gilt" smear follows the clip, the clip lifts, the plate leans toward the direction you're turning, and the folio ("p. 533 · 8:52") is printed large across the plate.
- **Previous / next line:** a leaf sweeps across the plate in the direction of travel, under a "next line ›" slip.
- **Stop:** no overlay; the clasp pauses and returns to 0:00.

## On the Vocapedia site
The site serves this player at `/player/` and shows it on `/watch` as `srcdoc`: the host denies framing its pages by URL. Framed by a page on its own origin, the player talks to it through `src/video/lesson/site-bridge.ts`:
- **Messages it sends:** the lesson's words (`vocapedia:ready`), the reading language, each word collected, each Again/Hard/Good/Easy grade, and the 25/50/75/100% points of the film.
- **Messages it accepts:** "play this word" and "switch language".
- **What the site does with them:** files each word as an Entry in the reading language and a Review in the reader's SM-2 queue, and counts XP and the streak.

Standalone, the bridge is silent, and links open vocapedia.base44.app in a new tab. Inside the site, links stay in the same tab.

## Translation language
English is always the spoken line. **Settings (the brass dial) → Translation** chooses the line beneath it from eight languages, all from Sintel's official subtitles (durian.blender.org, CC BY 3.0): Français, Español, Deutsch, Italiano, Português, Nederlands, Polski, Русский. The source files were mixed encodings (UTF-8, Latin-1, Mac Roman) and are converted to UTF-8 in `src/video/lesson/sintel-translations.ts`.

The whole dictionary follows the choice: the subtitle line, the line-page and A–Z entries (the `ES.` / `DE.` … labels), the hover slips, the phone word slip, the running head and the cover's "EN–XX" label. Word translations for the 32 special words are in `src/video/lesson/translations.ts`. The choice is remembered in this browser (`localStorage`, with a fallback when storage is blocked), and `lang` attributes switch with it for screen readers.

## Finishing touches
- **The cover opens:** on load, the cobalt-leather cover (gilt title, fleurons) swings open over the spine, showing its marbled inside. It's skipped under reduced motion and in fullscreen.
- **Finis:** when the film ends, the dictionary turns to a colophon with a gilt wax seal, "You collected N of 32 words", and "Read again".
- **How to read this volume:** the ⓘ on the dictionary page, or the ? key, turns to a page of keys, gestures and what each desk object does. Esc or ✕ closes it.
- **Seek previews:** hovering the ribbon shows the Mux storyboard frame as a tiny engraved plate, with the time caption.
- **Loading:** a quill writes a line of ink, with "turning the page…".
- **Errors:** an "Erratum" slip pasted askew into the book, with a cobalt OK button. Its focus is trapped and Esc closes it.

## Accessibility audit (Playwright)
- **Keyboard:** the Tab order follows the visual layout (A–Z toolbar → seek ribbon → seal → ±10 → mute → volume → quill → word cards → magnifier → dial → book → credit links). Every control has a visible ring.
- **Contrast:** the subtitles sit on a soft dark backing (made solid under reduced transparency or more contrast), and words not yet swept stay at 72% white.
- **Touch:** on coarse pointers the 13px A–Z tabs fold away (the word slip announces words instead), and every button is at least 40px; the volume handle is enlarged.
- **Sizes:** checked at 390×844, 844×390 (landscape phone, now fits without scrolling), 768×1024, 1180×820 tablet, 1366×768, 1440×900, 2560×1440 and fullscreen.

## Palette — the folio edition (from vocapedia.base44.app's article pages)
| Role | Value |
| --- | --- |
| Leather | lapis `#2c3f74` → `#1e2c52` → `#141d38` → `#0b1124` (ground `#020513`); cobalt `#1f30ff` only for things you press |
| Gilt | `#cfa548` on leather, site gold `#b68a2c` on parchment, light `#ecd593`, deep `#7d5b17` |
| Page / sheet | the site's `radial-gradient(120% 90% at 50% 0%, #f7efd9, #efe3c4 45%, #e4d5b2)` and sheet gradient |
| Ink / faded / rubric / lapis | `#241a12` / `#5f4b31` / `#9d2b1b` / `#1e2c52`; hairline rules `rgb(160 134 92 / .45)` |
| Type | Source Serif 4 (headwords, time, folios), Inter (UI) |

## The folio edition
- **Every word is a Vocapedia article:**
  - an illuminated rubric initial on a gilt-ruled square (dimmed until the karaoke sweep reaches it);
  - the part of speech, the IPA in lapis, and the definition in the chosen language;
  - a hairline infobox (part of speech · register · difficulty ●●○), labelled in that language.
- **Sections:** titled in Latin as on the site: *Exempla* (the spoken line, its translation and ▶ replay), *Origo* (`← OFr dragon ← Lat dracō ← Gk drákōn`, with abbreviations expanded in the chosen language), *Falsi amici* (curated real look-alikes per language, such as FR *lame* = boiteux, PL *krew* ≈ crew; none for RU) and *Vide etiam* (related words; those in the film open their letter).
- **Rising embers:** gold and rubric sparks rise from the A–Z tab (or the phone's word slip) the first time a word is heard.
- **XP:** +10 for each newly collected word, plus points from review. "✦ N XP" sits on the desk with a "+10 XP" floater. Collected words, XP and review boxes persist in this browser.
- **Review:** the word-cards button beside the quill, or the Finis page, opens Again / Hard / Good / Easy (+0/+2/+5/+5 XP) on the dictionary page. It pauses the film, is keyboard-first, and Esc closes it. It ends with a link to the full review on Vocapedia.
- **Phrase passport:** at the end, Finis shows a rubric ink stamp ("SINTEL · EN → FR · 13 · XI · 2026"), the words collected and XP, plus Review, Read again and "Open your phrase passport ↗" (`/passport/fr` and so on; Polish falls back to the home page).
- **Reduced motion:** no embers, floaters or stamp animation. Forced colours keep the initials and stamp legible.

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
