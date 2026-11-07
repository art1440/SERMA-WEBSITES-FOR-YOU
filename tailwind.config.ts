import type { Config } from "tailwindcss";

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
        ink: {
          DEFAULT: "#0D0D0B",
          900: "#0D0D0B",
          850: "#121210",
          800: "#171714",
          700: "#1F1F1B",
          600: "#2A2A25",
          500: "#3A3A33",
        },
        bone: {
          DEFAULT: "#F1EDE4",
          50: "#FAF8F3",
          100: "#F1EDE4",
          200: "#E6E0D4",
          300: "#D6CFC0",
        },
        muted: "#5C584F",
        ash: "#A8A296",
        hairline: {
          light: "#CFC8BA",
          dark: "#2E2E29",
        },
        signal: {
          DEFAULT: "#E5582A",
          deep: "#B23F14",
        },
        /* Ambient light-field tints — decorative backgrounds only, never text. */
        sand: "#E8DCC6",
        amber: "#F0A35C",
        ember: "#7A2E12",
        live: "#5DB37E",
      },
      fontFamily: {
        /* Display = Geist at a heavier optical weight (modern, Apple-like headlines). */
        display: [
          ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
          { fontVariationSettings: '"wght" 580' },
        ],
        /* Serif = Instrument Serif — used ONLY for italic accent words. */
        serif: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
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
  plugins: [],
};

export default config;
