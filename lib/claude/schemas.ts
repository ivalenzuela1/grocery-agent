import { z } from "zod";

export const aiIngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().nonnegative().default(1),
  unit: z.string().default("each"),
  category: z.string().default("Other"),
});

export const aiRecipeSchema = z.object({
  title: z.string().min(1),
  servings: z.coerce.number().int().positive().default(2),
  instructions: z.string().default(""),
  ingredients: z.array(aiIngredientSchema).default([]),
});

export const mealPlanResponseSchema = z.object({
  recipes: z.array(aiRecipeSchema).min(1),
});

export const consolidatedItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.coerce.number().nonnegative().default(1),
  unit: z.string().default("each"),
  category: z.string().default("Other"),
  source: z.enum(["staple", "recipe"]).default("recipe"),
});

export const consolidatedResponseSchema = z.object({
  items: z.array(consolidatedItemSchema),
});

export type AiRecipe = z.infer<typeof aiRecipeSchema>;
export type AiIngredient = z.infer<typeof aiIngredientSchema>;
export type ConsolidatedItem = z.infer<typeof consolidatedItemSchema>;
