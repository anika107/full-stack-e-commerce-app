import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { prisma } from "@/db";
import type { OrderGetPayload } from "@/generated/prisma/models/Order";
import type { RevenuePoint } from "@/lib/types";
import { formatCompactMoney } from "@/lib/format";
import { verifySession } from "./auth";

export type RangeKey = "7d" | "30d" | "90d" | "12m";

export const RANGES: Record<RangeKey, { days: number; label: string }> = {
  "7d": { days: 7, label: "7 days" },
  "30d": { days: 30, label: "30 days" },
  "90d": { days: 90, label: "90 days" },
  "12m": { days: 365, label: "12 months" },
};

export const isRangeKey = (value: string): value is RangeKey => value in RANGES;

// Shared source for every dashboard number: one query per request covers the
// KPIs, the revenue chart, and the top-categories list.
type StatsOrder = OrderGetPayload<{
  select: {
    createdAt: true;
    status: true;
    items: {
      select: {
        quantity: true;
        unitPrice: true;
        product: { select: { category: { select: { name: true } } } };
      };
    };
  };
}>;

const getStatsOrders = cache(async (): Promise<StatsOrder[]> => {
  await verifySession();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);
  return prisma.order.findMany({
    where: { createdAt: { gte: from } },
    select: {
      createdAt: true,
      status: true,
      items: {
        select: {
          quantity: true,
          unitPrice: true,
          product: { select: { category: { select: { name: true } } } },
        },
      },
    },
  });
});

const orderTotal = (order: StatsOrder) =>
  order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

const bucketByMonth = (orders: StatsOrder[]) => {
  const now = new Date();
  const buckets = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return {
      key: month.getTime(),
      label: month.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      orders: [] as StatsOrder[],
    };
  });
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const order of orders) {
    const month = new Date(order.createdAt.getFullYear(), order.createdAt.getMonth(), 1);
    byKey.get(month.getTime())?.orders.push(order);
  }
  return buckets;
};

const paidRevenue = (list: StatsOrder[]) =>
  list.filter((o) => o.status === "PAID").reduce((sum, o) => sum + orderTotal(o), 0);

const pctDelta = (current: number, previous: number) => {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
};

export type Kpi = {
  label: string;
  value: string;
  delta: { direction: "up" | "down"; good: boolean; text: string; period: string } | null;
  spark: number[] | null;
};

export const getDashboardKpis = cache(async (rangeKey: RangeKey): Promise<Kpi[]> => {
  // Window boundaries are relative to "now", so this must run at request time.
  await connection();
  const { days, label } = RANGES[rangeKey];
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const prevFrom = new Date(from.getTime() - days * 24 * 60 * 60 * 1000);

  const orders = await getStatsOrders();
  const current = orders.filter((o) => o.createdAt >= from);
  const previous = orders.filter((o) => o.createdAt >= prevFrom && o.createdAt < from);

  const revenue = paidRevenue(current);
  const prevRevenue = paidRevenue(previous);
  const ordersCount = current.length;
  const prevOrdersCount = previous.length;

  const [products, stockAlerts] = await Promise.all([
    prisma.product.findMany({ select: { createdAt: true } }),
    prisma.inventory.count({ where: { quantity: 0 } }),
  ]);
  const productCount = products.length;
  const productsCurrent = products.filter((p) => p.createdAt >= from).length;
  const productsPrevious = products.filter((p) => p.createdAt >= prevFrom && p.createdAt < from).length;

  const months = bucketByMonth(orders);
  const revenueSpark = months.map((m) => paidRevenue(m.orders));
  const ordersSpark = months.map((m) => m.orders.length);
  // Cumulative catalog size at each month boundary, so the spark grows like
  // the catalog did.
  const productsSpark = months.map((_, i) => {
    const monthEnd = i === 11 ? now : new Date(now.getFullYear(), now.getMonth() - (10 - i), 1);
    return products.filter((p) => p.createdAt < monthEnd).length;
  });

  const delta = (currentValue: number, previousValue: number): Kpi["delta"] => {
    const pct = pctDelta(currentValue, previousValue);
    if (pct === null) return null;
    const direction: "up" | "down" = pct >= 0 ? "up" : "down";
    return {
      direction,
      good: pct >= 0,
      text: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`,
      period: `vs previous ${label}`,
    };
  };

  return [
    {
      label: "Total revenue",
      value: formatCompactMoney(revenue),
      delta: delta(revenue, prevRevenue),
      spark: revenueSpark.map((v) => v / 1000),
    },
    {
      label: "Orders",
      value: ordersCount.toLocaleString("en-US"),
      delta: delta(ordersCount, prevOrdersCount),
      spark: ordersSpark,
    },
    {
      label: "Products",
      value: String(productCount),
      delta: {
        direction: productsCurrent >= productsPrevious ? "up" : "down",
        good: productsCurrent >= productsPrevious,
        text: `${productsCurrent >= productsPrevious ? "+" : ""}${productsCurrent - productsPrevious}`,
        period: `this ${label}`,
      },
      spark: productsSpark,
    },
    {
      label: "Stock alerts",
      value: String(stockAlerts),
      delta: null,
      spark: null,
    },
  ];
});

// Chart values are pre-scaled to whole thousands with one decimal.
const roundK = (value: number) => Math.round((value / 1000) * 10) / 10;

export const getRevenueSeries = cache(async (rangeKey: RangeKey): Promise<RevenuePoint[]> => {
  // Bucket boundaries are relative to "now", so this must run at request time.
  await connection();
  const orders = await getStatsOrders();
  const { days } = RANGES[rangeKey];
  const now = new Date();
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  if (rangeKey === "12m") {
    return bucketByMonth(orders).map((m) => ({
      label: m.label,
      value: roundK(paidRevenue(m.orders)),
    }));
  }

  // Daily buckets for 7d, weekly for 30d/90d. Labels put the distinguishing
  // part first because the chart's x-axis renders only the first word.
  const bucketMs =
    rangeKey === "7d" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const pointCount = Math.ceil((days * 24 * 60 * 60 * 1000) / bucketMs);
  return Array.from({ length: pointCount }, (_, i) => {
    const start = new Date(from.getTime() + i * bucketMs);
    const end = new Date(start.getTime() + bucketMs);
    const bucketOrders = orders.filter((o) => o.createdAt >= start && o.createdAt < end);
    const label =
      rangeKey === "7d"
        ? start.toLocaleDateString("en-US", { weekday: "short" })
        : `${start.getDate()} ${start.toLocaleDateString("en-US", { month: "short" })}`;
    return { label, value: roundK(paidRevenue(bucketOrders)) };
  });
});

export type { RevenuePoint };

export type TopCategory = { name: string; revenue: number; share: number };

export const getTopCategories = cache(async (): Promise<TopCategory[]> => {
  const orders = await getStatsOrders();
  const byCategory = new Map<string, number>();
  for (const order of orders) {
    if (order.status !== "PAID") continue;
    for (const item of order.items) {
      const name = item.product.category?.name ?? "Uncategorized";
      byCategory.set(name, (byCategory.get(name) ?? 0) + Number(item.unitPrice) * item.quantity);
    }
  }
  const total = [...byCategory.values()].reduce((sum, v) => sum + v, 0) || 1;
  return [...byCategory.entries()]
    .map(([name, revenue]) => ({ name, revenue, share: Math.round((revenue / total) * 100) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3);
});
