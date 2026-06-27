import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { aisleOrder } from "@/lib/aisles";
import { ReviewList, type ReviewItem } from "@/components/ReviewList";

export const dynamic = "force-dynamic";

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const list = await prisma.shoppingList.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!list) notFound();

  const items: ReviewItem[] = list.items
    .map((i) => ({
      key: i.id,
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
      category: i.category,
      source: i.source as ReviewItem["source"],
    }))
    .sort(
      (a, b) =>
        aisleOrder(a.category) - aisleOrder(b.category) ||
        a.name.localeCompare(b.name),
    );

  return <ReviewList listId={list.id} initialItems={items} />;
}
