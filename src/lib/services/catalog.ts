import "server-only";
import { cache } from "react";
import { prisma } from "@/db";
import { verifySession } from "./auth";

export type LowStockItem = { id: string; name: string };

export const getLowStock = cache(async (): Promise<LowStockItem[]> => {
  await verifySession();
  const items = await prisma.inventory.findMany({
    where: { quantity: 0 },
    select: { product: { select: { id: true, name: true } } },
  });
  return items.map((item) => ({ id: item.product.id.slice(0, 8), name: item.product.name }));
});

export const getProductCategories = cache(async (): Promise<string[]> => {
  await verifySession();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
  return categories.map((c) => c.name);
});

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  updated: string;
};

export type ProductsResult = {
  rows: ProductRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const getProducts = cache(
  async ({
    q = "",
    category = "all",
    page = 1,
    pageSize = 20,
  }: {
    q?: string;
    category?: string;
    page?: number;
    pageSize?: number;
  }): Promise<ProductsResult> => {
    await verifySession();
    const where = {
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      ...(category !== "all" ? { category: { name: category } } : {}),
    };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          price: true,
          createdAt: true,
          category: { select: { name: true } },
          inventory: { select: { quantity: true, updatedAt: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);
    return {
      rows: products.map((p) => ({
        id: p.id.slice(0, 8),
        name: p.name,
        category: p.category?.name ?? "Uncategorized",
        price: Number(p.price),
        stock: p.inventory?.quantity ?? 0,
        updated: (p.inventory?.updatedAt ?? p.createdAt).toLocaleDateString("en-US", {
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
