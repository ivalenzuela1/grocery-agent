// Verification seed: creates preferences, staples (some due), and a draft
// shopping list (simulating post-consolidation), then prints the list id and a
// valid auth cookie token so the protected pages can be smoke-tested via curl.
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

const prisma = new PrismaClient();
const DAY = 86400000;

async function main() {
  await prisma.shoppingListItem.deleteMany();
  await prisma.shoppingList.deleteMany();
  await prisma.staple.deleteMany();
  await prisma.preference.deleteMany();

  await prisma.preference.create({
    data: {
      likes: ["salmon", "thai", "roasted veg"],
      dislikes: ["cilantro"],
      allergies: ["peanuts"],
      householdSize: 4,
      defaultBudgetCents: 6000,
    },
  });

  await prisma.staple.createMany({
    data: [
      { name: "Milk", category: "Dairy & Eggs", defaultQuantity: 1, unit: "each", cadenceDays: 7, lastOrderedAt: null },
      { name: "Eggs", category: "Dairy & Eggs", defaultQuantity: 1, unit: "dozen", cadenceDays: 7, lastOrderedAt: new Date(Date.now() - 8 * DAY) },
      { name: "Coffee", category: "Beverages", defaultQuantity: 1, unit: "pack", cadenceDays: 30, lastOrderedAt: new Date() },
    ],
  });

  const list = await prisma.shoppingList.create({
    data: {
      status: "draft",
      items: {
        create: [
          { name: "Yellow onion", category: "Produce", quantity: 3, unit: "each", source: "recipe" },
          { name: "Chicken breast", category: "Meat & Seafood", quantity: 2, unit: "lb", source: "recipe" },
          { name: "Milk", category: "Dairy & Eggs", quantity: 1, unit: "each", source: "staple" },
          { name: "Olive oil", category: "Pantry", quantity: 1, unit: "each", source: "recipe" },
          { name: "Basmati rice", category: "Pantry", quantity: 1, unit: "pack", source: "recipe" },
        ],
      },
    },
  });

  const token = crypto
    .createHmac("sha256", process.env.AUTH_SECRET)
    .update("authorized")
    .digest("hex");

  console.log("LIST_ID=" + list.id);
  console.log("TOKEN=" + token);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
