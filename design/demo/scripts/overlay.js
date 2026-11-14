// The demo layer, injected into the recorded page: a gold cursor, click ripples, book-style caption cards,
// key badges, and intro/outro cards. Nothing here takes pointer input. Exposed on window.__demo.
(function boot() {
  if (window.__demo || window.top !== window) return;
  // Init scripts run before the document has a root; mount once it does.
  if (!document.documentElement || !document.body) {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
    return;
  }
  const GOLD = '#cfa548', GOLD_LIGHT = '#ecd593', FOIL = '#ffe9a8', LAPIS = '#0b1124', CLOTH = '#141d38', PAPER = '#f6ecd0', INK = '#241a12', RUBRIC = '#9d2b1b';
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@0,8..60,500;0,8..60,700;1,8..60,500;1,8..60,700&display=swap');
    .base44-edit-badge, #base44-edit-badge { display: none !important; }
    * { cursor: none !important; }
    #demo-layer { position: fixed; inset: 0; z-index: 2147483000; pointer-events: none; font-family: 'Source Serif 4', Georgia, serif; }
    #demo-cursor { position: absolute; left: 0; top: 0; width: 34px; height: 34px; translate: -4px -3px; filter: drop-shadow(0 2px 3px rgb(0 0 0 / .6)); transition: scale 90ms ease-out; will-change: transform; }
    #demo-cursor.down { scale: .88; }
    .demo-ripple { position: absolute; width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%; border: 2px solid ${FOIL}; box-shadow: 0 0 12px ${GOLD}; animation: demo-ripple 520ms cubic-bezier(.2,.8,.2,1) forwards; }
    @keyframes demo-ripple { from { scale: .4; opacity: 1 } to { scale: 4; opacity: 0 } }
    .demo-card { position: absolute; left: 56px; bottom: 48px; max-width: 680px; padding: 20px 30px 22px 26px; color: ${PAPER}; background: linear-gradient(135deg, ${CLOTH}, ${LAPIS}); border-radius: 10px; box-shadow: 0 24px 60px -20px rgb(0 0 0 / .9), inset 0 0 0 1px rgb(207 165 72 / .45); border-left: 4px solid ${GOLD}; animation: demo-card-in 520ms cubic-bezier(.2,.8,.2,1) both; }
    .demo-card.out { animation: demo-card-out 380ms ease-in both; }
    @keyframes demo-card-in { from { translate: -24px 18px; opacity: 0 } to { translate: 0 0; opacity: 1 } }
    @keyframes demo-card-out { from { opacity: 1 } to { translate: -16px 10px; opacity: 0 } }
    .demo-label { font-family: Inter, sans-serif; font-size: 13px; letter-spacing: .22em; text-transform: uppercase; color: ${GOLD_LIGHT}; }
    .demo-title { position: relative; display: inline-block; margin-top: 6px; font-size: 36px; font-weight: 700; line-height: 1.15; letter-spacing: -.01em; }
    .demo-title::after { content: ''; position: absolute; left: 0; right: 0; bottom: -4px; height: 2px; background: linear-gradient(90deg, ${GOLD}, ${FOIL}); transform-origin: left; animation: demo-rule 700ms 250ms cubic-bezier(.2,.8,.2,1) both; }
    @keyframes demo-rule { from { scale: 0 1 } to { scale: 1 1 } }
    .demo-line { margin-top: 12px; font-size: 19px; font-style: italic; line-height: 1.35; color: rgb(246 236 208 / .82); animation: demo-fade 500ms 350ms ease both; }
    @keyframes demo-fade { from { opacity: 0; translate: 0 6px } to { opacity: 1; translate: 0 0 } }
    .demo-key { position: absolute; right: 56px; bottom: 56px; display: flex; gap: 8px; align-items: center; animation: demo-key-in 260ms cubic-bezier(.2,.8,.2,1.3) both; }
    .demo-key.out { animation: demo-card-out 300ms ease-in both; }
    @keyframes demo-key-in { from { scale: .7; opacity: 0 } to { scale: 1; opacity: 1 } }
    .demo-key kbd { min-width: 44px; padding: 8px 14px; font-family: Inter, sans-serif; font-size: 20px; font-weight: 600; text-align: center; color: ${INK}; background: linear-gradient(${PAPER}, #e4d5b2); border-radius: 8px; border: 1px solid #b9a57c; box-shadow: 0 4px 0 #8a6418, 0 10px 24px -8px rgb(0 0 0 / .8); }
    .demo-key kbd.down { translate: 0 3px; box-shadow: 0 1px 0 #8a6418; }
    .demo-key .plus { color: ${GOLD_LIGHT}; font-size: 20px; }
    .demo-key .what { margin-left: 10px; font-size: 18px; font-style: italic; color: ${PAPER}; text-shadow: 0 1px 3px rgb(0 0 0 / .8); }
    .demo-full { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; color: ${PAPER}; background: radial-gradient(120% 90% at 50% 40%, #1e2c52 0%, ${LAPIS} 55%, #020513 100%); animation: demo-fade 600ms ease both; }
    .demo-full.out { animation: demo-full-out 700ms ease-in both; }
    @keyframes demo-full-out { to { opacity: 0 } }
    .demo-full .eyebrow { font-family: Inter, sans-serif; font-size: 15px; letter-spacing: .32em; text-transform: uppercase; color: ${GOLD_LIGHT}; animation: demo-fade 600ms 200ms ease both; }
    .demo-full .big { margin-top: 18px; font-size: 76px; font-weight: 700; line-height: 1.05; letter-spacing: -.02em; animation: demo-fade 700ms 350ms ease both; }
    .demo-full .big em { color: ${FOIL}; font-style: italic; }
    .demo-full .rule { width: 120px; height: 2px; margin: 26px auto 0; background: linear-gradient(90deg, transparent, ${GOLD}, transparent); animation: demo-rule 800ms 700ms ease both; transform-origin: center; }
    .demo-full .sub { margin-top: 22px; font-size: 24px; font-style: italic; color: rgb(246 236 208 / .8); animation: demo-fade 600ms 900ms ease both; }
    .demo-full .fleuron { margin-top: 30px; font-size: 30px; color: ${GOLD}; animation: demo-fade 600ms 1100ms ease both; }
    .demo-full .small { margin-top: 36px; font-family: Inter, sans-serif; font-size: 14px; letter-spacing: .08em; color: rgb(246 236 208 / .55); animation: demo-fade 600ms 1200ms ease both; }
    .demo-full .url { margin-top: 14px; font-family: Inter, sans-serif; font-size: 26px; font-weight: 600; color: ${FOIL}; animation: demo-fade 600ms 600ms ease both; }
  `;
  document.documentElement.appendChild(style);
  const layer = document.createElement('div');
  layer.id = 'demo-layer';
  layer.innerHTML = `<svg id="demo-cursor" viewBox="0 0 34 34" aria-hidden="true">
    <path d="M6 3 L28 17 L17.5 18.6 L23.5 30 L19.5 31.8 L13.6 20.4 L6 27.8 Z" fill="url(#demo-brass)" stroke="#5a4210" stroke-width="1.2" stroke-linejoin="round"/>
    <defs><linearGradient id="demo-brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${FOIL}"/><stop offset=".5" stop-color="${GOLD}"/><stop offset="1" stop-color="#8a6418"/></linearGradient></defs>
  </svg>`;
  document.documentElement.appendChild(layer);
  const cursor = layer.querySelector('#demo-cursor');
  const t0 = performance.now();
  const cues = [];
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const place = (x, y) => { pos.x = x; pos.y = y; cursor.style.transform = `translate(${x}px, ${y}px)`; };
  place(pos.x, pos.y);
  const cue = (sound) => cues.push({ t: (performance.now() - t0) / 1000, sound });

  window.__demo = {
    cues: () => cues,
    cue,
    now: () => (performance.now() - t0) / 1000,
    where: () => ({ ...pos }),
    place,
    down() { cursor.classList.add('down'); const r = document.createElement('span'); r.className = 'demo-ripple'; r.style.left = pos.x + 'px'; r.style.top = pos.y + 'px'; layer.appendChild(r); setTimeout(() => r.remove(), 600); cue('click'); },
    up() { cursor.classList.remove('down'); },
    caption(label, title, line) {
      // A card that replaces another goes straight in; two cards never share the corner.
      this.uncaption(true);
      layer.querySelectorAll('.demo-card').forEach((el) => el.remove());
      const c = document.createElement('div');
      c.className = 'demo-card';
      c.innerHTML = `<div class="demo-label">${label}</div><div class="demo-title">${title}</div>${line ? `<div class="demo-line">${line}</div>` : ''}`;
      layer.appendChild(c);
      this._card = c;
      cue('swish');
    },
    uncaption(instant) { const c = this._card; if (!c) return; this._card = null; if (instant) return c.remove(); c.classList.add('out'); setTimeout(() => c.remove(), 400); },
    key(keys, what) {
      this.unkey();
      const k = document.createElement('div');
      k.className = 'demo-key';
      k.innerHTML = keys.map((x) => `<kbd>${x}</kbd>`).join('<span class="plus">+</span>') + (what ? `<span class="what">${what}</span>` : '');
      layer.appendChild(k);
      this._key = k;
      setTimeout(() => k.querySelectorAll('kbd').forEach((el) => el.classList.add('down')), 120);
      setTimeout(() => k.querySelectorAll('kbd').forEach((el) => el.classList.remove('down')), 300);
      cue('click');
    },
    unkey() { const k = this._key; if (!k) return; this._key = null; k.classList.add('out'); setTimeout(() => k.remove(), 320); },
    full(html) { this.unfull(); const f = document.createElement('div'); f.className = 'demo-full'; f.innerHTML = html; layer.appendChild(f); this._full = f; cue('swish'); },
    unfull() { const f = this._full; if (!f) return; this._full = null; f.classList.add('out'); setTimeout(() => f.remove(), 720); },
    hide() { layer.style.display = 'none'; },
    show() { layer.style.display = ''; },
  };
})();
