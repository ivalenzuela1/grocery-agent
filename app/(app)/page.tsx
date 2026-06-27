import Link from "next/link";
import { prisma } from "@/lib/db";
import { dueStaples } from "@/lib/staples";
import { aisleOrder } from "@/lib/aisles";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [staples, latestList] = await Promise.all([
    prisma.staple.findMany(),
    prisma.shoppingList.findFirst({
      where: { status: { not: "ordered" } },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
    }),
  ]);

  const due = dueStaples(staples).sort(
    (a, b) =>
      aisleOrder(a.category) - aisleOrder(b.category) ||
      a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-5 pb-10">
      <div className="animate-rise">
        <h1>This week</h1>
        <p className="mt-1 text-muted">Glance, approve, done.</p>
      </div>

      {latestList ? (
        <Card className="animate-rise overflow-hidden">
          <Link href={`/list/${latestList.id}`} className="block p-5">
            <p className="text-sm font-medium text-accent">
              {latestList.status === "approved"
                ? "Approved list ready"
                : "List in progress"}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {latestList._count.items} items · pick up where you left off
            </p>
            <span className="mt-1 inline-block text-sm text-muted">
              Continue →
            </span>
          </Link>
        </Card>
      ) : null}

      <Card className="animate-rise p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Staples due</h2>
          <Link href="/staples" className="text-sm text-muted hover:text-ink">
            Manage
          </Link>
        </div>

        {due.length === 0 ? (
          <p className="mt-2 text-muted">
            {staples.length === 0
              ? "No staples yet. Add the things you buy every week so they pre-fill automatically."
              : "Nothing due right now — you're stocked up."}
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted">
              {due.length} item{due.length === 1 ? "" : "s"} ready to add to this
              week&rsquo;s cart.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {due.slice(0, 12).map((s) => (
                <span
                  key={s.id}
                  className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-medium text-primary"
                >
                  {s.name}
                </span>
              ))}
              {due.length > 12 ? (
                <span className="px-1 py-1.5 text-sm text-muted">
                  +{due.length - 12} more
                </span>
              ) : null}
            </div>
          </>
        )}

        {staples.length === 0 ? (
          <Link
            href="/staples"
            className={`${buttonClasses("ghost")} mt-4`}
          >
            Add staples
          </Link>
        ) : null}
      </Card>

      <Link href="/plan" className={buttonClasses("accent", "lg")}>
        Plan this week&rsquo;s meals →
      </Link>
    </div>
  );
}
