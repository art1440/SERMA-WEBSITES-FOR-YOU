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

/**
 * opts: { width=1280, height=800, reducedMotion=false, device }
 * `device` is a Playwright device descriptor (e.g. devices["iPhone 13"]);
 * it is spread into newContext, then width/height (if given explicitly) override the viewport.
 */
async function openPage(browser, url, opts = {}) {
  const { width, height, reducedMotion = false, device } = opts;
  const ctxOpts = { ...(device || {}) };
  if (width || height || !device) {
    ctxOpts.viewport = { width: width ?? 1280, height: height ?? 800 };
  }
  ctxOpts.reducedMotion = reducedMotion ? "reduce" : "no-preference";
  const context = await browser.newContext(ctxOpts);
  const page = await context.newPage();
  const errors = [];
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

const CHECKS = {
  "home-smoke": async ({ browser, base }) => {
    const { page, errors } = await openPage(browser, `${base}/`);
    assertNoErrors(errors);
    await runAxe(page);
    await page.context().close();
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
      try {
        await CHECKS[name]({ browser, base: BASE });
        console.log(`PASS ${name}`);
      } catch (e) {
        failed = true;
        console.log(`FAIL ${name}: ${e.message}`);
      }
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
