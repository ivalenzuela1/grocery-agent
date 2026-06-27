"use client";

import { useActionState } from "react";
import { planMeals, buildShoppingList, type PlanState } from "@/lib/actions/plan";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Field } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

const initial: PlanState = {};

export default function PlanPage() {
  const [state, formAction, pending] = useActionState(planMeals, initial);
  const hasResults = !!state.recipes?.length;

  return (
    <div className="space-y-5 pb-28">
      <div>
        <h1>Plan the week</h1>
        <p className="mt-1 text-muted">
          A few light constraints — we&rsquo;ll do the thinking.
        </p>
      </div>

      <Card className="p-5">
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Dinners">
              <Input
                name="dinners"
                type="number"
                min={1}
                max={14}
                defaultValue={4}
              />
            </Field>
            <Field label="Budget ($)" hint="Optional">
              <Input name="budget" type="number" min={0} placeholder="60" />
            </Field>
          </div>
          <Field label="Use up from the fridge" hint="Optional">
            <Input
              name="useUp"
              placeholder="e.g. half a cabbage, leftover rice"
            />
          </Field>
          <Field label="Anything else?" hint="Optional">
            <Textarea
              name="notes"
              placeholder="e.g. kid-friendly, nothing too spicy, one veggie night"
            />
          </Field>
          {state.error ? (
            <p className="text-sm text-danger">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending
              ? "Thinking…"
              : hasResults
                ? "Regenerate plan"
                : "Generate plan"}
          </Button>
        </form>
      </Card>

      {pending ? <LoadingRecipes /> : null}

      {!pending && hasResults ? (
        <>
          <div className="space-y-3">
            {state.recipes!.map((r, i) => (
              <Card key={i} className="animate-rise p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">{r.title}</h3>
                  <span className="shrink-0 text-sm text-muted">
                    serves {r.servings}
                  </span>
                </div>
                {r.instructions ? (
                  <p className="mt-1.5 text-sm text-muted">{r.instructions}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.ingredients.map((ing, j) => (
                    <span
                      key={j}
                      className="rounded-full bg-background px-2.5 py-1 text-xs text-ink"
                    >
                      {ing.quantity} {ing.unit} {ing.name}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <div className="sticky bottom-0 -mx-4 border-t border-border bg-surface/85 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md shadow-[var(--shadow-bar)]">
            <form action={buildShoppingList} className="mx-auto max-w-xl">
              <input type="hidden" name="mealPlanId" value={state.mealPlanId} />
              <Button type="submit" variant="accent" size="lg">
                Build shopping list →
              </Button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}

function LoadingRecipes() {
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-muted">
        Designing meals around your preferences…
      </p>
      {[0, 1, 2].map((i) => (
        <Card key={i} className="space-y-3 p-5">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        </Card>
      ))}
    </div>
  );
}
