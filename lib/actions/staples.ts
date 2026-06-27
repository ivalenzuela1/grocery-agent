"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { normalizeAisle } from "@/lib/aisles";

function parseStapleForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    category: normalizeAisle(String(formData.get("category") ?? "")),
    defaultQuantity: Math.max(
      0,
      parseFloat(String(formData.get("defaultQuantity") ?? "1")) || 1,
    ),
    unit: String(formData.get("unit") ?? "each").trim() || "each",
    cadenceDays: Math.max(
      1,
      parseInt(String(formData.get("cadenceDays") ?? "7"), 10) || 7,
    ),
  };
}

export async function addStaple(formData: FormData): Promise<void> {
  const data = parseStapleForm(formData);
  if (!data.name) return;
  await prisma.staple.create({ data });
  revalidatePath("/staples");
  revalidatePath("/");
}

export async function updateStaple(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const data = parseStapleForm(formData);
  if (!data.name) return;
  await prisma.staple.update({ where: { id }, data });
  revalidatePath("/staples");
  revalidatePath("/");
}

export async function deleteStaple(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.staple.delete({ where: { id } });
  revalidatePath("/staples");
  revalidatePath("/");
}

/** Mark a staple as just ordered (resets its cadence clock). Programmatic use. */
export async function markStapleOrdered(id: string): Promise<void> {
  await prisma.staple.update({
    where: { id },
    data: { lastOrderedAt: new Date() },
  });
  revalidatePath("/staples");
  revalidatePath("/");
}

/** Form wrapper for "mark bought" on the staples screen. */
export async function markStapleBought(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await markStapleOrdered(id);
}
