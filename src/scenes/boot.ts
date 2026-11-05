/**
 * Starts the 3D only when it will help: after the page has loaded and gone idle, when a 3D area
 * is near the screen, and only on devices that can render it well. Until then (and always, on
 * everything else) the CSS posters are what people see. The hero mounts first; the chapter
 * journey and the finale mount when you get close to them.
 */
import { preliminaryTier, createContext } from './quality';
import { BLEED, INTRO_KEY } from './hero/constants';
import type { Runtime, Entry } from './runtime';

const html = document.documentElement;
const params = new URLSearchParams(location.search);
const debug = params.has('debug');
const showPoster = () => html.classList.remove('intro-pending');

function afterLoad() {
  return new Promise<void>((resolve) => {
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 1500 }) : setTimeout(resolve, 200));
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
  });
}

function nearViewport(els: Element[], margin = '300px 0px') {
  return new Promise<void>((resolve) => {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); resolve(); }
    }, { rootMargin: margin });
    els.forEach((el) => io.observe(el));
  });
}

function visibleShare(el: Element) {
  const r = el.getBoundingClientRect();
  const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
  return r.height ? visible / r.height : 0;
}

async function mountHero(rt: Runtime, stage: HTMLElement) {
  const host = stage.querySelector<HTMLElement>('[data-canvas-host]');
  if (!host) return;
  let seen = false;
  try { seen = Boolean(localStorage.getItem(INTRO_KEY)); } catch { seen = true; }
  // The intro plays only on a first visit, and only if people can actually see it.
  const intro = !seen && html.classList.contains('intro-pending') && visibleShare(stage) > 0.35;
  const skipBtn = document.querySelector<HTMLButtonElement>('[data-skip-intro]');

  const { createHeroScene } = await import('./hero/scene');
  const hero = createHeroScene(rt, {
    intro,
    onChip: () => stage.classList.add('chip-in'),
    onIntroEnd: () => {
      if (!skipBtn) return;
      if (document.activeElement === skipBtn) document.querySelector<HTMLElement>('.hero [data-open-preview]')?.focus();
      skipBtn.hidden = true;
    },
  });
  await rt.add({ name: 'hero', stage, host, bleed: BLEED, scene: hero, params: {} });

  if (intro) {
    try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* ignore */ }
    if (skipBtn) skipBtn.hidden = false;
    const skip = () => hero.skip();
    skipBtn?.addEventListener('click', skip);
    window.addEventListener('scroll', skip, { once: true, passive: true });
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('wheel', skip, { once: true, passive: true });
  }
}

async function mountJourney(rt: Runtime) {
  const { createJourneyScene } = await import('./journey/scene');
  const scene = createJourneyScene(rt);
  const desktop = matchMedia('(min-width: 1024px)');
  const sticky = document.querySelector<HTMLElement>('[data-journey-stage]');
  const chapters = [...document.querySelectorAll<HTMLElement>('[data-chapter]')];
  const entries: Entry[] = [];

  // Desktop: four stacked chapter pictures in one sticky stage; the active chapter's picture hosts the canvas.
  sticky?.querySelectorAll<HTMLElement>('.stage-art .art').forEach((art) => {
    const host = art.querySelector<HTMLElement>('[data-canvas-host]');
    if (host) entries.push({
      name: `journey (${art.dataset.scene})`, stage: art, host, bleed: 0, scene,
      params: { mode: 'sticky', chapters },
      eligible: () => desktop.matches && sticky.dataset.active === art.dataset.scene,
    });
  });
  // Phones and tablets: each chapter's own picture.
  document.querySelectorAll<HTMLElement>('.inline-art .art').forEach((art) => {
    const host = art.querySelector<HTMLElement>('[data-canvas-host]');
    const chapter = chapters.findIndex((c) => c.contains(art));
    if (host && chapter >= 0) entries.push({
      name: `journey ${chapter + 1}/4`, stage: art, host, bleed: 0, scene,
      params: { mode: 'inline', chapter },
      eligible: () => !desktop.matches,
    });
  });
  // The half-built phone next to the final form (desktop layout only).
  const finale = document.querySelector<HTMLElement>('[data-scene="finale"]');
  const finaleHost = finale?.querySelector<HTMLElement>('[data-canvas-host]');
  if (finale && finaleHost) entries.push({ name: 'finale', stage: finale, host: finaleHost, bleed: 0.12, scene, params: { mode: 'finale' } });

  for (const e of entries) await rt.add(e);
  sticky?.classList.add('journey-live');
  if (sticky) new MutationObserver(() => rt.refresh()).observe(sticky, { attributes: true, attributeFilter: ['data-active'] });
  desktop.addEventListener('change', () => rt.refresh());
  rt.refresh();
}

async function boot() {
  const info = preliminaryTier();
  if (info.tier === 'off') { showPoster(); return; }

  const heroStage = document.querySelector<HTMLElement>('[data-scene="hero"]');
  const areas = [...document.querySelectorAll('[data-scene]')];
  if (!areas.length) { showPoster(); return; }

  await afterLoad();
  await nearViewport(areas);

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const gl = createContext(canvas, info);
  if (!gl) { showPoster(); return; }

  try {
    const { createRuntime } = await import('./runtime');
    const rt = await createRuntime(canvas, gl, info, { debug, onLost: showPoster });
    if (heroStage) await mountHero(rt, heroStage);
    showPoster();
    const later = [document.querySelector('[data-journey]'), document.querySelector('[data-scene="finale"]')].filter((el): el is Element => Boolean(el));
    if (later.length) {
      await nearViewport(later, '900px 0px');
      await mountJourney(rt);
    }
  } catch (err) {
    canvas.remove();
    document.querySelectorAll('.scene-live').forEach((el) => el.classList.remove('scene-live'));
    showPoster();
    if (debug) console.error('3D failed', err);
  }
}

boot();
