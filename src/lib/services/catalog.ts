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

export type CategoryRow = {
  id: string;
  name: string;
  count: number;
  revenue: number;
};

export const getCategories = cache(async (): Promise<CategoryRow[]> => {
  await verifySession();
  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, _count: { select: { products: true } } },
    }),
    // Revenue = paid order items, aggregated per category in JS (fine at
    // this scale; a GROUP BY would replace this if the catalog grew).
    prisma.orderItem.findMany({
      where: { order: { status: "PAID" } },
      select: { quantity: true, unitPrice: true, product: { select: { categoryId: true } } },
    }),
  ]);

  const revenueByCategory = new Map<string, number>();
  for (const item of items) {
    if (!item.product.categoryId) continue;
    const amount = Number(item.unitPrice) * item.quantity;
    revenueByCategory.set(item.product.categoryId, (revenueByCategory.get(item.product.categoryId) ?? 0) + amount);
  }

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    count: c._count.products,
    revenue: revenueByCategory.get(c.id) ?? 0,
  }));
});

export type ProductDetail = {
  id: string;
  name: string;
  price: number;
  categoryId: string | null;
  stock: number;
};

export const getProductById = cache(async (id: string): Promise<ProductDetail | null> => {
  await verifySession();
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      price: true,
      categoryId: true,
      inventory: { select: { quantity: true } },
    },
  });
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    categoryId: product.categoryId,
    stock: product.inventory?.quantity ?? 0,
  };
});

export type InventoryRow = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  updated: string;
};

export const getInventory = cache(async (): Promise<InventoryRow[]> => {
  await verifySession();
  const items = await prisma.inventory.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      quantity: true,
      updatedAt: true,
      product: { select: { id: true, name: true, category: { select: { name: true } } } },
    },
  });
  return items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    category: item.product.category?.name ?? "Uncategorized",
    quantity: item.quantity,
    updated: item.updatedAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));
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
        id: p.id,
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
