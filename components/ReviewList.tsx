"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AISLES, UNITS, aisleOrder } from "@/lib/aisles";
import { approveAndOrder, type ApproveResult } from "@/lib/actions/list";
import type { OrderItem } from "@/lib/ordering";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Stepper } from "@/components/ui/Stepper";
import { Checkbox } from "@/components/ui/Checkbox";

export type ReviewItem = {
  key: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  source: "staple" | "recipe" | "adhoc";
};

const sourceLabel: Record<ReviewItem["source"], string> = {
  staple: "staple",
  recipe: "recipe",
  adhoc: "added",
};

const selectClasses =
  "rounded-xl border border-border bg-surface px-3 min-h-12 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary";

let keySeq = 0;

export function ReviewList({
  listId,
  initialItems,
}: {
  listId: string;
  initialItems: ReviewItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<ReviewItem[]>(initialItems);
  const [done, setDone] = useState<ApproveResult | null>(null);
  const [pending, startTransition] = useTransition();

  const groups = useMemo(() => {
    const sorted = [...items].sort(
      (a, b) =>
        aisleOrder(a.category) - aisleOrder(b.category) ||
        a.name.localeCompare(b.name),
    );
    const out: { aisle: string; items: ReviewItem[] }[] = [];
    for (const it of sorted) {
      let g = out.find((x) => x.aisle === it.category);
      if (!g) out.push((g = { aisle: it.category, items: [] }));
      g.items.push(it);
    }
    return out;
  }, [items]);

  const setQty = (key: string, quantity: number) =>
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));

  const remove = (key: string) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const addAdhoc = (item: Omit<ReviewItem, "key">) =>
    setItems((prev) => [...prev, { ...item, key: `new-${keySeq++}` }]);

  const approve = () => {
    const payload: OrderItem[] = items.map(
      ({ name, quantity, unit, category, source }) => ({
        name,
        quantity,
        unit,
        category,
        source,
      }),
    );
    startTransition(async () => {
      const res = await approveAndOrder(listId, payload);
      setDone(res);
    });
  };

  if (done) {
    return <ExportPanel listId={listId} result={done} onHome={() => router.push("/")} />;
  }

  return (
    <div className="space-y-5 pb-28">
      <div>
        <h1>Review &amp; approve</h1>
        <p className="mt-1 text-muted">
          Staples and recipe ingredients, merged and grouped by aisle.
        </p>
      </div>

      {items.length === 0 ? (
        <Card className="p-5 text-muted">
          This list is empty. Add an item below.
        </Card>
      ) : (
        groups.map((g) => (
          <section key={g.aisle}>
            <h2 className="sticky top-14 z-10 -mx-4 bg-background/85 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-muted backdrop-blur">
              {g.aisle}
            </h2>
            <div className="space-y-2">
              {g.items.map((it) => (
                <Card
                  key={it.key}
                  className="flex items-center justify-between gap-3 p-3 pl-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{it.name}</p>
                    <p className="text-xs text-muted">{sourceLabel[it.source]}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Stepper
                      value={it.quantity}
                      onChange={(v) => setQty(it.key, v)}
                      step={0.5}
                      unit={it.unit !== "each" ? it.unit : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => remove(it.key)}
                      aria-label={`Remove ${it.name}`}
                      className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"
                    >
                      ✕
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}

      <AddItem onAdd={addAdhoc} />

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-surface/85 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md shadow-[var(--shadow-bar)]">
        <div className="mx-auto max-w-xl">
          <Button
            type="button"
            variant="accent"
            size="lg"
            onClick={approve}
            disabled={pending || items.length === 0}
          >
            {pending
              ? "Preparing…"
              : `Approve & order · ${items.length} item${items.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AddItem({ onAdd }: { onAdd: (i: Omit<ReviewItem, "key">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("each");
  const [category, setCategory] = useState("Other");

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        + Add an item
      </Button>
    );
  }

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), quantity, unit, category, source: "adhoc" });
    setName("");
    setQuantity(1);
    setUnit("each");
    setCategory("Other");
    setOpen(false);
  };

  return (
    <Card className="space-y-3 p-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name"
        autoFocus
      />
      <div className="flex flex-wrap items-center gap-2">
        <Stepper value={quantity} onChange={setQuantity} step={0.5} />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className={selectClasses}
          aria-label="Unit"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`${selectClasses} flex-1`}
          aria-label="Aisle"
        >
          {AISLES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div className="flex gap-2">
        <Button type="button" onClick={submit}>
          Add
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </Card>
  );
}

function ExportPanel({
  listId,
  result,
  onHome,
}: {
  listId: string;
  result: ApproveResult;
  onHome: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const copy = async () => {
    await navigator.clipboard.writeText(result.export.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-5 pb-28">
      <Card className="animate-rise p-5 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-2xl text-primary">
          ✓
        </div>
        <h1>List ready</h1>
        <p className="mt-1 text-muted">{result.result.message}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={copy}>
            {copied ? "Copied!" : "Copy list"}
          </Button>
          <a
            href={`/api/order?listId=${listId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface px-4 text-[15px] font-semibold text-ink hover:bg-background"
          >
            Download .txt
          </a>
        </div>
      </Card>

      <p className="px-1 text-sm text-muted">
        Tap an item to search it on Amazon Fresh, then check it off as you add it
        to your cart.
      </p>

      {result.export.groups.map((g) => (
        <section key={g.aisle}>
          <h2 className="sticky top-14 z-10 -mx-4 bg-background/85 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-muted backdrop-blur">
            {g.aisle}
          </h2>
          <Card className="divide-y divide-border">
            {g.items.map((it, idx) => {
              const k = `${g.aisle}-${idx}`;
              const isAdded = !!added[k];
              return (
                <div key={k} className="flex items-center gap-3 p-3 pl-4">
                  <Checkbox
                    checked={isAdded}
                    onChange={(v) => setAdded((p) => ({ ...p, [k]: v }))}
                    label={`Mark ${it.name} added`}
                  />
                  <a
                    href={it.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 text-[15px] ${isAdded ? "text-muted line-through" : "text-ink"}`}
                  >
                    {it.label}
                  </a>
                  <span className="text-xs text-muted">search ↗</span>
                </div>
              );
            })}
          </Card>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-4 border-t border-border bg-surface/85 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md shadow-[var(--shadow-bar)]">
        <div className="mx-auto max-w-xl">
          <Button type="button" variant="primary" size="lg" onClick={onHome}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
