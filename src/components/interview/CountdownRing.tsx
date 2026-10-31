const SIZE = 128;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CountdownRingProps {
  remaining: number;
  total: number;
}

export function CountdownRing({ remaining, total }: CountdownRingProps) {
  const fraction = total > 0 ? remaining / total : 0;
  const offset = CIRCUMFERENCE * (1 - fraction);
  const stroke =
    remaining <= 10
      ? "var(--destructive)"
      : remaining <= 30
        ? "var(--neon-violet)"
        : "var(--neon-cyan)";

  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="oklch(1 0 0 / 0.08)"
          strokeWidth={STROKE}
        />
        <circle
          className="ring-arc"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{ color: stroke }}
        >
          {remaining}
        </span>
        <span className="text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">
          seconds
        </span>
      </div>
    </div>
  );
}
