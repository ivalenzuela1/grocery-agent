import { anthropic, MODEL, responseText } from "./client";
import { parseModelJson } from "./parse";
import { consolidatedResponseSchema, type ConsolidatedItem } from "./schemas";
import { AISLES, normalizeAisle } from "@/lib/aisles";
import {
  consolidateDeterministic,
  type MergeInput,
} from "@/lib/consolidation";

const SYSTEM =
  "You consolidate grocery items into a single de-duplicated shopping list. " +
  "You merge items that are the same (e.g. 'yellow onion' and 'onion'), sum " +
  "their quantities when units are compatible, and assign each a grocery " +
  "aisle. You respond with JSON only — no prose, no markdown code fences.";

function buildPrompt(items: MergeInput[]): string {
  const lines = items
    .map(
      (i) =>
        `- ${i.quantity} ${i.unit} ${i.name} [${i.source}, aisle: ${i.category}]`,
    )
    .join("\n");

  return `Consolidate this raw list of grocery items into one clean shopping list.

Rules:
- Merge duplicates and near-duplicates into a single line; sum quantities when the units match or are easily combined.
- Keep a sensible everyday name for each item.
- Assign each item a category from EXACTLY this list: ${AISLES.join(", ")}.
- Set "source" to "staple" if any merged source was a staple, otherwise "recipe".
- Do not drop items; every input must be represented.

Raw items:
${lines}

Respond with JSON only, in exactly this shape:
{
  "items": [
    { "name": "string", "quantity": number, "unit": "string", "category": "string", "source": "staple" | "recipe" }
  ]
}`;
}

/**
 * AI-consolidate the combined staples + ingredients list. Falls back to a
 * deterministic merge if the model output can't be parsed/validated.
 */
export async function consolidateList(
  items: MergeInput[],
): Promise<{ items: ConsolidatedItem[]; usedFallback: boolean }> {
  if (items.length === 0) return { items: [], usedFallback: false };

  try {
    const message = await anthropic().messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: "user", content: buildPrompt(items) }],
    });
    const parsed = parseModelJson(
      responseText(message),
      consolidatedResponseSchema,
    );
    const normalized = parsed.items.map((i) => ({
      ...i,
      category: normalizeAisle(i.category),
    }));
    if (normalized.length === 0) throw new Error("Empty consolidation");
    return { items: normalized, usedFallback: false };
  } catch {
    return { items: consolidateDeterministic(items), usedFallback: true };
  }
}
