import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getProductById, getProducts } from "@/lib/services";
import { DeleteProductButton, ProductFormPanel } from "@/components/admin/product-form";
import { Icon } from "@/components/admin/icons";
import { NavSelect } from "@/components/admin/nav-select";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Td, Th } from "@/components/admin/ui/table";

export const metadata: Metadata = { title: "Products" };

const PAGE_SIZE = 20;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function ProductsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-96 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string; new?: string; edit?: string }>;
}) {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsTable searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductsTable({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string; new?: string; edit?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const [categories, { rows, total, pageSize }] = await Promise.all([
    getCategories(),
    getProducts({ q, category: params.category ?? "all", page, pageSize: PAGE_SIZE }),
  ]);

  const categoryNames = categories.map((c) => c.name);
  const category =
    params.category && categoryNames.includes(params.category) ? params.category : "all";
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (clampedPage - 1) * pageSize + 1;
  const to = Math.min(clampedPage * pageSize, total);

  const href = (target: number, extra: Record<string, string> = {}) => {
    const search = new URLSearchParams();
    if (q) search.set("q", q);
    if (category !== "all") search.set("category", category);
    if (target > 1) search.set("page", String(target));
    for (const [key, value] of Object.entries(extra)) search.set(key, value);
    const qs = search.toString();
    return qs ? `/admin/products?${qs}` : "/admin/products";
  };

  const returnTo = href(clampedPage);
  const editing = params.edit ? await getProductById(params.edit) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your catalog, pricing, and listings."
        actions={
          <Link
            href={href(clampedPage, { new: "1" })}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-3.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add product
          </Link>
        }
      />

      {params.new === "1" ? (
        <ProductFormPanel mode="new" categories={categories} returnTo={returnTo} />
      ) : params.edit ? (
        editing ? (
          <ProductFormPanel mode="edit" categories={categories} returnTo={returnTo} initial={editing} />
        ) : (
          <p className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Product not found.{" "}
            <Link href={returnTo} className="font-medium text-blue-600 dark:text-blue-400">
              Back to products
            </Link>
          </p>
        )
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 p-4 dark:border-zinc-800">
          <form action="/admin/products" className="relative min-w-0 flex-1 sm:max-w-xs">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products…"
              aria-label="Search products"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-600"
            />
            {category !== "all" ? <input type="hidden" name="category" value={category} /> : null}
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
          />
          <p className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
            Showing {from}–{to} of {total}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <Th>Product</Th>
                <Th>Category</Th>
                <Th right>Price</Th>
                <Th right>Stock</Th>
                <Th>Updated</Th>
                <Th className="w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((p) => (
                <tr key={p.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <Td>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">{p.name}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">{p.id.slice(0, 8)}</p>
                  </Td>
                  <Td>{p.category}</Td>
                  <Td right className="font-medium text-zinc-900 dark:text-zinc-50">
                    {money.format(p.price)}
                  </Td>
                  <Td right>{p.stock}</Td>
                  <Td className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{p.updated}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={href(clampedPage, { edit: p.id })}
                        aria-label={`Edit ${p.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      >
                        <Icon name="pencil" className="h-3.5 w-3.5" />
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} returnTo={returnTo} />
                    </div>
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No products match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Page {clampedPage} of {totalPages}
          </p>
          <div className="flex gap-1">
            {clampedPage > 1 ? (
              <Link
                href={href(clampedPage - 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Previous
              </Link>
            ) : (
              <span className="flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">
                Previous
              </span>
            )}
            {clampedPage < totalPages ? (
              <Link
                href={href(clampedPage + 1)}
                className="flex h-8 items-center gap-1 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                Next
              </Link>
            ) : (
              <span className="flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">
                Next
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
