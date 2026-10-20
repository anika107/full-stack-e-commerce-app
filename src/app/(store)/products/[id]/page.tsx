import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/services";
import { AddToCart } from "@/components/storefront/add-to-cart";
import { ProductImage } from "@/components/storefront/product-image";
import { Icon } from "@/components/admin/icons";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Product" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14">
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductDetail(id);
  if (!product) notFound();

  const stockLabel =
    product.stock === 0
      ? "Out of stock"
      : product.stock < 5
        ? `Only ${product.stock} left`
        : "In stock";

  return (
    <div>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400"
      >
        <Link href="/" className="transition-colors hover:text-stone-950 dark:hover:text-stone-50">
          Home
        </Link>
        <Icon name="chevron-right" className="h-3 w-3 text-stone-400" />
        <Link
          href="/products"
          className="transition-colors hover:text-stone-950 dark:hover:text-stone-50"
        >
          Shop
        </Link>
        <Icon name="chevron-right" className="h-3 w-3 text-stone-400" />
        <span className="truncate text-stone-700 dark:text-stone-300">{product.name}</span>
      </nav>

      <div className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <ProductImage
            category={product.category}
            name={product.name}
            className="aspect-square w-full rounded-4xl shadow-[0_24px_48px_-24px_rgba(28,25,23,0.25)]"
          />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <ProductImage
                key={i}
                category={product.category}
                name={`${product.name} view ${i + 1}`}
                className={`aspect-square rounded-2xl transition-opacity hover:opacity-100 ${
                  i === 0 ? "opacity-100 ring-2 ring-stone-950/20 dark:ring-stone-50/20" : "opacity-50"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            {product.category}
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold leading-[1.1] tracking-tight text-stone-950 dark:text-stone-50 md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 text-3xl font-semibold tabular-nums tracking-tight text-stone-950 dark:text-stone-50">
            {formatMoney(product.price)}
          </p>

          <p className="mt-4 flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${
                product.stock === 0 ? "bg-red-500" : product.stock < 5 ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
            <span
              className={`font-medium ${
                product.stock === 0 ? "text-red-600 dark:text-red-400" : "text-stone-600 dark:text-stone-300"
              }`}
            >
              {stockLabel}
              {product.stock > 0 ? ` · ${product.stock} available` : ""}
            </span>
          </p>

          <div className="mt-8">
            <AddToCart productId={product.id} stock={product.stock} />
          </div>

          <dl className="mt-10 space-y-4 border-t border-stone-200 pt-7 text-sm dark:border-stone-800">
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">Category</dt>
              <dd className="font-medium text-stone-900 dark:text-stone-50">
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {product.category}
                </Link>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">Added to store</dt>
              <dd className="font-medium text-stone-900 dark:text-stone-50">
                {product.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-stone-500 dark:text-stone-400">Product ID</dt>
              <dd className="font-mono text-xs font-medium text-stone-900 dark:text-stone-50">
                {product.id.slice(0, 8)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
