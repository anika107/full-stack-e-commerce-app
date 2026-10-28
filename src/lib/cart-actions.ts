"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import type { ActionState } from "./types";
import { CART_COOKIE, MAX_QUANTITY, readCartLines, serializeCart, type CartLine } from "./cart";

const CART_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 30, // 30 days
};

async function writeCart(lines: CartLine[]) {
  (await cookies()).set(CART_COOKIE, serializeCart(lines), CART_OPTIONS);
  revalidatePath("/cart");
}

async function getStock(productId: string): Promise<number | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { inventory: { select: { quantity: true } } },
  });
  if (!product) return null;
  return product.inventory?.quantity ?? 0;
}

export async function addToCart(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  const requested = Math.min(MAX_QUANTITY, Math.max(1, Number(formData.get("quantity")) || 1));

  const stock = await getStock(productId);
  if (stock === null) return { ok: false, message: "This product is no longer available." };
  if (stock <= 0) return { ok: false, message: "This item is out of stock." };

  const lines = await readCartLines();
  const existing = lines.find((line) => line.productId === productId);
  const merged = existing
    ? lines.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(stock, line.quantity + requested) }
          : line,
      )
    : [...lines, { productId, quantity: Math.min(stock, requested) }];

  await writeCart(merged);
  return { ok: true, message: "Added to cart." };
}

export async function updateCartQuantity(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  const quantity = Math.min(MAX_QUANTITY, Math.max(0, Number(formData.get("quantity")) || 0));

  const lines = await readCartLines();
  let next = lines.filter((line) => line.productId !== productId);
  if (quantity > 0) {
    const stock = await getStock(productId);
    if (stock === null) return { ok: false, message: "This product is no longer available." };
    next = [...next, { productId, quantity: Math.min(stock, quantity) }];
  }

  await writeCart(next);
  return { ok: true };
}

export async function removeFromCart(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const productId = String(formData.get("productId") ?? "");
  const lines = await readCartLines();
  await writeCart(lines.filter((line) => line.productId !== productId));
  return { ok: true };
}
