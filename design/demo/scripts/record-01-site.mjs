// Clip 01 · The site: the flag globe, search, the encyclopedia's sections, then into the reading room.
import { open, hand, finish } from './lib.mjs';

const s = await open('https://vocapedia.base44.app/');
const { page, started } = s;
const h = hand(page, started);
const scrollTo = async (y, ms = 1400) => { await page.evaluate((top) => window.scrollTo({ top, behavior: 'smooth' }), y); await h.sleep(ms); };
const scrollToHeading = async (text, offset = 140) => {
  const y = await page.locator('h2', { hasText: text }).first().evaluate((el, o) => el.getBoundingClientRect().top + window.scrollY - o, offset);
  await scrollTo(y);
};

// The intro plays while the site raises its curtain.
await h.sleep(1200);
await h.intro('Vocapedia · the living encyclopedia', 'Learn a language<br>from its <em>words</em>', '17 languages · 344 articles · one film', { dwell: 3000 });
await page.locator('section[aria-label^="A ball of flags"]').waitFor({ timeout: 60000 });
await h.sleep(2500);

// The globe
await h.captionOn('The globe', 'A ball of flags', 'Drag to spin it; press a flag to open that language.');
await h.glide(900, 470, 800);
await h.drag(1320, 440, 1600);
await h.sleep(600);
await h.glide(1100, 500, 300);
await h.drag(760, 520, 1300);
await h.sleep(900);
await h.captionOff();

// Search
const search = page.getByPlaceholder(/Search a language/i).first();
await h.captionOn('Search', 'Any word, in any script', 'Entries are written on demand when the encyclopedia has none yet.');
await h.click(search, { ms: 900 });
await h.type('blade', 110);
await h.sleep(1800);
await page.keyboard.press('Escape');
await h.captionOff();

// Down the page
await h.captionOn('Article of the day', 'An encyclopedia, not a flashcard app', 'Each word is a full article: meaning, etymology, false friends, a quiz.');
await scrollToHeading('Article of the day');
await h.sleep(1400);
await h.captionOff();
await h.captionOn('Recent changes', 'Written and edited by its readers', 'Every revision is signed and reviewed.');
await scrollToHeading('Recent changes');
await h.sleep(1400);
await h.captionOff();
await h.captionOn('All languages', 'From Arabic to Welsh', 'Add a language and the encyclopedia writes its first pages.');
await scrollToHeading('All languages');
await h.sleep(1600);
await h.captionOff();

// Into the reading room
await scrollTo(0, 1200);
const watch = page.locator('a[href="/watch"]').first();
await h.captionOn('Watch & learn', 'Learn with a film', 'The Video.js player lives inside the encyclopedia.');
await h.click(watch, { ms: 1000 });
await page.locator('iframe[title*="Vocapedia film player"]').waitFor({ timeout: 60000 });
await h.sleep(5500);
await h.captionOff();
await h.captionOn('The reading room', 'The player, filed under Plate I', 'Watch in English with your language beneath; every word is kept.');
await scrollTo(230, 1800);
await h.sleep(1200);
await h.captionOff();
await h.captionOn('Words from this film', 'Thirty-two words, indexed', 'Each one links back to its line and to its article.');
await scrollTo(1250, 2000);
await h.sleep(1600);
await h.captionOff();
await scrollTo(230, 1600);
await h.outro('<em>Vocapedia</em>', 'vocapedia.base44.app', 'Built on Base44 · player: Video.js 10 · film: Sintel © Blender Foundation, CC BY 3.0');
await finish(s, '01-the-site', h.cues, h.markers);
