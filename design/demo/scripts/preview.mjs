// Quick look: screenshots of a scene at chosen seconds, tiled. usage: node preview.mjs 02 [t1 t2 ...]
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ffmpeg = createRequire(import.meta.url)('ffmpeg-static');
const [id, ...times] = process.argv.slice(2);
const scene = JSON.parse(readFileSync(join(here, 'scenes', `${id}.json`), 'utf8'));
const footage = JSON.parse(readFileSync(join(here, 'footage', `${scene.footage}.json`), 'utf8'));
const dir = join(here, 'preview'); mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-accelerated-video-decode'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', (m) => console.log('[page]', m.type(), m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(pathToFileURL(join(here, 'comp', 'index.html')).href, { waitUntil: 'load' });
const duration = await page.evaluate(([s, f, b]) => window.load(s, f, b), [scene, footage, pathToFileURL(here).href]);
await page.evaluate(() => window.ready());
await page.waitForTimeout(800);
const info = await page.evaluate(() => window.info());
console.log('duration', duration.toFixed(1), 'beats:', info.beats.map((b) => `${b.cls}@${b.start.toFixed(1)}+${b.dur.toFixed(1)}`).join(' '));
const ts = times.length ? times.map(Number) : info.beats.slice(0, 12).map((b) => b.start + Math.min(1.6, b.dur / 2));
const files = [];
for (const t of ts) {
  const t0 = Date.now();
  await page.evaluate((x) => window.seek(x), t);
  const f = join(dir, `${id}-${t.toFixed(1)}.png`);
  await page.screenshot({ path: f });
  files.push(f);
  console.log('frame', t.toFixed(1), (Date.now() - t0) + 'ms');
}
await browser.close();
const n = files.length, cols = Math.min(4, n), rows = Math.ceil(n / cols);
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', ...files.flatMap((f) => ['-i', f]), '-filter_complex', `${files.map((_, i) => `[${i}]scale=640:-1[s${i}]`).join(';')};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${n}:layout=${files.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|')}:fill=black[o]`, '-map', '[o]', join(dir, `${id}-sheet.png`)]);
console.log('sheet', join(dir, `${id}-sheet.png`), rows, 'rows');
