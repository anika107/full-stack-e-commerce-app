import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  getDashboardKpis,
  getLowStock,
  getRecentOrders,
  getRevenueSeries,
  getTopCategories,
  isRangeKey,
} from "@/lib/services";
import { RangeSelect } from "@/components/admin/range-select";
import { RevenueChart } from "@/components/admin/charts";
import { Badge, STATUS_COLORS } from "@/components/admin/ui/badge";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatTile } from "@/components/admin/ui/stat-tile";
import { Td, Th } from "@/components/admin/ui/table";

export const metadata: Metadata = { title: "Dashboard" };

const ORDER_TONE = { PAID: "good", PENDING: "warning", REFUNDED: "serious", FAILED: "critical" } as const;
const ORDER_LABEL = { PAID: "Paid", PENDING: "Pending", REFUNDED: "Refunded", FAILED: "Failed" } as const;

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800 lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  return (
    // Data access (connection(), searchParams, DB) lives inside the boundary
    // so the route can prerender a static shell and stream the widgets in.
    <Suspense fallback={<DashboardSkeleton />}>
      <Dashboard searchParams={searchParams} />
    </Suspense>
  );
}

async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = params.range && isRangeKey(params.range) ? params.range : "12m";

  const [kpis, series, recentOrders, lowStock, topCategories] = await Promise.all([
    getDashboardKpis(range),
    getRevenueSeries(),
    getRecentOrders(),
    getLowStock(),
    getTopCategories(),
  ]);

  const totalRevenue = series.reduce((sum, point) => sum + point.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your store's performance."
        actions={<RangeSelect range={range} />}
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
        <RevenueChart data={series} />
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <Td className="font-medium text-zinc-900 dark:text-zinc-50">#{order.id}</Td>
                    <Td>{order.customer}</Td>
                    <Td className="whitespace-nowrap text-zinc-500 dark:text-zinc-400">{order.date}</Td>
                    <Td>
                      <Badge tone={ORDER_TONE[order.status]}>{ORDER_LABEL[order.status]}</Badge>
                    </Td>
                    <Td right className="font-medium text-zinc-900 dark:text-zinc-50">
                      ${order.total.toFixed(2)}
                    </Td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
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

        {/* Right rail */}
        <div className="space-y-6">
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
              {lowStock.map((item) => (
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
                  <button className="shrink-0 text-xs font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                    Restock
                  </button>
                </li>
              ))}
              {lowStock.length === 0 && (
                <li className="py-3 text-sm text-zinc-500 dark:text-zinc-400">Nothing out of stock.</li>
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Top categories</h2>
            <ul className="mt-4 space-y-4">
              {topCategories.map((category, i) => (
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
                      ${(category.revenue / 1000).toFixed(1)}K · {category.share}%
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
              {topCategories.length === 0 && (
                <li className="text-sm text-zinc-500 dark:text-zinc-400">No sales yet.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
