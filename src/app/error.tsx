"use client";

import { useEffect } from "react";
import Link from "next/link";

// Root fallback for errors below the root layout (e.g. a storefront layout
// failure). Area-specific boundaries in (store)/ and admin/(panel)/ catch
// everything else.
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-6 py-20 text-center dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
        An unexpected error occurred. Please try again.
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
