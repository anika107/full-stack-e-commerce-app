"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import { createCategory, renameCategory, type CategoryFormState } from "@/app/admin/(panel)/categories/actions";
import { Button } from "./ui/button";
import { Icon } from "./icons";

const INITIAL_STATE: CategoryFormState = { ok: false };

// "Add category" button in the page header; expands into an inline form.
export function AddCategoryButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createCategory, INITIAL_STATE);

  useEffect(() => {
    if (state.ok) setOpen(false);
  }, [state.ok]);

  return (
    <div className="relative">
      {!open && (
        <Button onClick={() => setOpen(true)}>
          <Icon name="plus" className="h-4 w-4" />
          Add category
        </Button>
      )}
      {open && (
        <form
          action={formAction}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <input
            name="name"
            autoFocus
            placeholder="Category name"
            aria-label="Category name"
            className="h-9 w-44 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
            aria-label="Save category"
          >
            <Icon name="check" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Cancel"
          >
            <Icon name="x" className="h-4 w-4" />
          </button>
          {state.error ? <span className="sr-only">{state.error}</span> : null}
        </form>
      )}
      {open && state.error ? (
        <p role="alert" className="absolute left-0 top-full mt-1 text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

// Pencil button on a category card; swaps the title for an inline rename form.
export function RenameCategoryButton({ id, name }: { id: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(renameCategory, INITIAL_STATE);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok) setEditing(false);
  }, [state.ok]);

  return (
    <div className="relative">
      {!editing && (
        <button
          aria-label={`Edit ${name}`}
          onClick={() => setEditing(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <Icon name="pencil" className="h-3.5 w-3.5" />
        </button>
      )}
      {editing && (
        <form action={formAction} className="flex items-center gap-1.5">
          <input type="hidden" name="id" value={id} />
          <input
            name="name"
            ref={inputRef}
            defaultValue={name}
            autoFocus
            aria-label="Category name"
            className="h-8 w-36 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 text-xs outline-none transition-colors focus:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
            aria-label="Save name"
          >
            <Icon name="check" className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Cancel"
          >
            <Icon name="x" className="h-3.5 w-3.5" />
          </button>
          {state.error ? <span className="sr-only">{state.error}</span> : null}
        </form>
      )}
      {editing && state.error ? (
        <p role="alert" className="absolute right-0 top-full mt-1 whitespace-nowrap text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
