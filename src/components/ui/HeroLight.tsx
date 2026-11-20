"use client";

/**
 * Hero-only tonal depth. Static, cheap layers (gradients + opacity, no blur filters),
 * built from theme tokens so they re-theme with the palette.
 */
export function HeroLight({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {/* Dark mode: the original layers, untouched. */}
      <div className="absolute inset-0 hidden dark:block">
        {/* Key light: soft glow behind the 3D engine (right side). */}
        <div className="absolute -right-[8%] top-[4%] hidden h-[90%] w-[62%] bg-[radial-gradient(closest-side,theme(colors.aqua.glow/0.28),theme(colors.signal.DEFAULT/0.12)_55%,transparent)] opacity-90 lg:block" />
        {/* Calm, lighter plane behind the headline. */}
        <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-[radial-gradient(ellipse_at_28%_46%,theme(colors.ink.900/0.55),transparent_70%)] lg:block" />
        {/* Vignette toward the edges. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_55%,theme(colors.ink.500/0.45)_100%)]" />
        {/* Deeper wash at the bottom. */}
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-ink-600/60 via-ink-600/20 to-transparent" />
      </div>

      {/* Light mode: three value planes, static gradients only (token colours). */}
      <div className="absolute inset-0 dark:hidden">
        {/* BACK plane: a deep blue atmosphere centred behind the engine (right ~60%). */}
        <div className="absolute inset-y-0 right-0 hidden w-[68%] bg-[radial-gradient(ellipse_62%_62%_at_62%_52%,theme(colors.aqua.glow/0.55),theme(colors.signal.DEFAULT/0.5)_42%,theme(colors.signal.DEFAULT/0.18)_72%,transparent)] lg:block" />
        {/* Horizon: a darker band of bone across the lower right. */}
        {/* The mask feathers the left edge so the band never ends in a visible seam. */}
        <div className="absolute bottom-0 right-0 hidden h-[42%] w-[68%] bg-[linear-gradient(to_top,theme(colors.bone.DEFAULT/0.1),theme(colors.bone.DEFAULT/0.06)_45%,transparent)] [mask-image:linear-gradient(to_right,transparent,#000_45%)] lg:block" />
        {/* Contact shadow grounding the engine. */}
        <div className="absolute bottom-[10%] right-[10%] hidden h-[12%] w-[40%] bg-[radial-gradient(ellipse_at_center,theme(colors.bone.DEFAULT/0.1),transparent_70%)] lg:block" />
        {/* FRONT plane: the lightest area, behind the headline and sub copy. */}
        <div className="absolute inset-y-0 left-0 hidden w-[52%] bg-[radial-gradient(ellipse_at_30%_50%,theme(colors.ink.900/0.85),theme(colors.ink.900/0.7)_45%,transparent_78%)] lg:block" />
        {/* Phones/tablets: keep the headline area light. The copy sits in the lower half here and the
            engine in the upper half, so the glow is centred low to avoid washing the engine out. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_45%_at_40%_70%,theme(colors.ink.900/0.7),transparent_75%)] lg:hidden" />
      </div>
    </div>
  );
}
