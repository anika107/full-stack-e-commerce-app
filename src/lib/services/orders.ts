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
