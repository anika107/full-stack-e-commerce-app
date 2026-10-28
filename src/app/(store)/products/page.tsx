import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublicCategories, getStorefrontProducts, PRODUCT_SORTS } from "@/lib/services";
import { NavSelect } from "@/components/ui/nav-select";
import { Pagination } from "@/components/ui/pagination";
import { ProductCard } from "@/components/storefront/product-card";
import { Icon } from "@/components/admin/icons";
import { StorefrontGridSkeleton } from "@/components/skeletons";
import { buildUrl, firstParam } from "@/lib/url";
import { pageWindow, parsePage } from "@/lib/pagination";

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
  const [categories, result] = await Promise.all([
    getPublicCategories(),
    getStorefrontProducts({
      q: firstParam(params.q),
      category: firstParam(params.category),
      sort: firstParam(params.sort),
      page: parsePage(firstParam(params.page)),
      pageSize: PAGE_SIZE,
    }),
  ]);

  // The service validates q/category/sort and echoes the effective values.
  const { q, category, sort } = result;
  const { totalPages } = pageWindow(result.total, result.page, result.pageSize);
  const categoryNames = categories.map((c) => c.name);

  const href = (target: number) =>
    buildUrl("/products", {
      q: q || undefined,
      category: category === "all" ? undefined : category,
      sort: sort === "newest" ? undefined : sort,
      page: target > 1 ? target : undefined,
    });

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
            <ProductCard key={p.id} product={p} />
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
        <Pagination
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
          hrefFor={href}
          tone="store"
        />
      )}
    </div>
  );
}
