"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./icons";

const OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
];

// Navigates with ?range=... so the server component re-renders with the new
// window — no client-side data fetching needed.
export function RangeSelect({ range }: { range: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="relative">
      <select
        aria-label="Date range"
        value={range}
        onChange={(e) => router.push(`${pathname}?range=${e.target.value}`)}
        className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-700 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-600"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
      />
    </div>
  );
}
