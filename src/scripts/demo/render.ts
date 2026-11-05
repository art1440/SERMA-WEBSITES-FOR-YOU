/**
 * Pure render functions for the booking demo. They return HTML strings,
 * so the same code builds the first view at build time and every update in the browser.
 */
import { shops, slots, openDays, existingBookings, isTaken, type Industry, type Booking } from './data';

export type Step = 'service' | 'time' | 'details' | 'done';

export interface DemoState {
  industry: Industry;
  step: Step;
  serviceId: string | null;
  day: number;
  slot: number | null;
  name: string;
  phone: string;
  booked: Booking | null;
  error: string | null;
  now: number;
}

export const initialState = (industry: Industry, now: number): DemoState => ({
  industry,
  step: 'service',
  serviceId: null,
  day: 0,
  slot: null,
  name: 'Jordan',
  phone: '(512) 555-0134',
  booked: null,
  error: null,
  now,
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const stepNumber: Record<Step, number> = { service: 1, time: 2, details: 3, done: 3 };

const check = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const back = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function stepTitle(state: DemoState): string {
  return { service: 'Pick a service', time: 'Pick a day and time', details: 'Confirm', done: 'Booked' }[state.step];
}

export function renderPhone(state: DemoState): string {
  const shop = shops[state.industry];
  const now = new Date(state.now);
  const days = openDays(now);
  const service = shop.services.find((s) => s.id === state.serviceId) ?? null;
  const day = days[state.day]!;
  const slot = state.slot !== null ? slots[state.slot]! : null;
  const taken = existingBookings(state.industry);

  const canGoBack = state.step === 'time' || state.step === 'details';
  const bar = `
    <div class="d-appbar">
      ${canGoBack ? `<button type="button" class="d-icon-btn" data-act="back" aria-label="Back">${back}</button>` : '<span class="d-logo" aria-hidden="true"></span>'}
      <div class="d-appbar-title"><strong>${esc(shop.name)}</strong><span>Book an appointment</span></div>
      ${state.step !== 'done' ? `<span class="d-steps">Step ${stepNumber[state.step]} of 3</span>` : ''}
    </div>`;

  const error = state.error ? `<p class="d-error" role="alert">${esc(state.error)}</p>` : '';
  let body = '';
  let foot = '';

  if (state.step === 'service') {
    body = `
      <fieldset class="d-fs">
        <legend class="d-legend" id="d-step-title" tabindex="-1">Pick a service</legend>
        <div class="d-opts">
          ${shop.services.map((s) => `
            <label class="d-opt">
              <input type="radio" name="d-service" id="d-svc-${s.id}" value="${s.id}" ${s.id === state.serviceId ? 'checked' : ''}>
              <span class="d-opt-main"><b>${esc(s.name)}</b><small>${s.minutes} min</small></span>
              <span class="d-price">$${s.price}</span>
            </label>`).join('')}
        </div>
      </fieldset>${error}`;
    foot = `<button type="button" class="d-btn" data-act="next">Continue</button>`;
  }

  if (state.step === 'time') {
    body = `
      <fieldset class="d-fs">
        <legend class="d-legend" id="d-step-title" tabindex="-1">Pick a day</legend>
        <div class="d-days">
          ${days.map((d) => `
            <label class="d-chip">
              <input type="radio" name="d-day" id="d-day-${d.index}" value="${d.index}" ${d.index === state.day ? 'checked' : ''}>
              <span><small>${d.short}</small><b>${d.date.getDate()}</b></span>
            </label>`).join('')}
        </div>
      </fieldset>
      <fieldset class="d-fs">
        <legend class="d-legend">Times on ${esc(day.long)}</legend>
        <div class="d-times">
          ${slots.map((s, i) => {
            const off = isTaken(taken, day, i, now);
            return `
            <label class="d-time${off ? ' is-off' : ''}">
              <input type="radio" name="d-slot" id="d-slot-${i}" value="${i}" ${i === state.slot ? 'checked' : ''} ${off ? 'disabled' : ''}>
              <span>${s.label}${off ? '<span class="visually-hidden"> (unavailable)</span>' : ''}</span>
            </label>`;
          }).join('')}
        </div>
      </fieldset>${error}`;
    foot = `<button type="button" class="d-btn" data-act="next">Continue</button>`;
  }

  if (state.step === 'details') {
    body = `
      <h3 class="d-legend" id="d-step-title" tabindex="-1">Confirm your booking</h3>
      <div class="d-summary">
        <div><b>${esc(service!.name)}</b><span>with ${esc(shop.staff)} · ${service!.minutes} min</span></div>
        <div><b>${esc(day.long)}</b><span>${slot!.label}</span></div>
      </div>
      <p class="d-muted">Booking as <b>${esc(state.name)}</b> (demo customer)</p>
      ${error}`;
    foot = `<button type="button" class="d-btn" data-act="confirm">Confirm booking · $${service!.price}</button>`;
  }

  if (state.step === 'done' && state.booked) {
    const b = state.booked;
    const bs = shop.services.find((s) => s.id === b.serviceId)!;
    const bd = days[b.day]!;
    body = `
      <div class="d-done">
        <span class="d-done-mark">${check}</span>
        <h3 class="d-legend" id="d-step-title" tabindex="-1">You're booked, ${esc(b.client)}!</h3>
        <p class="d-muted">${esc(bs.name)} with ${esc(shop.staff)}<br>${esc(bd.long)} at ${slots[b.slot]!.label}</p>
      </div>
      <div class="d-email">
        <small>Email · just now</small>
        <b>Your appointment is confirmed</b>
        <p>See you ${esc(bd.short === 'Today' ? 'today' : bd.long)} at ${slots[b.slot]!.label}. We'll send a reminder the day before.</p>
      </div>`;
    foot = `
      <button type="button" class="d-btn" data-act="to-dashboard">See it in the dashboard</button>
      <button type="button" class="d-btn d-btn-ghost" data-act="restart">Book another</button>`;
  }

  return `${bar}<div class="d-body">${body}</div><div class="d-foot">${foot}</div>`;
}

export function renderDashboard(state: DemoState): string {
  const shop = shops[state.industry];
  const now = new Date(state.now);
  const days = openDays(now);
  const all: Booking[] = [...existingBookings(state.industry), ...(state.booked ? [{ ...state.booked, isNew: true }] : [])];
  const at = (d: number, s: number) => all.find((b) => b.day === d && b.slot === s);
  const svc = (id: string) => shop.services.find((s) => s.id === id)!;
  const todayCount = all.filter((b) => b.day === 0).length;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const upcoming = all
    .filter((b) => !(b.day === 0 && days[0]!.short === 'Today' && slots[b.slot]!.min <= nowMin) || b.isNew)
    .sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)) || a.day - b.day || a.slot - b.slot)
    .slice(0, 5);

  const grid = `
    <div class="d-cal" aria-hidden="true">
      <span></span>
      ${days.map((d) => `<span class="d-cal-day">${d.short}<b>${d.date.getDate()}</b></span>`).join('')}
      ${slots.map((s, si) => `
        <span class="d-cal-time">${s.label.replace(':00', '').replace(' ', '')}</span>
        ${days.map((d) => {
          const b = at(d.index, si);
          if (!b) return '<span class="d-cell"></span>';
          return `<span class="d-cell is-booked${b.isNew ? ' is-new' : ''}"><b>${esc(svc(b.serviceId).short)}</b><small>${esc(b.client)}</small></span>`;
        }).join('')}`).join('')}
    </div>`;

  const list = `
    <div class="d-list">
      <h4>Upcoming</h4>
      <ul role="list">
        ${upcoming.map((b) => `
          <li class="${b.isNew ? 'is-new' : ''}">
            <span class="d-when">${days[b.day]!.short} · ${slots[b.slot]!.label}</span>
            <span class="d-who">${esc(b.client)} · ${esc(svc(b.serviceId).name)}</span>
            ${b.isNew ? '<span class="d-new">New</span>' : ''}
          </li>`).join('')}
      </ul>
    </div>`;

  return `
    <div class="d-dash-top">
      <div>
        <span class="d-kicker">Owner dashboard</span>
        <h3 class="d-dash-title" id="d-dash-title" tabindex="-1">${esc(shop.name)}</h3>
      </div>
      <span class="d-week">This week</span>
    </div>
    <div class="d-stats">
      <div><b>${todayCount}</b><span>today</span></div>
      <div><b>${all.length}</b><span>this week</span></div>
      <div class="${state.booked ? 'is-new' : ''}"><b>${state.booked ? 1 : 0}</b><span>new online</span></div>
    </div>
    ${state.booked ? '' : '<p class="d-hint">Book an appointment in the customer view. It shows up here.</p>'}
    <div class="d-dash-main">${grid}${list}</div>`;
}
