/**
 * Quick QA pass against a running preview server (npm run build && npm run preview).
 *   node scripts/qa.mjs [baseUrl] [outDir]
 * Checks: horizontal overflow at 360/390/768/1280/1440, small tap targets, axe-core (WCAG 2.2 AA),
 * console errors, and the key flows (form validation, demo booking, dialogs). Saves screenshots.
 */

import { readFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.argv[2] ?? 'http://127.0.0.1:4321';
const out = process.argv[3] ?? 'reports/qa';
mkdirSync(out, { recursive: true });

const pages = ['/', '/styleguide', '/404'];
const widths = [360, 390, 768, 1280, 1440];
const problems = [];
const note = (msg) => { problems.push(msg); console.log('  ✗', msg); };

const browser = await chromium.launch();

// 1) Layout: overflow + tap targets at every width
for (const path of pages) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) note(`${path} @${width}: horizontal overflow ${overflow}px`);
    const small = await page.evaluate(() => {
      const els = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, summary, [role=tab]')];
      return els.filter((el) => {
        if (el.closest('[aria-hidden="true"], dialog:not([open]), .hp, [hidden]')) return false;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') return false;
        // Radio/checkbox inputs are covered by their styled label.
        if (el.matches('input[type=radio], input[type=checkbox]')) return false;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return false;
        // Inline text links inside sentences are exempt (WCAG 2.5.8 inline exception).
        if (el.matches('p a, li > p a')) return false;
        return r.height < 44 && !(el.classList.contains('skip-link'));
      }).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} "${(el.textContent || '').trim().slice(0, 30)}" ${Math.round(el.getBoundingClientRect().height)}px`);
    });
    if (small.length) note(`${path} @${width}: targets under 44px: ${[...new Set(small)].slice(0, 8).join(' | ')}`);
    if (errors.length) note(`${path} @${width}: console errors: ${errors.join(' | ')}`);
    await page.close();
  }
}

// 2) Accessibility: axe on every page, desktop and phone, dialogs open too
async function axe(page, label) {
  await page.addScriptTag({ content: axeSource });
  const res = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } });
    return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(', ')}`);
  });
  res.forEach((v) => note(`axe ${label}: ${v}`));
}
for (const path of pages) {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await axe(page, `${path} @${width}`);
    await page.close();
  }
}

// 3) Flows on the homepage
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/home-390-top.png` });

  // Mobile menu opens, traps focus, closes on Escape
  await page.click('[data-open-menu]');
  if (!(await page.isVisible('#mobile-menu'))) note('mobile menu did not open');
  await axe(page, 'mobile menu open');
  await page.screenshot({ path: `${out}/menu-390.png` });
  await page.keyboard.press('Escape');
  if (await page.isVisible('#mobile-menu')) note('mobile menu did not close on Escape');

  // Hero button scrolls to the contact section? No: to What's included.
  await page.click('.hero .btn-primary');
  await page.waitForTimeout(900);
  const contactVisible = await page.evaluate(() => { const r = document.getElementById('included').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
  if (!contactVisible) note('primary button did not bring What\'s included into view');

  // Demo: book an appointment, then check the dashboard tab
  await page.locator('#demo').scrollIntoViewIfNeeded();
  await page.waitForSelector('[data-demo][data-ready]', { timeout: 5000 }).catch(() => note('demo did not initialize'));
  await page.click('label.choice:has(input[value=nails])');
  await page.click('[data-act=next]');
  if (!(await page.locator('.d-error').count())) note('demo: no error when continuing without a service');
  await page.click('.d-opt >> nth=0');
  await page.click('[data-act=next]');
  try {
    await page.click('.d-time:not(.is-off) >> nth=0', { timeout: 4000 });
  } catch {
    const dump = await page.evaluate(() => {
      const l = [...document.querySelectorAll('.d-time')].find((x) => !x.classList.contains('is-off'));
      const r = l.getBoundingClientRect();
      return { rect: [r.x, r.y, r.width, r.height].map(Math.round), stack: document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).slice(0, 5).map((e) => e.id || e.className || e.tagName), all: [...document.querySelectorAll('.d-time')].map((x) => Math.round(x.getBoundingClientRect().y)) };
    });
    note(`demo: time slot not clickable ${JSON.stringify(dump)}`);
    await page.screenshot({ path: `${out}/demo-time-fail.png` });
  }
  await page.screenshot({ path: `${out}/demo-time-390.png`, fullPage: false });
  await page.click('[data-act=next]');
  await page.click('[data-act=confirm]');
  await page.waitForSelector('.d-done');
  await page.locator('[data-demo-phone]').screenshot({ path: `${out}/demo-done-390.png` });
  await page.click('[data-act=to-dashboard]');
  if (!(await page.isVisible('#demo-panel-owner'))) note('demo: dashboard tab not shown after booking');
  const newRow = await page.locator('.d-list li.is-new').textContent();
  if (!newRow?.includes('Jordan')) note('demo: new booking missing from dashboard list');
  await axe(page, 'demo dashboard');
  await page.locator('[data-demo]').screenshot({ path: `${out}/demo-dash-390.png` });
  await page.close();
}

// 4) Full-page screenshots
for (const [w, h, name, mobile] of [[390, 844, 'home-390', true], [1440, 900, 'home-1440', false]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, reducedMotion: 'reduce' });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
  await page.close();
}
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${out}/home-1440-top.png` });
  await page.locator('#demo').scrollIntoViewIfNeeded();
  await page.waitForSelector('[data-demo][data-ready]');
  await page.click('.d-opt >> nth=3');
  await page.click('[data-act=next]');
  await page.click('.d-time:not(.is-off) >> nth=1');
  await page.click('[data-act=next]');
  await page.click('[data-act=confirm]');
  await page.waitForTimeout(900);
  await page.locator('[data-demo]').screenshot({ path: `${out}/demo-1440.png` });
  await page.close();
}

await browser.close();
console.log(problems.length ? `\n${problems.length} problem(s)` : '\nAll checks passed');
process.exitCode = problems.length ? 1 : 0;
