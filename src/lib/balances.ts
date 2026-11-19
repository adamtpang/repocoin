import { vestedPoints } from "./vesting";
import type { LedgerEntry, PullCredit, RoleBond } from "./types";

export interface ContributorBalance {
  githubUserId: number;
  login: string;
  /** Every prototype point ever granted for accepted work, voided included. */
  grantedPoints: number;
  vestedPoints: number;
  /** Still vesting on live (not voided) credits. */
  unvestedPoints: number;
  /** Unvested at void time, returned to the treasury. */
  returnedPoints: number;
  bondedPoints: number;
  reputation: number;
}

/** Folds credits, the reputation ledger, and bonds into one row per person. */
export function computeBalances(
  credits: PullCredit[],
  ledger: LedgerEntry[],
  bonds: RoleBond[],
  at: Date,
): ContributorBalance[] {
  const rows = new Map<number, ContributorBalance>();
  const row = (id: number, login: string) => {
    let r = rows.get(id);
    if (!r) {
      r = {
        githubUserId: id,
        login,
        grantedPoints: 0,
        vestedPoints: 0,
        unvestedPoints: 0,
        returnedPoints: 0,
        bondedPoints: 0,
        reputation: 0,
      };
      rows.set(id, r);
    }
    return r;
  };

  for (const c of credits) {
    const r = row(c.authorId, c.authorLogin);
    const vested = vestedPoints(c, at);
    r.grantedPoints += c.points;
    r.vestedPoints += vested;
    if (c.status === "voided") r.returnedPoints += c.points - vested;
    else r.unvestedPoints += c.points - vested;
  }
  for (const e of ledger) {
    if (e.ledger === "reputation") row(e.githubUserId, e.githubLogin).reputation += e.amount;
  }
  for (const b of bonds) {
    if (b.status === "active") row(b.githubUserId, b.githubLogin).bondedPoints += b.bondPoints;
  }
  return [...rows.values()].sort(
    (a, b) => b.vestedPoints + b.unvestedPoints - (a.vestedPoints + a.unvestedPoints) || b.reputation - a.reputation,
  );
}

export function totals(balances: ContributorBalance[]) {
  return balances.reduce(
    (t, b) => ({
      granted: t.granted + b.grantedPoints,
      vested: t.vested + b.vestedPoints,
      unvested: t.unvested + b.unvestedPoints,
      returned: t.returned + b.returnedPoints,
      bonded: t.bonded + b.bondedPoints,
    }),
    { granted: 0, vested: 0, unvested: 0, returned: 0, bonded: 0 },
  );
}
