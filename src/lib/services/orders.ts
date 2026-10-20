import "server-only";
import { cache } from "react";
import { prisma } from "@/db";
import { verifySession } from "./auth";

export type RecentOrder = {
  id: string;
  customer: string;
  status: "PAID" | "PENDING" | "REFUNDED" | "FAILED";
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
    date: order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    total: order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0),
  }));
});

export type OrderStatus = "PAID" | "PENDING" | "REFUNDED" | "FAILED";

export const ORDER_STATUSES = ["PAID", "PENDING", "REFUNDED", "FAILED"] as const;

export const isOrderStatus = (value: string): value is OrderStatus | "all" =>
  value === "all" || (ORDER_STATUSES as readonly string[]).includes(value);

export type OrderRow = {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: OrderStatus;
  date: string;
};

export type OrdersResult = {
  rows: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const getOrders = cache(
  async ({
    status = "all",
    page = 1,
    pageSize = 20,
  }: {
    status?: OrderStatus | "all";
    page?: number;
    pageSize?: number;
  }): Promise<OrdersResult> => {
    await verifySession();
    const where = status === "all" ? {} : { status };
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
        date: order.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
      total,
      page,
      pageSize,
    };
  },
);
