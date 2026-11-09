# Skin design spec — challenge-skin

Status: **partial — the visual concept is not chosen yet** (type, color, icon style, signature element and motion all depend on it).

## Agreed
- Base: Scaffold, React + plain CSS, video preset (Video.js 10.3.0).
- Surface: **solid control panel**. The controls sit on an opaque (or near-opaque) bar, so they stay readable over any footage.
- Controls, in focus/visual order:
  1. Play/pause
  2. Seek back 10s
  3. Seek forward 10s
  4. Time (current / duration)
  5. Seek bar
  6. Mute + volume
  7. Captions
  8. Settings menu (playback speed, quality)
  9. Picture-in-picture
  10. Fullscreen

  The exact order is to be settled with the layout once the concept is chosen.
- Keep the skin's error dialog, hotkeys, gestures and status announcer.
- Accessibility targets:
  - Touch targets of 44px or more.
  - Visible `:focus-visible` ring.
  - Menus close with Esc and return focus to their trigger.
  - Reduced motion collapses all motion tokens.
  - Text contrast of 4.5:1 or better on the panel.
- Responsive: container queries. At narrow widths, the seek bar takes its own row and volume collapses behind mute.

## Pending (needs the concept)
- Typography
- Palette and surfaces
- Icon style
- Seek-bar treatment
- Time display format
- Motion character
