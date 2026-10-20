import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getFeaturedProducts, getNewArrivals, getPublicCategories } from "@/lib/services";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductImage } from "@/components/storefront/product-image";
import { Icon, type IconName } from "@/components/admin/icons";
import { StorefrontGridSkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "ShopPilot — Thoughtful tech for everyday life" };

const CATEGORY_ICONS: Record<string, IconName> = {
  Audio: "speaker",
  Wearables: "watch",
  "Smart Home": "home",
  Accessories: "plug",
  Gaming: "gamepad",
  Cameras: "camera",
};

export default function Page() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(59,130,246,0.08), transparent)",
          }}
        />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-20 pt-20 text-center md:pb-28 md:pt-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            New season · New gear
          </p>
          <h1 className="font-display mt-6 text-5xl font-semibold leading-[1.05] tracking-tight text-stone-950 dark:text-stone-50 md:text-7xl">
            Everyday tech,
            <br />
            <span className="text-blue-600">beautifully</span> curated.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-stone-500 dark:text-stone-400 md:text-lg">
            Audio, wearables, smart home, and gaming — hand-picked products at honest
            prices, shipped fast.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-stone-950 px-7 text-sm font-semibold text-white transition-all hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
            >
              Shop the collection
              <Icon name="chevron-right" className="h-4 w-4" />
            </Link>
            <Link
              href="#featured"
              className="inline-flex h-12 items-center rounded-full border border-stone-300 px-7 text-sm font-semibold text-stone-700 transition-colors hover:border-stone-950 hover:text-stone-950 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-50 dark:hover:text-stone-50"
            >
              Featured
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <Suspense fallback={null}>
        <CategoryStrip />
      </Suspense>

      {/* Featured */}
      <section id="featured" className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Best sellers
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 md:text-4xl">
              Featured
            </h2>
          </div>
          <Link
            href="/products"
            className="group flex shrink-0 items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-50"
          >
            View all
            <Icon
              name="chevron-right"
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
        <div className="mt-9">
          <Suspense fallback={<StorefrontGridSkeleton count={8} />}>
            <FeaturedGrid />
          </Suspense>
        </div>
      </section>

      {/* Editorial band */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid overflow-hidden rounded-4xl bg-stone-950 text-white lg:grid-cols-2">
          <div className="flex flex-col justify-center px-8 py-14 md:px-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
              Why ShopPilot
            </p>
            <h2 className="font-display mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Fewer, better things.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-stone-400 md:text-base">
              We stock a tight catalog instead of everything. Every product earns its place
              on real customer demand — no filler, no gimmicks.
            </p>
            <Link
              href="/products"
              className="mt-8 inline-flex h-11 w-fit items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-stone-950 transition-colors hover:bg-stone-200"
            >
              Explore the catalog
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 p-8 md:p-12">
            <ProductImage category="Audio" name="Audio" className="aspect-square rounded-2xl" />
            <ProductImage category="Cameras" name="Cameras" className="aspect-square rounded-2xl" />
            <ProductImage category="Gaming" name="Gaming" className="aspect-square rounded-2xl" />
            <ProductImage category="Wearables" name="Wearables" className="aspect-square rounded-2xl" />
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="border-t border-stone-200/70 dark:border-stone-800/70">
        <div className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                Just in
              </p>
              <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 md:text-4xl">
                New arrivals
              </h2>
            </div>
            <Link
              href="/products?sort=newest"
              className="group flex shrink-0 items-center gap-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-950 dark:text-stone-400 dark:hover:text-stone-50"
            >
              See what&apos;s new
              <Icon
                name="chevron-right"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
          <div className="mt-9">
            <Suspense fallback={<StorefrontGridSkeleton count={4} />}>
              <NewArrivalsGrid />
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}

async function CategoryStrip() {
  const categories = await getPublicCategories();
  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {categories.map((c, i) => (
          <Link
            key={c.id}
            href={`/products?category=${encodeURIComponent(c.name)}`}
            className="group flex flex-col items-center gap-3 rounded-3xl bg-white px-4 py-6 text-center ring-1 ring-stone-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-900/5 dark:bg-stone-900 dark:ring-stone-800/60"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105"
              style={{
                color: `var(--viz-series-${(i % 6) + 1})`,
                backgroundColor: `color-mix(in srgb, var(--viz-series-${(i % 6) + 1}) 12%, transparent)`,
              }}
            >
              <Icon name={CATEGORY_ICONS[c.name] ?? "tags"} className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
              {c.name}
            </span>
            <span className="text-xs text-stone-400">{c.count} items</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

async function FeaturedGrid() {
  const products = await getFeaturedProducts(8);
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

async function NewArrivalsGrid() {
  const products = await getNewArrivals(4);
  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showNew />
      ))}
    </div>
  );
}
