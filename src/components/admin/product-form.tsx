"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createProduct, updateProduct, deleteProduct, type ProductFormState } from "@/app/admin/(panel)/products/actions";
import { Icon } from "./icons";

const INITIAL_STATE: ProductFormState = { ok: false };

type CategoryOption = { id: string; name: string };

// Shared add/edit panel: the page renders it (from ?new=1 / ?edit=<id>) above
// the table; submit goes through the matching server action.
export function ProductFormPanel({
  mode,
  categories,
  returnTo,
  initial,
}: {
  mode: "new" | "edit";
  categories: CategoryOption[];
  returnTo: string;
  initial?: { id: string; name: string; price: number; categoryId: string | null; stock: number };
}) {
  const action = mode === "new" ? createProduct : updateProduct;
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  const fieldClass =
    "h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600";

  return (
    <form
      action={formAction}
      className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {mode === "new" ? "Add product" : "Edit product"}
        </h2>
        <Link
          href={returnTo}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Cancel"
        >
          <Icon name="x" className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Name</span>
          <input
            name="name"
            required
            defaultValue={initial?.name}
            placeholder="Product name"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Price</span>
          <input
            name="price"
            type="number"
            required
            min="0.01"
            step="0.01"
            defaultValue={initial?.price}
            placeholder="0.00"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Category</span>
          <select name="categoryId" defaultValue={initial?.categoryId ?? ""} className={fieldClass}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">Stock</span>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={initial?.stock ?? 0}
            placeholder="0"
            className={fieldClass}
          />
        </label>
      </div>

      <input type="hidden" name="id" value={initial?.id} />
      <input type="hidden" name="returnTo" value={returnTo} />

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : mode === "new" ? "Add product" : "Save changes"}
        </button>
        {state.error ? (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {state.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

// Trash button per row; confirms before submitting, shows the action's error
// (e.g. "has orders and can't be deleted") inline.
export function DeleteProductButton({ id, name, returnTo }: { id: string; name: string; returnTo: string }) {
  const [state, formAction, pending] = useActionState(deleteProduct, INITIAL_STATE);

  return (
    <div className="flex items-center gap-2">
      {state.error ? (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {state.error}
        </span>
      ) : null}
      <form
        action={formAction}
        onSubmit={(e) => {
          if (!window.confirm(`Delete "${name}"? This can't be undone.`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          disabled={pending}
          aria-label={`Delete ${name}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
        >
          <Icon name="trash" className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
