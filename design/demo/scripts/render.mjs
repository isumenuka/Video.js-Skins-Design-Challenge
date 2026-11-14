// Renders a scene frame by frame through the composition page, then encodes the frames and mixes the sound.
// usage: node render.mjs 02   (reads scenes/02.json and footage/<scene.footage>.{webm,json})
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ffmpeg = createRequire(import.meta.url)('ffmpeg-static');
const id = process.argv[2];
const FPS = 30;
const scene = JSON.parse(readFileSync(join(here, 'scenes', `${id}.json`), 'utf8'));
const footage = JSON.parse(readFileSync(join(here, 'footage', `${scene.footage}.json`), 'utf8'));
const frames = join(here, 'frames', id);
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });
const out = join(here, 'final');
mkdirSync(out, { recursive: true });

// Software video decoding: the D3D11 decoder returns blank frames on some seeks; the GPU still composites the page.
const browser = await chromium.launch({ args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-accelerated-video-decode', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'warning' || m.type() === 'error') console.log('[page]', m.text()); });
await page.goto(pathToFileURL(join(here, 'comp', 'index.html')).href, { waitUntil: 'load' });
const base = pathToFileURL(here).href;
const duration = await page.evaluate(([s, f, b]) => window.load(s, f, b), [scene, footage, base]);
await page.evaluate(() => window.ready());
await page.waitForTimeout(800);
const info = await page.evaluate(() => window.info());
console.log(`scene ${id}: ${duration.toFixed(1)}s, ${info.beats.length} beats, ${info.events.length} sound events, ${info.audio.length} film segments`);

const total = Math.ceil(duration * FPS);
const t0 = Date.now();
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.seek(t), i / FPS);
  const jpg = await page.screenshot({ type: 'jpeg', quality: 94, animations: 'allow', caret: 'hide' });
  writeFileSync(join(frames, String(i).padStart(5, '0') + '.jpg'), jpg);
  if (i % 150 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
writeFileSync(join(out, `${id}.events.json`), JSON.stringify({ duration, ...info, footage: scene.footage }, null, 1));

const silent = join(out, `${id}.video.mp4`);
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(frames, '%05d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high', silent], { stdio: 'inherit' });
console.log('encoded', silent, `${((Date.now() - t0) / 1000).toFixed(0)}s`);
