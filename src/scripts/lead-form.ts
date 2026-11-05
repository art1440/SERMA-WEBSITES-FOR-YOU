/** Progressive enhancement for every lead form on the page. */
import { validateLead, leadFields, type LeadField, type LeadInput } from '../lib/lead';

const PREVIEW_DELAY = 900;

function readForm(form: HTMLFormElement): LeadInput {
  const data = new FormData(form);
  const get = (k: string) => String(data.get(k) ?? '');
  return {
    businessName: get('businessName'),
    businessType: get('businessType'),
    phone: get('phone'),
    email: get('email'),
    link: get('link'),
    language: get('language'),
  };
}

function fieldControl(form: HTMLFormElement, name: LeadField): HTMLElement | null {
  if (name === 'language') return form.querySelector('input[name="language"]');
  return form.querySelector(`[name="${name}"]`);
}

function setFieldError(form: HTMLFormElement, name: LeadField, on: boolean) {
  const control = fieldControl(form, name);
  const id = name === 'language' ? null : control?.id;
  const errorEl = id ? form.querySelector<HTMLElement>(`#${CSS.escape(id)}-error`) : form.querySelector<HTMLElement>(`[id$="-language-error"]`);
  if (name === 'language') {
    form.querySelectorAll('input[name="language"]').forEach((el) => {
      if (on) el.setAttribute('aria-invalid', 'true');
      else el.removeAttribute('aria-invalid');
    });
  } else if (control) {
    if (on) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }
  if (errorEl) errorEl.hidden = !on;
}

function showErrors(form: HTMLFormElement, errors: Partial<Record<LeadField, true>>) {
  for (const name of leadFields) setFieldError(form, name, Boolean(errors[name]));
}

function init(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('form')!;
  const success = root.querySelector<HTMLElement>('.lead-success')!;
  const summary = form.querySelector<HTMLElement>('.form-summary')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  const startedAt = form.querySelector<HTMLInputElement>('input[name="startedAt"]')!;
  const isPreview = root.dataset.preview === 'true';
  const touched = new Set<LeadField>();

  // Time-on-form check for the server (bots submit instantly).
  const stamp = () => { if (!startedAt.value) startedAt.value = String(Date.now()); };
  form.addEventListener('focusin', stamp, { once: true });

  // Re-check a field as it's being fixed, and on blur once it has a value.
  const recheck = (name: LeadField) => {
    const result = validateLead(readForm(form));
    setFieldError(form, name, !result.ok && Boolean(result.errors[name]));
  };
  form.addEventListener('input', (e) => {
    const name = (e.target as HTMLInputElement).name as LeadField;
    if (touched.has(name)) recheck(name);
  });
  form.addEventListener('focusout', (e) => {
    const el = e.target as HTMLInputElement;
    const name = el.name as LeadField;
    if (!(leadFields as readonly string[]).includes(name) || name === 'language') return;
    if (el.value.trim()) { touched.add(name); recheck(name); }
  });
  form.addEventListener('change', (e) => {
    const name = (e.target as HTMLInputElement).name as LeadField;
    if (name === 'businessType') { touched.add(name); recheck(name); }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    stamp();
    const input = readForm(form);
    const result = validateLead(input);

    if (!result.ok) {
      const names = Object.keys(result.errors) as LeadField[];
      names.forEach((n) => touched.add(n));
      showErrors(form, result.errors);
      summary.textContent = names.length === 1
        ? form.dataset.msgSummaryOne!
        : form.dataset.msgSummaryMany!.replace('{n}', String(names.length));
      summary.hidden = false;
      const first = fieldControl(form, names[0]!);
      first?.focus();
      return;
    }

    summary.hidden = true;
    showErrors(form, {});
    submit.dataset.loading = '';
    submit.setAttribute('aria-disabled', 'true');
    const label = submit.querySelector('span');
    const original = label?.textContent ?? '';
    if (label) label.textContent = submit.dataset.sendingLabel ?? original;

    try {
      if (isPreview) {
        await new Promise((r) => setTimeout(r, PREVIEW_DELAY));
      } else {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });
        if (res.status === 429) throw new Error('rate');
        if (!res.ok) throw new Error('network');
      }
      showSuccess(input);
    } catch (err) {
      summary.textContent = (err as Error).message === 'rate' ? form.dataset.msgRate! : form.dataset.msgNetwork!;
      summary.hidden = false;
      summary.focus();
    } finally {
      delete submit.dataset.loading;
      submit.removeAttribute('aria-disabled');
      if (label) label.textContent = original;
    }
  });

  function showSuccess(input: LeadInput) {
    const title = success.querySelector<HTMLElement>('.success-title')!;
    title.textContent = success.dataset.title!.replace('{business}', input.businessName.trim());
    const step3 = success.querySelector<HTMLElement>('[data-step="2"]');
    if (step3) step3.textContent = success.dataset.step3!.replace('{email}', input.email.trim());
    form.hidden = true;
    success.hidden = false;
    success.focus();
    root.dispatchEvent(new CustomEvent('lead:success', { bubbles: true }));
  }

  success.querySelector('[data-reset]')?.addEventListener('click', () => {
    form.reset();
    startedAt.value = '';
    touched.clear();
    success.hidden = true;
    form.hidden = false;
    form.querySelector<HTMLElement>('input, select')?.focus();
  });
}

document.querySelectorAll<HTMLElement>('[data-lead-form]').forEach(init);
