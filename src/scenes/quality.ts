/**
 * Decides whether and how richly to render 3D, without loading Three.js.
 * Tiers: off (still image only), low, mid, high.
 */
export type Tier = 'off' | 'low' | 'mid' | 'high';

export interface TierInfo { tier: Tier; maxDpr: number; antialias: boolean; reason: string }

const settings: Record<Exclude<Tier, 'off'>, Omit<TierInfo, 'tier' | 'reason'>> = {
  low: { maxDpr: 1, antialias: false },
  mid: { maxDpr: 1.5, antialias: true },
  high: { maxDpr: 2, antialias: true },
};

export const tierSettings = (tier: Exclude<Tier, 'off'>) => settings[tier];

function forced(): Tier | null {
  const q = new URLSearchParams(location.search).get('quality');
  return q === 'off' || q === 'low' || q === 'mid' || q === 'high' ? q : null;
}

/** Cheap checks that need no GPU work. */
export function preliminaryTier(): TierInfo {
  const force = forced();
  if (force === 'off') return { tier: 'off', maxDpr: 1, antialias: false, reason: 'forced' };
  if (force) return { tier: force, ...settings[force], reason: 'forced' };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return { tier: 'off', maxDpr: 1, antialias: false, reason: 'reduced motion' };
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return { tier: 'off', maxDpr: 1, antialias: false, reason: 'data saver' };
  if (typeof WebGL2RenderingContext === 'undefined') return { tier: 'off', maxDpr: 1, antialias: false, reason: 'no WebGL2' };

  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (memory < 2) return { tier: 'off', maxDpr: 1, antialias: false, reason: 'very low memory' };
  if (memory <= 3 || cores <= 4) return { tier: 'low', ...settings.low, reason: 'low-power device' };
  if (coarse) return { tier: 'mid', ...settings.mid, reason: 'phone or tablet' };
  return { tier: 'high', ...settings.high, reason: 'desktop' };
}

/**
 * Creates the WebGL2 context the scene will use, and rejects software renderers
 * (no GPU: the 3D would be slow and drain the battery, so the still image is the better experience).
 */
export function createContext(canvas: HTMLCanvasElement, info: TierInfo): WebGL2RenderingContext | null {
  const gl = canvas.getContext('webgl2', {
    antialias: info.antialias,
    alpha: true,
    premultipliedAlpha: true,
    powerPreference: 'default',
    failIfMajorPerformanceCaveat: forced() === null,
  });
  if (!gl) return null;
  if (forced() === null) {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return null;
    }
  }
  return gl;
}
