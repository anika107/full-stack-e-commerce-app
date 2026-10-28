import { Icon } from "../icons";
import type { Kpi } from "@/lib/services";

// 12-point sparkline: de-emphasis hue for the history, accent for the current period.
function Sparkline({ data }: { data: number[] }) {
  const w = 76;
  const h = 26;
  const min = Math.min(...data);
  const span = Math.max(...data) - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * w,
    h - 3 - ((v - min) / span) * (h - 8),
  ]);
  const path = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" className="shrink-0">
      <path
        d={path}
        fill="none"
        stroke="var(--viz-ink-muted)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1={prev[0]}
        y1={prev[1]}
        x2={last[0]}
        y2={last[1]}
        stroke="var(--viz-series-1)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill="var(--viz-series-1)" />
    </svg>
  );
}

export function StatTile({ kpi }: { kpi: Kpi }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
        {kpi.spark ? <Sparkline data={kpi.spark} /> : null}
      </div>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {kpi.value}
      </p>
      {kpi.delta ? (
        <p className="mt-1 flex items-center gap-1 text-xs">
          <Icon
            name={kpi.delta.direction === "up" ? "trending-up" : "trending-down"}
            className="h-3.5 w-3.5"
            style={{ color: kpi.delta.good ? "var(--viz-delta-good)" : "var(--viz-delta-bad)" }}
          />
          <span
            className="font-medium"
            style={{ color: kpi.delta.good ? "var(--viz-delta-good)" : "var(--viz-delta-bad)" }}
          >
            {kpi.delta.text}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">{kpi.delta.period}</span>
        </p>
      ) : (
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">live count</p>
      )}
    </div>
  );
}
