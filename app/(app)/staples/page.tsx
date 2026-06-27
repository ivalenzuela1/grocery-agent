import { prisma } from "@/lib/db";
import { aisleOrder } from "@/lib/aisles";
import { isDue, daysUntilDue } from "@/lib/staples";
import { StaplesManager, type StapleVM } from "@/components/StaplesManager";

export const dynamic = "force-dynamic";

export default async function StaplesPage() {
  const staples = await prisma.staple.findMany();
  const now = new Date();

  const view: StapleVM[] = staples
    .map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      defaultQuantity: s.defaultQuantity,
      unit: s.unit,
      cadenceDays: s.cadenceDays,
      due: isDue(s, now),
      daysUntilDue: daysUntilDue(s, now),
    }))
    .sort(
      (a, b) =>
        aisleOrder(a.category) - aisleOrder(b.category) ||
        a.name.localeCompare(b.name),
    );

  return (
    <div className="space-y-5 pb-10">
      <div>
        <h1>Staples</h1>
        <p className="mt-1 text-muted">
          Recurring items. They surface on your home screen when they&rsquo;re
          due.
        </p>
      </div>
      <StaplesManager staples={view} />
    </div>
  );
}
