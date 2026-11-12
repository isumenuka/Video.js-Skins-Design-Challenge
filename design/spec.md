# Skin design spec — Vocapedia Language Lab

Status: **built** (Video.js 10.3.0, React + plain CSS, from Scaffold; theme `data-theme="vocapedia"`).

## Concept
A player for learning a language from film, in the brand of Vocapedia (vocapedia.base44.app, "the free encyclopedia of languages"). The spoken line is set like a dictionary headword in Source Serif 4, with its translation beneath it. Every word worth learning is a button that opens its gloss, with a link to Vocapedia and a ☆ save. Sentence tools and a dialogue lane on the seek bar turn the player into a study desk.

**Submission blurb:** Vocapedia Language Lab turns a Video.js 10 player into a study desk for learning a language from film. The spoken line is set in Source Serif like an encyclopedia headword, with the translation beneath it, and every word worth learning opens its gloss and its Vocapedia article. Repeat segment, replay sentence, and pause per line work on whole sentences, and each line of dialogue appears as a dash along the seek bar. Everything uses Vocapedia's cobalt on deep navy, on a near-opaque bar that stays readable over Sintel's snow and caves.

## Tokens (`src/video/vocapedia.css`)
| Token | Value | Source |
| --- | --- | --- |
| Ground | `#020513` | site `--ground` |
| Primary | `#1f30ff` cobalt | site `--cobalt` / `--primary` |
| Focus / link | `#8fa0ff` periwinkle | site `--link` |
| Glow | `#5b6bff` | site `--ring` |
| Border | `hsl(224 38% 22%)` | site `--border` (lifted, derived) |
| Text / muted | `hsl(222 25% 94%)` / `hsl(222 20% 72%)` | site foreground / muted (muted lifted for 4.5:1, derived) |
| Saved star | `hsl(43 80% 62%)` | site `--chart-3` |
| Type | Inter (UI), Source Serif 4 (spoken line) | site fonts |
| Radius | 0.5rem controls, 0.375rem menus | site `--radius` |

## Layout (source order = focus order)
- **Top bar:** language chip (EN → Français) · Repeat segment (`aria-pressed`) · Replay sentence
- **Over the video:** dual subtitles (the spoken line in serif with a dark text plate and a periwinkle glow, the translation in Inter). Glossed words are underlined buttons whose popover holds the gloss, a Vocapedia link and Save. The 🔊 button reads the line aloud with speech synthesis.
- **Bar:** seek bar with the dialogue lane (each cue drawn as a dash; the active cue lights up) → Play (filled cobalt, the bar's one solid key) · −10 · +10 · Next sentence · time · mute + inline volume ‖ Native/Trans./Both radio group · Pause-per-line switch · Subtitles toggle · Settings (Speed 0.5–1.5 with an "Active" badge, Quality, Subtitles, Replay, Pause per line, Repeat) · Fullscreen
- **Page (workbench `preview.html`):** header (logo · Language Lab pill · lesson title), Transcript/Vocabulary tabs (ARIA tabs; the active cue glows and auto-scrolls; click to seek), "Vocabulary from this scene", footer with the Sintel credit.

## Responsive (container queries on `media-root`)
- ≥ 56rem: everything in the bar.
- < 56rem: the Pause-per-line switch moves to Settings. < 46rem: Native/Trans./Both moves to Settings.
- < 36rem: top chips go icon-only; their labels stay for screen readers.
- < 34rem: volume shrinks to the mute button.
- < 30rem (phones): the bar is one row (no ±10, no CC; double-tap and the arrow keys still seek); the top bar moves to Settings; subtitles sit just above the bar at smaller sizes.

## Accessibility
- 2px periwinkle focus ring on every control. Touch targets are 2.75rem under `pointer: coarse`.
- The radio group and tabs use roving tabindex with arrow keys. Glosses close with Escape and return focus to the word.
- The segmented group's arrow keys are handled natively and prevented, so the player's seek hotkeys don't also fire.
- Reduced motion turns off glows, transitions, slide-ins, and smooth transcript scrolling. Reduced transparency and more contrast use solid surfaces. Forced colors are supported.

## Media (submission info)
- **Mux playback ID:** `fNEeWPY4UUEkfCFd9617w8gvYFEsFOv72rPQj3qKG700` (public). Keep the asset live through judging.
- **Video:** "Sintel" © copyright Blender Foundation | durian.blender.org, CC BY 3.0. The credit appears in the page footer. The official EN/FR subtitles are in `src/video/lesson/lesson-data.ts`.

## Known limits
- Vocapedia has no English entries yet, so word links open Vocapedia's search for the term (`/search?q=…&language=en`), which offers to write the entry.
- The Vite dev server fails while the project folder name contains `#`. `npm run build` works; preview with any static server on `dist/`, or rename the folder to use `npm run dev`.
