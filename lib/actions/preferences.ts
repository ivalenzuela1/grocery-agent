"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { Preference } from "@prisma/client";

/** Fetch the singleton Preference row, creating a default if none exists. */
export async function getPreference(): Promise<Preference> {
  const existing = await prisma.preference.findFirst();
  if (existing) return existing;
  return prisma.preference.create({ data: {} });
}

export async function savePreferences(formData: FormData): Promise<void> {
  const clean = (arr: FormDataEntryValue[]) =>
    arr.map((v) => String(v).trim()).filter(Boolean);

  const likes = clean(formData.getAll("likes"));
  const dislikes = clean(formData.getAll("dislikes"));
  const allergies = clean(formData.getAll("allergies"));
  const householdSize = Math.max(
    1,
    parseInt(String(formData.get("householdSize") ?? "2"), 10) || 2,
  );
  const budgetDollars = parseFloat(String(formData.get("budget") ?? ""));
  const defaultBudgetCents = Number.isFinite(budgetDollars)
    ? Math.round(budgetDollars * 100)
    : null;

  const current = await getPreference();
  await prisma.preference.update({
    where: { id: current.id },
    data: { likes, dislikes, allergies, householdSize, defaultBudgetCents },
  });

  revalidatePath("/preferences");
  revalidatePath("/");
}
