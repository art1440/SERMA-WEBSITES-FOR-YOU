/** Shared building blocks for every scene: the rounded tile, its material, device bodies, seeded random. */
import { ShaderMaterial, Color, Vector3, ExtrudeGeometry, Shape, type Texture, type BufferGeometry } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { color } from '../design/tokens';
import { tileVertex, tileFragment, bodyVertex, bodyFragment } from './shaders';
import type { Tier } from './quality';

export const TILE_DEPTH = 0.36;
export const TILE_RADIUS = 0.18;
export const LIGHT = new Vector3(0.35, 0.55, 1).normalize();

export function tileGeometry(tier: Tier) {
  return new RoundedBoxGeometry(1, 1, TILE_DEPTH, tier === 'high' ? 3 : 2, TILE_RADIUS);
}

export function tileMaterial(atlas: Texture) {
  return new ShaderMaterial({
    vertexShader: tileVertex,
    fragmentShader: tileFragment,
    uniforms: {
      uAtlas: { value: atlas },
      uMint: { value: new Color(color.secondary) },
      uGold: { value: new Color(color.accent) },
      uFace: { value: new Color('#13201B') },
      uSide: { value: new Color('#1A2722') },
      uLight: { value: LIGHT.clone() },
      uLit: { value: 0 },
    },
  });
}

export function bodyMaterial(top: string, bottom: string) {
  return new ShaderMaterial({
    vertexShader: bodyVertex,
    fragmentShader: bodyFragment,
    transparent: true,
    uniforms: {
      uTop: { value: new Color(top) },
      uBottom: { value: new Color(bottom) },
      uEdge: { value: new Color('#2B3D36') },
      uHalfH: { value: 100 },
      uOpacity: { value: 0 },
      uLight: { value: LIGHT.clone() },
    },
  });
}

/** Rounded slab for device bodies, centered on the origin. */
export function roundedRectGeometry(w: number, h: number, r: number, depth: number): BufferGeometry {
  const s = new Shape();
  const x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const bevel = Math.min(2.5, depth * 0.25);
  const g = new ExtrudeGeometry(s, { depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 10 });
  g.translate(0, 0, -(depth - bevel * 2) / 2);
  return g;
}

/** Deterministic random so every visitor sees the same choreography. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
