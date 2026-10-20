import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublicCategories, getStorefrontProducts, isProductSort, PRODUCT_SORTS } from "@/lib/services";
import { NavSelect } from "@/components/ui/nav-select";
import { ProductCard } from "@/components/storefront/product-card";
import { Icon } from "@/components/admin/icons";
import { StorefrontGridSkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "Shop" };

const PAGE_SIZE = 12;

const SORT_OPTIONS = Object.entries(PRODUCT_SORTS).map(([value, { label }]) => ({ value, label }));

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14">
      <Suspense
        fallback={
          <div className="space-y-10">
            <div className="h-24 animate-pulse rounded-3xl bg-stone-200 dark:bg-stone-800" />
            <StorefrontGridSkeleton count={8} />
          </div>
        }
      >
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Catalog({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const sort = params.sort && isProductSort(params.sort) ? params.sort : "newest";
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, result] = await Promise.all([
    getPublicCategories(),
    getStorefrontProducts({ q, category: params.category ?? "all", sort, page, pageSize: PAGE_SIZE }),
  ]);

  const categoryNames = categories.map((c) => c.name);
  const category =
    params.category && categoryNames.includes(params.category) ? params.category : "all";
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
  const clampedPage = Math.min(page, totalPages);

  const href = (target: number) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (category !== "all") search.set("category", category);
    if (sort !== "newest") search.set("sort", sort);
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Catalog
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
            {category !== "all" ? category : "All products"}
          </h1>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {result.total} products
            {q ? ` matching “${q}”` : ""}
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <form action="/products" className="relative min-w-0">
            <Icon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              aria-label="Search products"
              className="h-10 w-56 rounded-full border border-stone-200 bg-white pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-stone-400 focus:border-stone-400 dark:border-stone-800 dark:bg-stone-900 dark:focus:border-stone-600"
            />
            {category !== "all" ? <input type="hidden" name="category" value={category} /> : null}
            {sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}
          </form>
          <NavSelect
            param="category"
            value={category}
            options={[
              { value: "all", label: "All categories" },
              ...categoryNames.map((name) => ({ value: name, label: name })),
            ]}
            ariaLabel="Filter by category"
            resetParams={["page"]}
            variant="pill"
          />
          <NavSelect
            param="sort"
            value={sort}
            options={SORT_OPTIONS}
            ariaLabel="Sort products"
            resetParams={["page"]}
            variant="pill"
          />
        </div>
      </div>

      {/* Grid */}
      {result.rows.length > 0 ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
          {result.rows.map((p) => (
            <ProductCard key={p.id} product={p} showNew />
          ))}
        </div>
      ) : (
        <div className="rounded-4xl border border-dashed border-stone-300 py-24 text-center dark:border-stone-700">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
            <Icon name="search" className="h-6 w-6 text-stone-400" />
          </span>
          <p className="mt-5 font-display text-xl font-semibold text-stone-900 dark:text-stone-50">
            No products found
          </p>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            Try a different search or category.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-10 items-center rounded-full bg-stone-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
          >
            Clear filters
          </Link>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Page {clampedPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {clampedPage > 1 ? (
              <Link
                href={href(clampedPage - 1)}
                className="flex h-9 items-center rounded-full border border-stone-200 px-4 text-xs font-medium text-stone-600 transition-colors hover:border-stone-950 hover:text-stone-950 dark:border-stone-800 dark:text-stone-400 dark:hover:border-stone-50 dark:hover:text-stone-50"
              >
                Previous
              </Link>
            ) : (
              <span className="flex h-9 items-center rounded-full border border-stone-200 px-4 text-xs font-medium text-stone-300 dark:border-stone-800 dark:text-stone-600">
                Previous
              </span>
            )}
            {clampedPage < totalPages ? (
              <Link
                href={href(clampedPage + 1)}
                className="flex h-9 items-center rounded-full border border-stone-200 px-4 text-xs font-medium text-stone-600 transition-colors hover:border-stone-950 hover:text-stone-950 dark:border-stone-800 dark:text-stone-400 dark:hover:border-stone-50 dark:hover:text-stone-50"
              >
                Next
              </Link>
            ) : (
              <span className="flex h-9 items-center rounded-full border border-stone-200 px-4 text-xs font-medium text-stone-300 dark:border-stone-800 dark:text-stone-600">
                Next
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
