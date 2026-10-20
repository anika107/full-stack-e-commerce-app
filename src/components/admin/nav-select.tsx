"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./icons";

// A select that navigates with ?<param>=<value> so the server component
// re-renders with the new filter — no client-side data fetching. Params
// listed in resetParams (e.g. pagination) are dropped when the filter changes.
export function NavSelect({
  param,
  value,
  options,
  ariaLabel,
  resetParams = [],
}: {
  param: string;
  value: string;
  options: { value: string; label: string }[];
  ariaLabel: string;
  resetParams?: string[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => {
          const params = new URLSearchParams(window.location.search);
          params.set(param, e.target.value);
          for (const key of resetParams) params.delete(key);
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-700 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-600"
      >
        {options.map((o) => (
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
