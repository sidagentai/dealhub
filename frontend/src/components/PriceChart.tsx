import type { PricePoint } from "@/lib/types";

/** Minimal dependency-free price history line. Rendered server-side. */
export default function PriceChart({ history }: { history: PricePoint[] }) {
  if (history.length < 2) return null;

  const width = 480;
  const height = 120;
  const pad = 8;
  const prices = history.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const span = max - min || 1;

  const points = history
    .map((p, i) => {
      const x = pad + (i / (history.length - 1)) * (width - 2 * pad);
      const y = pad + (1 - (p.price - min) / span) * (height - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const first = history[0].price;
  const last = history[history.length - 1].price;

  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-dim">
        Price history
      </h2>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-md rounded-lg border border-line bg-surface"
        role="img"
        aria-label={`Price went from $${first} to $${last} over ${history.length} recorded points`}
      >
        <polyline
          points={points}
          fill="none"
          stroke="#4cb782"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <p className="mt-1 text-xs text-ink-dim">
        ${min} – ${max} across {history.length} recorded prices
      </p>
    </div>
  );
}
