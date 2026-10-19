import type { Metadata } from "next";
import { inventory, lowStock, totalUnits } from "@/lib/admin-data";
import { Badge, STATUS_COLORS } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Td, Th } from "@/components/admin/ui/table";
import { Icon } from "@/components/admin/icons";

export const metadata: Metadata = { title: "Inventory" };

const outOfStock = inventory.filter((i) => i.quantity === 0).length;
const lowCount = lowStock.length - outOfStock;

function StockMeter({ quantity, reorder }: { quantity: number; reorder: number }) {
  // Full = 2x the reorder point; severity drives the fill color.
  const pct = Math.min(100, Math.round((quantity / (reorder * 2)) * 100));
  const tone = quantity === 0 ? "critical" : quantity <= reorder ? "warning" : "good";
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[tone] }}
        />
      </div>
      <span className="tabular-nums text-xs text-zinc-500 dark:text-zinc-400">{quantity}</span>
    </div>
  );
}

const SUMMARY = [
  {
    label: "Total units",
    value: totalUnits.toLocaleString("en-US"),
    icon: "boxes" as const,
    color: "var(--viz-series-1)",
  },
  {
    label: "Low stock",
    value: String(lowCount),
    icon: "triangle-alert" as const,
    color: STATUS_COLORS.warning,
  },
  {
    label: "Out of stock",
    value: String(outOfStock),
    icon: "circle-alert" as const,
    color: STATUS_COLORS.critical,
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="Track stock levels across your catalog."
        actions={
          <Button variant="secondary">
            <Icon name="plus" className="h-4 w-4" />
            Adjust stock
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {SUMMARY.map((s) => (
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
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th>Stock level</Th>
                <Th>Status</Th>
                <Th>Last updated</Th>
                <Th className="w-28">Adjust</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {inventory.map((item) => {
                const out = item.quantity === 0;
                const low = !out && item.quantity <= item.reorder;
                const tone = out ? "critical" : low ? "warning" : "good";
                const label = out ? "Out of stock" : low ? "Low" : "In stock";
                return (
                  <tr key={item.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <Td className="font-medium text-zinc-900 dark:text-zinc-50">{item.name}</Td>
                    <Td className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{item.sku}</Td>
                    <Td>{item.category}</Td>
                    <Td>
                      <StockMeter quantity={item.quantity} reorder={item.reorder} />
                    </Td>
                    <Td>
                      <Badge tone={tone}>{label}</Badge>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
