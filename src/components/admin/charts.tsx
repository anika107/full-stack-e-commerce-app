"use client";

import { useRef, useState } from "react";
import type { RevenuePoint } from "@/lib/types";

// Single-series area chart. Marks follow the dataviz skill specs: 2px line,
// ~10% area wash, 2px surface ring on dots, hairline grid, recessive ink.
// Colors come from the validated palette tokens in globals.css (--viz-*).

const W = 640;
const H = 240;
const PAD = { top: 18, right: 70, bottom: 28, left: 40 };
const Y_MAX = 20; // $K
const TICKS = [0, 5, 10, 15, 20];

export function RevenueChart({
  data,
  caption = "Monthly revenue, November 2025 through October 2026",
}: {
  data: RevenuePoint[];
  caption?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const n = data.length;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (n - 1)) * plotW;
  const y = (v: number) => PAD.top + (1 - v / Y_MAX) * plotH;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} L${x(
    0,
  ).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} Z`;

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < n; i++) {
      const d = Math.abs(x(i) - px);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    setHover(nearest);
  }

  const hovered = hover === null ? null : data[hover];
  const tooltipLeft = hover === null ? 0 : Math.min(85, Math.max(12, (x(hover) / W) * 100));
  const tooltipTop = hovered ? (y(hovered.value) / H) * 100 : 0;
  const last = data[n - 1];

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHover(null)}
        aria-hidden="true"
      >
        {/* gridlines + y ticks */}
        {TICKS.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke={t === 0 ? "var(--viz-baseline)" : "var(--viz-gridline)"}
              strokeWidth={1}
            />
            <text x={PAD.left - 8} y={y(t) + 3} textAnchor="end" fontSize={10} fill="var(--viz-ink-muted)">
              {t === 0 ? "0" : `${t}K`}
            </text>
          </g>
        ))}
        {/* x labels */}
        {data.map((d, i) => (
          <text key={d.label} x={x(i)} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--viz-ink-muted)">
            {d.label.split(" ")[0]}
          </text>
        ))}
        {/* area + line */}
        <path d={areaPath} fill="var(--viz-series-1)" fillOpacity={0.1} />
        <path
          d={linePath}
          fill="none"
          stroke="var(--viz-series-1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* end dot + end label (selective direct label: endpoint only) */}
        <circle cx={x(n - 1)} cy={y(last.value)} r={6} fill="var(--viz-surface)" />
        <circle cx={x(n - 1)} cy={y(last.value)} r={4} fill="var(--viz-series-1)" />
        <text
          x={x(n - 1) + 10}
          y={y(last.value) - 8}
          fontSize={11}
          fontWeight={600}
          fill="var(--viz-ink-secondary)"
        >
          ${last.value.toFixed(1)}K
        </text>
        {/* crosshair + hover dot */}
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke="var(--viz-baseline)"
              strokeWidth={1}
            />
            <circle cx={x(hover)} cy={y(data[hover].value)} r={6} fill="var(--viz-surface)" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r={4} fill="var(--viz-series-1)" />
          </g>
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
          style={{
            left: `${tooltipLeft}%`,
            top: `${tooltipTop}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
          }}
        >
          <p className="text-[10px] leading-tight text-zinc-500 dark:text-zinc-400">{hovered.label}</p>
          <p className="text-xs font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            ${hovered.value.toFixed(1)}K
          </p>
        </div>
      )}

      {/* table view: every value reachable without the chart */}
      <table className="sr-only">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Revenue</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>${d.value.toFixed(1)}K</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
