// WebM + cue list → H.264 MP4 with the sound effects mixed in at their cue times, plus a poster frame.
// usage: node finish.mjs <name> [--trim-start s] [--trim-end s] [--poster s]
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { here, OUT } from './lib.mjs';

const ffmpeg = createRequire(import.meta.url)('ffmpeg-static');
const [name, ...rest] = process.argv.slice(2);
const opt = (k, d) => { const i = rest.indexOf(k); return i >= 0 ? Number(rest[i + 1]) : d; };
const trimStart = opt('--trim-start', 0), trimEnd = opt('--trim-end', 0), posterAt = opt('--poster', 6);
const dest = process.env.DEMO_DEST || join(here, 'final');
mkdirSync(dest, { recursive: true });

const webm = join(OUT, `${name}.webm`);
const cues = JSON.parse(readFileSync(join(OUT, `${name}.cues.json`), 'utf8')).filter((c) => c.t >= trimStart);
const probe = (args) => execFileSync(ffmpeg, args, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();
let duration = 0;
try { execFileSync(ffmpeg, ['-i', webm], { stdio: 'pipe' }); } catch (e) { const m = String(e.stderr).match(/Duration: (\d+):(\d+):([\d.]+)/); duration = +m[1] * 3600 + +m[2] * 60 + +m[3]; }
const length = duration - trimStart - trimEnd;

// One input per cue, delayed into place, all mixed over a silent bed the length of the clip.
const sounds = { click: 'click.wav', swish: 'swish.wav', chime: 'chime.wav' };
const inputs = ['-ss', String(trimStart), '-t', String(length), '-i', webm];
const filters = [];
const labels = [];
cues.forEach((c, i) => {
  if (!sounds[c.sound] || !existsSync(join(here, sounds[c.sound]))) return;
  inputs.push('-i', join(here, sounds[c.sound]));
  const idx = inputs.filter((x) => x === '-i').length - 1;
  const delay = Math.max(0, Math.round((c.t - trimStart) * 1000));
  const gain = c.sound === 'click' ? 0.9 : c.sound === 'swish' ? 0.55 : 0.7;
  filters.push(`[${idx}:a]adelay=${delay}|${delay},volume=${gain}[s${i}]`);
  labels.push(`[s${i}]`);
});
filters.push(`anullsrc=r=48000:cl=mono:d=${length.toFixed(2)}[bed]`);
filters.push(`[bed]${labels.join('')}amix=inputs=${labels.length + 1}:normalize=0:dropout_transition=0,alimiter=limit=0.9[a]`);

const mp4 = join(dest, `${name}.mp4`);
execFileSync(ffmpeg, [
  '-y', ...inputs,
  '-filter_complex', filters.join(';'),
  '-map', '0:v', '-map', '[a]',
  '-vf', 'fps=30,format=yuv420p',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-profile:v', 'high', '-movflags', '+faststart',
  '-c:a', 'aac', '-b:a', '128k', '-shortest',
  mp4,
], { stdio: 'inherit' });
execFileSync(ffmpeg, ['-y', '-ss', String(posterAt), '-i', mp4, '-frames:v', '1', join(dest, `${name}.png`)], { stdio: 'ignore' });
console.log('wrote', mp4, 'length', length.toFixed(1) + 's', 'cues', labels.length);
