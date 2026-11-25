/** Service-area radius diagram: Lakeview at the centre, 10 and 20 mile rings, neighborhoods as dots. Decorative (aria-hidden); the names are listed in text beside it. */
export function RadiusMap({
  names,
  rings,
}: {
  names: string[];
  rings: [string, string];
}) {
  // Hand-placed in the 500 x 500 viewBox (rings r=100 and r=200 around 250,250):
  // [x, y, label side: start = right of the pin, end = left, below = centred under it]. Order matches the neighborhoods list; Lakeview is the centre.
  const spots: [number, number, "start" | "end" | "below"][] = [
    [250, 250, "start"],
    [268, 118, "start"],
    [342, 186, "start"],
    [100, 250, "below"],
    [360, 380, "end"],
    [190, 130, "end"],
    [186, 352, "end"],
    [214, 432, "start"],
  ];
  const R = 200;
  return (
    <svg aria-hidden="true" viewBox="0 0 500 500" className="h-auto w-full">
      <circle
        cx="250"
        cy="250"
        r={R}
        fill="#EAF6F4"
        stroke="#0F8F80"
        strokeWidth="2"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      <circle
        cx="250"
        cy="250"
        r={R / 2}
        fill="#D5EEEA"
        stroke="#0F8F80"
        strokeWidth="1.5"
      />
      <path
        d="M250 30V470M30 250H470"
        stroke="#0C3A36"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      <g
        fontFamily="var(--demo-body)"
        fontSize="14"
        fontWeight="600"
        fill="#0A6B60"
      >
        <text x={250 + R / 2 + 8} y="243">
          {rings[0]}
        </text>
        <text x={250 + R + 8} y="243">
          {rings[1]}
        </text>
      </g>
      {names.map((n, i) => {
        const [x, y, side] = spots[i] ?? [250, 250, "start"];
        const center = i === 0;
        return (
          <g key={n}>
            {center ? (
              <>
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  fill="#FFD23F"
                  stroke="#0C3A36"
                  strokeWidth="3"
                />
                <circle cx={x} cy={y} r="4" fill="#0C3A36" />
              </>
            ) : (
              <circle cx={x} cy={y} r="5.5" fill="#0C3A36" />
            )}
            <text
              x={
                center || side === "below"
                  ? x
                  : side === "end"
                    ? x - 11
                    : x + 11
              }
              y={center ? y + 40 : side === "below" ? y + 24 : y + 5}
              textAnchor={center || side === "below" ? "middle" : side}
              fontFamily="var(--demo-display)"
              fontSize={center ? 20 : 15}
              fontWeight={center ? 800 : 600}
              fill="#0C3A36"
            >
              {n}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
