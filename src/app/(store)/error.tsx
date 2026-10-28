"use client";

import { useEffect } from "react";
import Link from "next/link";

// Catches render/data errors in storefront pages; the storefront layout
// (header, cart, footer) stays intact above this boundary.
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
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-28 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
        <span className="text-xl">!</span>
      </span>
      <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        We couldn&apos;t load this page. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={retry}
          className="inline-flex h-11 items-center rounded-full bg-stone-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-stone-300 px-6 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-50 dark:hover:text-stone-50"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
