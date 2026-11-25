// Captures full-page gallery screenshots of every demo.
//   npm run capture:work [-- --version v2] [-- --overwrite] [-- --only desktop|mobile]   (or SHOT_VERSION=v2)
// Two sets per demo and locale:
//   desktop: 1280×800 viewport, DPR 1 -> shot-<locale>-<v>.jpg (+ a 640 px copy, the gallery cards)
//   mobile:  390×844 viewport, DPR 2  -> shot-<locale>-mobile-<v>.jpg (780 px wide, the phone preview)
// The overwrite guard is per set: `--only mobile` adds the mobile files while the desktop ones exist.
// Requires a prior `npm run build`, plus python3 with Pillow (JPEG encoding and the 640 px copies).
// Shots over 16 MP are stored proportionally narrower (iOS decodes larger images subsampled);
// the printed heights are always at the nominal width (1280 desktop / 780 mobile).
// Starts `next start` on PORT and always kills it.
//
// VERSIONING: /media is served immutable for a year. NEVER overwrite a deployed
// version. To change the images, bump the version (--version v2) and update the
// shot paths in src/data/demos/index.ts to the same version. --overwrite is only
// for versions that have not been deployed yet.
import { createRequire } from "node:module";
import { spawn, execFileSync } from "node:child_process";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3124;
const BASE = `http://localhost:${PORT}`;
const IDS = ["barbershop", "salon", "beauty", "restaurant", "contractor", "service"];
const LOCALES = ["en", "es"];
// Salon's signature is scroll-linked: data-state is "live" at the top of the page by design.
const EXPECT_LIVE = new Set(["salon"]);
const argv = process.argv.slice(2);
const OVERWRITE = argv.includes("--overwrite");
const oi = argv.indexOf("--only");
const ONLY = oi >= 0 ? argv[oi + 1] : null;
if (ONLY && ONLY !== "desktop" && ONLY !== "mobile") {
  console.error(`invalid --only "${ONLY}" (expected desktop or mobile)`);
  process.exit(1);
}
const SETS = ONLY ? [ONLY] : ["desktop", "mobile"];
const vi = argv.indexOf("--version");
const VERSION = (vi >= 0 ? argv[vi + 1] : process.env.SHOT_VERSION) || "v1";
if (!/^v\d+$/.test(VERSION)) {
  console.error(`invalid version "${VERSION}" (expected e.g. v2)`);
  process.exit(1);
}
/** Output files of one capture set for one demo + locale. */
const filesFor = (set, l) =>
  set === "mobile" ? [`shot-${l}-mobile-${VERSION}.jpg`] : [`shot-${l}-${VERSION}.jpg`, `shot-${l}-${VERSION}-640.jpg`];
const targets = SETS.flatMap((set) =>
  IDS.flatMap((id) => LOCALES.flatMap((l) => filesFor(set, l).map((f) => path.join(ROOT, "public/media/work", id, f)))));
const existing = targets.filter((f) => fs.existsSync(f));
if (existing.length && !OVERWRITE) {
  console.error(
    `Refusing to run: ${existing.length} target file(s) for ${VERSION} already exist (e.g. ${path.relative(ROOT, existing[0])}).\n` +
      `/media is served immutable; never overwrite a deployed version. Use --version v<next> and update src/data/demos/index.ts,\n` +
      `or pass --overwrite only if ${VERSION} has NOT been deployed yet. (--only desktop|mobile limits the run, and this check, to one set.)`);
  process.exit(1);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function portOpen() {
  return new Promise((resolve) => {
    const s = net.connect(PORT, "127.0.0.1");
    s.on("connect", () => (s.destroy(), resolve(true)));
    s.on("error", () => resolve(false));
  });
}

let server = null;
function stop() {
  if (server && !server.killed) {
    try { process.kill(-server.pid, "SIGTERM"); } catch { try { server.kill("SIGTERM"); } catch {} }
  }
}
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { stop(); process.exit(1); });
process.on("exit", stop);

async function startServer() {
  if (await portOpen()) throw new Error(`port ${PORT} already in use`);
  server = spawn("npx", ["next", "start", "-p", String(PORT)], { cwd: ROOT, stdio: "ignore", detached: true });
  for (let i = 0; i < 120; i++) {
    if (await portOpen()) return;
    await sleep(500);
  }
  throw new Error("server did not start");
}

function resize(src, dst) {
  execFileSync("python3", ["-c",
    "import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1]).convert('RGB')\nw=640\nh=round(im.height*w/im.width)\nim.resize((w,h),Image.LANCZOS).save(sys.argv[2],'JPEG',quality=78,optimize=True)",
    src, dst]);
}

/** Largest image a phone preview may decode at full resolution (iOS subsamples beyond ~16.7 MP). */
const MAX_PIXELS = 16_000_000;

/** python: <png> <jpg> <maxPixels> <q0> <qMin> <budget> -> "q bytes width height shrunk" */
const ENCODE = [
  "import io, sys",
  "from PIL import Image",
  "src, dst, maxpx, q, qmin, budget = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6])",
  "im = Image.open(src).convert('RGB')",
  "shrunk = 0",
  "if im.width * im.height > maxpx:",
  "    s = (maxpx / (im.width * im.height)) ** 0.5",
  "    im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)",
  "    shrunk = 1",
  "while True:",
  "    buf = io.BytesIO()",
  "    im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)",
  "    if buf.tell() <= budget or q <= qmin: break",
  "    q -= 4",
  "open(dst, 'wb').write(buf.getvalue())",
  "print(q, buf.tell(), im.width, im.height, shrunk)",
].join("\n");

/** Per set: viewport, pixel ratio, JPEG quality ladder and size budget. */
const SET_OPTS = {
  desktop: { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, q0: 80, qMin: 68, budget: 900 * 1024 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, q0: 78, qMin: 50, budget: 1.2 * 1024 * 1024 },
};

async function capture(browser, id, locale, set) {
  const o = SET_OPTS[set];
  const context = await browser.newContext({
    viewport: o.viewport, deviceScaleFactor: o.deviceScaleFactor, isMobile: o.isMobile, hasTouch: o.hasTouch,
    colorScheme: "light", reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  try {
    await page.goto(`${BASE}/work/${id}/?capture=1&lang=${locale}`, { waitUntil: "networkidle" });
    await page.waitForFunction(
      (l) => document.querySelector('[data-demo][data-capture="true"]') && !document.querySelector('[data-demo-ribbon]') && document.documentElement.lang === l,
      locale, { timeout: 15000 });
    // No scrollbar (or its reserved gutter) in the shot: the gallery shows the page edge to edge.
    await page.addStyleTag({
      content: "html,body{scrollbar-width:none!important;scrollbar-gutter:auto!important}::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}",
    });
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y <= height + 400; y += 400) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await sleep(150);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await sleep(300);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0), null, { timeout: 15000 });
    if (EXPECT_LIVE.has(id)) {
      console.log(`NOTE ${id}/${locale}: expected case, scroll-linked signature is "live" at the top of the page; not waiting for "rest"`);
    } else {
      await page.waitForSelector('[data-signature][data-state="rest"]', { state: "attached", timeout: 8000 });
    }
    await sleep(1500);
    const dir = path.join(ROOT, "public/media/work", id);
    fs.mkdirSync(dir, { recursive: true });
    const [name, smallName] = filesFor(set, locale);
    const full = path.join(dir, name);
    // Lossless capture first, then one JPEG encode: shrink (proportionally) anything over
    // MAX_PIXELS, then step the quality down until the file fits the budget.
    const png = `${full}.tmp.png`;
    await page.screenshot({ path: png, fullPage: true, type: "png" });
    const out = execFileSync("python3", ["-c", ENCODE, png, full, String(MAX_PIXELS), String(o.q0), String(o.qMin), String(Math.round(o.budget))]).toString().trim();
    fs.rmSync(png, { force: true });
    const [q, size, w, h, shrunk] = out.split(" ").map(Number);
    if (shrunk) console.log(`NOTE ${id}/${locale}/${set}: over ${MAX_PIXELS / 1e6} MP, stored at ${w} px wide (iOS decodes larger images subsampled)`);
    if (q !== o.q0) console.log(`NOTE ${id}/${locale}/${set}: quality lowered to ${q} (${Math.round(size / 1024)} KB)`);
    if (size > o.budget) console.log(`WARN ${id}/${locale}/${set}: ${Math.round(size / 1024)} KB is over budget at the minimum quality`);
    if (smallName) resize(full, path.join(dir, smallName));
    console.log(`ok ${id} ${locale} ${set} q${q} ${Math.round(size / 1024)}KB ${w} ${h}`);
    // Heights are recorded at the set's nominal width (1280 / 780), which is what the
    // width/height attributes in src/data/demos/index.ts describe (they only set the aspect ratio).
    const nominal = o.viewport.width * o.deviceScaleFactor;
    ((HEIGHTS[set] ??= {})[id] ??= {})[locale] = Math.round((h * nominal) / w);
  } finally {
    await context.close();
  }
}

/** Captured pixel heights, printed at the end as literals for SHOT_HEIGHT / MOBILE_HEIGHT in src/data/demos/index.ts. */
const HEIGHTS = {};
function printHeights() {
  const names = { desktop: "SHOT_HEIGHT", mobile: "MOBILE_HEIGHT" };
  for (const set of Object.keys(HEIGHTS)) {
    console.log(`\n${names[set]} (paste into src/data/demos/index.ts):`);
    for (const [id, h] of Object.entries(HEIGHTS[set])) {
      console.log(`  ${id}: { ${Object.entries(h).map(([l, v]) => `${l}: ${v}`).join(", ")} },`);
    }
  }
}

let browser;
try {
  await startServer();
  browser = await chromium.launch();
  for (const set of SETS) for (const id of IDS) for (const locale of LOCALES) await capture(browser, id, locale, set);
  printHeights();
  console.log(`Done. Reminder: src/data/demos/index.ts shot paths must reference ${VERSION}.`);
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  stop();
}
