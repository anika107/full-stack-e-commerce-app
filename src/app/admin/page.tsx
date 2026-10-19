import type { Metadata } from "next";
import Link from "next/link";
import { kpis, orders, lowStock, categories, revenueSeries } from "@/lib/admin-data";
import { RevenueChart } from "@/components/admin/charts";
import { Badge, STATUS_COLORS } from "@/components/admin/ui/badge";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Select } from "@/components/admin/ui/select";
import { StatTile } from "@/components/admin/ui/stat-tile";
import { Td, Th } from "@/components/admin/ui/table";

export const metadata: Metadata = { title: "Dashboard" };

const ORDER_TONE = { paid: "good", pending: "warning", refunded: "serious", failed: "critical" } as const;
const ORDER_LABEL = { paid: "Paid", pending: "Pending", refunded: "Refunded", failed: "Failed" } as const;

const totalRevenue = categories.reduce((sum, c) => sum + c.revenue, 0);

export default function Page() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your store's performance."
        actions={
          <Select
            ariaLabel="Date range"
            defaultValue="12m"
            options={[
              { value: "7d", label: "Last 7 days" },
              { value: "30d", label: "Last 30 days" },
              { value: "90d", label: "Last 90 days" },
              { value: "12m", label: "Last 12 months" },
            ]}
          />
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatTile key={kpi.label} kpi={kpi} />
        ))}
      </div>

      {/* Revenue chart */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Revenue</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Last 12 months</p>
          </div>
          <p className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
            Total ${totalRevenue.toFixed(1)}K
          </p>
        </div>
        <RevenueChart data={revenueSeries} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
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
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <Td className="font-medium text-zinc-900 dark:text-zinc-50">#{o.id}</Td>
                    <Td>{o.customer}</Td>
                    <Td className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{o.date}</Td>
                    <Td>
                      <Badge tone={ORDER_TONE[o.status]}>{ORDER_LABEL[o.status]}</Badge>
                    </Td>
                    <Td right className="font-medium text-zinc-900 dark:text-zinc-50">
                      ${o.total.toFixed(2)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right rail */}
        <div className="space-y-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Low stock</h2>
              <Link
                href="/admin/inventory"
                className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Manage
              </Link>
            </div>
            <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
              {lowStock.map((item) => {
                const out = item.quantity === 0;
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: out ? STATUS_COLORS.critical : STATUS_COLORS.warning }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {item.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {out ? "Out of stock" : `${item.quantity} left`}
                        </p>
                      </div>
                    </div>
                    <button className="shrink-0 text-xs font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                      Restock
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Top categories</h2>
            <ul className="mt-4 space-y-4">
              {categories.slice(0, 3).map((c, i) => {
                const share = Math.round((c.revenue / totalRevenue) * 100);
                return (
                  <li key={c.id}>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: `var(--viz-series-${i + 1})` }}
                        />
                        {c.name}
                      </span>
                      <span className="tabular-nums text-zinc-500 dark:text-zinc-400">
                        ${c.revenue.toFixed(1)}K · {share}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${share}%`,
                          backgroundColor: `var(--viz-series-${i + 1})`,
                        }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
