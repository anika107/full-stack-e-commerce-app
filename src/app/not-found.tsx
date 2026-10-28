import Link from "next/link";

// Shared 404 (used by notFound() and unmatched routes). Renders inside the
// active layout, so storefront pages keep their header/footer chrome.
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">404</p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
        Page not found
      </h1>
      <p className="mt-3 max-w-sm text-sm text-stone-500 dark:text-stone-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-stone-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
        >
          Back to store
        </Link>
        <Link
          href="/products"
          className="inline-flex h-11 items-center rounded-full border border-stone-300 px-6 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-50 dark:hover:text-stone-50"
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}
