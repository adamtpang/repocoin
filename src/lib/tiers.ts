/**
 * Priority tiers for dependents: Balaji's "companies buy token to prioritize
 * bugs & features", made concrete. A company reaches a tier by holding (and,
 * in a later version, locking) a balance of the project's token. In the
 * prototype nothing can be bought, so tiers are descriptive only.
 *
 * Thresholds and the lock period are assumptions, not decisions.
 */
export interface PriorityTier {
  name: string;
  /** Minimum held balance, in prototype points. */
  minHolding: number;
  perks: string[];
}

/** Assumption: a balance must stay locked this long to count, so a tier cannot be flash-bought. */
export const TIER_LOCK_DAYS = 30;

export const PRIORITY_TIERS: PriorityTier[] = [
  {
    name: "Community",
    minHolding: 0,
    perks: ["Open issue queue", "Open pull requests", "Public docs"],
  },
  {
    name: "Backer",
    minHolding: 1_000,
    perks: ["Your issues get a priority label and are triaged first"],
  },
  {
    name: "Partner",
    minHolding: 5_000,
    perks: ["Everything in Backer", "A support channel with the maintainers"],
  },
  {
    name: "Sponsor",
    minHolding: 20_000,
    perks: ["Everything in Partner", "Roadmap votes, as the constitution defines them"],
  },
];

/** The highest tier a locked holding reaches. */
export function tierFor(lockedHolding: number, tiers: PriorityTier[] = PRIORITY_TIERS): PriorityTier {
  let best = tiers[0];
  for (const t of tiers) if (lockedHolding >= t.minHolding && t.minHolding >= best.minHolding) best = t;
  return best;
}
