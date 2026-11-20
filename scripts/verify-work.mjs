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

/** Injects axe-core and throws if any violation is found. `opts.disableRules` is an array of rule ids. */
async function runAxe(page, opts = {}) {
  await page.addScriptTag({ path: path.join(ROOT, "node_modules/axe-core/axe.min.js") });
  const config = opts.disableRules?.length
    ? { rules: Object.fromEntries(opts.disableRules.map((id) => [id, { enabled: false }])) }
    : {};
  const results = await page.evaluate((c) => window.axe.run(document, c), config);
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

const CHECKS = {
  "home-smoke": async ({ browser, base }) => {
    const { page } = await openPage(browser, `${base}/`);
    await runAxe(page);
  },
  "demo:barbershop": ({ browser, base }) => demoCheck(browser, base, "barbershop"),
  "demo:salon": ({ browser, base }) => demoCheck(browser, base, "salon", { restCheck: salonAccentStaysPlum }),
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
