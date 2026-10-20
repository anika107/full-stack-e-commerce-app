"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/admin/icons";

// A select that navigates with ?<param>=<value> so the server component
// re-renders with the new filter — no client-side data fetching. Params
// listed in resetParams (e.g. pagination) are dropped when the filter changes.
// variant="pill" matches the storefront design language; default is admin.
export function NavSelect({
  param,
  value,
  options,
  ariaLabel,
  resetParams = [],
  variant = "default",
}: {
  param: string;
  value: string;
  options: { value: string; label: string }[];
  ariaLabel: string;
  resetParams?: string[];
  variant?: "default" | "pill";
}) {
  const router = useRouter();
  const pathname = usePathname();

  const pill = variant === "pill";
  const selectClass = pill
    ? "h-10 appearance-none rounded-full border border-stone-200 bg-white pl-4 pr-9 text-sm text-stone-700 outline-none transition-colors focus:border-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:focus:border-stone-600"
    : "h-9 appearance-none rounded-lg border border-zinc-200 bg-white pl-3 pr-8 text-sm text-zinc-700 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-600";

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
        className={selectClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        className={`pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400 ${
          pill ? "right-3.5" : "right-2.5 text-zinc-400"
        }`}
      />
    </div>
  );
}
