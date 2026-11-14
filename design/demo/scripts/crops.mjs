// Crisp cut-outs of the controls for the composition's enlarged "pill" beats: each element at device scale 3.
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const DIR = join(here, 'crops');
mkdirSync(DIR, { recursive: true });
const OVERLAY = readFileSync(join(here, 'overlay.js'), 'utf8');

const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
async function session(url, viewport = { width: 1920, height: 1080 }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 3 });
  const page = await context.newPage();
  await page.addInitScript(OVERLAY);
  await page.addInitScript(() => { const h = () => document.querySelectorAll('video').forEach((v) => { v.muted = true; }); setInterval(h, 300); });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  return { context, page };
}
const shot = async (locator, name, pad = 0) => {
  const el = locator.first();
  const box = await el.boundingBox();
  if (!box) return console.log('missing', name);
  await el.scrollIntoViewIfNeeded();
  await el.page().waitForTimeout(300);
  const b = await el.boundingBox();
  await el.page().screenshot({ path: join(DIR, `${name}.png`), clip: { x: Math.max(0, b.x - pad), y: Math.max(0, b.y - pad), width: b.width + pad * 2, height: b.height + pad * 2 }, omitBackground: true });
  console.log('crop', name, Math.round(b.width), 'x', Math.round(b.height));
};

// The player on its own, at the width the footage uses.
if (!process.env.CROPS_SITE_ONLY) {
  const { context, page } = await session('https://vocapedia.base44.app/player/index.html');
  await page.addStyleTag({ content: ':root{--preview-player-width:104rem}' });
  await page.locator('.media-skin').waitFor();
  await page.waitForTimeout(4000);
  await page.evaluate(() => window.__demo?.hide());
  await shot(page.locator('.media-play-button'), 'seal', 14);
  await shot(page.locator('.voca-transport'), 'transport', 10);
  await shot(page.locator('.voca-pages'), 'folio', 10);
  await shot(page.locator('.voca-volume'), 'inkwell', 10);
  await shot(page.locator('.voca-subtitles-button'), 'magnifier', 10);
  await shot(page.locator('.voca-dial-button'), 'dial', 10);
  await shot(page.locator('.media-fullscreen-button'), 'book', 10);
  await shot(page.locator('.voca-study-button'), 'quill', 10);
  await shot(page.locator('.voca-review-button'), 'review', 10);
  await shot(page.locator('.video-controls-end'), 'desk-end', 12);
  await shot(page.locator('.voca-thumb-index'), 'tabs', 8);
  // The ribbon: a slice around the clip.
  const slider = await page.locator('.media-time-slider').boundingBox();
  await page.screenshot({ path: join(DIR, 'ribbon.png'), clip: { x: slider.x - 8, y: slider.y - 6, width: 420, height: slider.height + 12 }, omitBackground: true });
  await context.close();
}
// The site: search field, nav link, and the watch page's stats strip and a word card.
{
  const { context, page } = await session('https://vocapedia.base44.app/');
  await page.locator('section[aria-label^="A ball of flags"]').waitFor({ timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.__demo?.hide());
  await shot(page.locator('input[placeholder*="Search a language"]').locator('..'), 'search', 8);
  await shot(page.locator('a[href="/watch"]'), 'watch-link', 10);
  await shot(page.locator('header, nav').first(), 'notch', 6);
  await context.close();
}
{
  const { context, page } = await session('https://vocapedia.base44.app/watch');
  await page.locator('iframe[title*="Vocapedia film player"]').waitFor({ timeout: 60000 });
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.__demo?.hide());
  await shot(page.locator('section[aria-label="Film"] > div.grid').first(), 'stats', 8);
  await shot(page.locator('#reading-language').locator('xpath=..'), 'reading-in', 8);
  await page.locator('li', { hasText: 'Hear it in the film' }).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await shot(page.locator('li', { hasText: 'Hear it in the film' }).first(), 'word-card', 6);
  await context.close();
}
await browser.close();
