// The composition: a timeline of beats built from a scene file and the footage's markers, animated with the Web
// Animations API so that `seek(t)` can show any instant exactly (the renderer screenshots it frame by frame).
(() => {
  const S = 1000; // ms per second
  const EASE = 'cubic-bezier(.2,.8,.2,1)';
  const beatsEl = document.getElementById('beats');
  const state = { duration: 0, events: [], audio: [], videos: [], beats: [] };
  const CURSOR = `<svg class="cursor" viewBox="0 0 34 34"><defs><linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".5" stop-color="#cfa548"/><stop offset="1" stop-color="#8a6418"/></linearGradient></defs><path d="M6 3 L28 17 L17.5 18.6 L23.5 30 L19.5 31.8 L13.6 20.4 L6 27.8 Z" fill="url(#brass)" stroke="#5a4210" stroke-width="1.2" stroke-linejoin="round"/></svg>`;

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html !== undefined) e.innerHTML = html; return e; };
  // "Fold a **corner** forward / second line" → lines of words, **key** words gilt.
  // "**full page.**" marks a run of words as gilt, so the marker is resolved before the line is split into words.
  const wordsOf = (text) => text.split('/').map((line) => {
    const out = [];
    for (const part of line.trim().split(/(\*\*[^*]+\*\*[.,!?]*)/).filter(Boolean)) {
      const key = part.startsWith('**');
      for (const w of part.replace(/\*\*/g, '').trim().split(/\s+/).filter(Boolean)) out.push({ text: w, key });
    }
    return out;
  });

  function beatEl(cls, start, dur) {
    const b = el('div', `beat ${cls}`);
    beatsEl.appendChild(b);
    // Visible only inside [start, start+dur): in/out fades on the container.
    b.animate([{ opacity: 0 }, { opacity: 1, offset: Math.min(0.25, 0.3 / dur) }, { opacity: 1, offset: 1 - Math.min(0.25, 0.35 / dur) }, { opacity: 0 }], { duration: dur * S, delay: start * S, fill: 'both', easing: 'linear' });
    state.beats.push({ cls, start, dur });
    return b;
  }

  function words(start, dur, text, extra = {}) {
    const b = beatEl('words', start, dur);
    const box = el('div');
    if (extra.eyebrow) box.appendChild(el('span', 'eyebrow', extra.eyebrow));
    const lines = wordsOf(text);
    let i = 0;
    const total = lines.flat().length;
    for (const line of lines) {
      const l = el('span', 'line');
      for (const w of line) {
        const span = el('span', `w ${w.key ? 'key' : 'plain'}`, w.text);
        l.appendChild(span);
        const inAt = 0.12 + i * 0.11, hold = dur - 0.55;
        span.animate([
          { opacity: 0, filter: 'blur(16px)', transform: 'translateY(14px) scale(.94)' },
          { opacity: 0, filter: 'blur(16px)', transform: 'translateY(14px) scale(.94)', offset: inAt / dur },
          { opacity: 1, filter: 'blur(0px)', transform: 'none', offset: Math.min(0.99, (inAt + 0.55) / dur), easing: EASE },
          { opacity: 1, filter: 'blur(0px)', transform: 'none', offset: Math.min(0.995, hold / dur) },
          { opacity: 0, filter: 'blur(12px)', transform: 'translateX(-40px)' },
        ], { duration: dur * S, delay: start * S, fill: 'both', easing: 'linear' });
        i++;
      }
      box.appendChild(l);
    }
    if (extra.url) box.appendChild(el('span', 'url', extra.url));
    if (extra.rule) box.appendChild(el('span', 'rule'));
    if (extra.small) box.appendChild(el('span', 'small', extra.small));
    b.appendChild(box);
    state.events.push({ t: start + 0.1, sound: 'swish' });
    if (extra.chime) state.events.push({ t: start + 0.4, sound: 'chime' });
    void total;
  }

  function cutout(start, dur, { crop, label, h = 160, press = [0.5, 0.5], base }) {
    const b = beatEl('cutout', start, dur);
    b.appendChild(el('div', 'band'));
    const stack = el('div', 'stack');
    if (label) stack.appendChild(el('div', 'label', label));
    const pill = el('div', 'pill');
    const img = el('img'); img.src = `${base}/crops/${crop}.png`; pill.style.setProperty('--h', h + 'px');
    pill.appendChild(img);
    const ripple = el('span', 'ripple'); pill.appendChild(ripple);
    stack.appendChild(pill);
    b.appendChild(stack);
    b.insertAdjacentHTML('beforeend', CURSOR);
    const cur = b.querySelector('.cursor');
    const pressAt = 1.05; // seconds into the beat
    // The pill settles in, then dips under the press.
    stack.animate([
      { transform: 'translateY(40px) scale(.9)', filter: 'blur(10px)' },
      { transform: 'none', filter: 'blur(0px)', offset: 0.5 / dur, easing: EASE },
      { transform: 'none', filter: 'blur(0px)', offset: (pressAt - 0.02) / dur },
      { transform: 'scale(.965)', filter: 'blur(0px)', offset: (pressAt + 0.08) / dur },
      { transform: 'none', filter: 'blur(0px)', offset: (pressAt + 0.3) / dur, easing: EASE },
      { transform: 'none', filter: 'blur(0px)', offset: 1 - 0.3 / dur },
      { transform: 'translateY(-30px) scale(.96)', filter: 'blur(8px)' },
    ], { duration: dur * S, delay: start * S, fill: 'both', easing: 'linear' });
    ripple.animate([
      { opacity: 0, transform: 'scale(.3)' }, { opacity: 0, transform: 'scale(.3)', offset: pressAt / dur },
      { opacity: 1, transform: 'scale(.5)', offset: (pressAt + 0.03) / dur },
      { opacity: 0, transform: 'scale(5)', offset: Math.min(0.99, (pressAt + 0.6) / dur), easing: 'ease-out' }, { opacity: 0 },
    ], { duration: dur * S, delay: start * S, fill: 'both', easing: 'linear' });
    // Cursor: glides in from the lower right to the press point on the image.
    const place = () => {
      const r = img.getBoundingClientRect(), st = document.getElementById('stage').getBoundingClientRect();
      const px = r.left - st.left + r.width * press[0], py = r.top - st.top + r.height * press[1];
      ripple.style.left = (px - (pill.getBoundingClientRect().left - st.left)) + 'px';
      ripple.style.top = (py - (pill.getBoundingClientRect().top - st.top)) + 'px';
      cur.animate([
        { opacity: 0, transform: `translate(${px + 360}px, ${py + 220}px)` },
        { opacity: 1, transform: `translate(${px + 300}px, ${py + 190}px)`, offset: 0.25 / dur },
        { opacity: 1, transform: `translate(${px}px, ${py}px)`, offset: (pressAt - 0.1) / dur, easing: EASE },
        { opacity: 1, transform: `translate(${px}px, ${py}px) scale(.88)`, offset: (pressAt + 0.06) / dur },
        { opacity: 1, transform: `translate(${px}px, ${py}px)`, offset: (pressAt + 0.25) / dur },
        { opacity: 1, transform: `translate(${px + 20}px, ${py + 12}px)`, offset: 1 - 0.3 / dur },
        { opacity: 0, transform: `translate(${px + 80}px, ${py + 60}px)` },
      ], { duration: dur * S, delay: start * S, fill: 'both', easing: 'linear' });
    };
    if (img.complete) place(); else img.addEventListener('load', place, { once: true });
    state.events.push({ t: start + pressAt, sound: 'click' });
    state.events.push({ t: start + 0.15, sound: 'swish' });
    return b;
  }

  function screen(start, dur, { src, from, label, line, headline, cam = {} }) {
    const b = beatEl('screen', start, dur);
    b.appendChild(el('div', 'halo'));
    const frame = el('div', 'frame');
    const v = el('video'); v.src = src; v.muted = true; v.preload = 'auto'; v.playsInline = true;
    frame.appendChild(v); frame.appendChild(el('div', 'gloss'));
    b.appendChild(frame);
    if (line) { const lower = el('div', 'lower'); if (label) lower.appendChild(el('div', 'label', label)); lower.appendChild(el('div', 'line', line)); b.appendChild(lower); }
    if (headline) {
      const h = el('div', 'headline');
      const lines = wordsOf(headline);
      for (const l of lines) { for (const w of l) h.appendChild(el('span', `w ${w.key ? 'key' : ''}`, w.text + ' ')); }
      b.appendChild(h);
      h.animate([{ opacity: 0, filter: 'blur(12px)', transform: 'translateY(-14px)' }, { opacity: 0, filter: 'blur(12px)', transform: 'translateY(-14px)', offset: Math.min(0.9, (dur - 2.2) / dur) }, { opacity: 1, filter: 'blur(0)', transform: 'none', offset: Math.min(0.98, (dur - 1.5) / dur), easing: EASE }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: dur * S, delay: start * S, fill: 'both', easing: 'linear' });
    }
    const rx0 = cam.rx0 ?? 9, ry0 = cam.ry0 ?? -8, rx1 = cam.rx1 ?? 5, ry1 = cam.ry1 ?? -3;
    frame.animate([
      { transform: `translateY(70px) rotateX(${rx0 + 8}deg) rotateY(${ry0}deg) scale(.94)`, filter: 'blur(10px)' },
      { transform: `rotateX(${rx0}deg) rotateY(${ry0}deg) scale(1)`, filter: 'blur(0)', offset: 0.7 / dur, easing: EASE },
      { transform: `rotateX(${rx1}deg) rotateY(${ry1}deg) scale(1.02)`, filter: 'blur(0)', offset: 1 - 0.35 / dur, easing: 'linear' },
      { transform: `translateY(-30px) rotateX(${rx1 - 4}deg) rotateY(${ry1 + 2}deg) scale(1.04)`, filter: 'blur(8px)' },
    ], { duration: dur * S, delay: start * S, fill: 'both', easing: 'linear' });
    state.videos.push({ v, start, dur, from });
    state.audio.push({ start, end: start + dur, footageStart: from });
    return b;
  }

  // Build the timeline from a scene and the footage's markers.
  window.load = (scene, footage, base) => {
    beatsEl.innerHTML = '';
    document.querySelector('#wordmark .sub').textContent = scene.wordmarkSub ? `· ${scene.wordmarkSub}` : '';
    const src = `${base}/footage/${scene.footage}.mp4`;
    document.getElementById('stage').style.setProperty('--zoom', scene.zoom ?? 1.14);
    const markers = footage.markers;
    let t = 0;
    const OVER = 0.35; // beats overlap by this much, so the fades cross
    if (scene.intro) { words(t, scene.intro.dur || 3.4, scene.intro.words, scene.intro); t += (scene.intro.dur || 3.4) - OVER; }
    for (const beat of scene.beats) {
      const mi = markers.findIndex((m) => m.kind === 'caption' && m.label.startsWith(beat.label));
      if (mi < 0) { console.warn('no marker for', beat.label); continue; }
      const m = markers[mi];
      const next = markers.slice(mi + 1).find((x) => x.kind === 'caption' || x.kind === 'caption-off' || x.kind === 'outro');
      const segLen = Math.max(2.2, Math.min(beat.screenMax ?? 5, (next ? next.t : m.t + 6) - m.t - (beat.skip || 0)));
      if (beat.words) { const d = beat.wordsDur || 1.9; words(t, d, beat.words); t += d - OVER; }
      if (beat.crop) { const d = beat.cropDur || 2.0; cutout(t, d, { crop: beat.crop, label: beat.cropLabel ?? m.label, h: beat.h, press: beat.press, base }); t += d - OVER; }
      if (beat.screen !== false) {
        const d = segLen + 0.5;
        screen(t, d, { src, from: m.t + (beat.skip || 0), label: m.label, line: beat.line ?? m.line, headline: beat.headline, cam: beat.cam });
        t += d - OVER;
      }
    }
    if (scene.outro) { const d = scene.outro.dur || 4.5; words(t, d, scene.outro.words, { ...scene.outro, chime: true }); t += d; }
    state.duration = t;
    document.getAnimations().forEach((a) => a.pause());
    return state.duration;
  };

  window.info = () => ({ duration: state.duration, events: state.events, audio: state.audio, beats: state.beats });

  window.ready = async () => {
    await document.fonts.ready;
    await Promise.all(state.videos.map(({ v }) => new Promise((r) => { if (v.readyState >= 1) r(); else v.addEventListener('loadedmetadata', r, { once: true }); })));
    await Promise.all([...document.images].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })));
    return true;
  };

  window.seek = async (t) => {
    document.getAnimations().forEach((a) => { a.currentTime = t * S; });
    const waits = [];
    for (const { v, start, dur, from } of state.videos) {
      if (t < start - 0.05 || t > start + dur + 0.05) continue;
      const target = Math.max(0, from + Math.min(Math.max(0, t - start), dur));
      if (Math.abs(v.currentTime - target) < 0.012) continue;
      waits.push(new Promise((r) => { const done = () => r(); v.addEventListener('seeked', done, { once: true }); v.currentTime = target; setTimeout(done, 1500); }));
    }
    await Promise.all(waits);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return t;
  };
})();
