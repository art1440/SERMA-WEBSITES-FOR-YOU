/**
 * Starts the hero 3D scene only when it will help: after the page has loaded and gone idle,
 * when the hero is near the screen, and only on devices that can render it well.
 * Until then (and forever, on everything else) the CSS poster is what people see.
 */
import { preliminaryTier, createContext } from '../quality';
import { INTRO_KEY } from './constants';

const html = document.documentElement;
const stage = document.querySelector<HTMLElement>('[data-scene="hero"]');
const showPoster = () => html.classList.remove('intro-pending');

function afterLoad() {
  return new Promise<void>((resolve) => {
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 1500 }) : setTimeout(resolve, 200));
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
  });
}

function nearViewport(el: Element) {
  return new Promise<void>((resolve) => {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { io.disconnect(); resolve(); }
    }, { rootMargin: '300px 0px' });
    io.observe(el);
  });
}

function visibleShare(el: Element) {
  const r = el.getBoundingClientRect();
  const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
  return r.height ? visible / r.height : 0;
}

async function boot(stage: HTMLElement) {
  const info = preliminaryTier();
  if (info.tier === 'off') { showPoster(); return; }

  await afterLoad();
  await nearViewport(stage);

  const host = stage.querySelector<HTMLElement>('[data-canvas-host]');
  if (!host) { showPoster(); return; }
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const gl = createContext(canvas, info);
  if (!gl) { showPoster(); return; }
  host.appendChild(canvas);

  let seen = false;
  try { seen = Boolean(localStorage.getItem(INTRO_KEY)); } catch { /* storage blocked: treat as seen */ seen = true; }
  // Play the intro only on a first visit, and only if people can actually see it.
  const intro = !seen && html.classList.contains('intro-pending') && visibleShare(stage) > 0.35;
  const skipBtn = document.querySelector<HTMLButtonElement>('[data-skip-intro]');

  try {
    const { createHeroScene } = await import('./scene');
    const scene = await createHeroScene({
      stage, canvas, context: gl, tier: info, intro,
      debug: new URLSearchParams(location.search).has('debug'),
      onChip: () => stage.classList.add('chip-in'),
      onIntroEnd: () => {
        if (skipBtn) {
          if (document.activeElement === skipBtn) document.querySelector<HTMLElement>('.hero [data-open-preview]')?.focus();
          skipBtn.hidden = true;
        }
      },
      onLost: () => { stage.classList.remove('scene-live'); showPoster(); },
    });

    stage.classList.add('scene-live');
    showPoster();

    if (intro) {
      try { localStorage.setItem(INTRO_KEY, '1'); } catch { /* ignore */ }
      if (skipBtn) skipBtn.hidden = false;
      const skip = () => scene.skip();
      skipBtn?.addEventListener('click', skip);
      window.addEventListener('scroll', skip, { once: true, passive: true });
      window.addEventListener('keydown', skip, { once: true });
      window.addEventListener('wheel', skip, { once: true, passive: true });
    }

    // Render only while the hero is on screen and the tab is visible.
    let onScreen = true;
    const sync = () => scene.setActive(onScreen && !document.hidden);
    new IntersectionObserver(([e]) => { onScreen = e!.isIntersecting; sync(); }).observe(stage);
    document.addEventListener('visibilitychange', sync);
    sync();
  } catch (err) {
    canvas.remove();
    stage.classList.remove('scene-live');
    showPoster();
    if (new URLSearchParams(location.search).has('debug')) console.error('Hero 3D failed', err);
  }
}

if (stage) boot(stage);
else showPoster();
