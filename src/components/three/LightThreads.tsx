"use client";

import { useEffect, useRef } from "react";

/**
 * Light threads — a bundle of thin luminous strands that sweeps across the
 * page and twists as you scroll (aqua, with a single ember strand).
 *
 * One full-screen fragment shader on its own tiny WebGL context: no three.js,
 * one draw call per frame. Rendered at reduced resolution (the glow is soft,
 * so it scales up cleanly) and capped at 30 fps on phones. Stops entirely
 * while paused (WCAG 2.2.2 control), when the tab is hidden, or when WebGL is
 * unavailable. Reduced motion never mounts it (the Stage is off).
 */
type Props = { paused: boolean; desktop: boolean };

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
const int N = 18;

float strand(vec2 q, float i, float t, float s) {
  float fi = i / float(N - 1) - 0.5;            // -0.5 … 0.5 across the bundle
  // Bundle centre: a long S-curve that drifts with time and swings with scroll.
  float c = 0.18 * sin(q.x * 1.25 + s * 1.6 + t * 0.07)
          + 0.07 * sin(q.x * 2.9 - s * 0.9 + t * 0.11);
  // Twist: the bundle pinches and fans out along its length (ribbon look).
  float twist = 0.05 + 0.24 * abs(sin(q.x * 1.05 + s * 1.2 + t * 0.05 + fi * 0.6));
  float wob = 0.012 * sin(q.x * 7.0 + i * 1.7 + t * 0.4);
  float d = abs(q.y - (c + fi * twist + wob));
  float px = 1.6 / uRes.y;                       // ~constant on-screen width
  return px / (d + px) * smoothstep(0.0, 0.6, 1.0 - abs(fi) * 1.6);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 q = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  // The whole bundle rotates slowly with scroll: diagonal → steeper → back.
  float a = -0.55 + 0.35 * sin(uScroll * 0.55);
  q = mat2(cos(a), -sin(a), sin(a), cos(a)) * q;

  vec3 col = vec3(0.0);
  for (int k = 0; k < N; k++) {
    float i = float(k);
    float g = strand(q, i, uTime, uScroll);
    float glow = pow(g, 2.2) * 1.4 + g * 0.06;
    // Aqua core strands, a deeper teal at the edges, one warm ember strand.
    vec3 tint = mix(vec3(0.24, 0.86, 0.79), vec3(0.07, 0.45, 0.52), abs(i / float(N - 1) - 0.5) * 2.0);
    if (k == 6) tint = vec3(0.90, 0.40, 0.18);
    col += tint * glow;
  }
  // Soft overall falloff toward the edges so text columns stay calm.
  float vign = smoothstep(1.25, 0.15, length((uv - vec2(0.62, 0.5)) * vec2(1.0, 1.25)));
  col *= vign;
  // Keep the reading column calm: on wide screens copy sits on the left, on
  // phones it sits in the lower half, so the threads dim to under 10% there.
  float calm = uRes.x > uRes.y
    ? mix(0.07, 1.0, smoothstep(0.36, 0.72, uv.x))
    : mix(0.08, 1.0, smoothstep(0.5, 0.88, uv.y));
  col *= calm;
  gl_FragColor = vec4(col, clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0));
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function LightThreads({ paused, desktop }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const runRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uScroll = gl.getUniformLocation(prog, "uScroll");

    // Soft glow → render at a fraction of CSS pixels and let the browser scale it up.
    const scale = desktop ? 0.6 : 0.45;
    const resize = () => {
      const w = Math.max(1, Math.round(window.innerWidth * scale));
      const h = Math.max(1, Math.round(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    // Scroll is eased so trackpad jitter never shakes the threads.
    let scroll = window.scrollY / window.innerHeight;
    let raf = 0;
    let last = 0;
    const minDelta = desktop ? 0 : 1000 / 30;
    let start = performance.now();
    let frozenAt = 0;
    const render = (now: number, ease: number) => {
      const target = window.scrollY / window.innerHeight;
      scroll += (target - scroll) * ease;
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform1f(uScroll, scroll);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < minDelta) return;
      last = now;
      render(now, 0.08);
    };
    // Paused: time freezes; the threads still follow scroll (visitor-driven), with no loop.
    const onScrollPaused = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => render(frozenAt, 1));
    };
    const run = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollPaused);
      if (pausedRef.current || document.visibilityState !== "visible") {
        frozenAt = frozenAt || performance.now();
        render(frozenAt, 1); // one still frame so the backdrop never goes blank
        if (pausedRef.current) window.addEventListener("scroll", onScrollPaused, { passive: true });
      } else {
        if (frozenAt) {
          // Resume from the frozen moment instead of jumping ahead.
          const gap = performance.now() - frozenAt;
          start += gap;
          frozenAt = 0;
        }
        raf = requestAnimationFrame(loop);
      }
    };
    runRef.current = run;
    document.addEventListener("visibilitychange", run);
    run();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScrollPaused);
      document.removeEventListener("visibilitychange", run);
    };
    // The canvas keeps one context for its whole life (a lost context can't be re-acquired).
  }, [desktop]);

  useEffect(() => {
    pausedRef.current = paused;
    runRef.current();
  }, [paused]);

  return <canvas ref={ref} aria-hidden="true" tabIndex={-1} className="absolute inset-0 h-full w-full" />;
}
