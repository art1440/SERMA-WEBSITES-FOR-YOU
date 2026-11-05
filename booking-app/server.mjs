/**
 * Booking prototype: one shop, a public booking page, and a live owner dashboard.
 * No dependencies: Node's built-in http, sqlite, and crypto.
 *
 *   OWNER_PIN=4821 node server.mjs            # http://localhost:3000 (booking) and /dashboard
 *   RESEND_API_KEY=... OWNER_EMAIL=... FROM_EMAIL=...   # optional: send real emails
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb } from './db.mjs';
import { shop } from './shop.mjs';
import { shopNow, toMin, toHHMM, weekday, addDays, isDate, isTime } from './time.mjs';

const ROOT = fileURLToPath(new URL('./public/', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

export function createApp({ dbFile = ':memory:', ownerPin = process.env.OWNER_PIN ?? '4821', now = () => new Date(), log = console, rateLimit = 8 } = {}) {
  const db = openDb(dbFile);
  const sessions = new Map(); // token -> expiry ms
  const streams = new Set(); // open dashboard connections
  const hits = new Map(); // ip -> recent booking attempt timestamps

  // ---------- Availability ----------
  function slotsFor(date, serviceId) {
    const service = shop.services.find((s) => s.id === serviceId);
    const hours = shop.hours[weekday(date)];
    if (!service || !hours) return { service, slots: [] };
    const need = Math.ceil(service.minutes / shop.slotMinutes);
    const taken = db.taken(date);
    const today = shopNow(now());
    const nowMin = date === today.date ? toMin(today.time) : -1;
    const open = toMin(hours[0]), close = toMin(hours[1]);
    const slots = [];
    for (let m = open; m + need * shop.slotMinutes <= close; m += shop.slotMinutes) {
      const covers = Array.from({ length: need }, (_, i) => `${date} ${toHHMM(m + i * shop.slotMinutes)}`);
      const free = m > nowMin && covers.every((c) => !taken.has(c));
      slots.push({ time: toHHMM(m), available: free });
    }
    return { service, slots, need };
  }

  function bookableDates() {
    const today = shopNow(now()).date;
    return Array.from({ length: shop.daysAhead }, (_, i) => addDays(today, i)).filter((d) => shop.hours[weekday(d)]);
  }

  // ---------- Live updates ----------
  function broadcast(event, data) {
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of streams) res.write(msg);
  }
  // Keep connections alive through proxies.
  const ping = setInterval(() => { for (const res of streams) res.write(': ping\n\n'); }, 25_000);

  // ---------- Email (logs instead when no key is set) ----------
  async function sendEmail(to, subject, text) {
    if (!to) return;
    const key = process.env.RESEND_API_KEY;
    if (!key || !process.env.FROM_EMAIL) { log.info?.(`[email skipped: no RESEND_API_KEY] to=${to} subject="${subject}"`); return; }
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: process.env.FROM_EMAIL, to, subject, text }),
      });
      if (!r.ok) log.error?.(`[email failed] ${r.status} ${await r.text()}`);
    } catch (err) { log.error?.('[email failed]', err); }
  }

  const publicBooking = (b) => {
    const s = shop.services.find((x) => x.id === b.service_id);
    return { id: b.id, service: s?.name ?? b.service_id, price: s?.price ?? null, date: b.date, start: b.start, minutes: b.minutes, name: b.customer_name, phone: b.customer_phone, email: b.customer_email, status: b.status, createdAt: b.created_at };
  };

  // ---------- Helpers ----------
  const json = (res, status, body, headers = {}) => {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
    res.end(JSON.stringify(body));
  };
  async function readJson(req) {
    let size = 0; const chunks = [];
    for await (const c of req) { size += c.length; if (size > 10_000) throw new Error('too large'); chunks.push(c); }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return null; }
  }
  const cookie = (req, name) => (req.headers.cookie ?? '').split(';').map((c) => c.trim().split('=')).find(([k]) => k === name)?.[1];
  function isOwner(req) {
    const t = cookie(req, 'owner');
    const exp = t && sessions.get(t);
    if (!exp) return false;
    if (exp < Date.now()) { sessions.delete(t); return false; }
    return true;
  }
  function tooMany(ip) {
    const t = Date.now();
    const list = (hits.get(ip) ?? []).filter((x) => t - x < 60_000);
    list.push(t);
    hits.set(ip, list);
    return list.length > rateLimit;
  }

  // ---------- Routes ----------
  async function handle(req, res) {
    const url = new URL(req.url, 'http://local');
    const path = url.pathname;
    const ip = req.socket.remoteAddress ?? '?';

    if (req.method === 'GET' && path === '/api/shop') {
      return json(res, 200, { name: shop.name, services: shop.services, dates: bookableDates() });
    }

    if (req.method === 'GET' && path === '/api/availability') {
      const date = url.searchParams.get('date');
      const service = url.searchParams.get('service');
      if (!isDate(date) || !bookableDates().includes(date)) return json(res, 400, { error: 'Pick a day within the next two weeks.' });
      const { service: s, slots } = slotsFor(date, service);
      if (!s) return json(res, 400, { error: 'Pick a service.' });
      return json(res, 200, { date, slots });
    }

    if (req.method === 'POST' && path === '/api/bookings') {
      if (tooMany(ip)) return json(res, 429, { error: 'Too many tries. Please wait a minute.' });
      const body = await readJson(req);
      if (!body) return json(res, 400, { error: 'Something went wrong. Please try again.' });
      const errors = {};
      const name = String(body.name ?? '').trim().replace(/\s+/g, ' ');
      const phone = String(body.phone ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
      const email = String(body.email ?? '').trim().toLowerCase();
      if (name.length < 2 || name.length > 60) errors.name = 'Enter your name.';
      if (phone.length !== 10) errors.phone = 'Enter a 10-digit phone number.';
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'Enter a valid email or leave it blank.';
      if (!isDate(body.date) || !bookableDates().includes(body.date)) errors.date = 'Pick a day.';
      if (!isTime(body.time)) errors.time = 'Pick a time.';
      const service = shop.services.find((s) => s.id === body.serviceId);
      if (!service) errors.serviceId = 'Pick a service.';
      if (Object.keys(errors).length) return json(res, 400, { error: 'Please fix the highlighted fields.', errors });

      const { slots, need } = slotsFor(body.date, service.id);
      const slot = slots.find((s) => s.time === body.time);
      if (!slot || !slot.available) return json(res, 409, { error: 'That time was just taken. Please pick another.' });
      const covers = Array.from({ length: need }, (_, i) => `${body.date} ${toHHMM(toMin(body.time) + i * shop.slotMinutes)}`);
      const booking = db.book({ serviceId: service.id, date: body.date, start: body.time, minutes: service.minutes, slots: covers, name, phone, email: email || null });
      if (!booking) return json(res, 409, { error: 'That time was just taken. Please pick another.' });

      const b = publicBooking(booking);
      broadcast('booking', b);
      const when = `${b.date} at ${b.start}`;
      sendEmail(email, `You're booked at ${shop.name}`, `Hi ${name},\n\nYou're booked for ${service.name} on ${when}.\n\nSee you then!\n${shop.name}`);
      sendEmail(process.env.OWNER_EMAIL, `New booking: ${service.name}, ${when}`, `${name} (${phone}) booked ${service.name} on ${when}.`);
      return json(res, 201, { booking: { id: b.id, service: b.service, date: b.date, start: b.start } });
    }

    // ----- Owner -----
    if (req.method === 'POST' && path === '/api/owner/login') {
      if (tooMany(ip)) return json(res, 429, { error: 'Too many tries. Please wait a minute.' });
      const body = await readJson(req);
      const pin = Buffer.from(String(body?.pin ?? ''));
      const want = Buffer.from(ownerPin);
      if (pin.length !== want.length || !timingSafeEqual(pin, want)) return json(res, 401, { error: 'Wrong PIN.' });
      const token = randomBytes(24).toString('base64url');
      sessions.set(token, Date.now() + 7 * 864e5);
      const secure = req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
      return json(res, 200, { ok: true }, { 'Set-Cookie': `owner=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secure}` });
    }

    if (path.startsWith('/api/owner/')) {
      if (!isOwner(req)) return json(res, 401, { error: 'Please log in.' });

      if (req.method === 'GET' && path === '/api/owner/bookings') {
        const today = shopNow(now()).date;
        const from = isDate(url.searchParams.get('from')) ? url.searchParams.get('from') : today;
        const to = isDate(url.searchParams.get('to')) ? url.searchParams.get('to') : addDays(today, 6);
        return json(res, 200, { today, from, to, shop: { name: shop.name, hours: shop.hours }, bookings: db.range(from, to).map(publicBooking) });
      }

      if (req.method === 'GET' && path === '/api/owner/stream') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
        res.write('retry: 3000\n\n');
        streams.add(res);
        req.on('close', () => streams.delete(res));
        return;
      }

      const cancel = path.match(/^\/api\/owner\/bookings\/(\d+)\/cancel$/);
      if (req.method === 'POST' && cancel) {
        const b = db.cancel(Number(cancel[1]));
        if (!b) return json(res, 404, { error: 'Booking not found or already cancelled.' });
        broadcast('cancelled', publicBooking(b));
        return json(res, 200, { ok: true });
      }

      if (req.method === 'POST' && path === '/api/owner/logout') {
        sessions.delete(cookie(req, 'owner'));
        return json(res, 200, { ok: true }, { 'Set-Cookie': 'owner=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });
      }
    }

    // ----- Static pages -----
    if (req.method === 'GET') {
      const file = path === '/' ? 'index.html' : path === '/dashboard' ? 'dashboard.html' : path.slice(1);
      const full = normalize(join(ROOT, file));
      if (full.startsWith(ROOT)) {
        try {
          const data = await readFile(full);
          res.writeHead(200, { 'Content-Type': TYPES[extname(full)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' });
          return res.end(data);
        } catch { /* fall through */ }
      }
    }
    json(res, 404, { error: 'Not found' });
  }

  const server = http.createServer((req, res) => {
    handle(req, res).catch((err) => { log.error?.(err); if (!res.headersSent) json(res, 500, { error: 'Something went wrong on our side. Please try again.' }); });
  });
  server.on('close', () => { clearInterval(ping); for (const r of streams) r.end(); db.close(); });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === normalize(process.argv[1])) {
  const port = Number(process.env.PORT ?? 3000);
  createApp({ dbFile: process.env.DB_FILE ?? 'bookings.db' }).listen(port, () => {
    console.log(`Booking page:  http://localhost:${port}/`);
    console.log(`Dashboard:     http://localhost:${port}/dashboard  (PIN: ${process.env.OWNER_PIN ? 'from OWNER_PIN' : '4821, set OWNER_PIN to change'})`);
  });
}
