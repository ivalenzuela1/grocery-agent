import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildManualExport, type OrderItem } from "@/lib/ordering";

/** Download the persisted shopping list as an aisle-sorted plain-text file. */
export async function GET(req: NextRequest) {
  const listId = req.nextUrl.searchParams.get("listId");
  if (!listId) {
    return NextResponse.json({ error: "Missing listId" }, { status: 400 });
  }

  const list = await prisma.shoppingList.findUnique({
    where: { id: listId },
    include: { items: true },
  });
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  const items: OrderItem[] = list.items.map((i) => ({
    name: i.name,
    quantity: i.quantity,
    unit: i.unit,
    category: i.category,
    source: i.source as OrderItem["source"],
  }));

  const { text } = buildManualExport(items);
  const header = `Fresh Cart — shopping list\n${"=".repeat(28)}\n\n`;

  return new NextResponse(header + text + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="grocery-list.txt"`,
    },
  });
}
