import "server-only";
import { cache } from "react";
import { connection } from "next/server";
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
  imageUrl: string;
  description: string;
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
      imageUrl: true,
      description: true,
      price: true,
      categoryId: true,
      inventory: { select: { quantity: true } },
    },
  });
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    description: product.description,
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

// --- Storefront (public) reads -------------------------------------------------
// Same catalog data, no admin gate: the storefront serves these to visitors.

export type StorefrontProduct = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  createdAt: Date;
};

export type StorefrontProductsResult = {
  rows: StorefrontProduct[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductSort = "newest" | "price-asc" | "price-desc";

export const PRODUCT_SORTS: Record<ProductSort, { label: string }> = {
  newest: { label: "Newest" },
  "price-asc": { label: "Price: low to high" },
  "price-desc": { label: "Price: high to low" },
};

export const isProductSort = (value: string): value is ProductSort => value in PRODUCT_SORTS;

export const getStorefrontProducts = cache(
  async ({
    q = "",
    category = "all",
    sort = "newest",
    page = 1,
    pageSize = 12,
  }: {
    q?: string;
    category?: string;
    sort?: ProductSort;
    page?: number;
    pageSize?: number;
  }): Promise<StorefrontProductsResult> => {
    const where = {
      ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
      ...(category !== "all" ? { category: { name: category } } : {}),
    };
    const orderBy =
      sort === "price-asc"
        ? { price: "asc" as const }
        : sort === "price-desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          imageUrl: true,
          description: true,
          price: true,
          createdAt: true,
          category: { select: { name: true } },
          inventory: { select: { quantity: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);
    return {
      rows: products.map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        description: p.description,
        price: Number(p.price),
        category: p.category?.name ?? "Uncategorized",
        stock: p.inventory?.quantity ?? 0,
        createdAt: p.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  },
);

export const getProductDetail = cache(async (id: string): Promise<StorefrontProduct | null> => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      description: true,
      price: true,
      createdAt: true,
      category: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
  });
  if (!product) return null;
  return {
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    description: product.description,
    price: Number(product.price),
    category: product.category?.name ?? "Uncategorized",
    stock: product.inventory?.quantity ?? 0,
    createdAt: product.createdAt,
  };
});

// "Featured" = best sellers by units ordered; "new arrivals" = newest listings.
export const getFeaturedProducts = cache(async (limit = 8): Promise<StorefrontProduct[]> => {
  // Home-page data has no request-time API of its own, so mark it explicitly.
  await connection();
  const bestSellers = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  const products = await prisma.product.findMany({
    where: { id: { in: bestSellers.map((row) => row.productId) } },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      description: true,
      price: true,
      createdAt: true,
      category: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  return bestSellers
    .map((row) => byId.get(row.productId))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      id: p.id,
      name: p.name,
      imageUrl: p.imageUrl,
      description: p.description,
      price: Number(p.price),
      category: p.category?.name ?? "Uncategorized",
      stock: p.inventory?.quantity ?? 0,
      createdAt: p.createdAt,
    }));
});

export const getNewArrivals = cache(async (limit = 4): Promise<StorefrontProduct[]> => {
  await connection();
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      imageUrl: true,
      description: true,
      price: true,
      createdAt: true,
      category: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    imageUrl: p.imageUrl,
    description: p.description,
    price: Number(p.price),
    category: p.category?.name ?? "Uncategorized",
    stock: p.inventory?.quantity ?? 0,
    createdAt: p.createdAt,
  }));
});

export type PublicCategory = { id: string; name: string; count: number };

export const getPublicCategories = cache(async (): Promise<PublicCategory[]> => {
  await connection();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, _count: { select: { products: true } } },
  });
  return categories.map((c) => ({ id: c.id, name: c.name, count: c._count.products }));
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
  imageUrl: string;
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
          imageUrl: true,
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
        imageUrl: p.imageUrl,
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
