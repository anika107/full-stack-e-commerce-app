import Link from "next/link";
import { RevenueChart } from "./charts";
import { Badge, STATUS_COLORS } from "./ui/badge";
import { Td, Th } from "./ui/table";
import { formatK, formatMoney } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/services";
import type {
  getLowStock,
  getRecentOrders,
  getRevenueSeries,
  getTopCategories,
} from "@/lib/services";

// Section components for the dashboard. Server components that receive their
// data through typed props derived from the service return types.

type RevenueSeries = Awaited<ReturnType<typeof getRevenueSeries>>;
type RecentOrders = Awaited<ReturnType<typeof getRecentOrders>>;
type LowStockItems = Awaited<ReturnType<typeof getLowStock>>;
type TopCategories = Awaited<ReturnType<typeof getTopCategories>>;

export function RevenueSection({
  series,
  rangeLabel,
}: {
  series: RevenueSeries;
  rangeLabel: string;
}) {
  const total = series.reduce((sum, point) => sum + point.value, 0);
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Revenue</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Last {rangeLabel}</p>
        </div>
        <p className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
          Total ${total.toFixed(1)}K
        </p>
      </div>
      <RevenueChart data={series} caption={`Revenue, last ${rangeLabel}`} />
    </section>
  );
}

export function RecentOrdersSection({ orders }: { orders: RecentOrders }) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-2">
      <header className="flex items-center justify-between px-5 pb-3 pt-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent orders</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Latest activity from your store</p>
        </div>
        <Link
          href="/admin/orders"
          className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          View all
        </Link>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th right>Total</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {orders.map((order) => (
              <tr key={order.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <Td className="font-medium text-zinc-900 dark:text-zinc-50">#{order.id}</Td>
                <Td>{order.customer}</Td>
                <Td className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{order.date}</Td>
                <Td>
                  <Badge tone={ORDER_STATUS_META[order.status].tone}>
                    {ORDER_STATUS_META[order.status].label}
                  </Badge>
                </Td>
                <Td right className="font-medium text-zinc-900 dark:text-zinc-50">
                  {formatMoney(order.total)}
                </Td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function LowStockSection({ items }: { items: LowStockItems }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Out of stock</h2>
        <Link
          href="/admin/inventory"
          className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Manage
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLORS.critical }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {item.name}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Out of stock</p>
              </div>
            </div>
            <Link
              href="/admin/inventory"
              className="shrink-0 text-xs font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Restock
            </Link>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-3 text-sm text-zinc-500 dark:text-zinc-400">Nothing out of stock.</li>
        )}
      </ul>
    </section>
  );
}

export function TopCategoriesSection({ categories }: { categories: TopCategories }) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Top categories</h2>
      <ul className="mt-4 space-y-4">
        {categories.map((category, i) => (
          <li key={category.name}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: `var(--viz-series-${i + 1})` }}
                />
                {category.name}
              </span>
              <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                {formatK(category.revenue)} · {category.share}%
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${category.share}%`,
                  backgroundColor: `var(--viz-series-${i + 1})`,
                }}
              />
            </div>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="text-sm text-zinc-500 dark:text-zinc-400">No sales yet.</li>
        )}
      </ul>
    </section>
  );
}
