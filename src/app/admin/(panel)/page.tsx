import type { Metadata } from "next";
import { Suspense } from "react";
import {
  getDashboardKpis,
  getLowStock,
  getRecentOrders,
  getRevenueSeries,
  getTopCategories,
  isRangeKey,
  RANGES,
} from "@/lib/services";
import {
  LowStockSection,
  RecentOrdersSection,
  RevenueSection,
  TopCategoriesSection,
} from "@/components/admin/dashboard-sections";
import { RangeSelect } from "@/components/admin/range-select";
import { PageHeader } from "@/components/admin/ui/page-header";
import { StatTile } from "@/components/admin/ui/stat-tile";
import { DashboardSkeleton } from "@/components/skeletons";

export const metadata: Metadata = { title: "Dashboard" };

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
    getRevenueSeries(range),
    getRecentOrders(),
    getLowStock(),
    getTopCategories(),
  ]);

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

      <RevenueSection series={series} rangeLabel={RANGES[range].label} />

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentOrdersSection orders={recentOrders} />
        <div className="space-y-6">
          <LowStockSection items={lowStock} />
          <TopCategoriesSection categories={topCategories} />
        </div>
      </div>
    </div>
  );
}
