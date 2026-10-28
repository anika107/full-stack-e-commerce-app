import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCategories, getProductById, getProducts } from "@/lib/services";
import { ProductFormPanel } from "@/components/admin/product-form";
import { ProductsTable } from "@/components/admin/products-table";
import { Icon } from "@/components/admin/icons";
import { PageHeader } from "@/components/admin/ui/page-header";
import { ProductsSkeleton } from "@/components/skeletons";
import { buildUrl, firstParam } from "@/lib/url";
import { parsePage } from "@/lib/pagination";

export const metadata: Metadata = { title: "Products" };

const PAGE_SIZE = 20;

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string; new?: string; edit?: string }>;
}) {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <Products searchParams={searchParams} />
    </Suspense>
  );
}

async function Products({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string; new?: string; edit?: string }>;
}) {
  const params = await searchParams;

  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      q: firstParam(params.q),
      category: firstParam(params.category),
      page: parsePage(firstParam(params.page)),
      pageSize: PAGE_SIZE,
    }),
  ]);

  // The service validates q/category and echoes the effective values.
  const { q, category, page } = result;
  const categoryNames = categories.map((c) => c.name);

  const href = (extra: Record<string, string> = {}) =>
    buildUrl("/admin/products", {
      q: q || undefined,
      category: category === "all" ? undefined : category,
      page: page > 1 ? page : undefined,
      ...extra,
    });

  const returnTo = href();
  const editing = params.edit ? await getProductById(params.edit) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage your catalog, pricing, and listings."
        actions={
          <Link
            href={href({ new: "1" })}
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

      <ProductsTable result={result} categoryNames={categoryNames} />
    </div>
  );
}
