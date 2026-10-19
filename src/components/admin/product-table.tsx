"use client";

import { useMemo, useState } from "react";
import { categories, products, type ProductStatus } from "@/lib/admin-data";
import { Icon } from "./icons";
import { Badge } from "./ui/badge";
import { Th, Td } from "./ui/table";

const STATUS_TONE = { active: "good", draft: "warning", archived: "neutral" } as const;
const STATUS_LABEL = { active: "Active", draft: "Draft", archived: "Archived" } as const;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function ProductTable() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<ProductStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (q === "" || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) &&
        (category === "all" || p.category === category) &&
        (status === "all" || p.status === status),
    );
  }, [query, category, status]);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 p-4 dark:border-zinc-800">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products or SKU…"
            aria-label="Search products"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-600"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus | "all")}
          aria-label="Filter by status"
          className="h-9 appearance-none rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none transition-colors focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:border-zinc-600"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <p className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
          {filtered.length} of {products.length} shown
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <Th>
                <button className="inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-zinc-900 dark:hover:text-zinc-100">
                  Product <Icon name="arrow-up-down" className="h-3 w-3" />
                </button>
              </Th>
              <Th>Category</Th>
              <Th right>Price</Th>
              <Th right>Stock</Th>
              <Th>Status</Th>
              <Th>Updated</Th>
              <Th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((p) => (
              <tr key={p.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <Td>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{p.name}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{p.sku}</p>
                </Td>
                <Td>{p.category}</Td>
                <Td right className="font-medium text-zinc-900 dark:text-zinc-50">
                  {money.format(p.price)}
                </Td>
                <Td right>{p.stock}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                </Td>
                <Td className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{p.updated}</Td>
                <Td>
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      aria-label={`Edit ${p.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    >
                      <Icon name="pencil" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      aria-label={`Delete ${p.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No products match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (UI only) */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Showing 1–{filtered.length} of 86 products</p>
        <div className="flex gap-1">
          <button
            aria-label="Previous page"
            disabled
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 disabled:opacity-50 dark:border-zinc-800"
          >
            <Icon name="chevron-left" className="h-4 w-4" />
          </button>
          <button
            aria-label="Next page"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <Icon name="chevron-right" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
