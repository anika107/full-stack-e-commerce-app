import { Badge } from "./ui/badge";
import { Icon } from "./icons";
import { Td, Th } from "./ui/table";
import type { getInventory } from "@/lib/services";

type InventoryRows = Awaited<ReturnType<typeof getInventory>>;

const SUMMARY_COLORS = {
  total: "var(--viz-series-1)",
  out: "#d03b3b",
  in: "#0ca30c",
} as const;

// Summary cards + stock table. The Adjust buttons are UI-only for now —
// stock mutation isn't implemented yet.
export function InventoryTable({ rows }: { rows: InventoryRows }) {
  const totalUnits = rows.reduce((sum, item) => sum + item.quantity, 0);
  const outOfStock = rows.filter((item) => item.quantity === 0).length;

  const summary = [
    { label: "Total units", value: totalUnits.toLocaleString("en-US"), icon: "boxes" as const, color: SUMMARY_COLORS.total },
    { label: "Out of stock", value: String(outOfStock), icon: "circle-alert" as const, color: SUMMARY_COLORS.out },
    { label: "In stock", value: String(rows.length - outOfStock), icon: "check" as const, color: SUMMARY_COLORS.in },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3.5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{
                color: s.color,
                backgroundColor: `color-mix(in srgb, ${s.color} 12%, transparent)`,
              }}
            >
              <Icon name={s.icon} className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
                {s.value}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <Th>Product</Th>
                <Th>Category</Th>
                <Th right>Stock</Th>
                <Th>Status</Th>
                <Th>Last updated</Th>
                <Th className="w-28">Adjust</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {rows.map((item) => {
                const out = item.quantity === 0;
                return (
                  <tr key={item.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <Td className="font-medium text-zinc-900 dark:text-zinc-50">{item.name}</Td>
                    <Td>{item.category}</Td>
                    <Td right>{item.quantity}</Td>
                    <Td>
                      <Badge tone={out ? "critical" : "good"}>{out ? "Out of stock" : "In stock"}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{item.updated}</Td>
                    <Td>
                      <div className="flex gap-1.5">
                        <button
                          aria-label={`Decrease stock of ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                          <Icon name="minus" className="h-3 w-3" />
                        </button>
                        <button
                          aria-label={`Increase stock of ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                          <Icon name="plus" className="h-3 w-3" />
                        </button>
                      </div>
                    </Td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    No inventory yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
