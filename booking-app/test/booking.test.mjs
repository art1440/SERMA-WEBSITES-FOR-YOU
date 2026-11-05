import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../server.mjs';

// Monday 2026-11-09, 8:00 AM in Austin (14:00 UTC): the shop opens at 9.
const NOW = new Date('2026-11-09T14:00:00Z');
const DAY = '2026-11-09';
let server, base;
const quiet = { info() {}, error() {} };

before(async () => {
  server = createApp({ now: () => NOW, log: quiet, rateLimit: 1000, ownerPin: '1234' });
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((r) => { server.closeAllConnections(); server.close(r); }));

const post = (path, body, headers = {}) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
const book = (time, serviceId = 'cut', extra = {}) => post('/api/bookings', { serviceId, date: DAY, time, name: 'Test Person', phone: '(512) 555-0134', ...extra });
async function login() {
  const r = await post('/api/owner/login', { pin: '1234' });
  assert.equal(r.status, 200);
  return r.headers.get('set-cookie').split(';')[0];
}

test('shows the shop, services, and bookable days (closed Sundays)', async () => {
  const data = await (await fetch(base + '/api/shop')).json();
  assert.equal(data.services.length, 4);
  assert.equal(data.dates[0], DAY);
  assert.ok(data.dates.every((d) => new Date(`${d}T12:00:00Z`).getUTCDay() !== 0));
});

test('books an open slot, then refuses the same slot', async () => {
  const first = await book('09:00');
  assert.equal(first.status, 201);
  const again = await book('09:00');
  assert.equal(again.status, 409);
  const slots = (await (await fetch(`${base}/api/availability?date=${DAY}&service=cut`)).json()).slots;
  assert.equal(slots.find((s) => s.time === '09:00').available, false);
});

test('a 60-minute service blocks the next slot too', async () => {
  assert.equal((await book('10:00', 'combo')).status, 201);
  assert.equal((await book('10:30')).status, 409);
  assert.equal((await book('11:00')).status, 201);
});

test('twenty people racing for one time: exactly one gets it', async () => {
  const results = await Promise.all(Array.from({ length: 20 }, () => book('13:00')));
  assert.equal(results.filter((r) => r.status === 201).length, 1);
  assert.equal(results.filter((r) => r.status === 409).length, 19);
});

test('rejects bad input with field errors', async () => {
  const r = await post('/api/bookings', { serviceId: 'nope', date: DAY, time: '25:00', name: 'x', phone: '12', email: 'bad' });
  assert.equal(r.status, 400);
  const { errors } = await r.json();
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'name', 'phone', 'serviceId', 'time']);
});

test('the dashboard is owner-only', async () => {
  assert.equal((await fetch(base + '/api/owner/bookings')).status, 401);
  assert.equal((await post('/api/owner/login', { pin: '0000' })).status, 401);
  const cookie = await login();
  const r = await fetch(base + '/api/owner/bookings', { headers: { cookie } });
  assert.equal(r.status, 200);
  const data = await r.json();
  assert.ok(data.bookings.some((b) => b.start === '09:00'));
});

test('a new booking reaches an open dashboard live', async () => {
  const cookie = await login();
  const got = new Promise((resolve, reject) => {
    const req = http.get(`${base}/api/owner/stream`, { headers: { cookie } }, (res) => {
      let buf = '';
      res.on('data', (c) => {
        buf += c;
        const m = buf.match(/event: booking\ndata: (.*)\n/);
        if (m) { req.destroy(); resolve(JSON.parse(m[1])); }
      });
    });
    req.on('error', (e) => { if (e.code !== 'ECONNRESET') reject(e); });
    setTimeout(() => reject(new Error('no live event within 2 s')), 2000);
  });
  await new Promise((r) => setTimeout(r, 100)); // let the stream open
  assert.equal((await book('15:00', 'fade', { name: 'Live Test' })).status, 201);
  const b = await got;
  assert.equal(b.name, 'Live Test');
  assert.equal(b.start, '15:00');
});

test('cancelling frees the time again', async () => {
  const cookie = await login();
  const created = await (await book('16:00')).json();
  assert.equal((await post(`/api/owner/bookings/${created.booking.id}/cancel`, {}, { cookie })).status, 200);
  assert.equal((await book('16:00')).status, 201);
});

test('times already past today are not offered', async () => {
  const late = createApp({ now: () => new Date('2026-11-09T20:10:00Z'), log: quiet }); // 2:10 PM in Austin
  await new Promise((r) => late.listen(0, r));
  const url = `http://127.0.0.1:${late.address().port}`;
  const slots = (await (await fetch(`${url}/api/availability?date=${DAY}&service=cut`)).json()).slots;
  assert.equal(slots.find((s) => s.time === '14:00').available, false);
  assert.equal(slots.find((s) => s.time === '14:30').available, true);
  await new Promise((r) => { late.closeAllConnections(); late.close(r); });
});
