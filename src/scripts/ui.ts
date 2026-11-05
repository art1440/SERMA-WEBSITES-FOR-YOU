/** Site-wide behavior: header, dialogs, mobile call-to-action bar, scroll reveals. Small on purpose. */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Header: hide on scroll down, show on scroll up ---------- */
const header = document.querySelector<HTMLElement>('[data-header]');
if (header) {
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    header.toggleAttribute('data-scrolled', y > 4);
    const goingDown = y > lastY + 6;
    const goingUp = y < lastY - 6;
    if (goingDown && y > 240 && !document.querySelector('dialog[open]')) header.setAttribute('data-hidden', '');
    else if (goingUp || y < 240) header.removeAttribute('data-hidden');
    if (goingDown || goingUp) lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  // First check waits a frame so it never forces a layout during page load.
  requestAnimationFrame(update);
}

/* ---------- Dialogs ---------- */
const openers = new WeakMap<HTMLDialogElement, Element | null>();

function openDialog(dialog: HTMLDialogElement, focusTarget?: HTMLElement | null) {
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach((d) => d !== dialog && d.close());
  openers.set(dialog, document.activeElement);
  dialog.showModal();
  focusTarget?.focus();
}

document.addEventListener('click', (e) => {
  const target = e.target as Element;

  const menuTrigger = target.closest('[data-open-menu]');
  const menu = document.getElementById('mobile-menu') as HTMLDialogElement | null;
  if (menuTrigger && menu) {
    openDialog(menu, menu.querySelector<HTMLElement>('[data-close-dialog]'));
    return;
  }

  const closer = target.closest('[data-close-dialog]');
  if (closer) {
    closer.closest('dialog')?.close();
    return;
  }

  // Click on the backdrop closes light-dismiss dialogs.
  if (target instanceof HTMLDialogElement && target.open && target.hasAttribute('data-light-dismiss')) {
    target.close();
  }
});

document.querySelectorAll<HTMLDialogElement>('dialog').forEach((dialog) => {
  dialog.addEventListener('close', () => {
    const opener = openers.get(dialog);
    if (opener instanceof HTMLElement && opener.isConnected && !opener.closest('dialog')) opener.focus({ preventScroll: true });
  });
});

/* ---------- Reveal on scroll ---------- */
const revealables = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (revealables.length) {
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealables.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealables.forEach((el) => io.observe(el));
  }
}
