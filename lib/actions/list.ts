"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  getActiveAdapter,
  buildManualExport,
  type OrderItem,
  type OrderResult,
} from "@/lib/ordering";
import type { ManualExport } from "@/lib/ordering/manualExport";
import { normalizeAisle } from "@/lib/aisles";

export type ApproveResult = {
  result: OrderResult;
  export: ManualExport;
};

/**
 * Persist the final edited list, hand it to the active OrderAdapter, reset the
 * cadence clock on any staples in the list, and return the export artifact.
 */
export async function approveAndOrder(
  listId: string,
  items: OrderItem[],
): Promise<ApproveResult> {
  // Replace the list's items with the edited set.
  await prisma.$transaction([
    prisma.shoppingListItem.deleteMany({ where: { listId } }),
    prisma.shoppingListItem.createMany({
      data: items.map((i) => ({
        listId,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        category: normalizeAisle(i.category),
        source: i.source,
      })),
    }),
    prisma.shoppingList.update({
      where: { id: listId },
      data: { status: "approved" },
    }),
  ]);

  // Hand off to the active adapter (manual export in v1).
  const result = await getActiveAdapter().placeOrder(items);

  // Reset cadence on staples that made it into the order.
  const stapleNames = items
    .filter((i) => i.source === "staple")
    .map((i) => i.name.toLowerCase());
  if (stapleNames.length) {
    const staples = await prisma.staple.findMany();
    const ids = staples
      .filter((s) => stapleNames.includes(s.name.toLowerCase()))
      .map((s) => s.id);
    if (ids.length) {
      await prisma.staple.updateMany({
        where: { id: { in: ids } },
        data: { lastOrderedAt: new Date() },
      });
    }
  }

  if (result.status === "exported" || result.status === "submitted") {
    await prisma.shoppingList.update({
      where: { id: listId },
      data: { status: "ordered" },
    });
  }

  revalidatePath("/");
  return { result, export: buildManualExport(items) };
}
