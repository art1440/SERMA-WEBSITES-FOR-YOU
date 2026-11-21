import { ImageResponse } from "next/og";

/** Rendered once at build time; works with `output: "export"`. */
export const dynamic = "force-static";
export const alt = "SERMA — Premium websites that get you picked first.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand values from tailwind.config.ts / globals.css (light scheme). Allowed here: the image renders outside the page.
const BRAND = {
  skyTop: "#F7FAFE",
  skyMid: "#DCEBFB",
  skyLow: "#B5D3F3",
  text: "#15315A",
  textSoft: "#526992",
  accent: "#2A6BBF",
  accentGlow: "#5A97E0",
};

export default function Image() {
  const lines = [0, 1, 2, 3, 4, 5];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          position: "relative",
          background: `linear-gradient(160deg, ${BRAND.skyTop} 0%, ${BRAND.skyMid} 55%, ${BRAND.skyLow} 100%)`,
        }}
      >
        {/* Subtle line motif: soft diagonal hairlines in the lower right. */}
        <svg
          width="1200"
          height="630"
          viewBox="0 0 1200 630"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {lines.map((i) => (
            <path
              key={i}
              d={`M ${520 + i * 60} 700 C ${760 + i * 40} 460, ${900 + i * 30} 300, 1260 ${180 + i * 44}`}
              fill="none"
              stroke={BRAND.accentGlow}
              strokeOpacity={0.14 + i * 0.03}
              strokeWidth={1.5}
            />
          ))}
        </svg>

        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              background: BRAND.accent,
              marginRight: 16,
            }}
          />
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: 10,
              color: BRAND.text,
            }}
          >
            SERMA
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: -3,
              color: BRAND.text,
              maxWidth: 900,
            }}
          >
            Premium websites that get you picked first.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: BRAND.textSoft }}>
            Built for you. See it finished before you pay.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
