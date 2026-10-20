"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart, type CartActionState } from "@/lib/cart-actions";
import { Icon } from "@/components/admin/icons";

const INITIAL_STATE: CartActionState = { ok: false };

export function AddToCart({ productId, stock }: { productId: string; stock: number }) {
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, pending] = useActionState(addToCart, INITIAL_STATE);
  const router = useRouter();

  // Refresh the layout's cart badge after a successful add.
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  const outOfStock = stock <= 0;

  return (
    <div>
      <form action={formAction} className="flex flex-wrap items-stretch gap-3">
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="quantity" value={quantity} />
        <div className="flex h-12 items-center rounded-full border border-stone-300 dark:border-stone-700">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={outOfStock || quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-12 w-10 items-center justify-center rounded-l-full text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-40 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            <Icon name="minus" className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums text-stone-950 dark:text-stone-50">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={outOfStock || quantity >= stock}
            aria-label="Increase quantity"
            className="flex h-12 w-10 items-center justify-center rounded-r-full text-stone-500 transition-colors hover:bg-stone-100 disabled:opacity-40 dark:text-stone-400 dark:hover:bg-stone-800"
          >
            <Icon name="plus" className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="submit"
          disabled={outOfStock || pending}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-stone-950 px-8 text-sm font-semibold text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-stone-950 dark:hover:bg-stone-200 sm:flex-none"
        >
          <Icon name="cart" className="h-4 w-4" />
          {outOfStock ? "Out of stock" : pending ? "Adding…" : "Add to cart"}
        </button>
      </form>

      {state.ok ? (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <Icon name="check" className="h-4 w-4" />
            Added to cart
          </span>
          <Link
            href="/cart"
            className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View cart →
          </Link>
        </div>
      ) : state.message ? (
        <p role="alert" className="mt-4 text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
