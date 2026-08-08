/**
 * Signature element: a hand-chalked circular score dial.
 * The arc uses a rough SVG filter so it reads as chalk-on-board rather
 * than a clean vector gauge.
 */
export default function ScoreGauge({ score, max = 10 }) {
  const pct = Math.max(0, Math.min(1, score / max));
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * pct;

  const tone =
    pct >= 0.7 ? "var(--color-amber)" : pct >= 0.4 ? "var(--color-chalk)" : "var(--color-coral)";

  return (
    <div className="relative w-44 h-44 sm:w-52 sm:h-52 shrink-0" role="img" aria-label={`Score: ${score} out of ${max}`}>
      <svg viewBox="0 0 180 180" className="w-full h-full -rotate-90">
        <defs>
          <filter id="chalkRough" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.15" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" />
          </filter>
        </defs>
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(238,242,234,0.15)"
          strokeWidth="10"
          strokeDasharray="1 7"
          strokeLinecap="round"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={tone}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          filter="url(#chalkRough)"
          style={{ transition: "stroke-dasharray 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-6xl sm:text-7xl leading-none" style={{ color: tone }}>
          {score}
        </span>
        <span className="text-xs tracking-[0.2em] text-chalk-dim mt-1">OUT OF {max}</span>
      </div>
    </div>
  );
}
