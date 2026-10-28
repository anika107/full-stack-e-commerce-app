"use client";

import { useEffect } from "react";
import Link from "next/link";

// Catches render/data errors in panel pages; the admin layout (sidebar,
// session header) stays intact above this boundary.
export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white px-6 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-lg dark:bg-zinc-800">
        !
      </span>
      <h1 className="mt-5 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        We couldn&apos;t load this page. Please try again.
      </p>
      <div className="mt-7 flex items-center gap-3">
        <button
          onClick={retry}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Try again
        </button>
        <Link
          href="/admin"
          className="inline-flex h-9 items-center rounded-lg border border-zinc-200 px-3.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
