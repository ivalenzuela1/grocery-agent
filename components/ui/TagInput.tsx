"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Chip-based multi-value input. Renders a hidden input per tag named `name`
 * so the values post natively inside a <form> (works with server actions).
 */
export function TagInput({
  name,
  defaultValue = [],
  placeholder = "Type and press Enter",
  tone = "neutral",
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
  tone?: "neutral" | "danger";
}) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (tags.some((t) => t.toLowerCase() === v.toLowerCase())) {
      setDraft("");
      return;
    }
    setTags([...tags, v]);
    setDraft("");
  };

  const remove = (t: string) => setTags(tags.filter((x) => x !== t));

  const chip =
    tone === "danger"
      ? "bg-danger-soft text-danger"
      : "bg-primary-soft text-primary";

  return (
    <div className="rounded-xl border border-border bg-surface p-2 focus-within:ring-2 focus-within:ring-primary">
      {tags.map((t) => (
        <input key={t} type="hidden" name={name} value={t} />
      ))}
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
              chip,
            )}
          >
            {t}
            <button
              type="button"
              onClick={() => remove(t)}
              aria-label={`Remove ${t}`}
              className="grid h-4 w-4 place-items-center rounded-full text-current/70 hover:text-current"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && tags.length) {
              remove(tags[tags.length - 1]);
            }
          }}
          onBlur={() => add(draft)}
          placeholder={tags.length ? "" : placeholder}
          className="min-w-32 flex-1 bg-transparent px-2 py-1.5 text-[15px] outline-none placeholder:text-muted"
        />
      </div>
    </div>
  );
}
