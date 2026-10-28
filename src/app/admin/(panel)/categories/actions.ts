"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/db";
import type { ActionState } from "@/lib/types";
import { isPrismaError } from "@/lib/prisma";
import { verifySession } from "@/lib/services/auth";

async function validate(
  formData: FormData,
): Promise<{ name: string; id?: string } | ActionState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Name is required." };
  if (name.length > 100) return { ok: false, message: "Name must be 100 characters or fewer." };
  return id ? { id, name } : { name };
}

export async function createCategory(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();
  const result = await validate(formData);
  if ("ok" in result) return result;

  try {
    await prisma.category.create({ data: { name: result.name } });
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return { ok: false, message: "A category with that name already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function renameCategory(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await verifySession();
  const result = await validate(formData);
  if ("ok" in result || !result.id) return { ok: false, message: "Missing category id." };

  try {
    await prisma.category.update({ where: { id: result.id }, data: { name: result.name } });
  } catch (error) {
    if (isPrismaError(error, "P2002")) {
      return { ok: false, message: "A category with that name already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/categories");
  return { ok: true };
}
