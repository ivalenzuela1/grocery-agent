import { anthropic, MODEL, responseText } from "./client";
import { parseModelJson } from "./parse";
import { mealPlanResponseSchema, type AiRecipe } from "./schemas";
import { AISLES } from "@/lib/aisles";

export type MealPlanInput = {
  dinners: number;
  notes?: string;
  budgetCents?: number | null;
  useUp?: string;
  preferences: {
    likes: string[];
    dislikes: string[];
    allergies: string[];
    householdSize: number;
  };
};

const SYSTEM =
  "You are a practical meal-planning assistant for a household's weekly grocery " +
  "shop. You design realistic, achievable dinners and list precise grocery " +
  "ingredients with quantities. You respond with JSON only — no prose, no " +
  "markdown code fences, no commentary.";

function buildPrompt(input: MealPlanInput): string {
  const { preferences: p } = input;
  const budget =
    input.budgetCents != null
      ? `Target weekly grocery budget: about $${(input.budgetCents / 100).toFixed(0)}.`
      : "No strict budget.";

  return `Plan ${input.dinners} dinner${input.dinners === 1 ? "" : "s"} for a household of ${p.householdSize}.

HARD CONSTRAINTS (never violate):
- Allergies / restrictions to completely avoid: ${p.allergies.length ? p.allergies.join(", ") : "none"}.

Preferences:
- Likes (lean into these): ${p.likes.length ? p.likes.join(", ") : "none specified"}.
- Dislikes (avoid): ${p.dislikes.length ? p.dislikes.join(", ") : "none specified"}.
- ${budget}
${input.useUp ? `- Try to use up these items already on hand: ${input.useUp}.` : ""}
${input.notes ? `- Additional notes: ${input.notes}.` : ""}

For each recipe provide: title, servings (default ${p.householdSize}), short instructions
(2-4 sentences), and a list of ingredients with name, numeric quantity, unit, and a
grocery category chosen from EXACTLY this list:
${AISLES.join(", ")}.

Scale ingredient quantities to the servings. Use common grocery units
(each, lb, oz, g, cup, tbsp, tsp, bunch, can, pack, clove, etc.).

Respond with JSON only, in exactly this shape:
{
  "recipes": [
    {
      "title": "string",
      "servings": number,
      "instructions": "string",
      "ingredients": [
        { "name": "string", "quantity": number, "unit": "string", "category": "string" }
      ]
    }
  ]
}`;
}

export async function generateMealPlan(
  input: MealPlanInput,
): Promise<AiRecipe[]> {
  const message = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const parsed = parseModelJson(responseText(message), mealPlanResponseSchema);
  return parsed.recipes;
}
