import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * SermaWebDesign — "Liquid Glass" token system (see docs/design-system.md).
 * Light "morning sky" palette rendered through translucent, light-catching
 * glass surfaces. No purple / neon. Contrast table lives with the colours below.
 * Hairlines are decorative structure only (never the sole carrier of meaning).
 */
const config: Config = {
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
        /* "Morning sky" palette — white ground, soft sky-blue washes, deep blue ink.
           Token names are kept from the old dark theme so every component re-themes at once:
             ink  = page / surface (whites and pale blues)   bone = primary text (deep blue)
             ash  = secondary text                           aqua = the one accent (friendly blue)
           Contrast (WCAG AA) for every pairing used:
             bone on ink ...... 12.4:1  ·  ash on ink ........ 5.4:1
             aqua on ink ....... 5.1:1  ·  ink on aqua ....... 5.1:1
             bone on sky-btn ... 10.0:1 ·  live on ink ....... 5.1:1 */
        ink: {
          DEFAULT: "#F7FAFE",
          900: "#FFFFFF",
          850: "#FBFDFF",
          800: "#F7FAFE",
          700: "#EEF5FD",
          600: "#E2EDFA",
          500: "#CFE0F5",
        },
        bone: {
          DEFAULT: "#15315A",
          50: "#0D2447",
          100: "#112B52",
          200: "#15315A",
          300: "#2E4C78",
        },
        muted: "#4A5F7E",
        ash: "#52698A",
        hairline: {
          light: "#D6E4F4",
          dark: "#D6E4F4",
        },
        signal: {
          DEFAULT: "#9CCBF6",
          deep: "#2A6BBF",
        },
        /* Brand accent = friendly blue. Fills take white (ink) text on top (5.1:1). */
        aqua: {
          DEFAULT: "#2A6BBF",
          deep: "#1F58A3",
          glow: "#5A97E0",
        },
        /* Ambient tints — decorative backgrounds only, never text. */
        sand: "#DCEBFB",
        amber: "#BCD9F5",
        ember: "#E6F0FB",
        live: "#1F7A50",
      },
      fontFamily: {
        /* Headings = Source Serif 4 (brand). */
        display: [
          ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
          { fontVariationSettings: '"wght" 600' },
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
        "scroll-cue": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
      },
      animation: {
        "live-pulse": "live-pulse 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        caret: "caret 1s steps(1) infinite",
        grain: "grain 0.9s steps(1) infinite",
        "scroll-cue": "scroll-cue 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
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
