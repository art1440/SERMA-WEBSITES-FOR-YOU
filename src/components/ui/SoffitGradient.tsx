"use client";

import { useEffect, useRef } from "react";

/**
 * Soffit — an animated WebGL2 gradient for the hero.
 *
 * The underside of an overhang: one long fall from the opening into the shade, and a bounce
 * coming back the other way so the deep end lifts off the floor instead of dying flat. The
 * hand turns the light and walks it along the opening.
 *
 * Plain WebGL2: one fullscreen triangle, one fragment shader. Every transformation happens in
 * the shader; per frame the CPU only steps the pointer followers, uploads two uniforms and
 * issues one drawArrays. To recolour, change CONFIG — never the GLSL.
 *
 * Adaptations from the stand-alone version (behaviour otherwise verbatim):
 *  - sized to its parent section (ResizeObserver) instead of the window;
 *  - the pointer is mapped against the canvas rect, so the field aims where the hand is;
 *  - full teardown on unmount (rAF, listeners, observers, GL program);
 *  - prefers-reduced-motion: one still frame, the clock and the pointer never advance.
 */
const CONFIG = {
  bgColor: "#062334",
  colorA: "#2b7be8",
  colorB: "#2bc8e8",
  colorC: "#4fe0d8",
  colorD: "#7fe8a0",
  scale: 1,
  speed: 0.33,
  tilt: 1.87,
  rock: 0.12,
  horizon: 0.36,
  breathe: 0.29,
  spread: 0.41,
  curve: 3.32,
  direct: 0.97,
  bounce: 0.38,
  bounceCurve: 4.25,
  spillCentre: 0.3,
  spillWidth: 2.18,
  spillFloor: 0.26,
  amount: 0.2,
  warp: 2.58,
  warpScale: 0.78,
  flow: 0.475,
  roughness: 0.29,
  lacunarity: 1.99,
  motes: 0.074,
  moteScale: 7,
  ambient: 0.24,
  contrast: 2.45,
  midpoint: 0.57,
  sink: 0.24,
  glow: 0.38,
  grain: 0,
  grainAnim: 0,
  dither: 0.58,
  vignette: 0.21,
  steer: -0.13,
  lift: 0.11,
  sweep: 0.5,
  cursor: 1,
  parallax: 0.0137,
  maxDpr: 1,
} as const;

export const SOFFIT_BG = CONFIG.bgColor;

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2  iResolution;
uniform float iTime;
uniform vec2  iMouse;          // aspect-corrected units, same space as uv
uniform float uScale;          // zoom of the whole picture — uv and the pointer together

uniform vec3  uBg, uColorA, uColorB, uColorC, uColorD;
uniform float uSpeed, uTilt, uRock, uHorizon, uBreathe, uSpread, uCurve, uDirect;
uniform float uBounce, uBounceCurve;
uniform float uSpillCentre, uSpillWidth, uSpillFloor;
uniform float uAmount, uWarp, uWarpScale, uFlow, uRoughness, uLacunarity, uMotes, uMoteScale;
uniform float uAmbient, uContrast, uMidpoint, uSink, uGlow;
uniform float uGrain, uDither, uVignette;
uniform float uSteer, uLift, uSweep, uParallax;

#define OCTAVES 4

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float snoise(vec2 p) {
  const float K1 = 0.366025404, K2 = 0.211324865;
  vec2 i = floor(p + (p.x + p.y) * K1);
  vec2 a = p - i + (i.x + i.y) * K2;
  float m = step(a.y, a.x);
  vec2 o = vec2(m, 1.0 - m);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0 * K2;
  vec3 h = max(0.5 - vec3(dot(a, a), dot(b, b), dot(c, c)), 0.0);
  vec3 n = h * h * h * h * vec3(dot(a, hash2(i)), dot(b, hash2(i + o)), dot(c, hash2(i + 1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p) {
  float v = 0.0, amp = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    v += amp * snoise(p);
    p *= uLacunarity;
    amp *= uRoughness;
  }
  return v;
}

vec3 ramp4(float t) {
  vec3 c = mix(uColorA, uColorB, smoothstep(0.00, 0.36, t));
  c = mix(c, uColorC, smoothstep(0.32, 0.70, t));
  c = mix(c, uColorD, smoothstep(0.66, 1.00, t));
  return c;
}

float triDither(vec2 fc) {
  float a = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float b = fract(sin(dot(fc + 17.0, vec2(12.9898, 78.233))) * 43758.5453);
  return (a + b - 1.0) / 255.0;
}


// ---- house grain. ONE look across the collection: an integer hash (no sin() streaks),
// triangular so it reads as film rather than static, weighted into the midtones so it
// never crusts a black or a white. Static by default; uGrainAnim re-seeds it 24×/s.
uniform float uGrainAnim;
float houseGrain(vec2 fc) {
  uvec2 q = uvec2(fc) * uvec2(1597334677u, 3812015801u)
          + uint(floor(iTime * 24.0 * uGrainAnim)) * 2654435769u;
  uint n = q.x ^ q.y; n = n * 1664525u + 1013904223u; n ^= n >> 16u; n *= 2246822519u; n ^= n >> 13u;
  float a = float(n & 0xffffu) / 65535.0;
  n *= 3266489917u; n ^= n >> 16u;
  float b = float(n & 0xffffu) / 65535.0;
  return a + b - 1.0;
}
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * iResolution) / iResolution.y;
  uv *= uScale;                             // scale: zoom of the whole picture
  vec2 iM = iMouse * uScale;                // the pointer, in the same zoomed space
  float t = iTime * uSpeed;

  vec2 p = uv - iM * uParallax;

  // THE LIGHT HAS A DIRECTION and the picture is that direction, not a pattern. Everything
  // below is a function of ONE number: how far along the light axis this pixel is. The noise
  // is only allowed to perturb that number, which is the difference between a lit surface
  // and a noise field with a nice palette on it.
  float tilt = uTilt + sin(t * 0.13) * uRock + iM.x * uSteer;
  vec2 dir = vec2(cos(tilt), sin(tilt));
  float axis = dot(p, dir);
  float across = dot(p, vec2(-dir.y, dir.x));

  // the air the light crosses, as a domain-warped field. Held to uAmount: past about a third
  // it stops perturbing the light and starts being the subject, and the direction dissolves.
  vec2 q = vec2(fbm(p * uWarpScale + vec2(0.0, t * uFlow)),
                fbm(p * uWarpScale + vec2(5.2, 1.3) - t * uFlow * 0.7));
  float air = fbm(p + uWarp * q + vec2(t * 0.12, -t * 0.09)) * 0.5 + 0.5;

  float horizon = uHorizon + sin(t * 0.09 + 2.1) * uBreathe - iM.y * uLift;
  float alt = clamp(0.5 + (axis - horizon) * uSpread + (air - 0.5) * uAmount, 0.0, 1.0);

  // THE OPENING IS NOT INFINITELY WIDE. A band across the light axis — never a disc — so the
  // brightest part of the frame sits off to one side and the composition has a long empty end.
  float ac = (across - uSpillCentre - iM.x * uSweep) / max(0.05, uSpillWidth);
  float spill = mix(uSpillFloor, 1.0, exp(-ac * ac));

  float direct = pow(alt, max(0.05, uCurve)) * uDirect * spill;

  // THE BOUNCE. Light that has already been in the shade and come back out of it: it falls off
  // the OTHER way, so the deep end lifts off the floor instead of dying to a flat black. This
  // is the whole reason a shadow can be a subject rather than an absence.
  float bounce = uBounce * pow(1.0 - alt, max(0.05, uBounceCurve));

  float f = uAmbient + direct + bounce;
  f += uMotes * snoise(p * uMoteScale + vec2(-t * 0.5, t * 0.35)) * 0.5 * alt;

  f = clamp((f - uMidpoint) * uContrast + 0.5, 0.0, 1.0);

  vec3 col = ramp4(f);
  col += uColorD * uGlow * pow(f, 4.0);
  col = mix(uBg, col, smoothstep(0.0, max(0.01, uSink), f) * 0.90 + 0.10);

  col *= 1.0 - uVignette * dot(uv, uv);
  { float hgL = clamp(dot(col, vec3(0.299, 0.587, 0.114)), 0.0, 1.0);
    col += houseGrain(gl_FragCoord.xy) * uGrain * mix(1.0, 4.0 * hgL * (1.0 - hgL), 0.6); }
  col += triDither(gl_FragCoord.xy) * uDither;

  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function SoffitGradient({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    // No WebGL2: the section's own background (bgColor) stands in. Nothing else to do.
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "shader");
      return sh;
    };

    const program = gl.createProgram()!;
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
    } catch (err) {
      console.error("[Soffit]", err);
      return;
    }
    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());

    const LOC: Record<string, WebGLUniformLocation | null> = {};
    const loc = (n: string) => (n in LOC ? LOC[n] : (LOC[n] = gl.getUniformLocation(program, n)));
    const u1f = (n: string, v: number) => gl.uniform1f(loc(n), v);
    const u2f = (n: string, x: number, y: number) => gl.uniform2f(loc(n), x, y);
    const u3c = (n: string, hex: string) => {
      const c = hexToVec3(hex);
      gl.uniform3f(loc(n), c[0], c[1], c[2]);
    };

    /* ====== CONFIG → UNIFORMS ====== */
    u3c("uBg", CONFIG.bgColor);
    u3c("uColorA", CONFIG.colorA);
    u3c("uColorB", CONFIG.colorB);
    u3c("uColorC", CONFIG.colorC);
    u3c("uColorD", CONFIG.colorD);
    const scalars = [
      "scale", "speed", "tilt", "rock", "horizon", "breathe", "spread", "curve", "direct",
      "bounce", "bounceCurve", "spillCentre", "spillWidth", "spillFloor", "amount", "warp",
      "warpScale", "flow", "roughness", "lacunarity", "motes", "moteScale", "ambient",
      "contrast", "midpoint", "sink", "glow", "grain", "grainAnim", "dither", "vignette",
      "steer", "lift", "sweep", "parallax",
    ] as const;
    for (const k of scalars) u1f("u" + k[0].toUpperCase() + k.slice(1), CONFIG[k]);

    /* ====== RESIZE — to the section, coalesced to one per frame ====== */
    let cssW = 1, cssH = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
      const r = canvas.getBoundingClientRect();
      cssW = Math.max(1, r.width);
      cssH = Math.max(1, r.height);
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      u2f("iResolution", w, h);
    };
    let resizeQueued = false;
    let resizeRaf = 0;
    const ro = new ResizeObserver(() => {
      if (resizeQueued) return;
      resizeQueued = true;
      resizeRaf = requestAnimationFrame(() => {
        resizeQueued = false;
        resize();
        if (reduce) draw(); // the still frame has to follow the new size
      });
    });
    ro.observe(canvas);

    /* ====== POINTER — two-stage lerp, mapped against the canvas rect ====== */
    const mouse = { x: 0, y: 0, ax: 0, ay: 0, tx: 0, ty: 0 };
    const rest = { x: 0, y: 0 };
    const aim = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * (r.width / r.height);
      mouse.ty = 0.5 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", aim, { passive: true });
    window.addEventListener("pointerdown", aim, { passive: true });

    /* ====== RENDER LOOP ====== */
    let visible = true;
    const io = new IntersectionObserver((es) => (visible = es[0].isIntersecting), { threshold: 0 });
    io.observe(canvas);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = mq.matches;

    const draw = () => gl.drawArrays(gl.TRIANGLES, 0, 3);

    let raf = 0;
    let prevT = performance.now();
    let clock = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      /* Pacing: the interval is clamped to [4.17, 50] ms, springs step by elapsed time, and the
         shader clock accumulates from that clamped value — an alt-tab costs a pause, not a lurch. */
      const raw = now - prevT;
      prevT = now;
      if (!visible || document.hidden || reduce) return;
      const ms = raw > 50 ? 50 : raw < 4.167 ? 4.167 : raw;
      const s = ms > 36.7 ? 2.2 : ms * 0.06;
      clock += ms * 0.001;

      if (!CONFIG.cursor) {
        mouse.tx = rest.x;
        mouse.ty = rest.y;
      }
      const kLead = 0.105 * s, kBody = 0.043 * s;
      mouse.ax += (mouse.tx - mouse.ax) * kLead;
      mouse.ay += (mouse.ty - mouse.ay) * kLead;
      mouse.x += (mouse.ax - mouse.x) * kBody;
      mouse.y += (mouse.ay - mouse.y) * kBody;

      u1f("iTime", clock);
      u2f("iMouse", mouse.x, mouse.y);
      draw();
    };

    const onMotionPref = () => {
      reduce = mq.matches;
      if (reduce) draw();
    };
    mq.addEventListener("change", onMotionPref);

    resize();
    u1f("iTime", 0);
    u2f("iMouse", 0, 0);
    draw(); // one draw before the reveal, so we never fade onto a blank canvas
    canvas.dataset.ready = "true";
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      ro.disconnect();
      io.disconnect();
      mq.removeEventListener("change", onMotionPref);
      window.removeEventListener("pointermove", aim);
      window.removeEventListener("pointerdown", aim);
      // No loseContext(): a canvas hands back the SAME context on the next getContext, so a
      // remount (StrictMode, fast refresh) would inherit a dead one. Freeing the program is enough.
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`soffit pointer-events-none absolute inset-0 -z-10 block h-full w-full ${className}`}
    />
  );
}
