"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The SermaWebDesign "engine": a real-time WebGL sculpture choreographed by scroll.
 *
 * Performance contract:
 *  - Scroll position is read from MotionValues inside the render loop (no React state, no listeners).
 *  - Particle formations morph on the GPU (vertex shader); the CPU only updates a handful of uniforms.
 *  - The render loop stops entirely ("never") whenever no 3D chapter is on screen.
 *  - Reflections come from three's procedural RoomEnvironment — no HDR download, no third-party request.
 */

export type EngineInputs = {
  hero: MotionValue<number>;
  system: MotionValue<number>;
  finale: MotionValue<number>;
  /** 0 = light (bone) backdrop, 1 = dark (ink) backdrop. */
  ink: MotionValue<number>;
};

type Props = EngineInputs & { active: boolean; desktop: boolean };

const INK = new THREE.Color("#17253B");
const BONE = new THREE.Color("#E8DFCF");
/** Brand accent on the dark-first site (aqua). Particles keep a warm ember minority for depth. */
const ACCENT = new THREE.Color("#E8DFCF");
const EMBER = new THREE.Color("#C9B893");

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Smoothstep of x between a and b. */
const ss = (x: number, a: number, b: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Piecewise-linear keyframes: kf([[0, a], [0.5, b], [1, c]], x). */
const kf = (frames: [number, number][], x: number) => {
  if (x <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [x1, y1] = frames[i];
    const [x0, y0] = frames[i - 1];
    if (x <= x1) {
      const t = (x - x0) / (x1 - x0 || 1);
      return y0 + (y1 - y0) * t * t * (3 - 2 * t);
    }
  }
  return frames[frames.length - 1][1];
};

/** Soft radial glow sprite, drawn once in memory (no image download). */
function makeGlowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type Pose = { x: number; y: number; z: number; s: number };
const mix = (a: Pose, b: Pose, t: number): Pose => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  z: lerp(a.z, b.z, t),
  s: lerp(a.s, b.s, t),
});

function posesFor(desktop: boolean) {
  return desktop
    ? {
        hero: { x: 2.35, y: -0.05, z: 0, s: 1 },
        dive: { x: 0, y: 0, z: 2.2, s: 1.35 },
        system: { x: 1.75, y: 0, z: 0, s: 1 },
        finale: { x: 2.2, y: 0.05, z: 0, s: 1.05 },
      }
    : {
        hero: { x: 0, y: 2.05, z: -1.8, s: 0.52 },
        dive: { x: 0, y: 0.4, z: 1.2, s: 1.05 },
        system: { x: 0, y: 1.3, z: -1.4, s: 0.8 },
        finale: { x: 0, y: 1.6, z: -1.6, s: 0.72 },
      };
}

/* ------------------------------------------------------------------ */
/* Particle formations                                                 */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildFormations(count: number) {
  const rand = mulberry32(1440);
  const shell = new Float32Array(count * 3);
  const swarm = new Float32Array(count * 3);
  const ring = new Float32Array(count * 3);
  const grid = new Float32Array(count * 3);
  const orbit = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  const tilt = new THREE.Euler(1.15, 0.25, 0);
  const v = new THREE.Vector3();
  const COLS = 12;
  const ROWS = 8;

  for (let i = 0; i < count; i++) {
    const k = i * 3;
    // random unit vector
    const u = rand() * 2 - 1;
    const th = rand() * Math.PI * 2;
    const sq = Math.sqrt(1 - u * u);
    const dx = sq * Math.cos(th);
    const dy = sq * Math.sin(th);
    const dz = u;

    // 0 — scattered leads: a loose shell
    const r0 = 3.0 + rand() * 1.1;
    shell[k] = dx * r0;
    shell[k + 1] = dy * r0 * 0.85;
    shell[k + 2] = dz * r0;

    // 1 — captured: a tight swarm around the core
    const r1 = 1.0 + Math.pow(rand(), 2) * 0.55;
    swarm[k] = dx * r1;
    swarm[k + 1] = dy * r1;
    swarm[k + 2] = dz * r1;

    // 2 — instant response: a tilted pulse ring
    const a2 = rand() * Math.PI * 2;
    const r2 = 2.25 + (rand() - 0.5) * 0.28;
    v.set(Math.cos(a2) * r2, Math.sin(a2) * r2, (rand() - 0.5) * 0.12).applyEuler(tilt);
    ring[k] = v.x;
    ring[k + 1] = v.y;
    ring[k + 2] = v.z;

    // 3 — booked: a calendar grid of slots
    const cell = i % (COLS * ROWS);
    const col = cell % COLS;
    const row = Math.floor(cell / COLS);
    grid[k] = (col - (COLS - 1) / 2) * 0.4 + (rand() - 0.5) * 0.035;
    grid[k + 1] = (row - (ROWS - 1) / 2) * 0.4 + (rand() - 0.5) * 0.035;
    grid[k + 2] = (rand() - 0.5) * 0.04;

    // 4 — return business: a (2,3) torus-knot loop
    const t4 = (i / count) * Math.PI * 2 + (rand() - 0.5) * 0.05;
    const R = 2.05;
    const r4 = 0.68 + (rand() - 0.5) * 0.08;
    orbit[k] = (R + r4 * Math.cos(3 * t4)) * Math.cos(2 * t4);
    orbit[k + 1] = (R + r4 * Math.cos(3 * t4)) * Math.sin(2 * t4) * 0.8;
    orbit[k + 2] = r4 * Math.sin(3 * t4);

    seeds[i] = rand();
  }
  return { shell, swarm, ring, grid, orbit, seeds };
}

const vertexShader = /* glsl */ `
  attribute vec3 aSwarm;
  attribute vec3 aRing;
  attribute vec3 aGrid;
  attribute vec3 aOrbit;
  attribute float aSeed;
  uniform float uMorph;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vAccent;

  float ease(float t) { return t * t * (3.0 - 2.0 * t); }

  void main() {
    // Per-particle stagger inside each transition, so formations flow instead of
    // snapping in unison — yet every particle lands exactly on its formation at
    // whole-number morph values (the "hold" while a step is on screen).
    float m = clamp(uMorph, 0.0, 4.0);
    float seg = min(floor(m), 3.0);
    float f = clamp((m - seg - aSeed * 0.35) / 0.65, 0.0, 1.0);
    vec3 p;
    if (seg < 0.5)      p = mix(position, aSwarm, ease(f));
    else if (seg < 1.5) p = mix(aSwarm, aRing, ease(f));
    else if (seg < 2.5) p = mix(aRing, aGrid, ease(f));
    else                p = mix(aGrid, aOrbit, ease(f));

    // Living drift.
    float t = uTime * 0.6 + aSeed * 50.0;
    p += 0.045 * vec3(sin(t), cos(t * 0.9), sin(t * 0.7));

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.55 + aSeed * 0.9) / -mv.z;
    vAlpha = 0.45 + 0.55 * aSeed;
    vAccent = step(0.91, aSeed);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    // Hot core + soft halo reads as light, not as flat dots.
    float core = smoothstep(0.22, 0.0, d);
    float halo = exp(-d * d * 18.0) * 0.55;
    float a = (core + halo) * vAlpha * uOpacity * (1.0 + vAccent * 0.6);
    vec3 col = mix(uColor, uAccent, vAccent) * (1.0 + core * 0.35 * vAccent);
    gl_FragColor = vec4(col, min(a, 1.0));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

function Environment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function EngineScene({ hero, system, finale, ink, desktop }: Omit<Props, "active">) {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const cage = useRef<THREE.LineSegments>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);
  const wave = useRef<THREE.Mesh>(null);
  const heart = useRef<THREE.Mesh>(null);
  const heartGlow = useRef<THREE.Sprite>(null);
  const ringGlow = useRef<THREE.Mesh>(null);
  const keyLight = useRef<THREE.DirectionalLight>(null);
  const cam = useRef({ z: 9, y: 0, x: 0, roll: 0, fov: 35, orbit: 0 });
  const glowTexture = useMemo(() => makeGlowTexture(), []);
  const pose = useRef<Pose>({ ...posesFor(desktop).hero });
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const morph = useRef(0);
  const { gl } = useThree();
  const setDpr = useThree((s) => s.setDpr);
  const perf = useRef({ frames: 0, time: 0, lowered: false });

  const count = desktop ? 1400 : 500;
  const formations = useMemo(() => buildFormations(count), [count]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(formations.shell, 3));
    g.setAttribute("aSwarm", new THREE.BufferAttribute(formations.swarm, 3));
    g.setAttribute("aRing", new THREE.BufferAttribute(formations.ring, 3));
    g.setAttribute("aGrid", new THREE.BufferAttribute(formations.grid, 3));
    g.setAttribute("aOrbit", new THREE.BufferAttribute(formations.orbit, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(formations.seeds, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);
    return g;
  }, [formations]);

  const pointsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: desktop ? 40 : 34 },
          uPixelRatio: { value: Math.min(gl.getPixelRatio(), 2) },
          uColor: { value: INK.clone() },
          uAccent: { value: ACCENT.clone() },
          uOpacity: { value: 0.85 },
        },
      }),
    [desktop, gl],
  );

  const coreGeometry = useMemo(() => new THREE.IcosahedronGeometry(0.9, 0), []);
  const cageGeometry = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.32, 1)), []);
  const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({ color: INK.clone(), transparent: true, opacity: 0.55 }), []);
  const thinRingMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ color: INK.clone(), transparent: true, opacity: 0.55 }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      pointsMaterial.dispose();
      coreGeometry.dispose();
      cageGeometry.dispose();
      lineMaterial.dispose();
      thinRingMaterial.dispose();
      glowTexture.dispose();
    },
    [geometry, pointsMaterial, coreGeometry, cageGeometry, lineMaterial, thinRingMaterial, glowTexture],
  );

  // Pointer parallax (pointer events only — never scroll listeners).
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    // Adaptive quality: if the device averages under ~40fps over 90 frames, render at 1× resolution.
    const pf = perf.current;
    if (!pf.lowered) {
      pf.frames += 1;
      pf.time += delta;
      if (pf.frames >= 90) {
        if (pf.time / pf.frames > 1 / 40) {
          setDpr(1);
          pf.lowered = true;
        }
        pf.frames = 0;
        pf.time = 0;
      }
    }
    const dt = Math.min(delta, 1 / 20);
    const time = state.clock.elapsedTime;
    const h = hero.get();
    const s = system.get();
    const f = finale.get();
    const darkness = ink.get();
    const P = posesFor(desktop);

    // ---- Where should the engine be? ------------------------------------
    let target: Pose;
    let targetMorph: number;
    let targetOpacity: number;
    let coreScale = 1;
    let waveT = 0;

    if (f > 0.001) {
      // Finale: re-enter as the closing scene.
      target = mix({ ...P.finale, s: P.finale.s * 0.6, z: P.finale.z - 2 }, P.finale, ss(f, 0, 0.55));
      targetMorph = 4;
      targetOpacity = desktop ? 0.9 : 0.55;
    } else if (h < 0.999) {
      // Hero: idle → dive toward the camera → settle into the system pose.
      const dive = mix(P.hero, P.dive, ss(h, 0.08, 0.45));
      target = mix(dive, P.system, ss(h, 0.6, 0.98));
      targetMorph = ss(h, 0.7, 1) * 0.15;
      targetOpacity = lerp(0.85, 1, ss(h, 0.4, 0.7));
    } else {
      // The system: four formations, one per step.
      target = P.system;
      // Step k (of 4) spans [k/4, (k+1)/4]: formation k+1 assembles in the first 40% and holds.
      const k = Math.min(3, Math.floor(s * 4));
      targetMorph = k + ss((s - k / 4) * 4, 0, 0.4);
      targetOpacity = 1;
      coreScale = 1 - 0.5 * (ss(s, 0.5, 0.58) - ss(s, 0.74, 0.82)); // core steps back while the calendar forms
      waveT = ss(s, 0.27, 0.33) - ss(s, 0.47, 0.52);
    }

    // ---- Directed camera ----------------------------------------------
    // Hero: push in + zoom + slight roll on the dive. System: orbit the engine, levelling out so
    // the calendar grid faces you on "Book". Finale: pull back, then settle. Plus a handheld drift.
    let camZ: number, camY: number, roll: number, fov: number, orbit: number;
    if (f > 0.001) {
      camZ = kf([[0, 11.5], [0.6, 9]], f);
      camY = kf([[0, 0.9], [0.6, 0.15]], f);
      roll = 0;
      fov = kf([[0, 40], [0.6, 35]], f);
      orbit = kf([[0, -0.5], [0.7, 0.15]], f);
    } else if (h < 0.999) {
      camZ = kf([[0, 9], [0.45, 6.4], [0.98, 8.2]], h);
      camY = kf([[0, 0], [0.45, 0.35], [0.98, 0]], h);
      roll = kf([[0.1, 0], [0.4, 0.07], [0.7, 0]], h);
      fov = kf([[0, 35], [0.45, 30], [0.98, 35]], h);
      orbit = 0;
    } else {
      camZ = kf([[0, 8.2], [0.25, 7.6], [0.55, 7.2], [0.75, 7.6], [1, 8.6]], s);
      camY = kf([[0, 0], [0.25, 0.25], [0.55, 0], [1, 0.3]], s);
      roll = kf([[0, 0], [0.3, -0.03], [0.55, 0], [0.9, 0.025]], s);
      fov = 35;
      // Orbit: swing round on Capture/Respond, square up for Book (grid faces camera), circle on Return.
      orbit = kf([[0, 0], [0.22, 0.55], [0.45, -0.4], [0.55, 0], [0.72, 0], [1, 0.7]], s);
    }
    // Camera / pose follows on top of the sprung progress: quick enough to stay in step with the page.
    const ck = 1 - Math.exp(-dt * 6);
    const c = cam.current;
    c.z += (camZ - c.z) * ck;
    c.y += (camY - c.y) * ck;
    c.roll += (roll - c.roll) * ck;
    c.fov += (fov - c.fov) * ck;
    c.orbit += (orbit - c.orbit) * ck;
    const camera = state.camera as THREE.PerspectiveCamera;
    camera.position.set(Math.sin(time * 0.31) * 0.04, c.y + Math.sin(time * 0.43) * 0.03, c.z);
    camera.rotation.set(Math.sin(time * 0.37) * 0.003, Math.sin(time * 0.29) * 0.004, c.roll);
    if (Math.abs(camera.fov - c.fov) > 0.01) {
      camera.fov = c.fov;
      camera.updateProjectionMatrix();
    }

    // ---- Damped follow (silky, frame-rate independent) -----------------
    const k = 1 - Math.exp(-dt * 9);
    const cur = pose.current;
    cur.x += (target.x - cur.x) * k;
    cur.y += (target.y - cur.y) * k;
    cur.z += (target.z - cur.z) * k;
    cur.s += (target.s - cur.s) * k;
    morph.current += (targetMorph - morph.current) * (1 - Math.exp(-dt * 10));

    const ptr = pointer.current;
    ptr.sx += (ptr.x - ptr.sx) * (1 - Math.exp(-dt * 3));
    ptr.sy += (ptr.y - ptr.sy) * (1 - Math.exp(-dt * 3));

    if (root.current) {
      root.current.position.set(cur.x, cur.y, cur.z);
      root.current.scale.setScalar(cur.s);
      // Whole-sculpture turn only during the hero; formations must face the camera in the system chapter.
      const heroSwing = f > 0.001 || h >= 0.999 ? 0 : Math.sin(h * Math.PI) * 0.7;
      root.current.rotation.set(ptr.sy * 0.16 + 0.08, ptr.sx * 0.26 + heroSwing + cam.current.orbit, 0);
    }
    if (core.current) {
      core.current.rotation.x = time * 0.22 + h * Math.PI;
      core.current.rotation.y = time * 0.31 + s * Math.PI * 2;
      const cs = core.current.scale.x + (coreScale - core.current.scale.x) * k;
      core.current.scale.setScalar(cs);
    }
    if (cage.current) {
      cage.current.rotation.x = -time * 0.12 - s * Math.PI;
      cage.current.rotation.y = -time * 0.17 - h * Math.PI * 0.8;
    }
    if (ringA.current) ringA.current.rotation.z = time * 0.45 + h * 3;
    if (ringB.current) ringB.current.rotation.z = -time * 0.25 - s * 4;
    if (ringC.current) ringC.current.rotation.z = time * 0.16 + f * 3;
    if (wave.current) {
      const pulse = waveT > 0 ? (time * 0.6) % 1 : 0;
      wave.current.scale.setScalar(1 + pulse * 3.2);
      (wave.current.material as THREE.MeshBasicMaterial).opacity = waveT * (1 - pulse) * 0.9;
    }

    // ---- The heart: a slow breath, a flare on "Respond" -------------------
    const flare = waveT * (0.6 + 0.4 * Math.sin(time * 6));
    const beat = 1 + Math.sin(time * 2.1) * 0.06 + flare * 0.35;
    if (heart.current) heart.current.scale.setScalar(beat * (0.85 + coreScale * 0.15));
    if (heartGlow.current) {
      heartGlow.current.scale.setScalar((2.4 + flare * 2.2) * beat);
      (heartGlow.current.material as THREE.SpriteMaterial).opacity = 0.55 + darkness * 0.3 + flare * 0.3;
    }
    if (ringGlow.current) {
      ringGlow.current.rotation.z = ringA.current?.rotation.z ?? 0;
      (ringGlow.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + darkness * 0.14;
    }
    if (keyLight.current) keyLight.current.intensity = 2.2 + flare * 1.5 + ss(f, 0, 0.5) * 0.6;

    // ---- Theme: ink lines on bone, bone lines on ink --------------------
    const u = pointsMaterial.uniforms;
    u.uTime.value = time;
    u.uMorph.value = morph.current;
    u.uOpacity.value += (targetOpacity - u.uOpacity.value) * k;
    (u.uColor.value as THREE.Color).copy(INK).lerp(BONE, darkness);
    lineMaterial.color.copy(INK).lerp(BONE, darkness);
    thinRingMaterial.color.copy(INK).lerp(BONE, darkness);
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight ref={keyLight} position={[4, 5, 6]} intensity={2.4} color="#F3EDE1" />
      <directionalLight position={[-6, -2, -4]} intensity={1.4} color="#8E99AB" />
      <pointLight position={[0, 0, 0]} intensity={6} distance={4} color="#E8DFCF" />

      <group ref={root}>
        {/* Glowing heart, seen through the glass core */}
        <mesh ref={heart}>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshBasicMaterial color="#F3EDE1" toneMapped={false} />
        </mesh>
        <sprite ref={heartGlow} scale={2.4}>
          <spriteMaterial map={glowTexture} color="#E8DFCF" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>

        <mesh ref={core} geometry={coreGeometry}>
          {desktop ? (
            // Dark refractive glass: bends the heart's light and the particles behind it.
            <meshPhysicalMaterial
              color="#17253B"
              metalness={0.1}
              roughness={0.08}
              transmission={0.92}
              thickness={1.4}
              ior={1.5}
              attenuationColor="#132033"
              attenuationDistance={1.6}
              clearcoat={1}
              clearcoatRoughness={0.05}
              flatShading
              envMapIntensity={1.8}
            />
          ) : (
            <meshStandardMaterial color="#1E2E48" metalness={0.85} roughness={0.2} flatShading envMapIntensity={1.4} transparent opacity={0.88} />
          )}
        </mesh>
        <lineSegments ref={cage} geometry={cageGeometry} material={lineMaterial} />

        <group rotation={[1.2, 0.3, 0]}>
          <mesh ref={ringA}>
            <torusGeometry args={[1.8, 0.014, 12, 160]} />
            <meshBasicMaterial color={ACCENT} toneMapped={false} />
          </mesh>
          {/* Soft halo around the accent ring */}
          <mesh ref={ringGlow}>
            <torusGeometry args={[1.8, 0.07, 12, 160]} />
            <meshBasicMaterial color={ACCENT} transparent opacity={0.12} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
        <group rotation={[-0.45, 0.9, 0]}>
          <mesh ref={ringB} material={thinRingMaterial}>
            <torusGeometry args={[2.3, 0.006, 8, 180]} />
          </mesh>
        </group>
        <group rotation={[0.35, -0.6, 0.5]}>
          <mesh ref={ringC} material={thinRingMaterial}>
            <torusGeometry args={[2.8, 0.005, 8, 200]} />
          </mesh>
        </group>
        <group rotation={[1.15, 0.25, 0]}>
          <mesh ref={wave}>
            <torusGeometry args={[0.95, 0.01, 8, 140]} />
            <meshBasicMaterial color={EMBER} transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>

        <points geometry={geometry} material={pointsMaterial} frustumCulled={false} />
      </group>
    </>
  );
}

/**
 * Compiles every shader in the scene off the main thread (KHR_parallel_shader_compile where
 * available) before the first frame, so the page never freezes when the engine first renders.
 */
function Precompile({ onReady }: { onReady: () => void }) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .finally(() => {
        if (alive) onReady();
      });
    return () => {
      alive = false;
    };
  }, [gl, scene, camera, onReady]);
  return null;
}

export default function Engine3D({ active, ...inputs }: Props) {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  return (
    <Canvas
      // Phones: cap sharpness at 1.25× (big battery/GPU saving, visually near-identical).
      dpr={inputs.desktop ? [1, 1.75] : [1, 1.25]}
      frameloop={active && ready ? "always" : "never"}
      // The glass core's refraction pass at half resolution: a quarter of the per-frame
      // MSAA resolve + mipmap work, and the refraction is seen through dark tinted glass.
      onCreated={({ gl }) => {
        gl.transmissionResolutionScale = 0.5;
      }}
      camera={{ position: [0, 0, 9], fov: 35, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden="true"
      tabIndex={-1}
    >
      <Environment />
      <EngineScene {...inputs} />
      <Precompile onReady={onReady} />
    </Canvas>
  );
}
