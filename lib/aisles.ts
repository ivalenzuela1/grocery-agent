// Canonical grocery aisles, ordered to roughly match a shopping route.
// Used by staples, AI output normalization, and consolidation grouping.

export const AISLES = [
  "Produce",
  "Bakery",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Frozen",
  "Pantry",
  "Canned & Jarred",
  "Condiments & Sauces",
  "Spices & Baking",
  "Breakfast",
  "Snacks",
  "Beverages",
  "Household",
  "Personal Care",
  "Other",
] as const;

export type Aisle = (typeof AISLES)[number];

const ORDER = new Map<string, number>(AISLES.map((a, i) => [a, i]));

/** Sort key for an aisle name; unknown aisles sort to the end (with "Other"). */
export function aisleOrder(name: string): number {
  return ORDER.get(name) ?? ORDER.get("Other")!;
}

/** Coerce an arbitrary string to the nearest known aisle, defaulting to "Other". */
export function normalizeAisle(name: string | undefined | null): Aisle {
  if (!name) return "Other";
  const hit = AISLES.find((a) => a.toLowerCase() === name.trim().toLowerCase());
  return hit ?? "Other";
}

export const UNITS = [
  "each",
  "lb",
  "oz",
  "g",
  "kg",
  "ml",
  "L",
  "cup",
  "tbsp",
  "tsp",
  "bunch",
  "can",
  "pack",
  "dozen",
  "loaf",
  "clove",
] as const;
