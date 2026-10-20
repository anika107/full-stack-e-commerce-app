import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/db";

// Cookie-persisted cart. The cookie stores only product ids + quantities —
// prices and stock are always re-read from the database, never trusted from
// the client. Mutations live in ./cart-actions.ts ("use server").

export const CART_COOKIE = "cart";
export const MAX_QUANTITY = 99;

export type CartLine = { productId: string; quantity: number };

export function parseCart(raw: string | undefined): CartLine[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (line): line is CartLine =>
          typeof line === "object" &&
          line !== null &&
          typeof (line as CartLine).productId === "string" &&
          typeof (line as CartLine).quantity === "number" &&
          Number.isInteger((line as CartLine).quantity),
      )
      .map((line) => ({
        productId: line.productId,
        quantity: Math.min(MAX_QUANTITY, Math.max(1, line.quantity)),
      }));
  } catch {
    return [];
  }
}

export const serializeCart = (lines: CartLine[]) => JSON.stringify(lines);

export const readCartLines = cache(async (): Promise<CartLine[]> => {
  const value = (await cookies()).get(CART_COOKIE)?.value;
  return parseCart(value);
});

export type CartItem = {
  productId: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  quantity: number;
  available: boolean;
  lineTotal: number;
};

export type CartDetails = {
  items: CartItem[];
  subtotal: number;
  count: number;
};

// Joins the cookie lines with live product data. Out-of-stock lines stay
// visible (so the shopper can see and remove them) but are excluded from the
// subtotal; quantities are clamped to available stock.
export const getCartDetails = cache(async (): Promise<CartDetails> => {
  const lines = await readCartLines();
  if (lines.length === 0) return { items: [], subtotal: 0, count: 0 };

  const products = await prisma.product.findMany({
    where: { id: { in: lines.map((line) => line.productId) } },
    select: {
      id: true,
      name: true,
      price: true,
      category: { select: { name: true } },
      inventory: { select: { quantity: true } },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: CartItem[] = lines.flatMap((line) => {
    const product = byId.get(line.productId);
    if (!product) return []; // product deleted since it was added
    const stock = product.inventory?.quantity ?? 0;
    const quantity = Math.min(line.quantity, stock);
    const available = stock > 0;
    const price = Number(product.price);
    return [
      {
        productId: product.id,
        name: product.name,
        category: product.category?.name ?? "Uncategorized",
        price,
        stock,
        quantity,
        available,
        lineTotal: available ? price * quantity : 0,
      },
    ];
  });

  return {
    items,
    subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  };
});
