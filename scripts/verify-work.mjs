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
      const ov = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      if (ov.sw > ov.iw) throw new Error(`${where}: page overflows horizontally (scrollWidth ${ov.sw} > ${ov.iw})`);
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
 * Ember & Oak: a header nav link lands its section right below the sticky header (the site-wide
 * scroll-padding-top must not add to the section's own scroll-margin-top). Ribbon shown and hidden.
 */
async function restaurantAnchorLands(browser, base) {
  for (const query of ["", "?capture=1"]) {
    const { page, errors } = await openPage(browser, `${base}/work/restaurant/${query}`, { width: 1280, height: 800, reducedMotion: true });
    const links = page.locator('header nav a[href^="#"]');
    const n = await links.count();
    if (n < 2) throw new Error(`anchor${query}: expected header nav links, found ${n}`);
    for (let i = 0; i < n; i++) {
      const link = links.nth(i);
      const hash = await link.getAttribute("href");
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(150);
      await link.click();
      await page.waitForFunction((h) => location.hash === h, hash, { timeout: 3000 });
      // Wait for the scroll (smooth or not) to settle.
      await page.evaluate(async () => {
        let last = -1;
        let still = 0;
        while (still < 6) {
          await new Promise((r) => requestAnimationFrame(r));
          still = scrollY === last ? still + 1 : 0;
          last = scrollY;
        }
      });
      const m = await page.evaluate((h) => {
        const header = document.querySelector("[data-demo] header");
        const target = document.querySelector(h);
        return { headerBottom: header.getBoundingClientRect().bottom, top: target.getBoundingClientRect().top, y: scrollY, max: document.documentElement.scrollHeight - innerHeight };
      }, hash);
      // A section near the end of the page may be unable to reach the top: then the page is at its end.
      if (m.y >= m.max - 1 && m.top > m.headerBottom) continue;
      if (Math.abs(m.top - m.headerBottom) > 8)
        throw new Error(`anchor${query} ${hash}: section top ${m.top.toFixed(1)} vs header bottom ${m.headerBottom.toFixed(1)}`);
    }
    assertNoErrors(errors);
  }
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

/** Opens /#work as an iPhone 13 (touch, DPR 3) and waits for the six cards in their row. */
async function openPhoneGallery(browser, base, opts = {}) {
  const { page, errors } = await openPage(browser, `${base}/#work`, { device: devices["iPhone 13"], ...opts });
  const row = page.locator("[data-work-row]");
  await row.waitFor({ state: "visible", timeout: 5000 });
  await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
  const cards = page.locator("[data-work-card]");
  const n = await cards.count();
  if (n !== 6) throw new Error(`expected 6 [data-work-card], found ${n}`);
  await page.waitForTimeout(500);
  return { page, errors, cards, row };
}

/**
 * Phone preview -> "Visit the full demo": the demo opens at its top (the body pin must not hand the
 * home page's scroll offset to the demo), with its h1 on screen.
 */
async function phoneVisitLandsAtTop(browser, base, { reducedMotion }) {
  const where = reducedMotion ? "phone visit (reduced motion)" : "phone visit";
  const { page, errors, cards } = await openPhoneGallery(browser, base, { reducedMotion });
  const yHome = await page.evaluate(() => scrollY);
  if (!(yHome > 400)) throw new Error(`${where}: gallery is at scrollY ${yHome}, too close to the top to tell`);
  const c = await cards.nth(0).locator("[data-work-viewport]").boundingBox();
  await page.touchscreen.tap(c.x + c.width / 2, c.y + c.height / 2);
  const dialog = page.getByRole("dialog", { name: "Trueframe Builders", exact: true });
  await dialog.waitFor({ state: "visible", timeout: 5000 });
  await page.waitForTimeout(900);
  if ((await page.evaluate(() => getComputedStyle(document.body).position)) !== "fixed") throw new Error(`${where}: body not pinned before Visit`);
  await dialog.getByRole("link", { name: "Visit the full demo" }).tap();
  await page.waitForURL(/\/work\/contractor\/?$/, { timeout: 10000 });
  await page.locator("[data-demo] h1").waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(800);
  const m = await page.evaluate(() => {
    const r = document.querySelector("[data-demo] h1").getBoundingClientRect();
    return { y: scrollY, top: r.top, bottom: r.bottom, vh: innerHeight, pos: getComputedStyle(document.body).position, bodyTop: document.body.style.top };
  });
  if (m.y !== 0) throw new Error(`${where}: demo opened at scrollY ${m.y}, expected 0`);
  if (!(m.top >= 0 && m.bottom <= m.vh)) throw new Error(`${where}: h1 not in the viewport (${m.top}..${m.bottom}, vh ${m.vh})`);
  if (m.pos !== "static" || m.bodyTop) throw new Error(`${where}: body still pinned on the demo (${m.pos}, top ${m.bodyTop})`);
  assertNoErrors(errors);
}

/** A real touch drag (CDP touch events: pointer events + native scrolling), in small steps. */
async function touchDrag(page, from, to, steps = 12) {
  const cdp = await page.context().newCDPSession(page);
  const pt = (x, y) => [{ x: Math.round(x), y: Math.round(y), id: 1 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: pt(from.x, from.y) });
  for (let i = 1; i <= steps; i++) {
    const k = i / steps;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: pt(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k) });
    await page.waitForTimeout(16);
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
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
  // ---- Home page wiring (Task 14) ----
  "home-wiring": async ({ browser, base }) => {
    const { page, errors } = await openPage(browser, `${base}/`);
    // On the home page the nav is the tab bar (buttons); the plain links list is used on pages
    // without it (legal pages), checked below; the mobile menu holds anchors (checked at 390px).
    if (!(await page.locator('header nav [data-tab="work"]').count())) throw new Error("home: no work tab in the nav tab bar");
    // Visible section numbers run (01)…(03) in DOM order, no gaps, no duplicates.
    const numbers = await page.evaluate(() => [...document.querySelectorAll("main [data-section-index]")].map((el) => el.textContent.trim()));
    const expected = ["01", "02", "03"];
    if (numbers.join(",") !== expected.join(",")) throw new Error(`home: section numbers are [${numbers.join(", ")}], expected [${expected.join(", ")}]`);
    // Legal pages (no tab bar) list /#work in the primary nav links.
    const { page: legal } = await openPage(browser, `${base}/privacy/`, { width: 1440, height: 800 });
    if (!(await legal.locator('header nav a[href="/#work"]').count())) throw new Error("/privacy/: no nav link to /#work");
    const order = await page.evaluate(() => {
      const ids = ["included", "work", "compare"].map((id) => document.getElementById(id));
      if (ids.some((el) => !el)) return "missing";
      const before = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
      return before(ids[0], ids[1]) && before(ids[1], ids[2]) ? "ok" : "wrong";
    });
    if (order !== "ok") throw new Error(`home: #included < #work < #compare DOM order is ${order}`);
    // Mobile menu (narrow viewport) lists the section as an anchor to #work.
    const { page: m } = await openPage(browser, `${base}/`, { width: 390, height: 844 });
    await m.getByRole("button", { name: "Open menu" }).click();
    const menuLink = m.locator('#mobile-menu a[href="#work"]');
    await menuLink.waitFor({ state: "visible", timeout: 3000 });
    if ((await menuLink.innerText()).trim().split("\n")[0] !== "Our work") throw new Error("mobile menu: #work link label is not \"Our work\"");
    // Clicking the tab scrolls to the section and the scroll spy settles on it.
    await page.locator('[data-tab="work"]').click();
    await page.waitForFunction(() => document.querySelector('[data-tab="work"]')?.getAttribute("aria-current") === "location", null, { timeout: 4000 });
    await page.waitForTimeout(1600);
    const cur = await page.locator('[data-tab][aria-current="location"]').getAttribute("data-tab");
    if (cur !== "work") throw new Error(`scroll spy: after picking work the current tab is ${cur}`);
    // Laptop width (rail under the capsule): keyboard focus in Compare lands below the rail
    // (WCAG 2.4.11). (a) Tab forward into the section; (b) a control already on screen but
    // parked under the rail gets nudged clear when it takes keyboard focus.
    const { page: lap } = await openPage(browser, `${base}/`, { width: 1100, height: 800 });
    const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
    const settle = () =>
      lap.evaluate(async () => {
        let last = -1;
        for (let i = 0; i < 20 && scrollY !== last; i++) {
          last = scrollY;
          await new Promise((r) => setTimeout(r, 150));
        }
      });
    const focusState = () =>
      lap.evaluate(() => {
        const el = document.activeElement;
        const box = el.getBoundingClientRect();
        const rail = document.querySelector("[data-nav-rail]").getBoundingClientRect().bottom;
        return { inDash: !!el.closest("#compare"), top: box.top, rail, label: (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 30) };
      });
    await lap.evaluate((sel) => {
      const all = [...document.querySelectorAll(sel)];
      // Start from the nearest control before the section that actually takes focus.
      for (let i = all.findIndex((el) => el.closest("#compare")) - 1; i >= 0; i--) {
        all[i].focus();
        if (document.activeElement === all[i]) break;
      }
    }, FOCUSABLE);
    await settle();
    let tabbed = 0;
    for (let n = 0; n < 6; n++) {
      await lap.keyboard.press("Tab");
      await settle();
      const r = await focusState();
      if (!r.inDash) break;
      tabbed++;
      if (r.top < r.rail) throw new Error(`1100px: Tab ${n + 1}: "${r.label}" top ${Math.round(r.top)} is under the nav rail (bottom ${Math.round(r.rail)})`);
    }
    if (tabbed < 1) throw new Error(`1100px: no Compare control reached by Tab`);
    await lap.evaluate((sel) => {
      const all = [...document.querySelectorAll(sel)];
      const i = all.findIndex((el) => el.closest("#compare"));
      window.scrollBy({ top: all[i].getBoundingClientRect().top - 60, behavior: "instant" });
      for (let j = i - 1; j >= 0; j--) {
        all[j].focus({ preventScroll: true });
        if (document.activeElement === all[j]) break;
      }
    }, FOCUSABLE);
    await lap.waitForTimeout(300);
    await lap.keyboard.press("Tab");
    await settle();
    const parked = await focusState();
    if (!parked.inDash) throw new Error(`1100px: parked Tab landed outside Compare ("${parked.label}")`);
    if (parked.top < parked.rail) throw new Error(`1100px: parked "${parked.label}" top ${Math.round(parked.top)} is under the nav rail (bottom ${Math.round(parked.rail)})`);
    // Dialogs opened from the keyboard never move the page behind them (1100px, rail under the capsule).
    const keepsScroll = async (what, opener) => {
      const { page: dp } = await openPage(browser, `${base}/`, { width: 1100, height: 800 });
      // Late layout (lazy chapters, media) can still shift scrollY after a jump: wait until it has
      // held still for ~1 s before taking the baseline.
      const settleDp = () =>
        dp.evaluate(async () => {
          let last = scrollY;
          let still = 0;
          for (let i = 0; i < 60 && still < 7; i++) {
            await new Promise((r) => setTimeout(r, 150));
            still = scrollY === last ? still + 1 : 0;
            last = scrollY;
          }
        });
      const trigger = await opener(dp);
      await trigger.focus();
      await settleDp();
      const before = await dp.evaluate(() => scrollY);
      await dp.keyboard.press("Enter");
      const dialog = dp.locator('[role="dialog"][aria-modal="true"]');
      await dialog.first().waitFor({ state: "visible", timeout: 5000 });
      await dp.waitForTimeout(700);
      for (let n = 0; n < 10; n++) {
        await dp.keyboard.press("Tab");
        await dp.waitForTimeout(120);
      }
      await dp.keyboard.press("Escape");
      await dialog.first().waitFor({ state: "detached", timeout: 5000 }).catch(() => {});
      await dp.waitForTimeout(800);
      await settleDp();
      const after = await dp.evaluate(() => scrollY);
      if (Math.abs(after - before) > 1) throw new Error(`1100px ${what}: page scrolled behind the dialog (${before} -> ${after})`);
      if (await dialog.count()) throw new Error(`1100px ${what}: dialog still open after Esc`);
    };
    await keepsScroll("mockup modal", async (dp) => {
      await dp.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight / 2, behavior: "instant" }));
      await dp.waitForTimeout(500);
      return dp.locator('header a[aria-haspopup="dialog"], header button[aria-haspopup="dialog"]').first();
    });
    await keepsScroll("gallery preview", async (dp) => dp.locator("[data-work-card]").nth(1));
    // Spanish.
    const { page: es } = await openPage(browser, `${base}/es/`);
    const label = (await es.locator('[data-tab="work"]').innerText()).trim();
    if (label !== "Nuestro trabajo") throw new Error(`es: work tab label is ${JSON.stringify(label)}`);
    const srcs = await es.evaluate(() =>
      [...document.querySelectorAll("#work img")].map((i) => i.getAttribute("src") || "").filter((s) => s.includes("/media/work/")),
    );
    if (!srcs.length) throw new Error("es: no gallery images under #work");
    const wrong = srcs.filter((s) => /shot-/.test(s) && !/shot-es-v1/.test(decodeURIComponent(s)));
    if (wrong.length) throw new Error(`es: gallery shots not Spanish: ${wrong.slice(0, 3).join(", ")}`);
    if (!srcs.some((s) => /shot-es-v1/.test(decodeURIComponent(s)))) throw new Error(`es: no shot-es-v1 image in #work (${srcs.slice(0, 3).join(", ")})`);
    assertNoErrors(errors);
  },
  "sitemap-clean": async ({ base }) => {
    const r = await fetch(`${base}/sitemap.xml`);
    if (r.status !== 200) throw new Error(`/sitemap.xml returned ${r.status}`);
    const xml = await r.text();
    if (!xml.includes("<urlset")) throw new Error("/sitemap.xml is not a urlset");
    if (xml.includes("/work/")) throw new Error("/sitemap.xml lists a /work/ URL");
  },
  // The whole home page, scrolled through so reveal-on-scroll content is visible, in both schemes,
  // with no axe rule disabled (home-smoke never scrolls).
  "home-axe-full": async ({ browser, base }) => {
    for (const lang of ["", "es/"]) {
      for (const colorScheme of ["light", "dark"]) {
        const where = `/${lang} ${colorScheme}`;
        const { page } = await openPage(browser, `${base}/${lang}`, { width: 1280, height: 800, colorScheme });
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y <= total; y += 400) {
          await page.evaluate((v) => window.scrollTo(0, v), y);
          await page.waitForTimeout(120);
        }
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await page.waitForTimeout(1200);
        try {
          await runAxe(page);
        } catch (e) {
          throw new Error(`${where}: ${e.message}`);
        }
      }
    }
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
    const dialog = page.getByRole("dialog", { name: "Brightline Home", exact: true });
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

    // Closing with the mouse over the card's slot: no tilt and no glide may start during the shrink.
    await page.waitForTimeout(800);
    const slot = await second.locator("[data-work-viewport]").boundingBox();
    await second.click();
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(700);
    await page.mouse.move(slot.x + slot.width * 0.8, slot.y + slot.height * 0.2);
    await page.evaluate(() => {
      window.__settle = [];
      const card = document.querySelector('[data-work-card="salon"]');
      const tilt = card.querySelector("[data-work-tilt]");
      const shot = card.querySelector("[data-work-shot]");
      const t0 = performance.now();
      const tick = () => {
        window.__settle.push({ t: performance.now() - t0, tilt: getComputedStyle(tilt).transform, y: new DOMMatrix(getComputedStyle(shot).transform).m42 });
        if (performance.now() - t0 < 330) requestAnimationFrame(tick);
      };
      document.addEventListener("keydown", () => requestAnimationFrame(tick), { once: true, capture: true });
    });
    await page.keyboard.press("Escape");
    for (let i = 0; i < 8; i++) {
      await page.mouse.move(slot.x + slot.width * (0.2 + (i % 4) * 0.2), slot.y + slot.height * (0.25 + (i % 2) * 0.5), { steps: 2 });
    }
    await page.waitForTimeout(400);
    const settle = await page.evaluate(() => window.__settle);
    if (settle.length < 2) throw new Error(`settle: only ${settle.length} samples`);
    const tilted = settle.filter((s) => s.tilt !== "none" && !/^matrix\(1, 0, 0, 1, 0, 0\)$/.test(s.tilt));
    if (tilted.length) throw new Error(`settle: card tilted during the shrink (${tilted[0].tilt} at ${Math.round(tilted[0].t)} ms)`);
    const moved = settle.filter((s) => Math.abs(s.y - settle[0].y) > 1);
    if (moved.length) throw new Error(`settle: card image moved during the shrink (${settle[0].y} -> ${moved[0].y} at ${Math.round(moved[0].t)} ms)`);
    assertNoErrors(errors);

    // "Visit the full demo" from the desktop preview opens the demo at its top.
    {
      const v = await openGallery(browser, base);
      await v.page.waitForTimeout(800);
      if (!((await v.page.evaluate(() => scrollY)) > 400)) throw new Error("desktop visit: gallery too close to the top to tell");
      await v.cards.nth(1).click();
      const d = v.page.getByRole("dialog", { name: "Brightline Home", exact: true });
      await d.waitFor({ state: "visible", timeout: 5000 });
      await v.page.waitForTimeout(700);
      await d.getByRole("link", { name: "Visit the full demo" }).click();
      await v.page.waitForURL(/\/work\/service\/?$/, { timeout: 10000 });
      await v.page.locator("[data-demo] h1").waitFor({ state: "visible", timeout: 10000 });
      await v.page.waitForTimeout(800);
      const y = await v.page.evaluate(() => scrollY);
      if (y !== 0) throw new Error(`desktop visit: demo opened at scrollY ${y}, expected 0`);
      assertNoErrors(v.errors);
    }

    for (const colorScheme of ["light", "dark"]) {
      const g = await openGallery(browser, base, { colorScheme });
      await g.cards.nth(1).click();
      await g.page.getByRole("dialog", { name: "Brightline Home", exact: true }).waitFor({ state: "visible", timeout: 5000 });
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
    const dialog = page.getByRole("dialog", { name: "Trueframe Builders", exact: true });
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "hidden", timeout: 5000 });
    assertNoErrors(errors);

    for (const colorScheme of ["light", "dark"]) {
      const g = await openGallery(browser, base, { reducedMotion: true, colorScheme });
      await g.cards.nth(0).click();
      await g.page.getByRole("dialog", { name: "Trueframe Builders", exact: true }).waitFor({ state: "visible", timeout: 5000 });
      await g.page.waitForTimeout(500);
      try {
        await runAxe(g.page, { include: ["#work", '[role="dialog"]'] });
      } catch (e) {
        throw new Error(`reduced ${colorScheme}, preview open: ${e.message}`);
      }
    }
  },
  // ---- "Our work" gallery on phones (Task 13) ----
  "gallery-phone": async ({ browser, base }) => {
    const { page, errors, cards, row } = await openPhoneGallery(browser, base);
    const m = await row.evaluate((el) => ({
      h: el.getBoundingClientRect().height,
      w: window.innerWidth,
      tops: [...el.querySelectorAll("[data-work-card]")].map((c) => Math.round(c.getBoundingClientRect().top)),
    }));
    if (!(m.h <= 1.4 * m.w)) throw new Error(`row height ${m.h} > 1.4 × innerWidth (${m.w})`);
    if (new Set(m.tops).size !== 1) throw new Error(`cards are not on one row: tops ${m.tops.join(", ")}`);
    const dots = page.locator("#work [data-work-dot]");
    if ((await dots.count()) !== 6) throw new Error(`expected 6 dots, found ${await dots.count()}`);
    if ((await dots.nth(0).getAttribute("aria-current")) !== "true") throw new Error("first dot is not aria-current on load");
    const lit = await page.locator('#work [data-work-dot][aria-current="true"]').count();
    if (lit !== 1) throw new Error(`${lit} dots are aria-current on load, expected 1`);
    const early = await page.evaluate(() => performance.getEntriesByType("resource").filter((r) => r.name.includes("-mobile-")).map((r) => r.name));
    if (early.length) throw new Error(`phone shots requested before any preview opened: ${early.join(", ")}`);
    if ((await dots.nth(0).getAttribute("aria-label")) !== "Show Trueframe Builders") throw new Error(`dot label is ${await dots.nth(0).getAttribute("aria-label")}`);
    const dotBox = await dots.nth(0).boundingBox();
    if (dotBox.width < 24 || dotBox.height < 24) throw new Error(`dot hit area ${dotBox.width}×${dotBox.height} < 24×24`);

    // The active card auto-scrolls while the section is on screen.
    await page.waitForTimeout(3000);
    const yAuto = await shotY(cards.nth(0));
    if (!(yAuto < -1)) throw new Error(`auto: active card translateY is ${yAuto}, expected negative`);
    if (Math.abs(await shotY(cards.nth(1))) > 0.5) throw new Error("auto: an inactive card is scrolling");

    // Horizontal swipe: never opens, moves the active card to the second one.
    const rb = await row.boundingBox();
    const sy = rb.y + Math.min(rb.height / 2, 120);
    await touchDrag(page, { x: rb.x + rb.width * 0.8, y: sy }, { x: rb.x + rb.width * 0.8 - 250, y: sy });
    await page.waitForTimeout(900);
    if (await page.getByRole("dialog").count()) throw new Error("swipe opened the preview");
    if ((await dots.nth(1).getAttribute("aria-current")) !== "true") throw new Error("after swipe the second dot is not aria-current");
    await page.waitForTimeout(1200);
    if (Math.abs(await shotY(cards.nth(0))) > 1) throw new Error(`swiped-away card did not rest: ${await shotY(cards.nth(0))}`);

    // Vertical drag over the row still scrolls the page.
    const before = await page.evaluate(() => window.scrollY);
    await touchDrag(page, { x: rb.x + rb.width / 2, y: sy + 60 }, { x: rb.x + rb.width / 2, y: sy - 140 });
    await page.waitForTimeout(600);
    const after = await page.evaluate(() => window.scrollY);
    if (!(after > before + 40)) throw new Error(`vertical drag over the row did not scroll the page (${before} -> ${after})`);
    if (await page.getByRole("dialog").count()) throw new Error("vertical drag opened the preview");
    await row.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(400);

    // Tap the centred card: full-screen preview with the CTA on screen.
    const second = cards.nth(1);
    const cb = await second.locator("[data-work-viewport]").boundingBox();
    const yBeforeOpen = await page.evaluate(() => window.scrollY);
    await page.touchscreen.tap(cb.x + cb.width / 2, cb.y + cb.height / 2);
    const dialog = page.getByRole("dialog", { name: "Brightline Home", exact: true });
    await dialog.waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(700);
    const full = await dialog.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, vw: window.innerWidth, vh: window.innerHeight, lock: getComputedStyle(document.body).overflow, pin: getComputedStyle(document.body).position };
    });
    if (Math.abs(full.x) > 1 || Math.abs(full.y) > 1 || Math.abs(full.w - full.vw) > 1 || Math.abs(full.h - full.vh) > 1)
      throw new Error(`preview is not full-screen: ${JSON.stringify(full)}`);
    if (full.lock !== "hidden") throw new Error(`body scroll not locked (overflow ${full.lock})`);
    if (full.pin !== "fixed") throw new Error(`body not pinned for iOS (position ${full.pin})`);
    const shotInfo = await dialog.locator('[role="region"] img').evaluate(async (img) => {
      await img.decode().catch(() => null);
      return { src: img.currentSrc || img.src, nw: img.naturalWidth, w: img.getBoundingClientRect().width, vw: window.innerWidth };
    });
    if (!/shot-en-mobile-v1\.jpg$/.test(shotInfo.src)) throw new Error(`phone preview shows ${shotInfo.src}, expected the mobile shot`);
    if (shotInfo.nw !== 780 || Math.abs(shotInfo.w - shotInfo.vw) > 1) throw new Error(`phone shot ${shotInfo.nw}px natural, ${shotInfo.w}px shown (viewport ${shotInfo.vw})`);
    const visit = dialog.getByRole("link", { name: "Visit the full demo" });
    const vb = await visit.boundingBox();
    if (!vb || vb.y < 0 || vb.y + vb.height > full.vh) throw new Error(`"Visit the full demo" is not on screen: ${JSON.stringify(vb)}`);
    await dialog.getByRole("button", { name: "Close preview" }).click();
    await dialog.waitFor({ state: "hidden", timeout: 5000 });
    const yAfterClose = await page.evaluate(() => window.scrollY);
    if (Math.abs(yAfterClose - yBeforeOpen) > 1) throw new Error(`page scroll not restored after close (${yBeforeOpen} -> ${yAfterClose})`);
    if (await page.evaluate(() => getComputedStyle(document.body).position) !== "static") throw new Error("body still pinned after close");

    // Dots scroll their card to the centre.
    await dots.nth(3).click();
    await page.waitForTimeout(1200);
    if ((await dots.nth(3).getAttribute("aria-current")) !== "true") throw new Error("tapping dot 4 did not make it current");
    const centred = await cards.nth(3).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return Math.abs(r.left + r.width / 2 - window.innerWidth / 2);
    });
    if (centred > 2) throw new Error(`dot 4: card is ${centred}px off centre`);

    // Keyboard still opens the focused card.
    await cards.nth(3).focus();
    await page.keyboard.press("Enter");
    const kd = page.getByRole("dialog", { name: "Ironside Barber Co.", exact: true });
    await kd.waitFor({ state: "visible", timeout: 5000 });
    await page.keyboard.press("Escape");
    await kd.waitFor({ state: "hidden", timeout: 5000 });

    // Leaving the section stops the loop and rests the card.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1200);
    if (Math.abs(await shotY(cards.nth(3))) > 1) throw new Error(`off screen: active card translateY ${await shotY(cards.nth(3))}`);
    assertNoErrors(errors);

    await phoneVisitLandsAtTop(browser, base, { reducedMotion: false });
    await phoneVisitLandsAtTop(browser, base, { reducedMotion: true });

    for (const width of [360, 390, 430]) {
      const g = await openPhoneGallery(browser, base, { width, height: 800 });
      const o = await g.page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
      if (o.sw > o.iw) throw new Error(`${width}px: page overflows horizontally (scrollWidth ${o.sw} > ${o.iw})`);
    }
    for (const colorScheme of ["light", "dark"]) {
      const g = await openPhoneGallery(browser, base, { colorScheme });
      try {
        await runAxe(g.page, { include: ["#work"] });
      } catch (e) {
        throw new Error(`phone ${colorScheme}: ${e.message}`);
      }
      const c = await g.cards.nth(0).locator("[data-work-viewport]").boundingBox();
      await g.page.touchscreen.tap(c.x + c.width / 2, c.y + c.height / 2);
      await g.page.getByRole("dialog", { name: "Trueframe Builders", exact: true }).waitFor({ state: "visible", timeout: 5000 });
      await g.page.waitForTimeout(900);
      try {
        await runAxe(g.page, { include: ["#work", '[role="dialog"]'] });
      } catch (e) {
        throw new Error(`phone ${colorScheme}, preview open: ${e.message}`);
      }
    }
  },
  "gallery-phone-paused": async ({ browser, base }) => {
    const { page, errors, cards } = await openPhoneGallery(browser, base);
    await page.waitForTimeout(3000);
    if (!(await shotY(cards.nth(0)) < -1)) throw new Error("auto-scroll was not running before Pause");
    const pause = page.getByRole("button", { name: "Pause animations", exact: true });
    await pause.click();
    const yNow = await shotY(cards.nth(0));
    if (Math.abs(yNow) > 0.5) throw new Error(`Pause: translateY ${yNow} right after pausing, expected 0`);
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    const y = await shotY(cards.nth(0));
    if (Math.abs(y) > 0.5) throw new Error(`paused: active card translateY is ${y} after 3 s, expected 0`);
    await page.getByRole("button", { name: "Play animations", exact: true }).click();
    await page.locator("[data-work-row]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3000);
    if (!(await shotY(cards.nth(0)) < -1)) throw new Error("auto-scroll did not resume after unpausing");
    assertNoErrors(errors);
  },
  "demo:barbershop": ({ browser, base }) => demoCheck(browser, base, "barbershop"),
  "demo:beauty": ({ browser, base }) => demoCheck(browser, base, "beauty", { restCheck: beautyWindowsOpen }),
  "demo:restaurant": async ({ browser, base }) => {
    await demoCheck(browser, base, "restaurant", { restCheck: restaurantMenuPlated });
    await restaurantMenuPlatesLive(browser, base);
    await restaurantAnchorLands(browser, base);
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
    // Next renders the credit's href without the trailing slash; either form is the Spanish home page.
    const creditHrefs = () => page.locator("[data-demo] footer a").evaluateAll((as) => as.map((a) => a.getAttribute("href")).filter((h) => /^\/(es\/?)?$/.test(h)));
    const credit = await creditHrefs();
    if (credit.length !== 1 || !/^\/es\/?$/.test(credit[0])) throw new Error(`es: footer credit links to ${JSON.stringify(credit)}, expected the Spanish home page`);
    await ribbon.locator('button[data-lang="en"]').click();
    await page.waitForFunction(() => location.search.includes("lang=en"), null, { timeout: 5000 });
    await page.getByRole("region", { name: "Demo site by Serma" }).waitFor({ state: "visible", timeout: 5000 });
    const creditEn = await creditHrefs();
    if (creditEn.length !== 1 || creditEn[0] !== "/") throw new Error(`en: footer credit links to ${JSON.stringify(creditEn)}, expected ["/"]`);
    // Dismissing the ribbon moves focus to <main> without scrolling the page.
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(200);
    const yDismiss = await page.evaluate(() => scrollY);
    await page.getByRole("region", { name: "Demo site by Serma" }).getByRole("button", { name: /dismiss|close|hide/i }).click();
    await page.waitForTimeout(300);
    if (!(await page.evaluate(() => document.activeElement?.id === "main"))) throw new Error("ribbon dismiss: focus is not on <main>");
    const yAfterDismiss = await page.evaluate(() => scrollY);
    if (Math.abs(yAfterDismiss - yDismiss) > 1) throw new Error(`ribbon dismiss scrolled the page (${yDismiss} -> ${yAfterDismiss})`);
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
