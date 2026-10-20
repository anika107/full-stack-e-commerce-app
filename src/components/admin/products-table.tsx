import Link from "next/link";
import { DeleteProductButton } from "./product-form";
import { Icon } from "./icons";
import { NavSelect } from "./nav-select";
import { Td, Th } from "./ui/table";
import type { getProducts } from "@/lib/services";

type ProductsResult = Awaited<ReturnType<typeof getProducts>>;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// Toolbar (search + category filter), product table with row actions, and
// pagination. Filters arrive as props so the component stays presentational;
// all navigation is URL-driven.
export function ProductsTable({
  result,
  q,
  category,
  categoryNames,
}: {
  result: ProductsResult;
  q: string;
  category: string;
  categoryNames: string[];
}) {
  const { rows, total, page, pageSize } = result;
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

  return (
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
  );
}
