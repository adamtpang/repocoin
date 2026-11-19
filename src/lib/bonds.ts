import type { BondRole, ProjectParams } from "./types";

export type BondCheck = { ok: true } | { ok: false; reason: string };

/**
 * Role bonds are mocked in the database. Contribution history (reputation)
 * qualifies someone; the bond, posted from points they already vested, makes
 * them accountable while they serve. Points cannot be bought in the
 * prototype, and no balance ever grants merge or write access.
 */
export function checkBondEligibility(input: {
  role: BondRole;
  bondPoints: number;
  reputation: number;
  vestedPoints: number;
  alreadyBondedPoints: number;
  hasActiveBondForRole: boolean;
  params: Pick<ProjectParams, "minReputationToBond">;
}): BondCheck {
  if (!Number.isInteger(input.bondPoints) || input.bondPoints <= 0) {
    return { ok: false, reason: "Bond must be a positive whole number of prototype points." };
  }
  if (input.hasActiveBondForRole) {
    return { ok: false, reason: `Already holds an active ${input.role} bond.` };
  }
  if (input.reputation < input.params.minReputationToBond) {
    return {
      ok: false,
      reason: `Needs ${input.params.minReputationToBond} reputation from accepted work; has ${input.reputation}.`,
    };
  }
  if (input.vestedPoints - input.alreadyBondedPoints < input.bondPoints) {
    return { ok: false, reason: "Bond is larger than unbonded vested prototype points." };
  }
  return { ok: true };
}
