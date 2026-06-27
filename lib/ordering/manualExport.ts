import { aisleOrder } from "@/lib/aisles";
import type { OrderAdapter, OrderItem, OrderResult } from "./types";

/** Public Amazon Fresh search URL for an item (not an ordering API). */
export function amazonFreshSearchUrl(name: string): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(name)}&i=amazonfresh`;
}

export type ExportGroup = {
  aisle: string;
  items: { label: string; name: string; searchUrl: string }[];
};

export type ManualExport = {
  text: string;
  groups: ExportGroup[];
};

function formatQty(item: OrderItem): string {
  const q = Math.round(item.quantity * 100) / 100;
  return item.unit && item.unit !== "each" ? `${q} ${item.unit}` : `${q}`;
}

/** Build an aisle-sorted, quantity-resolved export: copyable text + UI groups. */
export function buildManualExport(items: OrderItem[]): ManualExport {
  const sorted = [...items].sort(
    (a, b) =>
      aisleOrder(a.category) - aisleOrder(b.category) ||
      a.name.localeCompare(b.name),
  );

  const groups: ExportGroup[] = [];
  for (const item of sorted) {
    const label = `${formatQty(item)} ${item.name}`.trim();
    let group = groups.find((g) => g.aisle === item.category);
    if (!group) {
      group = { aisle: item.category, items: [] };
      groups.push(group);
    }
    group.items.push({
      label,
      name: item.name,
      searchUrl: amazonFreshSearchUrl(item.name),
    });
  }

  const text = groups
    .map(
      (g) =>
        `${g.aisle.toUpperCase()}\n` +
        g.items.map((i) => `  - ${i.label}`).join("\n"),
    )
    .join("\n\n");

  return { text, groups };
}

export class ManualExportAdapter implements OrderAdapter {
  readonly name = "Manual Export";

  async placeOrder(items: OrderItem[]): Promise<OrderResult> {
    const { groups } = buildManualExport(items);
    const count = items.length;
    return {
      status: "exported",
      message: `Exported ${count} item${count === 1 ? "" : "s"} across ${groups.length} aisle${groups.length === 1 ? "" : "s"}, ready to add to Amazon Fresh.`,
    };
  }
}
