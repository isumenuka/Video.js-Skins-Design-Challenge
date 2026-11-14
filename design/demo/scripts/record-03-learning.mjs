// Clip 03 · Learning: words pull out tabs, go into the reader's real review queue, and link back to the film.
import { open, hand, finish } from './lib.mjs';

const s = await open('https://vocapedia.base44.app/watch');
const { page, started } = s;
const h = hand(page, started);
const scrollTo = async (y, ms = 1400) => { await page.evaluate((top) => window.scrollTo({ top, behavior: 'smooth' }), y); await h.sleep(ms); };

await h.sleep(800);
await h.intro('Watch & learn', 'Every word you hear<br>is <em>kept</em>', 'The film files its words in your Vocapedia reviews');
await page.locator('iframe[title*="Vocapedia film player"]').waitFor({ timeout: 60000 });
const frame = page.frames().find((f) => f !== page.mainFrame() && f.url().startsWith('about:srcdoc'));
await frame.locator('.media-skin').waitFor({ timeout: 60000 });
await h.sleep(2500);
await scrollTo(230, 1200);
const f$ = (sel) => frame.locator(sel).first();

// 1 · Play up to the first spoken line; the tab pulls out
await frame.evaluate(() => { const v = document.querySelector('video, mux-video, hls-video'); v.currentTime = 101; });
await h.captionOn('The A–Z tabs', 'New words pull out a tab', 'Spoken for the first time, a word rises with embers and is written into the dictionary.');
await h.click(f$('.media-play-button'), { ms: 900 });
await frame.locator('.voca-thumb-word').first().waitFor({ timeout: 30000 });
await h.sleep(2600);
await h.captionOff();

// 2 · The site reacts: the line under the film, the stats, a card turns
await h.captionOn('Filed in Vocapedia', 'Straight into your review queue', '+2 XP a word · SM-2 scheduling · your streak, all on the same site.');
await scrollTo(560, 1600);
await h.sleep(2800);
await h.captionOff();
await scrollTo(230, 1200);

// 3 · The dictionary page
await h.captionOn('The dictionary page', 'Every word, defined in your language', 'The line just heard, each word with its sense, pronunciation and translation.');
await h.hover(f$('.voca-entry'), { ms: 900 });
await h.sleep(2200);
await h.captionOff();

// 4 · Study focus
await h.captionOn('The quill · Study focus', 'Let the film teach', 'Pause after new words, repeat each line, or slow the speech.');
await h.click(f$('.voca-study-button'));
await h.sleep(1000);
await h.click(frame.getByRole('menuitemcheckbox').first());
await h.sleep(1500);
await h.key(['Esc'], 'Close', 'Escape', { dwell: 900 });
await h.captionOff();

// 5 · Review
await h.captionOn('The word cards · Review', 'Again · Hard · Good · Easy', 'Grading here moves the word’s schedule in your Vocapedia queue.');
await h.click(f$('.voca-review-button'));
await h.sleep(1500);
await h.click(f$('.voca-review-show'));
await h.sleep(1300);
await h.click(frame.getByRole('button', { name: /^Good$/ }).first());
await h.sleep(2000);
await h.key(['Esc'], 'Close the review', 'Escape', { dwell: 900 });
await h.captionOff();

// 6 · Back from a card into the film, then on to the article
await h.captionOn('Words from this film', 'Hear it in the film', 'Each card turns the film to its line, and opens the full article.');
await scrollTo(1250, 1600);
const card = page.locator('li', { hasText: 'Hear it in the film' }).first();
await h.click(card.getByRole('button', { name: /Hear it in the film/ }));
await h.sleep(2600);
await scrollTo(1250, 1000);
const entry = card.getByRole('link', { name: /Open entry/ });
if (await entry.count()) {
  await h.click(entry);
  await h.sleep(4200);
}
await h.captionOff();
await h.outro('Every word, <em>kept</em>', 'vocapedia.base44.app/watch', 'Video.js 10 skin · Sintel © Blender Foundation · CC BY 3.0 · streamed by Mux');
await finish(s, '03-learning', h.cues, h.markers);
