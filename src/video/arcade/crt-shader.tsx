/** @jsxImportSource react */

import { usePlayer } from '@videojs/react/video';
import { useEffect, useRef, useState } from 'react';

import { setArcadePref, useArcadePrefs } from './prefs';

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() { uv = p * 0.5 + 0.5; uv.y = 1.0 - uv.y; gl_Position = vec4(p, 0.0, 1.0); }`;

// Barrel distortion, an RGB phosphor mask, scanlines, a soft bloom and vignette — a curved glass tube.
const FRAG = `
precision mediump float;
varying vec2 uv;
uniform sampler2D tex;
uniform vec2 res;
vec2 bend(vec2 c) {
  c = c * 2.0 - 1.0;
  vec2 o = abs(c.yx) / vec2(5.5, 4.2);
  c = c + c * o * o;
  return c * 0.5 + 0.5;
}
void main() {
  vec2 c = bend(uv);
  if (c.x < 0.0 || c.x > 1.0 || c.y < 0.0 || c.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  vec3 col = texture2D(tex, c).rgb;
  vec2 px = 1.5 / res;
  vec3 glow = (texture2D(tex, c + vec2(px.x, 0.0)).rgb + texture2D(tex, c - vec2(px.x, 0.0)).rgb
             + texture2D(tex, c + vec2(0.0, px.y)).rgb + texture2D(tex, c - vec2(0.0, px.y)).rgb) * 0.25;
  col = mix(col, max(col, glow), 0.35);
  float scan = 0.82 + 0.18 * sin(c.y * res.y * 3.14159);
  float m = mod(gl_FragCoord.x, 3.0);
  vec3 mask = m < 1.0 ? vec3(1.08, 0.9, 0.9) : m < 2.0 ? vec3(0.9, 1.08, 0.9) : vec3(0.9, 0.9, 1.08);
  vec2 v = c * (1.0 - c);
  float vig = clamp(pow(v.x * v.y * 18.0, 0.22), 0.0, 1.0);
  gl_FragColor = vec4(col * scan * mask * vig * 1.08, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
  return s;
}

/**
 * Curved CRT: when the viewer turns it on (Settings → Arcade), the film is redrawn through a WebGL shader that bends
 * it like real curved glass, with an RGB phosphor mask and scanlines. The `<video>` stays the media underneath (it is
 * only hidden visually). If WebGL is missing or the frame can't be read, the option switches itself back off.
 */
export function CrtShader() {
  const { crt } = useArcadePrefs();
  const paused = usePlayer((s) => s.paused);
  const anchor = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    const root = anchor.current?.closest<HTMLElement>('.media-skin');
    const video = root?.querySelector('video');
    if (!crt || !c || !video || !root) return;
    const gl = c.getContext('webgl', { premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) {
      setArcadePref('crt', false);
      return;
    }
    let prog: WebGLProgram;
    try {
      prog = gl.createProgram()!;
      gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(prog);
      gl.useProgram(prog);
    } catch {
      setArcadePref('crt', false);
      return;
    }
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const res = gl.getUniformLocation(prog, 'res');

    let frame = 0;
    let timer = 0;
    let alive = true;
    const draw = () => {
      if (!alive) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(c.clientWidth * dpr));
      const h = Math.max(1, Math.round(c.clientHeight * dpr));
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
      }
      gl.viewport(0, 0, w, h);
      if (video.readyState >= 2) {
        try {
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
        } catch {
          setArcadePref('crt', false); // tainted: can't read the frame
          return;
        }
        gl.uniform2f(res, w, h);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!ready) setReady(true);
      }
      if (paused) timer = window.setTimeout(draw, 200);
      else frame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [crt, paused]);

  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>('.media-skin');
    root?.toggleAttribute('data-crt', crt && ready);
    if (!crt) setReady(false);
  }, [crt, ready]);

  return (
    <>
      <span ref={anchor} hidden />
      {crt && <canvas ref={canvas} className={'arc-crt-shader'} aria-hidden="true" />}
    </>
  );
}
