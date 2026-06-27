import { normalizeAisle, aisleOrder } from "@/lib/aisles";

export type MergeInput = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  source: "staple" | "recipe";
};

export type MergedItem = MergeInput;

/**
 * Deterministic merge used as a fallback when AI consolidation fails to parse.
 * Combines items sharing a name + unit, sums their quantities, prefers the
 * "staple" source, and groups by aisle. No fuzzy matching — purely structural.
 */
export function consolidateDeterministic(items: MergeInput[]): MergedItem[] {
  const byKey = new Map<string, MergedItem>();

  for (const item of items) {
    const name = item.name.trim();
    if (!name) continue;
    const unit = (item.unit || "each").trim();
    const key = `${name.toLowerCase()}|${unit.toLowerCase()}`;
    const existing = byKey.get(key);

    if (existing) {
      existing.quantity += item.quantity;
      if (item.source === "staple") existing.source = "staple";
      if (existing.category === "Other")
        existing.category = normalizeAisle(item.category);
    } else {
      byKey.set(key, {
        name,
        quantity: item.quantity,
        unit,
        category: normalizeAisle(item.category),
        source: item.source,
      });
    }
  }

  return [...byKey.values()]
    .map((i) => ({ ...i, quantity: Math.round(i.quantity * 100) / 100 }))
    .sort(
      (a, b) =>
        aisleOrder(a.category) - aisleOrder(b.category) ||
        a.name.localeCompare(b.name),
    );
}
