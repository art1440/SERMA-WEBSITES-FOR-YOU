// Verification harness: node scripts/verify-work.mjs <check...>
// Requires a prior `npm run build` (non-static). Starts `next start` on PORT,
// runs the named checks, prints PASS/FAIL, always kills the server.
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
// Playwright is installed globally in this environment, not in package.json.
const { chromium, devices } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3123;
const BASE = `http://localhost:${PORT}`;
const CSP_PREFIX = "[CSP-VIOLATION]";

// Per-check registry of every context opened by openPage and its collected errors.
// The runner asserts on it and closes all contexts after each check, pass or fail.
let registry = [];

/**
 * opts: { width=1280, height=800, reducedMotion=false, device }
 * `device` is a Playwright device descriptor (e.g. devices["iPhone 13"]);
 * it is spread into newContext, then width/height (if given explicitly) override the viewport.
 */
async function openPage(browser, url, opts = {}) {
  const { width, height, reducedMotion = false, device, colorScheme = "light" } = opts;
  const ctxOpts = { ...(device || {}) };
  if (width || height || !device) {
    ctxOpts.viewport = { width: width ?? 1280, height: height ?? 800 };
  }
  ctxOpts.colorScheme = colorScheme;
  ctxOpts.reducedMotion = reducedMotion ? "reduce" : "no-preference";
  const context = await browser.newContext(ctxOpts);
  const page = await context.newPage();
  const errors = [];
  registry.push({ context, errors, url });
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  await page.addInitScript((prefix) => {
    document.addEventListener("securitypolicyviolation", (e) => {
      console.error(`${prefix} ${e.violatedDirective} blocked ${e.blockedURI}`);
    });
  }, CSP_PREFIX);
  await page.goto(url, { waitUntil: "networkidle" });
  return { page, errors };
}

/**
 * Injects axe-core and throws if any violation is found. `opts.disableRules` is an array of rule ids;
 * `opts.include` (CSS selectors) scopes the run to those subtrees instead of the whole document.
 */
async function runAxe(page, opts = {}) {
  await page.addScriptTag({ path: path.join(ROOT, "node_modules/axe-core/axe.min.js") });
  const config = opts.disableRules?.length
    ? { rules: Object.fromEntries(opts.disableRules.map((id) => [id, { enabled: false }])) }
    : {};
  const context = opts.include?.length ? { include: opts.include.map((sel) => [sel]) } : null;
  const results = await page.evaluate(([ctx, c]) => window.axe.run(ctx ?? document, c), [context, config]);
  if (results.violations.length) {
    const msg = results.violations
      .map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ")}`)
      .join("; ");
    throw new Error(`axe violations: ${msg}`);
  }
}

function assertNoErrors(errors) {
  if (errors.length) throw new Error(`page errors: ${errors.join(" | ")}`);
}

/**
 * Shared per-demo check: at 1280 and 390, in light and dark OS schemes:
 * 200 status, one h1, >= 2 [data-book], the signature marker, every image
 * decoded after a full scroll, axe clean. Then with reduced motion at 1280,
 * no scrolling: the signature is at rest and every text node in main is opaque.
 */
async function demoCheck(browser, base, id, { restCheck } = {}) {
  const url = `${base}/work/${id}/`;
  for (const colorScheme of ["light", "dark"]) {
    for (const width of [1280, 390]) {
      const where = `${width}px ${colorScheme}`;
      const { page, errors } = await openPage(browser, url, { width, height: width > 600 ? 800 : 844, colorScheme });
      const status = (await page.request.get(url)).status();
      if (status !== 200) throw new Error(`${where}: ${url} returned ${status}`);
      const h1 = await page.locator("h1").count();
      if (h1 !== 1) throw new Error(`${where}: expected exactly one h1, found ${h1}`);
      const books = await page.locator("[data-book]").count();
      if (books < 2) throw new Error(`${where}: expected >= 2 [data-book], found ${books}`);
      if (!(await page.locator(`[data-signature="${id}"]`).count())) throw new Error(`${where}: no [data-signature="${id}"]`);
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y <= total; y += 400) {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        await page.waitForTimeout(150);
      }
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(600);
      const broken = await page.evaluate(async () => {
        const imgs = [...document.querySelectorAll("img")];
        await Promise.all(imgs.map((i) => (i.complete ? null : i.decode().catch(() => null))));
        return imgs.filter((i) => !(i.naturalWidth > 0)).map((i) => i.currentSrc || i.src);
      });
      if (broken.length) throw new Error(`${where}: images not loaded: ${broken.join(", ")}`);
      try {
        await runAxe(page);
      } catch (e) {
        throw new Error(`${where}: ${e.message}`);
      }
      assertNoErrors(errors);
    }
  }
  const { page, errors } = await openPage(browser, url, { width: 1280, height: 800, reducedMotion: true });
  await page.waitForTimeout(400);
  const state = await page.locator("[data-signature]").first().getAttribute("data-state");
  if (state !== "rest") throw new Error(`reduced motion: [data-signature] data-state is ${JSON.stringify(state)}, expected "rest"`);
  const faded = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll("main *:not(:empty)")) {
      const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) continue;
      let node = el;
      let opacity = 1;
      while (node && node !== document.documentElement) {
        opacity *= parseFloat(getComputedStyle(node).opacity);
        node = node.parentElement;
      }
      if (opacity < 1) out.push(`${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 30)}" (${opacity.toFixed(2)})`);
    }
    return out;
  });
  if (faded.length) throw new Error(`reduced motion: text not fully opaque: ${faded.slice(0, 5).join("; ")}`);
  // Demo-specific assertions on the same reduced-motion page (may scroll).
  if (restCheck) await restCheck(page);
  assertNoErrors(errors);
}

/**
 * Maison Lumière, with motion: scroll until the ribbon has swapped the accent
 * away from plum, switch EN -> ES with the demo ribbon toggle, and assert the
 * accent (and its ink) did not change: a re-render must not reset it.
 */
async function salonAccentSurvivesLanguageSwitch(browser, base) {
  const { page, errors } = await openPage(browser, `${base}/work/salon/`, { width: 1280, height: 800 });
  const read = () =>
    page.evaluate(() => {
      const cs = getComputedStyle(document.querySelector("[data-demo]"));
      return `${cs.getPropertyValue("--salon-accent").trim().toUpperCase()} ${cs.getPropertyValue("--salon-ink").trim().toUpperCase()}`;
    });
  const top = await page.evaluate(() => document.querySelector("#shades").getBoundingClientRect().top + window.scrollY);
  let before = "";
  for (let off = 0; off <= 900; off += 75) {
    await page.evaluate((v) => window.scrollTo(0, v), top - 100 + off);
    await page.waitForTimeout(200);
    before = await read();
    if (!before.startsWith("#9B4A6B")) break;
  }
  if (before.startsWith("#9B4A6B")) throw new Error(`language switch: ribbon never swapped the accent away from plum (${before})`);
  await page.locator('[data-lang="es"]').click();
  await page.waitForFunction(() => document.documentElement.lang === "es" || document.querySelector('[data-lang="es"]')?.getAttribute("aria-pressed") === "true");
  await page.waitForTimeout(600);
  const after = await read();
  if (after !== before) throw new Error(`language switch: accent changed from ${before} to ${after}`);
  assertNoErrors(errors);
}

/** Maison Lumière: with reduced motion the ribbon never swaps the accent, even scrolled through. */
async function salonAccentStaysPlum(page) {
  const read = () =>
    page.evaluate(() => getComputedStyle(document.querySelector("[data-demo]")).getPropertyValue("--salon-accent").trim().toUpperCase());
  const before = await read();
  if (before !== "#9B4A6B") throw new Error(`reduced motion: --salon-accent is ${JSON.stringify(before)}, expected #9B4A6B`);
  await page.locator('[data-signature="salon"]').scrollIntoViewIfNeeded();
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(120);
  }
  const after = await read();
  if (after !== "#9B4A6B") throw new Error(`reduced motion: --salon-accent changed to ${after} while scrolling the ribbon`);
  const state = await page.locator('[data-signature="salon"]').getAttribute("data-state");
  if (state !== "rest") throw new Error(`reduced motion: ribbon data-state is ${JSON.stringify(state)} after scrolling`);
}

/**
 * Velvet Room: with reduced motion every treatment window is fully open (no
 * clip, image at scale 1) without scrolling to it.
 */
async function beautyWindowsOpen(page) {
  const windows = await page.evaluate(() =>
    [...document.querySelectorAll('[data-signature="beauty"] [data-window]')].map((w) => {
      const clip = getComputedStyle(w).clipPath;
      const img = w.querySelector("img");
      const t = img ? getComputedStyle(img).transform : "none";
      return { clip, t };
    }),
  );
  if (windows.length !== 3) throw new Error(`reduced motion: expected 3 [data-window], found ${windows.length}`);
  for (const { clip, t } of windows) {
    if (clip !== "none" && !/^inset\(0(px|%)?[ )]/.test(clip)) throw new Error(`reduced motion: window still clipped (${clip})`);
    if (t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)") throw new Error(`reduced motion: window image transformed (${t})`);
  }
}

/**
 * Ember & Oak: with reduced motion every menu row ([data-plate]) is plated
 * without scrolling to it: opacity 1 and no transform, on the row itself.
 */
async function restaurantMenuPlated(page) {
  const rows = await page.evaluate(() =>
    [...document.querySelectorAll('[data-signature="restaurant"] [data-plate]')].map((el) => {
      const cs = getComputedStyle(el);
      return { text: el.textContent.trim().slice(0, 30), opacity: cs.opacity, transform: cs.transform };
    }),
  );
  if (rows.length < 6) throw new Error(`reduced motion: expected >= 6 [data-plate] menu rows, found ${rows.length}`);
  for (const r of rows) {
    if (r.opacity !== "1") throw new Error(`reduced motion: menu row "${r.text}" has opacity ${r.opacity}`);
    if (r.transform !== "none" && r.transform !== "matrix(1, 0, 0, 1, 0, 0)") {
      throw new Error(`reduced motion: menu row "${r.text}" is transformed (${r.transform})`);
    }
  }
}

/**
 * Ember & Oak, with motion: scroll through the menu card in steps and expect
 * every course to have plated, i.e. [data-signature] reaches data-state="rest".
 */
async function restaurantMenuPlatesLive(browser, base) {
  const { page, errors } = await openPage(browser, `${base}/work/restaurant/`, { width: 1280, height: 800 });
  const { top, bottom } = await page.evaluate(() => {
    const r = document.querySelector('[data-signature="restaurant"]').getBoundingClientRect();
    return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
  });
  for (let y = top - 400; y <= bottom; y += 300) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(200);
  }
  try {
    await page.waitForFunction(() => document.querySelector('[data-signature="restaurant"]').dataset.state === "rest", null, { timeout: 4000 });
  } catch {
    const state = await page.locator('[data-signature="restaurant"]').getAttribute("data-state");
    throw new Error(`motion: after scrolling the menu, data-state is ${JSON.stringify(state)}, expected "rest"`);
  }
  assertNoErrors(errors);
}

/**
 * Trueframe: with reduced motion the hero kitchen photo is fully shown (no
 * clip) and the elevation linework is hidden behind it.
 */
async function contractorPhotoShown(page) {
  const r = await page.evaluate(() => {
    const sig = document.querySelector('[data-signature="contractor"]');
    const photo = sig?.querySelector("[data-photo]");
    const lines = sig?.querySelector("[data-linework]");
    if (!photo || !lines) return { missing: true };
    const pr = photo.getBoundingClientRect();
    const lr = lines.getBoundingClientRect();
    return {
      clip: getComputedStyle(photo).clipPath,
      photoOpacity: getComputedStyle(photo).opacity,
      covers: pr.left <= lr.left + 1 && pr.top <= lr.top + 1 && pr.right >= lr.right - 1 && pr.bottom >= lr.bottom - 1,
      linesVisibility: getComputedStyle(lines).visibility,
    };
  });
  if (r.missing) throw new Error("reduced motion: hero has no [data-photo] or [data-linework]");
  if (r.clip !== "none" && !/^inset\(0(px|%)?\)$/.test(r.clip)) throw new Error(`reduced motion: kitchen photo still clipped (${r.clip})`);
  if (r.photoOpacity !== "1") throw new Error(`reduced motion: kitchen photo opacity ${r.photoOpacity}`);
  if (!r.covers) throw new Error("reduced motion: the photo does not cover the linework");
  if (r.linesVisibility !== "hidden") throw new Error(`reduced motion: linework visibility is ${r.linesVisibility}, expected hidden`);
}

/** Trueframe, with motion: the hero sequence (draw, wipe, edge fade) lands at data-state="rest" with the photo unclipped. */
async function contractorHeroSettlesLive(browser, base) {
  const { page, errors } = await openPage(browser, `${base}/work/contractor/`, { width: 1280, height: 800 });
  const early = await page.locator('[data-signature="contractor"]').getAttribute("data-state");
  try {
    await page.waitForFunction(() => document.querySelector('[data-signature="contractor"]').dataset.state === "rest", null, { timeout: 6000 });
  } catch {
    const state = await page.locator('[data-signature="contractor"]').getAttribute("data-state");
    throw new Error(`motion: hero data-state is ${JSON.stringify(state)} after 6 s, expected "rest" (at load: ${JSON.stringify(early)})`);
  }
  await contractorPhotoShown(page);
  assertNoErrors(errors);
}

/**
 * Brightline: the before/after slider ([role="slider"] inside the signature).
 * Mouse drag from 50% to 80% lands at 78-82; the wheel over the slider still
 * scrolls the page (touch-action: pan-y, no wheel handler); keyboard: ArrowRight
 * +5, Home 0, End 100. Run with motion on, after the one-time hint sweep.
 */
async function serviceSliderWorks(browser, base) {
  const { page, errors } = await openPage(browser, `${base}/work/service/`, { width: 1280, height: 800 });
  const sig = page.locator('[data-signature="service"]');
  await sig.scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    const el = document.querySelector('[data-signature="service"]');
    window.scrollBy(0, el.getBoundingClientRect().top - 120);
  });
  try {
    await page.waitForFunction(() => document.querySelector('[data-signature="service"]').dataset.state === "rest", null, { timeout: 4000 });
  } catch {
    throw new Error("motion: slider never reached data-state=rest after its hint sweep");
  }
  const slider = page.locator('[data-signature="service"] [role="slider"]');
  const now = async () => Number(await slider.getAttribute("aria-valuenow"));
  for (const attr of ["aria-valuemin", "aria-valuemax", "aria-valuetext"]) {
    if ((await slider.getAttribute(attr)) == null) throw new Error(`slider: missing ${attr}`);
  }
  if ((await now()) !== 50) throw new Error(`slider: expected to start at 50, got ${await now()}`);
  const frame = await page.evaluate(() => {
    const r = document.querySelector('[data-signature="service"] [data-frame]').getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const y = frame.y + frame.h / 2;
  await page.mouse.move(frame.x + frame.w * 0.5, y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(frame.x + frame.w * (0.5 + 0.03 * i), y);
  await page.mouse.up();
  const dragged = await now();
  if (dragged < 78 || dragged > 82) throw new Error(`slider: drag 50% -> 80% gave aria-valuenow ${dragged}`);
  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(frame.x + frame.w * 0.3, y);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => window.scrollY);
  if (after - before < 200) throw new Error(`slider: wheel over the slider scrolled ${after - before}px, expected ~400`);
  await slider.focus();
  await page.keyboard.press("Home");
  if ((await now()) !== 0) throw new Error(`slider: Home gave ${await now()}`);
  await page.keyboard.press("ArrowRight");
  if ((await now()) !== 5) throw new Error(`slider: ArrowRight from 0 gave ${await now()}`);
  await page.keyboard.press("End");
  if ((await now()) !== 100) throw new Error(`slider: End gave ${await now()}`);
  await page.keyboard.press("ArrowLeft");
  if ((await now()) !== 95) throw new Error(`slider: ArrowLeft from 100 gave ${await now()}`);
  const clip = await page.evaluate(() => getComputedStyle(document.querySelector('[data-signature="service"] [data-after]')).clipPath);
  if (!/inset\(0(px|%)? 5%/.test(clip)) throw new Error(`slider: after-image clip is ${clip} at 95`);
  assertNoErrors(errors);
}

/** Brightline, reduced motion: the slider rests at 50 with the after image half revealed. */
async function serviceSliderAtRest(page) {
  const r = await page.evaluate(() => {
    const s = document.querySelector('[data-signature="service"] [role="slider"]');
    const a = document.querySelector('[data-signature="service"] [data-after]');
    return { now: s?.getAttribute("aria-valuenow"), clip: a ? getComputedStyle(a).clipPath : null };
  });
  if (r.now !== "50") throw new Error(`reduced motion: slider aria-valuenow ${r.now}, expected 50`);
  if (!/inset\(0(px|%)? 50%/.test(r.clip ?? "")) throw new Error(`reduced motion: after-image clip is ${r.clip}`);
}


/** translateY (px) of a card's screenshot image, from its computed transform. */
async function shotY(card) {
  return card.locator("[data-work-shot]").evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42);
}

/** Opens /#work at 1280x900 and waits for the six cards. */
async function openGallery(browser, base, opts = {}) {
  const { page, errors } = await openPage(browser, `${base}/#work`, { width: 1280, height: 900, ...opts });
  await page.locator("#work").scrollIntoViewIfNeeded();
  const cards = page.locator("[data-work-card]");
  await cards.first().waitFor({ state: "visible", timeout: 5000 });
  const n = await cards.count();
  if (n !== 6) throw new Error(`expected 6 [data-work-card], found ${n}`);
  await page.waitForTimeout(300);
  return { page, errors, cards };
}

async function hoverViewport(page, card) {
  const box = await card.locator("[data-work-viewport]").boundingBox();
  if (!box) throw new Error("card viewport has no box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
}

const CHECKS = {
  "home-smoke": async ({ browser, base }) => {
    const { page } = await openPage(browser, `${base}/`);
    await runAxe(page);
  },
  // ---- "Our work" gallery on the home page (Task 12) ----
  "gallery-desktop": async ({ browser, base }) => {
    const { page, errors, cards } = await openGallery(browser, base);
    const first = cards.nth(0);
    const second = cards.nth(1);
    await hoverViewport(page, first);
    await page.waitForTimeout(1500);
    const yLive = await shotY(first);
    if (!(yLive < -1)) throw new Error(`hover: first card's image translateY is ${yLive}, expected negative`);
    await page.mouse.move(4, 450, { steps: 4 });
    await page.waitForTimeout(1200);
    const yBack = await shotY(first);
    if (Math.abs(yBack) > 1) throw new Error(`leave: translateY is ${yBack} after 1200 ms, expected 0 ± 1`);

    await hoverViewport(page, second);
    await page.waitForTimeout(800);
    await second.click();
    const dialog = page.getByRole("dialog", { name: "Maison Lumière" });
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    const inside = () => dialog.evaluate((el) => el.contains(document.activeElement));
    if (!(await inside())) throw new Error("focus is not inside the preview on open");
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      if (!(await inside())) throw new Error(`focus left the preview after Tab ${i + 1}`);
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 5000 });
    const back = await second.evaluate((el) => el === document.activeElement);
    if (!back) throw new Error("focus did not return to the second card after Esc");

    await second.click();
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(700);
    await page.mouse.click(8, 8);
    await dialog.waitFor({ state: "hidden", timeout: 5000 });
    assertNoErrors(errors);

    for (const colorScheme of ["light", "dark"]) {
      const g = await openGallery(browser, base, { colorScheme });
      await g.cards.nth(1).click();
      await g.page.getByRole("dialog", { name: "Maison Lumière" }).waitFor({ state: "visible", timeout: 5000 });
      await g.page.waitForTimeout(900);
      try {
        // Scoped to the gallery + its dialog: the page around it has its own checks (home-smoke).
        await runAxe(g.page, { include: ["#work", '[role="dialog"]'] });
      } catch (e) {
        throw new Error(`${colorScheme}, preview open: ${e.message}`);
      }
    }
  },
  "gallery-reduced": async ({ browser, base }) => {
    const { page, errors, cards } = await openGallery(browser, base, { reducedMotion: true });
    const first = cards.nth(0);
    await hoverViewport(page, first);
    await page.waitForTimeout(1500);
    const y = await shotY(first);
    if (Math.abs(y) > 0.5) throw new Error(`reduced motion: translateY is ${y} while hovered, expected 0`);
    await first.click();
    const dialog = page.getByRole("dialog", { name: "Ironside Barber Co." });
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 5000 });
    assertNoErrors(errors);
  },
  "demo:barbershop": ({ browser, base }) => demoCheck(browser, base, "barbershop"),
  "demo:beauty": ({ browser, base }) => demoCheck(browser, base, "beauty", { restCheck: beautyWindowsOpen }),
  "demo:restaurant": async ({ browser, base }) => {
    await demoCheck(browser, base, "restaurant", { restCheck: restaurantMenuPlated });
    await restaurantMenuPlatesLive(browser, base);
  },
  "demo:contractor": async ({ browser, base }) => {
    await demoCheck(browser, base, "contractor", { restCheck: contractorPhotoShown });
    await contractorHeroSettlesLive(browser, base);
  },
  "demo:service": async ({ browser, base }) => {
    await demoCheck(browser, base, "service", { restCheck: serviceSliderAtRest });
    await serviceSliderWorks(browser, base);
  },
  "demo:salon": async ({ browser, base }) => {
    await demoCheck(browser, base, "salon", { restCheck: salonAccentStaysPlum });
    await salonAccentSurvivesLanguageSwitch(browser, base);
  },
  // ---- DemoShell checks (need a demo route; they 404 until Task 5) ----
  "shell-lang": async ({ browser, base }) => {
    const { page, errors } = await openPage(browser, `${base}/work/barbershop/?lang=es`);
    const ribbon = page.getByRole("region", { name: "Sitio de demostración por Serma" });
    await ribbon.waitFor({ state: "visible", timeout: 5000 });
    const lang = await page.evaluate(() => document.documentElement.lang);
    if (lang !== "es") throw new Error(`html lang is "${lang}", expected "es"`);
    await ribbon.locator('button[data-lang="en"]').click();
    await page.waitForFunction(() => location.search.includes("lang=en"), null, { timeout: 5000 });
    await page.getByRole("region", { name: "Demo site by Serma" }).waitFor({ state: "visible", timeout: 5000 });
    assertNoErrors(errors);
  },
  "shell-booking": async ({ browser, base }) => {
    const { page, errors } = await openPage(browser, `${base}/work/barbershop/`);
    const book = page.locator("[data-book]").first();
    await book.scrollIntoViewIfNeeded();
    await book.click();
    const dialog = page.getByRole("dialog", { name: "This is a demo" });
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    const inside = () => dialog.evaluate((el) => el.contains(document.activeElement));
    if (!(await inside())) throw new Error("focus is not inside the dialog on open");
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      if (!(await inside())) throw new Error(`focus left the dialog after Tab ${i + 1}`);
    }
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 5000 });
    const back = await book.evaluate((el) => el === document.activeElement);
    if (!back) throw new Error("focus did not return to the [data-book] button");
    assertNoErrors(errors);
    // axe with the sheet open, in both colour schemes
    for (const colorScheme of ["light", "dark"]) {
      const { page: p } = await openPage(browser, `${base}/work/barbershop/`, { colorScheme });
      await p.locator("[data-book]").first().click();
      await p.getByRole("dialog", { name: "This is a demo" }).waitFor({ state: "visible", timeout: 5000 });
      await p.waitForTimeout(400);
      await runAxe(p, { disableRules: ["region"] });
    }
  },
  "shell-capture": async ({ browser, base }) => {
    const { page, errors } = await openPage(browser, `${base}/work/barbershop/?capture=1`);
    const visible = await page.getByRole("region", { name: /Demo site by Serma|Sitio de demostración por Serma/ }).isVisible();
    if (visible) throw new Error("ribbon is visible with ?capture=1");
    assertNoErrors(errors);
  },
  "shell-noindex": async ({ browser, base }) => {
    const { page } = await openPage(browser, `${base}/work/barbershop/`);
    const content = await page.locator('meta[name="robots"]').first().getAttribute("content");
    if (content !== "noindex, nofollow") throw new Error(`robots meta is ${JSON.stringify(content)}`);
  },
};

function portInUse(port) {
  return new Promise((resolve) => {
    const s = net.createServer();
    s.once("error", () => resolve(true));
    s.once("listening", () => s.close(() => resolve(false)));
    s.listen(port);
  });
}

async function waitForOk(url, server, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (server.exitCode !== null) throw new Error(`next start exited early (code ${server.exitCode})`);
    try {
      const r = await fetch(url);
      if (r.status === 200) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`timed out waiting for ${url}`);
}

async function main() {
  const names = process.argv.slice(2);
  if (!names.length) {
    console.error(`Usage: node scripts/verify-work.mjs <check...>\nChecks: ${Object.keys(CHECKS).join(", ")}`);
    return 2;
  }
  const unknown = names.filter((n) => !CHECKS[n]);
  if (unknown.length) {
    console.error(`Unknown check(s): ${unknown.join(", ")}. Available: ${Object.keys(CHECKS).join(", ")}`);
    return 2;
  }
  if (!fs.existsSync(path.join(ROOT, ".next/BUILD_ID"))) {
    console.error("No .next build found. Run `npm run build` first.");
    return 2;
  }
  if (await portInUse(PORT)) {
    console.error(`Port ${PORT} is already in use. Stop whatever is listening on it and retry.`);
    return 2;
  }

  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  let serverLog = "";
  server.stdout.on("data", (d) => (serverLog += d));
  server.stderr.on("data", (d) => (serverLog += d));
  const killServer = () => {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {}
  };
  process.on("exit", killServer);
  for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => process.exit(130));

  let browser;
  let failed = false;
  try {
    await waitForOk(`${BASE}/`, server);
    browser = await chromium.launch();
    for (const name of names) {
      registry = [];
      let failure = null;
      try {
        await CHECKS[name]({ browser, base: BASE });
      } catch (e) {
        failure = e.message;
      }
      const collected = registry.flatMap((r) => r.errors.map((m) => `${r.url} ${m}`));
      for (const r of registry) await r.context.close().catch(() => {});
      registry = [];
      if (!failure && collected.length) failure = `page errors: ${collected.join(" | ")}`;
      if (failure) {
        failed = true;
        console.log(`FAIL ${name}: ${failure}`);
      } else console.log(`PASS ${name}`);
    }
  } catch (e) {
    failed = true;
    console.error(`Harness error: ${e.message}\n${serverLog}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
    killServer();
  }
  return failed ? 1 : 0;
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
