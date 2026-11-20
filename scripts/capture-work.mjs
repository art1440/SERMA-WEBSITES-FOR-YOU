// Captures full-page gallery screenshots of every demo.
//   npm run capture:work [-- --version v2] [-- --overwrite]   (or SHOT_VERSION=v2)
// Requires a prior `npm run build`, plus python3 with Pillow (for the 640 px copies).
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
const vi = argv.indexOf("--version");
const VERSION = (vi >= 0 ? argv[vi + 1] : process.env.SHOT_VERSION) || "v1";
if (!/^v\d+$/.test(VERSION)) {
  console.error(`invalid version "${VERSION}" (expected e.g. v2)`);
  process.exit(1);
}
const targets = IDS.flatMap((id) =>
  LOCALES.flatMap((l) => [`shot-${l}-${VERSION}.jpg`, `shot-${l}-${VERSION}-640.jpg`].map((f) => path.join(ROOT, "public/media/work", id, f))));
const existing = targets.filter((f) => fs.existsSync(f));
if (existing.length && !OVERWRITE) {
  console.error(
    `Refusing to run: ${existing.length} target file(s) for ${VERSION} already exist (e.g. ${path.relative(ROOT, existing[0])}).\n` +
      `/media is served immutable; never overwrite a deployed version. Use --version v<next> and update src/data/demos/index.ts,\n` +
      `or pass --overwrite only if ${VERSION} has NOT been deployed yet.`);
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

async function capture(browser, id, locale) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1,
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
    const full = path.join(dir, `shot-${locale}-${VERSION}.jpg`);
    let q = 80, size;
    for (;;) {
      await page.screenshot({ path: full, fullPage: true, type: "jpeg", quality: q });
      size = fs.statSync(full).size;
      if (size <= 900 * 1024 || q <= 68) break;
      q -= 4;
    }
    if (q !== 80) console.log(`NOTE ${id}/${locale}: quality lowered to ${q} (${Math.round(size / 1024)} KB)`);
    resize(full, path.join(dir, `shot-${locale}-${VERSION}-640.jpg`));
    console.log(`ok ${id} ${locale} q${q} ${Math.round(size / 1024)}KB`);
  } finally {
    await context.close();
  }
}

let browser;
try {
  await startServer();
  browser = await chromium.launch();
  for (const id of IDS) for (const locale of LOCALES) await capture(browser, id, locale);
  console.log(`Done. Reminder: src/data/demos/index.ts shot paths must reference ${VERSION}.`);
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  stop();
}
