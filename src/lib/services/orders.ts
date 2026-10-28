import "server-only";
import { cache } from "react";
import { prisma } from "@/db";
import type { PageResult } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { verifySession } from "./auth";

export type OrderStatus = "PAID" | "PENDING" | "REFUNDED" | "FAILED";

// Single source for how each status reads and renders across the admin panel.
export const ORDER_STATUS_META = {
  PAID: { tone: "good", label: "Paid" },
  PENDING: { tone: "warning", label: "Pending" },
  REFUNDED: { tone: "serious", label: "Refunded" },
  FAILED: { tone: "critical", label: "Failed" },
} as const satisfies Record<
  OrderStatus,
  { tone: "good" | "warning" | "serious" | "critical"; label: string }
>;

export const ORDER_STATUSES = Object.keys(ORDER_STATUS_META) as OrderStatus[];

export const isOrderStatus = (value: string): value is OrderStatus | "all" =>
  value === "all" || (ORDER_STATUSES as readonly string[]).includes(value);

export type RecentOrder = {
  id: string;
  customer: string;
  status: OrderStatus;
  date: string;
  total: number;
};

export const getRecentOrders = cache(async (): Promise<RecentOrder[]> => {
  await verifySession();
  const orders = await prisma.order.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      customer: { select: { name: true } },
      items: { select: { quantity: true, unitPrice: true } },
    },
  });
  return orders.map((order) => ({
    id: order.id.slice(0, 8),
    customer: order.customer.name,
    status: order.status,
    date: formatDate(order.createdAt),
    total: order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0),
  }));
});

export type OrderRow = {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: OrderStatus;
  date: string;
};

export type OrdersResult = PageResult<OrderRow> & { status: OrderStatus | "all" };

export const getOrders = cache(
  async ({
    status = "all",
    page = 1,
    pageSize = 20,
  }: {
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<OrdersResult> => {
    await verifySession();
    const effectiveStatus: OrderStatus | "all" =
      status && isOrderStatus(status) ? status : "all";
    const where = effectiveStatus === "all" ? {} : { status: effectiveStatus };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          status: true,
          createdAt: true,
          customer: { select: { name: true, email: true } },
          items: { select: { quantity: true, unitPrice: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    return {
      rows: orders.map((order) => ({
        id: order.id.slice(0, 8),
        customer: order.customer.name,
        email: order.customer.email,
        items: order.items.reduce((sum, item) => sum + item.quantity, 0),
        total: order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0),
        status: order.status,
        date: formatDate(order.createdAt),
      })),
      total,
      page,
      pageSize,
      status: effectiveStatus,
    };
  },
);
