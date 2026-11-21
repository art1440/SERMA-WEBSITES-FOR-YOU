import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * SermaWebDesign — "Liquid Glass" token system (see docs/design-system.md).
 * Light "morning sky" palette rendered through translucent, light-catching
 * glass surfaces. No purple / neon. Contrast table lives with the colours below.
 * Hairlines are decorative structure only (never the sole carrier of meaning).
 */
const config: Config = {
  /* The scheme is `html.dark` (not data-theme: that attribute is a legacy styling hook). */
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        /* Every colour token is a CSS variable in "R G B" channel form, defined in
           src/app/globals.css (light in :root, dark in html.dark), so all opacity
           modifiers (bg-ink/90, text-bone/[0.21], from-ink …) keep working.
           Token names come from the old dark theme:
             ink  = page / surface        bone = primary text
             ash  = secondary text        aqua = the one accent (friendly blue)
           WCAG AA contrast tables for BOTH schemes sit next to the values in globals.css. */
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          850: "rgb(var(--ink-850) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
        },
        bone: {
          DEFAULT: "rgb(var(--bone) / <alpha-value>)",
          50: "rgb(var(--bone-50) / <alpha-value>)",
          100: "rgb(var(--bone-100) / <alpha-value>)",
          200: "rgb(var(--bone-200) / <alpha-value>)",
          300: "rgb(var(--bone-300) / <alpha-value>)",
        },
        muted: "rgb(var(--muted) / <alpha-value>)",
        ash: "rgb(var(--ash) / <alpha-value>)",
        hairline: {
          light: "rgb(var(--hairline) / <alpha-value>)",
          dark: "rgb(var(--hairline) / <alpha-value>)",
        },
        signal: {
          DEFAULT: "rgb(var(--signal) / <alpha-value>)",
          deep: "rgb(var(--signal-deep) / <alpha-value>)",
        },
        /* Brand accent = friendly blue. Fills take ink text on top. */
        aqua: {
          DEFAULT: "rgb(var(--aqua) / <alpha-value>)",
          deep: "rgb(var(--aqua-deep) / <alpha-value>)",
          glow: "rgb(var(--aqua-glow) / <alpha-value>)",
          hi: "rgb(var(--aqua-hi) / <alpha-value>)",
          /* Text on pale cards: AA on bone-50 in dark mode. */
          "on-pale": "rgb(var(--aqua-on-pale) / <alpha-value>)",
        },
        /* Ambient tints — decorative backgrounds only, never text. */
        sand: "rgb(var(--sand) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
        ember: "rgb(var(--ember) / <alpha-value>)",
        live: "rgb(var(--live) / <alpha-value>)",
      },
      fontFamily: {
        /* Headings = Source Serif 4 (brand). */
        display: [
          ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
          { fontVariationSettings: '"wght" 700' },
        ],
        /* Accent words in the same serif, italic. */
        serif: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
        /* Body = Work Sans (brand). */
        sans: ["var(--font-sans)", "system-ui", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(2.6rem, 8vw, 8.25rem)", { lineHeight: "0.94", letterSpacing: "-0.055em" }],
        "display-lg": ["clamp(2.4rem, 5.4vw, 5.5rem)", { lineHeight: "0.98", letterSpacing: "-0.045em" }],
        "display-md": ["clamp(1.9rem, 3.6vw, 3.4rem)", { lineHeight: "1.04", letterSpacing: "-0.035em" }],
        micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
      },
      maxWidth: {
        frame: "90rem",
      },
      borderRadius: {
        "glass-sm": "14px",
        glass: "22px",
        "glass-lg": "30px",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "450ms",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "live-pulse": {
          "0%": { transform: "scale(1)", opacity: "0.7" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
        caret: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "20%": { transform: "translate(-7%, 4%)" },
          "40%": { transform: "translate(5%, -6%)" },
          "60%": { transform: "translate(-4%, -3%)" },
          "80%": { transform: "translate(6%, 5%)" },
        },
      },
      animation: {
        "live-pulse": "live-pulse 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        caret: "caret 1s steps(1) infinite",
        grain: "grain 0.9s steps(1) infinite",
      },
    },
  },
  plugins: [
    /* `pin:` = the window can hold a pinned scroll scene near full size (wide AND tall).
       A variant, not a screen: an extra screen would break the max-* screen variants.
       Keep the query in sync with `pin` in src/context/SceneContext.tsx. */
    plugin(({ addVariant }) => {
      addVariant("pin", "@media (min-width: 1280px) and (min-height: 840px)");
    }),
  ],
};

export default config;
