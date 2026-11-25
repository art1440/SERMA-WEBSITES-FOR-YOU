/**
 * Button / link label that rolls up to a fresh copy of itself on hover or
 * keyboard focus of the closest `.group` (put `group` on the button).
 * The accessible name is the plain label; the two visual copies are hidden.
 * CSS only (globals.css `.demo-roll`), off under reduced motion / Pause.
 */
export function RollText({ children }: { children: string }) {
  return (
    <span className="demo-roll">
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="demo-roll-a">
        {children}
      </span>
      <span aria-hidden="true" className="demo-roll-b">
        {children}
      </span>
    </span>
  );
}
