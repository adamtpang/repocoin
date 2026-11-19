import type { ProjectParams, PullCredit } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Adds calendar months in UTC, clamping to the last day of a shorter month. */
export function addMonthsUTC(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const target = new Date(Date.UTC(y, m, 1));
  const lastDay = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  target.setUTCHours(
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );
  return target;
}

/** Whole calendar months from `start` to `at` (0 if `at` is before `start`). */
export function wholeMonthsBetween(start: Date, at: Date): number {
  if (at < start) return 0;
  let months =
    (at.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (at.getUTCMonth() - start.getUTCMonth());
  while (months > 0 && addMonthsUTC(start, months) > at) months -= 1;
  while (addMonthsUTC(start, months + 1) <= at) months += 1;
  return months;
}

export interface VestingSchedule {
  disputeEndsAt: Date;
  vestStartAt: Date;
  cliffAt: Date;
  vestEndAt: Date;
}

/**
 * The dispute window runs first. Vesting starts when it closes, nothing vests
 * before the cliff, and after the cliff a slice vests each whole month.
 */
export function vestingSchedule(
  mergedAt: Date,
  params: Pick<ProjectParams, "disputeWindowDays" | "cliffMonths" | "vestMonths">,
): VestingSchedule {
  const disputeEndsAt = new Date(mergedAt.getTime() + params.disputeWindowDays * DAY_MS);
  const vestStartAt = disputeEndsAt;
  return {
    disputeEndsAt,
    vestStartAt,
    cliffAt: addMonthsUTC(vestStartAt, params.cliffMonths),
    vestEndAt: addMonthsUTC(vestStartAt, params.vestMonths),
  };
}

type VestFields = Pick<
  PullCredit,
  "points" | "vestStartAt" | "cliffAt" | "vestEndAt" | "voidedAt"
>;

/**
 * Prototype points vested at `at`. A maintainer void freezes vesting at the
 * void time: whatever was unvested then returns to the treasury.
 */
export function vestedPoints(credit: VestFields, at: Date): number {
  let effective = at;
  if (credit.voidedAt) {
    const voidedAt = new Date(credit.voidedAt);
    if (voidedAt < effective) effective = voidedAt;
  }
  const cliffAt = new Date(credit.cliffAt);
  if (effective < cliffAt) return 0;
  const start = new Date(credit.vestStartAt);
  const total = wholeMonthsBetween(start, new Date(credit.vestEndAt));
  if (total <= 0) return credit.points;
  const elapsed = Math.min(total, wholeMonthsBetween(start, effective));
  return Math.floor((credit.points * elapsed) / total);
}

export type VestPhase = "dispute_window" | "before_cliff" | "vesting" | "fully_vested" | "voided";

export function vestPhase(
  credit: Pick<PullCredit, "status" | "disputeEndsAt" | "cliffAt" | "vestEndAt">,
  at: Date,
): VestPhase {
  if (credit.status === "voided") return "voided";
  if (at < new Date(credit.disputeEndsAt)) return "dispute_window";
  if (at < new Date(credit.cliffAt)) return "before_cliff";
  if (at < new Date(credit.vestEndAt)) return "vesting";
  return "fully_vested";
}

export const PHASE_LABEL: Record<VestPhase, string> = {
  dispute_window: "In dispute window",
  before_cliff: "Before cliff",
  vesting: "Vesting",
  fully_vested: "Fully vested",
  voided: "Voided by maintainer",
};
