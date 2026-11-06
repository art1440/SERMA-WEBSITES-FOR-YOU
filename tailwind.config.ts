import type { Config } from "tailwindcss";

/**
 * "Tactile Swiss / Quiet Luxury" token system.
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
        live: "#5DB37E",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(2.75rem, 9vw, 9.5rem)", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.6rem, 6vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.015em" }],
        "display-md": ["clamp(2rem, 4vw, 3.75rem)", { lineHeight: "1", letterSpacing: "-0.01em" }],
        micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
      },
      maxWidth: {
        frame: "90rem",
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
        "scroll-cue": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
      },
      animation: {
        "live-pulse": "live-pulse 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        caret: "caret 1s steps(1) infinite",
        "scroll-cue": "scroll-cue 1.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
