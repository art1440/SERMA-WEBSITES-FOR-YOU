const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmtDay = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' });
const fmtTime = (t) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const fmtPhone = (p) => (p?.length === 10 ? `(${p.slice(0, 3)}) ${p.slice(3, 6)}-${p.slice(6)}` : p);

let data = null;
const fresh = new Set();
let newCount = 0;

async function load() {
  const r = await fetch('/api/owner/bookings');
  if (r.status === 401) { showLogin(); return false; }
  data = await r.json();
  render();
  return true;
}

function render() {
  $('#title').textContent = data.shop.name;
  $('#range').textContent = `${fmtDay(data.from)} – ${fmtDay(data.to)}`;
  const active = data.bookings.filter((b) => b.status === 'booked');
  $('#s-today').textContent = active.filter((b) => b.date === data.today).length;
  $('#s-week').textContent = active.length;
  $('#s-new').textContent = newCount;
  $('#s-new-box').classList.toggle('hot', newCount > 0);
  const byDay = new Map();
  for (let d = new Date(`${data.from}T12:00:00Z`); d <= new Date(`${data.to}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) byDay.set(d.toISOString().slice(0, 10), []);
  for (const b of data.bookings) byDay.get(b.date)?.push(b);
  $('#days').innerHTML = [...byDay].map(([date, list]) => `
    <section class="day" aria-label="${fmtDay(date)}">
      <h3>${date === data.today ? 'Today · ' : ''}${fmtDay(date)}</h3>
      ${list.length ? list.sort((a, b) => a.start.localeCompare(b.start)).map((b) => `
        <div class="appt ${fresh.has(b.id) ? 'new' : ''} ${b.status}">
          <span class="time">${fmtTime(b.start)}</span>
          <span class="who"><b>${esc(b.name)}</b>${fresh.has(b.id) ? '<span class="badge">New</span>' : ''}<small>${esc(b.service)} · ${b.minutes} min · <a href="tel:+1${esc(b.phone)}">${esc(fmtPhone(b.phone))}</a></small></span>
          ${b.status === 'booked' ? `<button class="btn ghost small" data-cancel="${b.id}" type="button">Cancel</button>` : '<span class="muted">Cancelled</span>'}
        </div>`).join('') : `<p class="empty">${data.shop.hours[new Date(`${date}T12:00:00Z`).getUTCDay()] ? 'No appointments.' : 'Closed.'}</p>`}
    </section>`).join('');
}

// ---------- Live updates ----------
function connect() {
  const live = $('#live');
  const es = new EventSource('/api/owner/stream');
  es.onopen = () => { live.dataset.on = ''; live.querySelector('span').textContent = 'Live'; load(); /* catch up on anything missed */ };
  es.onerror = () => { delete live.dataset.on; live.querySelector('span').textContent = 'Reconnecting…'; };
  es.addEventListener('booking', (e) => {
    const b = JSON.parse(e.data);
    if (b.date < data.from || b.date > data.to) return;
    data.bookings = data.bookings.filter((x) => x.id !== b.id).concat(b);
    fresh.add(b.id); newCount++;
    render();
    const msg = `New booking: ${b.name}, ${b.service}, ${fmtDay(b.date)} at ${fmtTime(b.start)}`;
    $('#announce').textContent = msg;
    flashTitle();
    if ('Notification' in window && Notification.permission === 'granted' && document.hidden) new Notification('New booking', { body: msg });
  });
  es.addEventListener('cancelled', (e) => {
    const b = JSON.parse(e.data);
    data.bookings = data.bookings.map((x) => (x.id === b.id ? b : x));
    render();
  });
}

let flashTimer = 0;
function flashTitle() {
  const base = data.shop.name;
  let on = false, n = 0;
  clearInterval(flashTimer);
  flashTimer = setInterval(() => { document.title = (on = !on) ? '● New booking' : base; if (++n > 9) { clearInterval(flashTimer); document.title = base; } }, 700);
}

// ---------- Actions ----------
$('#days').addEventListener('click', async (e) => {
  const id = e.target.closest('[data-cancel]')?.dataset.cancel;
  if (!id) return;
  const btn = e.target.closest('button');
  if (btn.dataset.confirm !== 'yes') { btn.dataset.confirm = 'yes'; btn.textContent = 'Tap again to cancel'; setTimeout(() => { if (btn.isConnected) { btn.dataset.confirm = ''; btn.textContent = 'Cancel'; } }, 4000); return; }
  btn.disabled = true;
  const r = await fetch(`/api/owner/bookings/${id}/cancel`, { method: 'POST' });
  if (!r.ok) { btn.disabled = false; btn.textContent = 'Try again'; }
});

if ('Notification' in window && Notification.permission === 'default') {
  $('#notify').hidden = false;
  $('#notify').addEventListener('click', async () => { await Notification.requestPermission(); $('#notify').hidden = true; });
}

$('#logout').addEventListener('click', async () => { await fetch('/api/owner/logout', { method: 'POST' }); location.reload(); });

function showLogin() { $('#login').hidden = false; $('#app').hidden = true; $('[name=pin]').focus(); }

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const err = $('#login-err');
  const r = await fetch('/api/owner/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: new FormData(e.target).get('pin') }) });
  if (!r.ok) { err.textContent = (await r.json()).error; err.hidden = false; return; }
  start();
});

async function start() {
  if (!(await load())) return;
  $('#login').hidden = true; $('#app').hidden = false;
  connect();
}
start();
