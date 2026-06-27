import type { z } from "zod";

/**
 * Pull a JSON object/array out of model text even if it arrives wrapped in
 * ```json fences or with stray prose around it. Returns the parsed value or
 * throws.
 */
export function extractJson(raw: string): unknown {
  let text = raw.trim();

  // Strip ```json ... ``` or ``` ... ``` fences.
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  // Try a direct parse first.
  try {
    return JSON.parse(text);
  } catch {
    // Fall back to the first balanced { ... } or [ ... ] span.
  }

  const start = text.search(/[{[]/);
  if (start === -1) throw new Error("No JSON found in model output");
  const open = text[start];
  const close = open === "{" ? "}" : "]";
  const end = text.lastIndexOf(close);
  if (end <= start) throw new Error("Unbalanced JSON in model output");

  return JSON.parse(text.slice(start, end + 1));
}

/** Extract JSON from model text and validate against a zod schema. */
export function parseModelJson<T>(raw: string, schema: z.ZodType<T>): T {
  return schema.parse(extractJson(raw));
}
