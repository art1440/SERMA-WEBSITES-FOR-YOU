const $ = (s) => document.querySelector(s);
const state = { service: null, date: null, time: null };
const fmtDay = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const fmtTime = (t) => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const radio = (name, value, html, extra = '') => `<label class="opt"><input type="radio" name="${name}" value="${esc(value)}" ${extra}><span>${html}</span></label>`;

const shop = await (await fetch('/api/shop')).json();
document.title = `Book · ${shop.name}`;
$('#shop').textContent = `Book at ${shop.name}`;
$('#services').innerHTML = shop.services.map((s) => radio('service', s.id, `<b>${esc(s.name)}</b><small class="muted">${s.minutes} min · $${s.price}</small>`)).join('');
$('#days').innerHTML = shop.dates.map((d) => radio('day', d, fmtDay(d).replace(', ', '<br>'))).join('');

async function loadTimes() {
  const box = $('#times');
  state.time = null;
  if (!state.service || !state.date) return;
  $('#time-hint').textContent = 'Loading times…';
  const r = await fetch(`/api/availability?date=${state.date}&service=${state.service}`);
  const data = await r.json();
  if (!r.ok) { $('#time-hint').textContent = data.error; box.innerHTML = ''; return; }
  const open = data.slots.filter((s) => s.available).length;
  $('#time-hint').textContent = open ? `${open} open times on ${fmtDay(state.date)}.` : 'No open times that day. Try another day.';
  box.innerHTML = data.slots.map((s) => radio('time', s.time, `${fmtTime(s.time)}${s.available ? '' : '<span class="visually-hidden"> (taken)</span>'}`, s.available ? '' : 'disabled')).join('');
}

$('#book').addEventListener('change', (e) => {
  const { name, value } = e.target;
  if (name === 'service') { state.service = value; loadTimes(); }
  if (name === 'day') { state.date = value; loadTimes(); }
  if (name === 'time') state.time = value;
});

function showErrors(errors = {}) {
  for (const f of ['name', 'phone', 'email']) {
    const el = $(`#e-${f}`);
    el.hidden = !errors[f];
    el.textContent = errors[f] ?? '';
    $(`[name=${f}]`).setAttribute('aria-invalid', errors[f] ? 'true' : 'false');
  }
}

$('#book').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const err = $('#form-error');
  err.hidden = true;
  showErrors();
  if (!state.service || !state.date || !state.time) { err.textContent = 'Pick a service, a day, and a time.'; err.hidden = false; err.focus(); return; }
  const btn = $('#submit');
  btn.disabled = true; btn.textContent = 'Booking…';
  try {
    const r = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId: state.service, date: state.date, time: state.time, name: form.get('name'), phone: form.get('phone'), email: form.get('email') }),
    });
    const data = await r.json();
    if (!r.ok) {
      showErrors(data.errors);
      err.textContent = data.error; err.hidden = false; err.focus();
      if (r.status === 409) loadTimes();
      return;
    }
    $('#book').hidden = true;
    $('#done-text').textContent = `${data.booking.service} on ${fmtDay(data.booking.date)} at ${fmtTime(data.booking.start)}.`;
    $('#done').hidden = false; $('#done').focus();
  } catch {
    err.textContent = 'Could not reach the shop. Check your connection and try again.'; err.hidden = false;
  } finally {
    btn.disabled = false; btn.textContent = 'Confirm booking';
  }
});

$('#again').addEventListener('click', () => {
  $('#book').reset();
  Object.assign(state, { service: null, date: null, time: null });
  $('#times').innerHTML = '';
  $('#time-hint').textContent = 'Pick a service and a day first.';
  $('#done').hidden = true; $('#book').hidden = false;
});
