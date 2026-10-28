"use client";

import { useActionState } from "react";
import Link from "next/link";
import { removeFromCart, updateCartQuantity } from "@/lib/cart-actions";
import type { CartItem } from "@/lib/cart";
import type { ActionState } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "./product-image";
import { Icon } from "@/components/admin/icons";

const INITIAL_STATE: ActionState = { ok: false };

// Everything the line renders, minus the derived lineTotal.
type CartLineItemProps = Pick<
  CartItem,
  "productId" | "name" | "imageUrl" | "category" | "price" | "stock" | "quantity" | "available"
>;

export function CartLineItem({
  productId,
  name,
  imageUrl,
  category,
  price,
  stock,
  quantity,
  available,
}: CartLineItemProps) {
  const [removeState, removeAction] = useActionState(removeFromCart, INITIAL_STATE);
  const [updateState, updateAction] = useActionState(updateCartQuantity, INITIAL_STATE);

  return (
    <li className="flex gap-5 py-6">
      <Link href={`/products/${productId}`} className="shrink-0">
        <ProductImage category={category} name={name} imageUrl={imageUrl} className="h-24 w-24 rounded-2xl" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              href={`/products/${productId}`}
              className="block truncate font-display text-base font-medium text-stone-950 transition-colors hover:text-blue-600 dark:text-stone-50 dark:hover:text-blue-400"
            >
              {name}
            </Link>
            <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
              {category} · {formatMoney(price)} each
            </p>
          </div>
          <form action={removeAction}>
            <input type="hidden" name="productId" value={productId} />
            <button
              type="submit"
              aria-label={`Remove ${name} from cart`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <Icon name="trash" className="h-4 w-4" />
            </button>
          </form>
        </div>

        {!available ? (
          <p className="text-xs font-medium text-red-600 dark:text-red-400">
            Out of stock — remove it to continue, or wait for a restock.
          </p>
        ) : (
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center rounded-full border border-stone-200 dark:border-stone-800">
              <form action={updateAction}>
                <input type="hidden" name="productId" value={productId} />
                <input type="hidden" name="quantity" value={quantity - 1} />
                <button
                  type="submit"
                  aria-label="Decrease quantity"
                  className="flex h-9 w-9 items-center justify-center rounded-l-full text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-40 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                  <Icon name="minus" className="h-3 w-3" />
                </button>
              </form>
              <span className="w-8 text-center text-xs font-semibold tabular-nums text-stone-950 dark:text-stone-50">
                {quantity}
              </span>
              <form action={updateAction}>
                <input type="hidden" name="productId" value={productId} />
                <input type="hidden" name="quantity" value={Math.min(stock, quantity + 1)} />
                <button
                  type="submit"
                  aria-label="Increase quantity"
                  disabled={quantity >= stock}
                  className="flex h-9 w-9 items-center justify-center rounded-r-full text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-40 dark:text-stone-400 dark:hover:bg-stone-800"
                >
                  <Icon name="plus" className="h-3 w-3" />
                </button>
              </form>
            </div>
            <p className="text-base font-semibold tabular-nums text-stone-950 dark:text-stone-50">
              {formatMoney(price * quantity)}
            </p>
          </div>
        )}
        {updateState.message && !updateState.ok ? (
          <p className="text-xs text-red-600 dark:text-red-400">{updateState.message}</p>
        ) : null}
        {removeState.message && !removeState.ok ? (
          <p className="text-xs text-red-600 dark:text-red-400">{removeState.message}</p>
        ) : null}
      </div>
    </li>
  );
}
