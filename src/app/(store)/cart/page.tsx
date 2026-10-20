import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getCartDetails } from "@/lib/cart";
import { formatMoney } from "@/lib/format";
import { CartLineItem } from "@/components/storefront/cart-line";
import { Icon } from "@/components/admin/icons";
import { CartSkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "Cart" };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14">
      <Suspense
        fallback={
          <div className="space-y-10">
            <div className="h-12 w-48 animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
            <CartSkeleton />
          </div>
        }
      >
        <Cart />
      </Suspense>
    </div>
  );
}

async function Cart() {
  const { items, subtotal, count } = await getCartDetails();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
          <Icon name="cart" className="h-7 w-7 text-stone-400" />
        </span>
        <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          Browse the catalog and add something you love.
        </p>
        <Link
          href="/products"
          className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-stone-950 px-7 text-sm font-semibold text-white transition-colors hover:bg-stone-800 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Cart</p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">
          Your cart
        </h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <ul className="divide-y divide-stone-100 rounded-4xl bg-white px-6 shadow-[0_1px_2px_rgba(28,25,23,0.06)] ring-1 ring-stone-200/60 dark:divide-stone-800 dark:bg-stone-900 dark:ring-stone-800/60 lg:col-span-2">
          {items.map((item) => (
            <CartLineItem key={item.productId} {...item} />
          ))}
        </ul>

        <aside className="h-fit rounded-4xl bg-stone-950 p-7 text-stone-100">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-stone-400">
            Order summary
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-stone-400">Subtotal</dt>
              <dd className="font-semibold tabular-nums text-white">{formatMoney(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-stone-400">Shipping</dt>
              <dd className="text-stone-400">Calculated at checkout</dd>
            </div>
          </dl>
          <div className="mt-6 flex items-center justify-between border-t border-stone-800 pt-5">
            <p className="text-sm font-medium text-stone-300">Total</p>
            <p className="text-xl font-semibold tabular-nums text-white">{formatMoney(subtotal)}</p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-stone-500">
            Checkout isn&apos;t wired up yet — your cart is saved for when it is.
          </p>
          <Link
            href="/products"
            className="mt-6 flex h-11 w-full items-center justify-center rounded-full border border-stone-700 text-sm font-medium text-stone-200 transition-colors hover:border-stone-500 hover:text-white"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
