/* eslint-disable @typescript-eslint/no-explicit-any */
// In-memory data layer used when DEMO mode is on (no Postgres required).
// Implements just the subset of the Prisma client surface the app calls, with
// matching shapes (nested create, include, _count, $transaction). State lives in
// module scope, so it persists across requests within the running dev process
// and resets on restart.

const DAY = 86400000;

// State lives on globalThis so every Next bundle (RSC pages, server actions,
// route handlers) shares ONE store instead of each getting its own copy.
const g = globalThis as unknown as { __grocerySeq?: number };
const id = (p: string) => {
  g.__grocerySeq = (g.__grocerySeq ?? 0) + 1;
  return `${p}_${g.__grocerySeq.toString(36)}${Date.now().toString(36)}`;
};

type Any = Record<string, any>;

type Pref = {
  id: string;
  likes: string[];
  dislikes: string[];
  allergies: string[];
  householdSize: number;
  defaultBudgetCents: number | null;
  createdAt: Date;
  updatedAt: Date;
};
type Staple = {
  id: string;
  name: string;
  category: string;
  defaultQuantity: number;
  unit: string;
  cadenceDays: number;
  lastOrderedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
type Ingredient = {
  id: string;
  recipeId: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
};
type Recipe = {
  id: string;
  title: string;
  servings: number;
  source: string;
  instructions: string;
  ingredients: Ingredient[];
  createdAt: Date;
  updatedAt: Date;
};
type MealPlan = {
  id: string;
  weekOf: Date;
  constraintsJson: unknown;
  status: string;
  recipeIds: string[];
  createdAt: Date;
  updatedAt: Date;
};
type Item = {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  source: string;
  checked: boolean;
};
type ShoppingList = {
  id: string;
  mealPlanId: string | null;
  status: string;
  items: Item[];
  createdAt: Date;
  updatedAt: Date;
};

type DemoDb = {
  preference: Pref | null;
  staples: Staple[];
  recipes: Recipe[];
  mealPlans: MealPlan[];
  lists: ShoppingList[];
  seeded: boolean;
};

const store = globalThis as unknown as { __groceryDb?: DemoDb };
const db: DemoDb = (store.__groceryDb ??= {
  preference: null,
  staples: [],
  recipes: [],
  mealPlans: [],
  lists: [],
  seeded: false,
});

function seed() {
  const now = Date.now();
  db.preference = {
    id: id("pref"),
    likes: ["salmon", "thai", "roasted veg"],
    dislikes: ["cilantro"],
    allergies: ["peanuts"],
    householdSize: 4,
    defaultBudgetCents: 6000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mkStaple = (s: Partial<Staple> & { name: string; category: string }): Staple => ({
    id: id("stp"),
    defaultQuantity: 1,
    unit: "each",
    cadenceDays: 7,
    lastOrderedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...s,
  });
  db.staples = [
    mkStaple({ name: "Milk", category: "Dairy & Eggs" }),
    mkStaple({ name: "Eggs", category: "Dairy & Eggs", unit: "dozen", lastOrderedAt: new Date(now - 8 * DAY) }),
    mkStaple({ name: "Bananas", category: "Produce", unit: "bunch" }),
    mkStaple({ name: "Coffee", category: "Beverages", unit: "pack", cadenceDays: 30, lastOrderedAt: new Date(now) }),
    mkStaple({ name: "Olive oil", category: "Pantry", cadenceDays: 45, lastOrderedAt: new Date(now - 10 * DAY) }),
  ];
  const list: ShoppingList = {
    id: id("lst"),
    mealPlanId: null,
    status: "draft",
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  list.items = [
    ["Yellow onion", "Produce", 3, "each", "recipe"],
    ["Bell pepper", "Produce", 2, "each", "recipe"],
    ["Chicken breast", "Meat & Seafood", 2, "lb", "recipe"],
    ["Milk", "Dairy & Eggs", 1, "each", "staple"],
    ["Coconut milk", "Canned & Jarred", 1, "can", "recipe"],
    ["Basmati rice", "Pantry", 1, "pack", "recipe"],
  ].map(([name, category, quantity, unit, source]) => ({
    id: id("itm"),
    listId: list.id,
    name: name as string,
    category: category as string,
    quantity: quantity as number,
    unit: unit as string,
    source: source as string,
    checked: false,
  }));
  db.lists = [list];
}
if (!db.seeded) {
  seed();
  db.seeded = true;
}

const touch = () => new Date();

export const demoStore = {
  preference: {
    findFirst: async () => db.preference,
    create: async ({ data }: Any) => {
      db.preference = {
        id: id("pref"),
        likes: [],
        dislikes: [],
        allergies: [],
        householdSize: 2,
        defaultBudgetCents: null,
        createdAt: touch(),
        updatedAt: touch(),
        ...(data as Any),
      } as Pref;
      return db.preference;
    },
    update: async ({ data }: Any) => {
      db.preference = { ...(db.preference as Pref), ...(data as Any), updatedAt: touch() } as Pref;
      return db.preference;
    },
  },

  staple: {
    findMany: async () => [...db.staples],
    create: async ({ data }: Any) => {
      const s: Staple = {
        id: id("stp"),
        defaultQuantity: 1,
        unit: "each",
        cadenceDays: 7,
        lastOrderedAt: null,
        createdAt: touch(),
        updatedAt: touch(),
        ...(data as Any),
      } as Staple;
      db.staples.push(s);
      return s;
    },
    update: async ({ where, data }: Any) => {
      const w = where as { id: string };
      const i = db.staples.findIndex((s) => s.id === w.id);
      if (i >= 0) db.staples[i] = { ...db.staples[i], ...(data as Any), updatedAt: touch() };
      return db.staples[i];
    },
    delete: async ({ where }: Any) => {
      const w = where as { id: string };
      db.staples = db.staples.filter((s) => s.id !== w.id);
      return { id: w.id };
    },
    updateMany: async ({ where, data }: Any) => {
      const ids: string[] = (where as Any)?.id?.["in"] ?? [];
      db.staples = db.staples.map((s) =>
        ids.includes(s.id) ? { ...s, ...(data as Any), updatedAt: touch() } : s,
      );
      return { count: ids.length };
    },
  },

  mealPlan: {
    create: async ({ data }: Any) => {
      const d = data as Any;
      const recipeIds: string[] = [];
      const creates = ((d.recipes as Any)?.create ?? []) as Any[];
      for (const link of creates) {
        const rc = (link.recipe as Any).create as Any;
        const rid = id("rcp");
        const ings = (((rc.ingredients as Any)?.create ?? []) as Any[]).map((ing) => ({
          id: id("ing"),
          recipeId: rid,
          name: ing.name,
          quantity: ing.quantity ?? 1,
          unit: ing.unit ?? "each",
          category: ing.category ?? "Other",
        })) as Ingredient[];
        db.recipes.push({
          id: rid,
          title: rc.title as string,
          servings: (rc.servings as number) ?? 2,
          source: (rc.source as string) ?? "ai",
          instructions: (rc.instructions as string) ?? "",
          ingredients: ings,
          createdAt: touch(),
          updatedAt: touch(),
        });
        recipeIds.push(rid);
      }
      const plan: MealPlan = {
        id: id("mp"),
        weekOf: (d.weekOf as Date) ?? touch(),
        constraintsJson: d.constraintsJson ?? {},
        status: (d.status as string) ?? "draft",
        recipeIds,
        createdAt: touch(),
        updatedAt: touch(),
      };
      db.mealPlans.push(plan);
      return plan;
    },
    findUnique: async ({ where }: Any) => {
      const w = where as { id: string };
      const plan = db.mealPlans.find((p) => p.id === w.id);
      if (!plan) return null;
      return {
        ...plan,
        recipes: plan.recipeIds
          .map((rid) => db.recipes.find((r) => r.id === rid))
          .filter(Boolean)
          .map((recipe) => ({ recipe })),
      };
    },
    update: async ({ where, data }: Any) => {
      const w = where as { id: string };
      const p = db.mealPlans.find((x) => x.id === w.id);
      if (p) Object.assign(p, data as Any, { updatedAt: touch() });
      return p;
    },
  },

  shoppingList: {
    create: async ({ data }: Any) => {
      const d = data as Any;
      const list: ShoppingList = {
        id: id("lst"),
        mealPlanId: (d.mealPlanId as string) ?? null,
        status: (d.status as string) ?? "draft",
        items: [],
        createdAt: touch(),
        updatedAt: touch(),
      };
      const creates = ((d.items as Any)?.create ?? []) as Any[];
      list.items = creates.map((it) => ({
        id: id("itm"),
        listId: list.id,
        name: it.name,
        quantity: it.quantity ?? 1,
        unit: it.unit ?? "each",
        category: it.category ?? "Other",
        source: it.source ?? "adhoc",
        checked: false,
      })) as Item[];
      db.lists.push(list);
      return list;
    },
    findFirst: async ({ where, orderBy }: Any = {}) => {
      let rows = [...db.lists];
      const notStatus = (where as Any)?.status?.not as string | undefined;
      if (notStatus) rows = rows.filter((l) => l.status !== notStatus);
      if ((orderBy as Any)?.createdAt === "desc")
        rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const l = rows[0];
      if (!l) return null;
      return { ...l, _count: { items: l.items.length } };
    },
    findUnique: async ({ where }: Any) => {
      const w = where as { id: string };
      const l = db.lists.find((x) => x.id === w.id);
      return l ? { ...l, items: [...l.items] } : null;
    },
    update: async ({ where, data }: Any) => {
      const w = where as { id: string };
      const l = db.lists.find((x) => x.id === w.id);
      if (l) Object.assign(l, data as Any, { updatedAt: touch() });
      return l;
    },
  },

  shoppingListItem: {
    deleteMany: async ({ where }: Any) => {
      const listId = (where as Any)?.listId as string;
      const l = db.lists.find((x) => x.id === listId);
      const n = l?.items.length ?? 0;
      if (l) l.items = [];
      return { count: n };
    },
    createMany: async ({ data }: Any) => {
      const rows = data as Any[];
      for (const it of rows) {
        const l = db.lists.find((x) => x.id === it.listId);
        if (l)
          l.items.push({
            id: id("itm"),
            listId: it.listId,
            name: it.name,
            quantity: it.quantity ?? 1,
            unit: it.unit ?? "each",
            category: it.category ?? "Other",
            source: it.source ?? "adhoc",
            checked: false,
          });
      }
      return { count: rows.length };
    },
  },

  $transaction: async (ops: Promise<unknown>[]) => Promise.all(ops),
};
