/**
 * "Our work" on phones pins its row and walks the six demo sites with the page scroll. Once a visitor has
 * reached the last one, the row unpins for the rest of the visit: going back up (or coming down again) the
 * gallery is a plain block they scroll straight past, and a swipe or a dot still steps through it.
 *
 * The flag is a `data-work-seen` attribute on <html>; CSS drops the pin's sticky stage and scroll room
 * under it (WorkGallery.tsx). It is kept in sessionStorage only (gone when the tab closes, never sent
 * anywhere, same as the colour scheme in theme.ts), so a reload, or Back from a demo page, keeps the
 * layout the visitor left: the browser's restored scroll position still points at the same content.
 */
export const WORK_SEEN_KEY = "serma-work-seen";
export const WORK_SEEN_ATTR = "data-work-seen";

/** Runs before first paint (inlined in <head> by layout.tsx), so a restored page never lays out the pin. */
export const WORK_SEEN_SCRIPT = `try{if(sessionStorage.getItem("${WORK_SEEN_KEY}"))document.documentElement.setAttribute("${WORK_SEEN_ATTR}","")}catch(e){}`;
