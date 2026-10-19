import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/admin-data";
import { Button } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Icon } from "@/components/admin/icons";

export const metadata: Metadata = { title: "Categories" };

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize your catalog into browsable collections."
        actions={
          <Button>
            <Icon name="plus" className="h-4 w-4" />
            Add category
          </Button>
        }
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
                <Icon name={c.icon} className="h-5 w-5" />
              </span>
              <button
                aria-label={`Edit ${c.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <Icon name="pencil" className="h-3.5 w-3.5" />
              </button>
            </div>

            <h2 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{c.name}</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {c.count} products · ${c.revenue.toFixed(1)}K revenue
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <Link
                href="/admin/products"
                className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View products
              </Link>
              <Icon name="chevron-right" className="h-3.5 w-3.5 text-zinc-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
