"use server";

import { redirect } from "next/navigation";
import { prisma, DEMO } from "@/lib/db";
import { getPreference } from "@/lib/actions/preferences";
import { generateMealPlan } from "@/lib/claude/mealPlan";
import { sampleRecipes } from "@/lib/demo/sampleRecipes";
import { consolidateList } from "@/lib/claude/consolidate";
import { dueStaples } from "@/lib/staples";
import { normalizeAisle } from "@/lib/aisles";
import { consolidateDeterministic, type MergeInput } from "@/lib/consolidation";
import type { AiRecipe } from "@/lib/claude/schemas";

export type PlanState = {
  mealPlanId?: string;
  recipes?: AiRecipe[];
  error?: string;
};

export async function planMeals(
  _prev: PlanState,
  formData: FormData,
): Promise<PlanState> {
  const dinners = Math.min(
    14,
    Math.max(1, parseInt(String(formData.get("dinners") ?? "4"), 10) || 4),
  );
  const notes = String(formData.get("notes") ?? "").trim() || undefined;
  const useUp = String(formData.get("useUp") ?? "").trim() || undefined;
  const budgetInput = parseFloat(String(formData.get("budget") ?? ""));

  const pref = await getPreference();
  const budgetCents = Number.isFinite(budgetInput)
    ? Math.round(budgetInput * 100)
    : pref.defaultBudgetCents;

  let recipes: AiRecipe[];
  if (DEMO) {
    // No API key needed in demo mode — use built-in sample meals.
    recipes = sampleRecipes(dinners);
  } else {
    try {
      recipes = await generateMealPlan({
        dinners,
        notes,
        useUp,
        budgetCents,
        preferences: {
          likes: pref.likes,
          dislikes: pref.dislikes,
          allergies: pref.allergies,
          householdSize: pref.householdSize,
        },
      });
    } catch (err) {
      console.error("meal plan generation failed", err);
      return {
        error:
          "Couldn't generate a plan just now. Check the API key and try again.",
      };
    }
  }

  const plan = await prisma.mealPlan.create({
    data: {
      weekOf: new Date(),
      status: "draft",
      constraintsJson: { dinners, notes, useUp, budgetCents },
      recipes: {
        create: recipes.map((r) => ({
          recipe: {
            create: {
              title: r.title,
              servings: r.servings,
              source: "ai",
              instructions: r.instructions,
              ingredients: {
                create: r.ingredients.map((ing) => ({
                  name: ing.name,
                  quantity: ing.quantity,
                  unit: ing.unit,
                  category: normalizeAisle(ing.category),
                })),
              },
            },
          },
        })),
      },
    },
  });

  return { mealPlanId: plan.id, recipes };
}

/** Consolidate due staples + plan ingredients into a persisted ShoppingList. */
export async function buildShoppingList(formData: FormData): Promise<void> {
  const mealPlanId = String(formData.get("mealPlanId") ?? "");
  if (!mealPlanId) return;

  const [plan, staples] = await Promise.all([
    prisma.mealPlan.findUnique({
      where: { id: mealPlanId },
      include: {
        recipes: { include: { recipe: { include: { ingredients: true } } } },
      },
    }),
    prisma.staple.findMany(),
  ]);
  if (!plan) return;

  const raw: MergeInput[] = [
    ...dueStaples(staples).map((s) => ({
      name: s.name,
      quantity: s.defaultQuantity,
      unit: s.unit,
      category: s.category,
      source: "staple" as const,
    })),
    ...plan.recipes.flatMap((mpr) =>
      mpr.recipe.ingredients.map((ing) => ({
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category,
        source: "recipe" as const,
      })),
    ),
  ];

  const { items } = DEMO
    ? { items: consolidateDeterministic(raw) }
    : await consolidateList(raw);

  const list = await prisma.shoppingList.create({
    data: {
      mealPlanId: plan.id,
      status: "draft",
      items: {
        create: items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          category: normalizeAisle(i.category),
          source: i.source,
        })),
      },
    },
  });

  await prisma.mealPlan.update({
    where: { id: plan.id },
    data: { status: "planned" },
  });

  redirect(`/list/${list.id}`);
}
