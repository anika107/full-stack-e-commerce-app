"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/db";
import { verifySession } from "@/lib/services/auth";

export type ProductFormState = { ok: boolean; error?: string };

type ParsedProduct = {
  name: string;
  price: number;
  categoryId: string | null;
  stock: number;
};

function parseForm(formData: FormData): ParsedProduct | ProductFormState {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (name.length > 200) return { ok: false, error: "Name must be 200 characters or fewer." };

  const price = Number(formData.get("price"));
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, error: "Price must be greater than 0." };
  }

  const stock = Number(formData.get("stock") ?? 0);
  if (!Number.isInteger(stock) || stock < 0) {
    return { ok: false, error: "Stock must be a whole number of 0 or more." };
  }

  const categoryId = String(formData.get("categoryId") ?? "");
  return { name, price: Math.round(price * 100) / 100, categoryId: categoryId || null, stock };
}

// Only allow redirects back into the products list.
function returnTo(formData: FormData): string {
  const target = String(formData.get("returnTo") ?? "");
  return target.startsWith("/admin/products") ? target : "/admin/products";
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await verifySession();
  const parsed = parseForm(formData);
  if ("ok" in parsed) return parsed;

  await prisma.$transaction([
    prisma.product.create({
      data: {
        name: parsed.name,
        price: parsed.price,
        categoryId: parsed.categoryId,
        inventory: { create: { quantity: parsed.stock } },
      },
    }),
  ]);

  revalidatePath("/admin/products");
  redirect(returnTo(formData));
}

export async function updateProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await verifySession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing product id." };

  const parsed = parseForm(formData);
  if ("ok" in parsed) return parsed;

  await prisma.$transaction([
    prisma.product.update({
      where: { id },
      data: { name: parsed.name, price: parsed.price, categoryId: parsed.categoryId },
    }),
    prisma.inventory.upsert({
      where: { productId: id },
      update: { quantity: parsed.stock },
      create: { productId: id, quantity: parsed.stock },
    }),
  ]);

  revalidatePath("/admin/products");
  redirect(returnTo(formData));
}

export async function deleteProduct(
  _prevState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await verifySession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing product id." };

  try {
    // Inventory first — its FK is Restrict. Order items stay a blocker:
    // a product with sales history can't be deleted.
    await prisma.$transaction([
      prisma.inventory.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);
  } catch (error) {
    if ((error as { code?: string })?.code === "P2003") {
      return { ok: false, error: "This product has orders and can't be deleted." };
    }
    throw error;
  }

  revalidatePath("/admin/products");
  return { ok: true };
}
