/** Interactive booking demo: state, events, tabs. Loaded only when the demo nears the screen. */
import { renderPhone, renderDashboard, initialState, stepTitle, type DemoState } from './render';
import { shops, slots, openDays, existingBookings, isTaken, type Industry } from './data';

export function init(root: HTMLElement) {
  const phone = root.querySelector<HTMLElement>('[data-demo-phone]')!;
  const dash = root.querySelector<HTMLElement>('[data-demo-dash]')!;
  const live = root.querySelector<HTMLElement>('[data-demo-live]')!;
  const tablist = root.querySelector<HTMLElement>('[role="tablist"]')!;
  const tabs = Array.from(tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-demo-panel]'));
  const wide = window.matchMedia('(min-width: 1100px)');

  let state: DemoState = initialState('barber', Date.now());

  const announce = (msg: string) => { live.textContent = ''; requestAnimationFrame(() => { live.textContent = msg; }); };

  function render(focus?: 'title' | string) {
    phone.innerHTML = renderPhone(state);
    dash.innerHTML = renderDashboard(state);
    if (focus === 'title') phone.querySelector<HTMLElement>('#d-step-title')?.focus({ preventScroll: true });
    else if (focus) (phone.querySelector<HTMLElement>(`#${focus}`))?.focus({ preventScroll: true });
  }

  function set(patch: Partial<DemoState>, focus?: string) {
    state = { ...state, ...patch };
    render(focus);
  }

  /* ----- Tabs (phones and tablets). On wide screens both views sit side by side. ----- */
  function selectTab(index: number, moveFocus = false) {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i]!.hidden = !on;
    });
    if (moveFocus) tabs[index]!.focus();
  }
  function applyLayout() {
    if (wide.matches) {
      tablist.hidden = true;
      panels.forEach((p) => { p.hidden = false; p.removeAttribute('role'); p.removeAttribute('aria-labelledby'); p.removeAttribute('tabindex'); });
    } else {
      tablist.hidden = false;
      panels.forEach((p, i) => { p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', tabs[i]!.id); p.tabIndex = -1; });
      const current = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      selectTab(Math.max(0, current));
    }
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(i));
    tab.addEventListener('keydown', (e) => {
      const keys: Record<string, number> = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (e.key in keys) { e.preventDefault(); selectTab(keys[e.key]!, true); }
    });
  });
  wide.addEventListener('change', applyLayout);
  applyLayout();

  /* ----- Shop type ----- */
  root.querySelectorAll<HTMLInputElement>('input[name="demo-industry"]').forEach((input) => {
    input.addEventListener('change', () => {
      state = initialState(input.value as Industry, Date.now());
      render();
      announce(`Switched to ${shops[state.industry].name}. Step 1 of 3: pick a service.`);
    });
  });

  /* ----- Flow ----- */
  phone.addEventListener('change', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.name === 'd-service') set({ serviceId: el.value, error: null }, el.id);
    if (el.name === 'd-day') set({ day: Number(el.value), slot: null, error: null }, el.id);
    if (el.name === 'd-slot') set({ slot: Number(el.value), error: null }, el.id);
  });
  phone.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    if (el.name === 'd-name') state.name = el.value;
    if (el.name === 'd-phone') state.phone = el.value;
  });

  function firstOpenDay(): number {
    const now = new Date(state.now);
    const days = openDays(now);
    const taken = existingBookings(state.industry);
    const idx = days.findIndex((d) => slots.some((_, i) => !isTaken(taken, d, i, now)));
    return Math.max(0, idx);
  }

  phone.addEventListener('click', (e) => {
    const act = (e.target as Element).closest<HTMLElement>('[data-act]')?.dataset.act;
    if (!act) return;

    if (act === 'next' && state.step === 'service') {
      if (!state.serviceId) return set({ error: 'Pick a service to continue.' }, 'd-svc-' + shops[state.industry].services[0]!.id);
      set({ step: 'time', day: firstOpenDay(), slot: null, error: null }, 'title');
      announce(`Step 2 of 3: ${stepTitle(state)}.`);
    } else if (act === 'next' && state.step === 'time') {
      if (state.slot === null) return set({ error: 'Pick a time to continue.' });
      set({ step: 'details', error: null }, 'title');
      announce('Step 3 of 3: your details.');
    } else if (act === 'back') {
      set({ step: state.step === 'details' ? 'time' : 'service', error: null }, 'title');
      announce(`Step ${state.step === 'time' ? 2 : 1} of 3: ${stepTitle(state)}.`);
    } else if (act === 'confirm') {
      const name = state.name.trim().split(/\s+/)[0] ?? '';
      if (!name) return set({ error: 'Enter your name to book.' }, 'd-name');
      set({
        step: 'done',
        error: null,
        booked: { day: state.day, slot: state.slot!, client: name.slice(0, 20), serviceId: state.serviceId! },
      }, 'title');
      announce('Booked. The appointment now shows in the owner dashboard.');
      if (wide.matches) flashDashboard();
    } else if (act === 'to-dashboard') {
      if (!wide.matches) selectTab(1);
      flashDashboard();
      const title = dash.querySelector<HTMLElement>('#d-dash-title');
      title?.focus({ preventScroll: true });
      title?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } else if (act === 'restart') {
      state = { ...initialState(state.industry, Date.now()) };
      render('title');
      announce('Step 1 of 3: pick a service.');
    }
  });

  function flashDashboard() {
    dash.classList.remove('is-flash');
    void dash.offsetWidth;
    dash.classList.add('is-flash');
  }

  render();
  root.dataset.ready = '';
}
