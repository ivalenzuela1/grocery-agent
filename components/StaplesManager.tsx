"use client";

import { useState } from "react";
import { AISLES, UNITS } from "@/lib/aisles";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  addStaple,
  updateStaple,
  deleteStaple,
  markStapleBought,
} from "@/lib/actions/staples";

export type StapleVM = {
  id: string;
  name: string;
  category: string;
  defaultQuantity: number;
  unit: string;
  cadenceDays: number;
  due: boolean;
  daysUntilDue: number;
};

const selectClasses =
  "rounded-xl border border-border bg-surface px-3 min-h-12 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary";

function Fields({ staple }: { staple?: StapleVM }) {
  return (
    <>
      <Input
        name="name"
        placeholder="Item name"
        defaultValue={staple?.name}
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          name="category"
          defaultValue={staple?.category ?? "Pantry"}
          className={selectClasses}
        >
          {AISLES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Input
            name="defaultQuantity"
            type="number"
            min={0}
            step="0.5"
            defaultValue={staple?.defaultQuantity ?? 1}
            className="w-20"
            aria-label="Quantity"
          />
          <select
            name="unit"
            defaultValue={staple?.unit ?? "each"}
            className={`${selectClasses} flex-1`}
            aria-label="Unit"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted">
        Buy every
        <Input
          name="cadenceDays"
          type="number"
          min={1}
          defaultValue={staple?.cadenceDays ?? 7}
          className="w-20"
          aria-label="Cadence in days"
        />
        days
      </label>
    </>
  );
}

function StapleRow({ staple }: { staple: StapleVM }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Card className="space-y-3 p-4">
        <form
          action={async (fd) => {
            await updateStaple(fd);
            setEditing(false);
          }}
          className="space-y-3"
        >
          <input type="hidden" name="id" value={staple.id} />
          <Fields staple={staple} />
          <div className="flex gap-2">
            <Button type="submit" size="md">
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card className="flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{staple.name}</span>
          {staple.due ? (
            <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent">
              Due
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-muted">
          {staple.defaultQuantity} {staple.unit} · every {staple.cadenceDays}d
          {!staple.due && staple.daysUntilDue > 0
            ? ` · in ${staple.daysUntilDue}d`
            : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <form action={markStapleBought}>
          <input type="hidden" name="id" value={staple.id} />
          <button
            type="submit"
            className="rounded-full px-2.5 py-1.5 text-sm text-muted hover:bg-background hover:text-ink"
            title="Mark as just bought (resets cadence)"
          >
            Bought
          </button>
        </form>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-full px-2.5 py-1.5 text-sm text-muted hover:bg-background hover:text-ink"
        >
          Edit
        </button>
        <form action={deleteStaple}>
          <input type="hidden" name="id" value={staple.id} />
          <button
            type="submit"
            aria-label={`Delete ${staple.name}`}
            className="rounded-full px-2.5 py-1.5 text-sm text-muted hover:bg-danger-soft hover:text-danger"
          >
            ✕
          </button>
        </form>
      </div>
    </Card>
  );
}

export function StaplesManager({ staples }: { staples: StapleVM[] }) {
  const [showAdd, setShowAdd] = useState(staples.length === 0);

  return (
    <div className="space-y-4">
      {showAdd ? (
        <Card className="space-y-3 p-4">
          <p className="font-medium">New staple</p>
          <form
            action={async (fd) => {
              await addStaple(fd);
              setShowAdd(false);
            }}
            className="space-y-3"
          >
            <Fields />
            <div className="flex gap-2">
              <Button type="submit">Add staple</Button>
              {staples.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdd(false)}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      ) : (
        <Button variant="ghost" onClick={() => setShowAdd(true)}>
          + Add a staple
        </Button>
      )}

      <div className="space-y-2.5">
        {staples.map((s) => (
          <StapleRow key={s.id} staple={s} />
        ))}
      </div>
    </div>
  );
}
