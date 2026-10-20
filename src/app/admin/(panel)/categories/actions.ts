"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import { verifySession } from "@/lib/services/auth";

export type CategoryFormState = { ok: boolean; error?: string };

const isUniqueViolation = (error: unknown) => (error as { code?: string })?.code === "P2002";

async function validate(formData: FormData): Promise<{ name: string; id?: string } | CategoryFormState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Name is required." };
  if (name.length > 100) return { ok: false, error: "Name must be 100 characters or fewer." };
  return id ? { id, name } : { name };
}

export async function createCategory(
  prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await verifySession();
  const result = await validate(formData);
  if ("ok" in result) return result;

  try {
    await prisma.category.create({ data: { name: result.name } });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "A category with that name already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function renameCategory(
  prevState: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  await verifySession();
  const result = await validate(formData);
  if ("ok" in result || !result.id) return { ok: false, error: "Missing category id." };

  try {
    await prisma.category.update({ where: { id: result.id }, data: { name: result.name } });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, error: "A category with that name already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  return { ok: true };
}
