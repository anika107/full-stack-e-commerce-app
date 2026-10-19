import type { ReactNode } from "react";

// Status colors are fixed and never themed (dataviz skill: status palette).
// They always ship with an icon + label, never color alone.
export const STATUS_COLORS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
  neutral: "#898781",
} as const;

export type BadgeTone = keyof typeof STATUS_COLORS;

const BADGE_WASH: Record<BadgeTone, string> = {
  good: "bg-emerald-50 dark:bg-emerald-400/10",
  warning: "bg-amber-50 dark:bg-amber-400/10",
  serious: "bg-orange-50 dark:bg-orange-400/10",
  critical: "bg-red-50 dark:bg-red-400/10",
  neutral: "bg-zinc-100 dark:bg-zinc-800",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 ${BADGE_WASH[tone]}`}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: STATUS_COLORS[tone] }}
      />
      {children}
    </span>
  );
}
