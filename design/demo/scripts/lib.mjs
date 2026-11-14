// Shared recording helpers: a browser that records 1920×1080, and a "hand" that glides the gold cursor, presses,
// types, scrolls, shows captions and key badges, and keeps the sound-cue list in step with the video clock.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const here = dirname(fileURLToPath(import.meta.url));
export const OUT = join(here, 'out');
mkdirSync(OUT, { recursive: true });
const OVERLAY = readFileSync(join(here, 'overlay.js'), 'utf8');
export const W = 1920, H = 1080;

export async function open(url, { viewport = { width: W, height: H } } = {}) {
  const browser = await chromium.launch({
    // The real GPU (D3D11 through ANGLE): the site's WebGL globe runs at 60 fps instead of 5 in software.
    args: ['--autoplay-policy=no-user-gesture-required', '--force-device-scale-factor=1', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
  });
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    recordVideo: { dir: OUT, size: viewport },
  });
  const started = Date.now();
  const page = await context.newPage();
  await page.addInitScript(OVERLAY);
  // Keep the film silent in the recording: the clips carry only their own sound effects.
  await page.addInitScript(() => {
    const mute = () => document.querySelectorAll('video, audio').forEach((v) => { v.muted = true; v.volume = 0; });
    new MutationObserver(mute).observe(document.documentElement, { childList: true, subtree: true });
    setInterval(mute, 500);
  });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  return { browser, context, page, started };
}

const ease = (t) => 1 - Math.pow(1 - t, 3);
/** Pacing: every wait and glide is scaled by this (DEMO_SPEED=0.7 makes the clip ~30% shorter). */
const SPEED = Number(process.env.DEMO_SPEED || 1);

/** The hand: drives the overlay cursor in `page` (the top document) and the real mouse together. */
export function hand(page, started) {
  const demo = (fn, ...args) => page.evaluate(([f, a]) => window.__demo[f](...a), [fn, args]);
  const clock = () => (Date.now() - started) / 1000; // seconds since the video began
  const cues = [];
  const cue = (sound) => cues.push({ t: clock(), sound });
  const sleep = (ms) => page.waitForTimeout(ms * SPEED);
  const h = {
    cues,
    sleep,
    clock,
    async glide(x, y, ms = 650) {
      ms *= SPEED;
      const from = await demo('where');
      // Time-based, so a busy page gets fewer steps rather than a slower glide.
      const t0 = Date.now();
      let k = 0;
      while (k < 1) {
        k = Math.min(1, (Date.now() - t0) / ms);
        const e = ease(k);
        const nx = from.x + (x - from.x) * e, ny = from.y + (y - from.y) * e;
        await page.mouse.move(nx, ny);
        await demo('place', nx, ny);
        if (k < 1) await page.waitForTimeout(16);
      }
    },
    /** Glide to the centre of a locator (in the top page) and press it. */
    async click(locator, { ms = 650, dx = 0, dy = 0, hold = 90 } = {}) {
      const box = await locator.boundingBox();
      if (!box) throw new Error('no box for ' + locator);
      await h.glide(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, ms);
      await h.press(hold);
    },
    async press(hold = 90) {
      await demo('down'); cue('click');
      await page.mouse.down(); await sleep(hold); await page.mouse.up();
      await demo('up');
    },
    /** Hover without pressing. */
    async hover(locator, { ms = 600, dx = 0, dy = 0 } = {}) {
      const box = await locator.boundingBox();
      await h.glide(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, ms);
    },
    /** Drag from the current spot to (x, y). */
    async drag(x, y, ms = 1200) {
      await demo('down'); cue('click'); await page.mouse.down();
      await h.glide(x, y, ms);
      await page.mouse.up(); await demo('up');
    },
    async type(text, delay = 90) {
      for (const ch of text) { await page.keyboard.type(ch); cue('click'); await sleep(delay); }
    },
    async caption(label, title, line, { dwell = 3200 } = {}) {
      await demo('caption', label, title, line || ''); cue('swish');
      if (dwell) { await sleep(dwell); await demo('uncaption'); }
    },
    captionOn: (label, title, line) => demo('caption', label, title, line || '').then(() => cue('swish')),
    captionOff: () => demo('uncaption'),
    async key(keys, what, combo, { dwell = 1400, press = true } = {}) {
      await demo('key', keys, what || ''); cue('click');
      await sleep(150);
      if (press) await page.keyboard.press(combo || keys[0]);
      await sleep(dwell);
      await demo('unkey');
    },
    async intro(eyebrow, big, sub, { dwell = 2600 } = {}) {
      await demo('full', `<div><div class="eyebrow">${eyebrow}</div><div class="big">${big}</div><div class="rule"></div><div class="sub">${sub}</div><div class="fleuron">❦</div></div>`);
      cue('swish'); await sleep(dwell); await demo('unfull'); await sleep(750);
    },
    async outro(big, url, small, { dwell = 3600 } = {}) {
      await demo('full', `<div><div class="big">${big}</div><div class="url">${url}</div><div class="rule"></div><div class="small">${small}</div></div>`);
      cue('swish'); cue('chime'); await sleep(dwell);
    },
    chime: () => cue('chime'),
    hideCursor: () => demo('hide'),
    showCursor: () => demo('show'),
  };
  return h;
}

/** Stop recording, move the WebM to a stable name and write the cue list beside it. */
export async function finish({ browser, context, page }, name, cues) {
  const video = page.video();
  await context.close();
  const path = await video.path();
  const webm = join(OUT, `${name}.webm`);
  renameSync(path, webm);
  writeFileSync(join(OUT, `${name}.cues.json`), JSON.stringify(cues, null, 1));
  await browser.close();
  console.log('recorded', webm, cues.length, 'cues');
}
