import Link from "next/link";
import { RenameCategoryButton } from "./category-form";
import { Icon, type IconName } from "./icons";
import type { getCategories } from "@/lib/services";

type CategoryRows = Awaited<ReturnType<typeof getCategories>>;

// Presentation mapping for known categories; anything new falls back to a tag.
const CATEGORY_ICONS: Record<string, IconName> = {
  Audio: "speaker",
  Wearables: "watch",
  "Smart Home": "home",
  Accessories: "plug",
  Gaming: "gamepad",
  Cameras: "camera",
};

export function CategoriesGrid({ categories }: { categories: CategoryRows }) {
  return (
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
  );
}
