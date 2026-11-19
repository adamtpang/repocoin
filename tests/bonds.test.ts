import { describe, expect, it } from "vitest";
import { checkBondEligibility } from "@/lib/bonds";

const base = {
  role: "reviewer" as const,
  bondPoints: 50,
  reputation: 3,
  vestedPoints: 200,
  alreadyBondedPoints: 0,
  hasActiveBondForRole: false,
  params: { minReputationToBond: 3 },
};

describe("role bonds (database mock)", () => {
  it("allows a bond backed by reputation and vested points", () => {
    expect(checkBondEligibility(base)).toEqual({ ok: true });
  });
  it("refuses a bond without enough reputation, however many points", () => {
    expect(checkBondEligibility({ ...base, reputation: 0, vestedPoints: 1_000_000 }).ok).toBe(false);
  });
  it("refuses a bond larger than unbonded vested points", () => {
    expect(checkBondEligibility({ ...base, vestedPoints: 60, alreadyBondedPoints: 20 }).ok).toBe(false);
  });
  it("refuses a second active bond for the same role and bad amounts", () => {
    expect(checkBondEligibility({ ...base, hasActiveBondForRole: true }).ok).toBe(false);
    expect(checkBondEligibility({ ...base, bondPoints: 0 }).ok).toBe(false);
    expect(checkBondEligibility({ ...base, bondPoints: 1.5 }).ok).toBe(false);
  });
});
