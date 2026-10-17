export function AppLogo({
  className,
  ink = "currentColor",
  accent = "var(--cta)",
  tile,
  scale = 1,
}: {
  className?: string;
  /** Colour of the three squares. */
  ink?: string;
  /** Colour of the dot. */
  accent?: string;
  /** Optional rounded-square background; `radius` is in the 512 viewBox. */
  tile?: { fill: string; radius: number };
  /** Scales the drawing around the centre (maskable icons need a safe zone). */
  scale?: number;
}) {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: decorative, hidden from assistive tech
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      aria-hidden
      className={className}
    >
      {tile ? (
        <rect width="512" height="512" rx={tile.radius} fill={tile.fill} />
      ) : null}
      <g transform={`translate(256 256) scale(${scale}) translate(-256 -256)`}>
        <g fill={ink}>
          <rect
            x={FIRST}
            y={FIRST}
            width={SQUARE}
            height={SQUARE}
            rx={RADIUS}
          />
          <rect
            x={SECOND}
            y={FIRST}
            width={SQUARE}
            height={SQUARE}
            rx={RADIUS}
          />
          <rect
            x={FIRST}
            y={SECOND}
            width={SQUARE}
            height={SQUARE}
            rx={RADIUS}
          />
        </g>
        <circle
          cx={RECORD_CENTER}
          cy={RECORD_CENTER}
          r={SQUARE / 2}
          fill={accent}
        />
      </g>
    </svg>
  );
}

// 2x2 grid in the 512 viewBox: 160px cells, 16px gap, 88px margin.
const SQUARE = 160;
const RADIUS = 40;
const FIRST = 88;
const SECOND = 264;
const RECORD_CENTER = SECOND + SQUARE / 2;
