import Link from "next/link";
import { pageWindow } from "@/lib/pagination";

// Shared Previous/Next footer for list pages. `hrefFor` keeps the caller's
// filter state in the URL; `tone` matches the surrounding design language.
export function Pagination({
  total,
  page,
  pageSize,
  hrefFor,
  tone = "admin",
}: {
  total: number;
  page: number;
  pageSize: number;
  hrefFor: (page: number) => string;
  tone?: "admin" | "store";
}) {
  const { totalPages, clampedPage } = pageWindow(total, page, pageSize);
  const store = tone === "store";

  const labelClass = store
    ? "text-xs text-stone-500 dark:text-stone-400"
    : "text-xs text-zinc-500 dark:text-zinc-400";
  const linkClass = store
    ? "flex h-9 items-center rounded-full border border-stone-200 px-4 text-xs font-medium text-stone-600 transition-colors hover:border-stone-950 hover:text-stone-950 dark:border-stone-800 dark:text-stone-400 dark:hover:border-stone-50 dark:hover:text-stone-50"
    : "flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";
  const disabledClass = store
    ? "flex h-9 items-center rounded-full border border-stone-200 px-4 text-xs font-medium text-stone-300 dark:border-stone-800 dark:text-stone-600"
    : "flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-600";

  return (
    <div className="flex items-center justify-between">
      <p className={labelClass}>
        Page {clampedPage} of {totalPages}
      </p>
      <div className={store ? "flex gap-2" : "flex gap-1"}>
        {clampedPage > 1 ? (
          <Link href={hrefFor(clampedPage - 1)} className={linkClass}>
            Previous
          </Link>
        ) : (
          <span className={disabledClass}>Previous</span>
        )}
        {clampedPage < totalPages ? (
          <Link href={hrefFor(clampedPage + 1)} className={linkClass}>
            Next
          </Link>
        ) : (
          <span className={disabledClass}>Next</span>
        )}
      </div>
    </div>
  );
}
