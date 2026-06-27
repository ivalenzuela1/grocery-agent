import type { AiRecipe } from "@/lib/claude/schemas";

// Static recipes used in DEMO mode so the planner works without an API key.
const POOL: AiRecipe[] = [
  {
    title: "Sheet-Pan Lemon Chicken & Veg",
    servings: 4,
    instructions:
      "Toss chicken and chopped vegetables with olive oil, lemon, salt and pepper. Roast at 425°F for 30 minutes until cooked through.",
    ingredients: [
      { name: "Chicken thighs", quantity: 2, unit: "lb", category: "Meat & Seafood" },
      { name: "Broccoli", quantity: 1, unit: "bunch", category: "Produce" },
      { name: "Lemon", quantity: 2, unit: "each", category: "Produce" },
      { name: "Olive oil", quantity: 2, unit: "tbsp", category: "Pantry" },
    ],
  },
  {
    title: "Thai Coconut Veggie Curry",
    servings: 4,
    instructions:
      "Sauté aromatics, stir in curry paste and coconut milk, simmer vegetables until tender. Serve over rice.",
    ingredients: [
      { name: "Coconut milk", quantity: 1, unit: "can", category: "Canned & Jarred" },
      { name: "Red curry paste", quantity: 2, unit: "tbsp", category: "Condiments & Sauces" },
      { name: "Bell pepper", quantity: 2, unit: "each", category: "Produce" },
      { name: "Yellow onion", quantity: 1, unit: "each", category: "Produce" },
      { name: "Basmati rice", quantity: 1, unit: "pack", category: "Pantry" },
    ],
  },
  {
    title: "Baked Salmon with Greens",
    servings: 4,
    instructions:
      "Season salmon and bake at 400°F for 12-15 minutes. Serve with a quick lemony green salad.",
    ingredients: [
      { name: "Salmon fillet", quantity: 1.5, unit: "lb", category: "Meat & Seafood" },
      { name: "Mixed greens", quantity: 1, unit: "bunch", category: "Produce" },
      { name: "Lemon", quantity: 1, unit: "each", category: "Produce" },
      { name: "Olive oil", quantity: 1, unit: "tbsp", category: "Pantry" },
    ],
  },
  {
    title: "Hearty Beef & Veg Pasta",
    servings: 4,
    instructions:
      "Brown beef with onion and garlic, add tomato sauce and simmer. Toss with cooked pasta.",
    ingredients: [
      { name: "Ground beef", quantity: 1, unit: "lb", category: "Meat & Seafood" },
      { name: "Yellow onion", quantity: 1, unit: "each", category: "Produce" },
      { name: "Pasta", quantity: 1, unit: "pack", category: "Pantry" },
      { name: "Tomato sauce", quantity: 1, unit: "can", category: "Canned & Jarred" },
    ],
  },
  {
    title: "Black Bean Quesadillas",
    servings: 4,
    instructions:
      "Mash black beans with spices, fill tortillas with beans and cheese, griddle until golden.",
    ingredients: [
      { name: "Black beans", quantity: 2, unit: "can", category: "Canned & Jarred" },
      { name: "Tortillas", quantity: 1, unit: "pack", category: "Bakery" },
      { name: "Shredded cheese", quantity: 1, unit: "pack", category: "Dairy & Eggs" },
      { name: "Bell pepper", quantity: 1, unit: "each", category: "Produce" },
    ],
  },
  {
    title: "Veggie Fried Rice",
    servings: 4,
    instructions:
      "Stir-fry mixed vegetables and cooked rice with soy sauce and egg until hot.",
    ingredients: [
      { name: "Basmati rice", quantity: 1, unit: "pack", category: "Pantry" },
      { name: "Frozen mixed vegetables", quantity: 1, unit: "pack", category: "Frozen" },
      { name: "Eggs", quantity: 3, unit: "each", category: "Dairy & Eggs" },
      { name: "Soy sauce", quantity: 2, unit: "tbsp", category: "Condiments & Sauces" },
    ],
  },
];

export function sampleRecipes(count: number): AiRecipe[] {
  const out: AiRecipe[] = [];
  for (let i = 0; i < count; i++) out.push(POOL[i % POOL.length]);
  return out;
}
