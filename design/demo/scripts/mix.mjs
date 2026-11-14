// Lays Sintel's own sound under every screen beat (aligned to what the footage shows), adds the click / swish /
// chime events, normalizes, and muxes the result with the rendered video. usage: node mix.mjs 02 <outName>
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const ffmpeg = createRequire(import.meta.url)('ffmpeg-static');
const [id, outName] = process.argv.slice(2);
const info = JSON.parse(readFileSync(join(here, 'final', `${id}.events.json`), 'utf8'));
const footage = JSON.parse(readFileSync(join(here, 'footage', `${info.footage}.json`), 'utf8'));
const dest = process.env.DEMO_DEST || join(here, 'final');
mkdirSync(dest, { recursive: true });

// Film time at a footage second: the nearest sample of the recorder's clock.
const samples = footage.film;
const sampleAt = (ft) => { let best = samples[0]; for (const s of samples) if (Math.abs(s.t - ft) < Math.abs(best.t - ft)) best = s; return best; };

// Each screen beat → runs of continuous, unmuted, playing film: [compStart, filmStart, length]
const runs = [];
for (const seg of info.audio) {
  const step = 0.2;
  let run = null;
  for (let ct = seg.start; ct < seg.end; ct += step) {
    const s = sampleAt(seg.footageStart + (ct - seg.start));
    const playing = !s.paused && !s.muted && s.time > 0.1;
    if (run && playing) {
      const expect = run.film + (ct - run.comp);
      if (Math.abs(s.time - expect) < 0.45) { run.len = ct - run.comp + step; continue; }
    }
    if (run) runs.push(run);
    run = playing ? { comp: ct, film: s.time, len: step } : null;
  }
  if (run) runs.push(run);
}
const kept = runs.filter((r) => r.len >= 0.6);
console.log(`${kept.length} film runs, ${kept.reduce((a, r) => a + r.len, 0).toFixed(1)}s of film sound`);

const sounds = { click: 'click.wav', swish: 'swish.wav', chime: 'chime.wav' };
const gains = { click: 0.8, swish: 0.42, chime: 0.6 };
const inputs = ['-i', join(here, 'final', `${id}.video.mp4`), '-i', join(here, 'sintel.wav')];
const filters = [];
const mixIn = [];
kept.forEach((r, i) => {
  const fade = Math.min(0.25, r.len / 3);
  filters.push(`[1:a]atrim=start=${r.film.toFixed(3)}:duration=${r.len.toFixed(3)},asetpts=PTS-STARTPTS,afade=t=in:d=${fade},afade=t=out:st=${(r.len - fade).toFixed(3)}:d=${fade},volume=0.9,adelay=${Math.round(r.comp * 1000)}|${Math.round(r.comp * 1000)}[f${i}]`);
  mixIn.push(`[f${i}]`);
});
info.events.forEach((e, i) => {
  if (!sounds[e.sound] || !existsSync(join(here, sounds[e.sound]))) return;
  inputs.push('-i', join(here, sounds[e.sound]));
  const idx = inputs.filter((x) => x === '-i').length - 1;
  const d = Math.max(0, Math.round(e.t * 1000));
  filters.push(`[${idx}:a]aformat=channel_layouts=stereo,adelay=${d}|${d},volume=${gains[e.sound]}[s${i}]`);
  mixIn.push(`[s${i}]`);
});
filters.push(`anullsrc=r=48000:cl=stereo:d=${info.duration.toFixed(2)}[bed]`);
filters.push(`[bed]${mixIn.join('')}amix=inputs=${mixIn.length + 1}:normalize=0:dropout_transition=0,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.95[a]`);

const mp4 = join(dest, `${outName}.mp4`);
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filters.join(';'), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-shortest', mp4], { stdio: 'inherit' });
const posterAt = process.env.POSTER || String(Math.max(2, (info.audio[0]?.start ?? 2) + 2));
execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-ss', posterAt, '-i', mp4, '-frames:v', '1', join(dest, `${outName}.png`)], { stdio: 'ignore' });
console.log('wrote', mp4, 'poster at', posterAt + 's');
