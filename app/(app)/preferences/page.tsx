import { getPreference, savePreferences } from "@/lib/actions/preferences";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Field } from "@/components/ui/Input";
import { TagInput } from "@/components/ui/TagInput";

export const dynamic = "force-dynamic";

export default async function PreferencesPage() {
  const pref = await getPreference();

  return (
    <form action={savePreferences} className="space-y-5 pb-28">
      <div>
        <h1>Preferences</h1>
        <p className="mt-1 text-muted">
          These shape every meal plan. Allergies are treated as hard limits.
        </p>
      </div>

      <Card className="space-y-5 p-5">
        <Field label="Likes" hint="Foods and cuisines to lean into.">
          <TagInput
            name="likes"
            defaultValue={pref.likes}
            placeholder="e.g. salmon, Thai, roasted veg"
          />
        </Field>

        <Field label="Dislikes" hint="The planner will avoid these.">
          <TagInput
            name="dislikes"
            defaultValue={pref.dislikes}
            placeholder="e.g. cilantro, very spicy"
          />
        </Field>

        <Field label="Allergies & restrictions" hint="Never included. Ever.">
          <TagInput
            name="allergies"
            defaultValue={pref.allergies}
            placeholder="e.g. peanuts, shellfish"
            tone="danger"
          />
        </Field>
      </Card>

      <Card className="grid grid-cols-2 gap-4 p-5">
        <Field label="Household size">
          <Input
            name="householdSize"
            type="number"
            min={1}
            max={12}
            defaultValue={pref.householdSize}
          />
        </Field>
        <Field label="Weekly budget ($)" hint="Optional">
          <Input
            name="budget"
            type="number"
            min={0}
            step="1"
            placeholder="60"
            defaultValue={
              pref.defaultBudgetCents != null
                ? (pref.defaultBudgetCents / 100).toString()
                : ""
            }
          />
        </Field>
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-surface/85 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md shadow-[var(--shadow-bar)]">
        <div className="mx-auto max-w-xl">
          <Button type="submit" size="lg">
            Save preferences
          </Button>
        </div>
      </div>
    </form>
  );
}
