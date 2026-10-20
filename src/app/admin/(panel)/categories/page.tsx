import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCategories } from "@/lib/services";
import { AddCategoryButton, RenameCategoryButton } from "@/components/admin/category-form";
import { Icon, type IconName } from "@/components/admin/icons";
import { PageHeader } from "@/components/admin/ui/page-header";

export const metadata: Metadata = { title: "Categories" };

// Presentation mapping for known categories; anything new falls back to a tag.
const CATEGORY_ICONS: Record<string, IconName> = {
  Audio: "speaker",
  Wearables: "watch",
  "Smart Home": "home",
  Accessories: "plug",
  Gaming: "gamepad",
  Cameras: "camera",
};

function CategoriesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CategoriesSkeleton />}>
      <CategoriesGrid />
    </Suspense>
  );
}

async function CategoriesGrid() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your catalog into browsable collections."
        actions={<AddCategoryButton />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c, i) => (
          <div
            key={c.id}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
          >
            <div className="flex items-start justify-between">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  color: `var(--viz-series-${(i % 6) + 1})`,
                  backgroundColor: `color-mix(in srgb, var(--viz-series-${(i % 6) + 1}) 12%, transparent)`,
                }}
              >
                <Icon name={CATEGORY_ICONS[c.name] ?? "tags"} className="h-5 w-5" />
              </span>
              <RenameCategoryButton id={c.id} name={c.name} />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{c.name}</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {c.count} products · ${(c.revenue / 1000).toFixed(1)}K revenue
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Link
                href={`/admin/products?category=${encodeURIComponent(c.name)}`}
                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View products
              </Link>
              <Icon name="chevron-right" className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
