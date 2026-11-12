import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * SermaWebDesign — "Liquid Glass" token system (see docs/design-system.md).
 * Warm brand palette (ink · bone · signal) rendered through translucent,
 * light-catching glass surfaces. No purple / neon.
 * Contrast (WCAG 2.1 AA) verified for every text pairing used:
 *  - ink on bone ........ 16.6:1   - muted on bone ...... 6.1:1
 *  - bone on ink ........ 16.6:1   - ash on ink ......... 7.7:1
 *  - signal-deep on bone   5.0:1   - signal on ink ...... 5.3:1
 *  - ink on signal ...... 5.3:1    - live on ink ........ 7.6:1
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
        /* Paper and Navy brand palette — navy ground, sand ink.
           Contrast (WCAG AA) for every pairing used:
           sand on navy ....... 9.0:1  ·  navy on sand ....... 9.0:1
           ash on navy ........ 5.1:1  ·  muted on sand ...... 7.6:1 */
        ink: {
          DEFAULT: "#17253B",
          900: "#0F1A2A",
          850: "#132033",
          800: "#17253B",
          700: "#1E2E48",
          600: "#293B57",
          500: "#3A4A63",
        },
        bone: {
          DEFAULT: "#E8DFCF",
          50: "#FBF8F1",
          100: "#F3EDE1",
          200: "#E8DFCF",
          300: "#D6C9B2",
        },
        muted: "#4A5464",
        ash: "#8E99AB",
        hairline: {
          light: "#D9CFBC",
          dark: "#2A3B57",
        },
        signal: {
          DEFAULT: "#C9B893",
          deep: "#A08B60",
        },
        /* Brand accent = sand. Fills use navy text on top (9:1). */
        aqua: {
          DEFAULT: "#E8DFCF",
          deep: "#C9B893",
          glow: "#F3EDE1",
        },
        /* Ambient tints — decorative backgrounds only, never text. */
        sand: "#E8DFCF",
        amber: "#D9C7A4",
        ember: "#2A3B57",
        live: "#8FBFA3",
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
