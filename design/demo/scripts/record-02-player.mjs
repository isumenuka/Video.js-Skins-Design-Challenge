// Clip 02 · The Player: every control on the desk, shown with the gold cursor and key badges.
import { open, hand, finish } from './lib.mjs';

const s = await open('https://vocapedia.base44.app/player/index.html');
const { page, started } = s;
// Fill the 1080p frame, and lift the player so the caption cards have room beneath it.
await page.addStyleTag({ content: ':root{--preview-player-width:104rem} #root{translate:0 -105px}' });
await page.locator('.media-skin').waitFor();
await page.waitForTimeout(3500);
const h = hand(page, started);
const $ = (sel) => page.locator(sel).first();
const focusPlayer = () => page.evaluate(() => document.querySelector('.media-skin').focus());
const settle = (ms = 900) => h.sleep(ms);

await h.intro('A Video.js 10 skin', 'The <em>Living</em><br>Encyclopedia', 'Every control is an object on a scholar’s desk');

// 1 · The wax seal
await h.captionOn('The wax seal · Play', 'Press the seal', 'The film begins. Pause, and the picture yellows like an old print.');
await h.click($('.media-play-button'), { ms: 900 });
await settle(2600);
await h.glide(700, 600, 500); await focusPlayer();
await h.key(['Space'], 'Pause', 'Space', { dwell: 1600 });
await h.key(['Space'], 'Play', 'Space', { dwell: 1200 });
await h.captionOff();

// 2 · The clasp and the page corners
await h.captionOn('The brass clasp · Stop', 'Close the book', 'Stop returns to the first page.');
await h.click($('.voca-stop-button'));
await settle(1800);
await h.click($('.media-play-button'), { ms: 500 });
await settle(600);
await h.captionOn('The page corners · ±10 s', 'Fold a corner forward', 'Press again and they add up: +10, +20, +30.');
const fwd = $('.voca-seek-button[data-direction="forward"], .voca-seek-button:nth-of-type(2)');
await h.click(page.locator('.voca-seek-button').nth(1));
await h.sleep(260); await h.press(); await h.sleep(260); await h.press();
await settle(1500);
await h.click(page.locator('.voca-seek-button').nth(0));
await settle(900);
await h.glide(700, 600, 400); await focusPlayer();
await h.key(['→'], '+10 s', 'ArrowRight', { dwell: 1100 });
await h.key(['←'], '−10 s', 'ArrowLeft', { dwell: 1100 });
await h.captionOff();

// 3 · The line-markers
await h.captionOn('The line-markers', 'Turn to the next spoken line', 'A leaf sweeps across the plate. Shift + ← / → from the keyboard.');
await h.click($('.voca-line-button[data-direction="forward"]'));
await settle(2200);
await h.glide(700, 600, 400); await focusPlayer();
await h.key(['Shift', '→'], 'Next line', 'Shift+ArrowRight', { dwell: 1800 });
await h.click($('.voca-line-button[data-direction="back"]'));
await settle(1200);
await h.captionOff();

// 4 · The ribbon
await h.captionOn('The silk ribbon · Timeline', 'Drag the brass clip', 'The gilt edges riffle, the plate leans, and the folio is printed large.');
const thumb = $('.media-time-slider-thumb');
await h.hover(thumb, { ms: 700 });
await h.sleep(500);
const tb = await thumb.boundingBox();
await h.drag(tb.x + 560, tb.y + tb.height / 2, 2400);
await settle(700);
const tb2 = await thumb.boundingBox();
await h.glide(tb2.x + tb2.width / 2, tb2.y + tb2.height / 2, 300);
await h.drag(tb2.x - 260, tb2.y + tb2.height / 2, 1400);
await settle(900);
await h.captionOff();

// 5 · The folio
await h.hover($('.voca-pages'), { ms: 700 });
await h.caption('The folio · Time', 'p. 150 of 888', 'A page a second, with the clock set in small print beneath.', { dwell: 2600 });

// 6 · The inkwell
await h.captionOn('The inkwell · Volume', 'Cork the well to mute', 'The ink level is the volume. M from the keyboard.');
await h.click($('.voca-inkwell'));
await settle(1200);
await h.click($('.voca-inkwell'), { ms: 300 });
await settle(600);
const vt = $('.voca-volume-slider-thumb');
await h.hover(vt, { ms: 500 });
const vb = await vt.boundingBox();
await h.drag(vb.x - 40, vb.y + vb.height / 2, 900);
await settle(500);
await h.drag(vb.x + 30, vb.y + vb.height / 2, 700);
await settle(500);
await h.glide(700, 600, 400); await focusPlayer();
await h.key(['M'], 'Mute', 'm', { dwell: 1100 });
await h.key(['M'], 'Unmute', 'm', { dwell: 900 });
await h.captionOff();

// 7 · The magnifier
await h.captionOn('The magnifier · Subtitles', 'Hide the lines, or show them', 'English above, your language beneath.');
await h.click($('.voca-subtitles-button'));
await settle(1600);
await h.click($('.voca-subtitles-button'), { ms: 300 });
await settle(1000);
await h.captionOff();

// 8 · The compass dial
await h.captionOn('The compass dial · Settings', 'Translation · Speed · Quality', 'Eight languages, from Sintel’s own subtitles.');
await h.click($('.voca-dial-button'));
await settle(1100);
await h.click(page.getByRole('menuitem', { name: /Translation/ }).first());
await settle(1000);
await h.click(page.getByRole('menuitemradio', { name: /Español/ }).first());
await settle(1800);
await h.key(['Esc'], 'Close', 'Escape', { dwell: 1100 });
await h.captionOff();

// 9 · The open book. (Shown, not entered: a headless recording cannot capture a fullscreen change.)
await h.captionOn('The open book · Full page', 'Open the book wide', 'The last object on the desk: full page, F from the keyboard, Esc to close.');
await h.hover($('.media-fullscreen-button'), { ms: 900 });
await settle(1600);
await h.key(['F'], 'Full page', 'f', { dwell: 1500, press: false });
await h.captionOff();

// 10 · Keyboard
await h.captionOn('Keyboard', 'Every control reachable by Tab', 'A gold-foil focus ring shows where you are.');
await h.hideCursor();
await $('.media-play-button').focus();
for (const name of ['Stop', 'Previous line', '−10 s', '+10 s', 'Next line', 'Mute', 'Volume']) {
  await h.key(['Tab'], name, 'Tab', { dwell: 520 });
}
await h.key(['?'], 'How to read this volume', '?', { dwell: 3200 });
await h.key(['Esc'], 'Close the guide', 'Escape', { dwell: 1000 });
await h.showCursor();
await h.captionOff();

// 11 · Responsive, then the colophon
await h.caption('Responsive', 'From phone to full page', 'The desk objects give way in steps; nothing overflows.', { dwell: 2600 });
await h.outro('<em>Vocapedia</em> · Video.js 10', 'vocapedia.base44.app/watch', 'Sintel © Blender Foundation · CC BY 3.0 · streamed by Mux · built with @videojs/react');
await finish(s, '02-the-player', h.cues, h.markers);
