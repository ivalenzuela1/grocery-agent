import type { Staple } from "@prisma/client";

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * A staple is "due" if it has never been ordered, or if at least `cadenceDays`
 * have elapsed since it was last ordered.
 */
export function isDue(staple: Staple, now: Date = new Date()): boolean {
  if (!staple.lastOrderedAt) return true;
  const elapsedDays = (now.getTime() - staple.lastOrderedAt.getTime()) / DAY_MS;
  return elapsedDays >= staple.cadenceDays;
}

/** Whole days until a staple is next due (0 or negative means due now). */
export function daysUntilDue(staple: Staple, now: Date = new Date()): number {
  if (!staple.lastOrderedAt) return 0;
  const dueAt = staple.lastOrderedAt.getTime() + staple.cadenceDays * DAY_MS;
  return Math.ceil((dueAt - now.getTime()) / DAY_MS);
}

export function dueStaples(staples: Staple[], now: Date = new Date()): Staple[] {
  return staples.filter((s) => isDue(s, now));
}
