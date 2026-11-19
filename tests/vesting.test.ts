import { describe, expect, it } from "vitest";
import { addMonthsUTC, vestedPoints, vestingSchedule, vestPhase } from "@/lib/vesting";
import { DEFAULT_PARAMS } from "@/lib/types";

const merged = new Date("2026-01-10T12:00:00Z");
const s = vestingSchedule(merged, DEFAULT_PARAMS);
const credit = {
  points: 120,
  status: "vesting" as const,
  disputeEndsAt: s.disputeEndsAt.toISOString(),
  vestStartAt: s.vestStartAt.toISOString(),
  cliffAt: s.cliffAt.toISOString(),
  vestEndAt: s.vestEndAt.toISOString(),
  voidedAt: null as string | null,
};
const at = (iso: string) => new Date(iso);

describe("vesting schedule (assumption: 7-day dispute, 1-month cliff, 12-month vest)", () => {
  it("puts the cliff one month after the dispute window closes", () => {
    expect(s.disputeEndsAt.toISOString()).toBe("2026-01-17T12:00:00.000Z");
    expect(s.cliffAt.toISOString()).toBe("2026-02-17T12:00:00.000Z");
    expect(s.vestEndAt.toISOString()).toBe("2027-01-17T12:00:00.000Z");
  });

  it("vests zero inside the dispute window", () => {
    expect(vestedPoints(credit, at("2026-01-12T00:00:00Z"))).toBe(0);
    expect(vestPhase(credit, at("2026-01-12T00:00:00Z"))).toBe("dispute_window");
  });

  it("vests zero before the cliff", () => {
    expect(vestedPoints(credit, at("2026-02-17T11:59:59Z"))).toBe(0);
    expect(vestPhase(credit, at("2026-02-01T00:00:00Z"))).toBe("before_cliff");
  });

  it("vests one month's slice at the cliff, then monthly", () => {
    expect(vestedPoints(credit, at("2026-02-17T12:00:00Z"))).toBe(10);
    expect(vestedPoints(credit, at("2026-03-16T00:00:00Z"))).toBe(10);
    expect(vestedPoints(credit, at("2026-03-17T12:00:00Z"))).toBe(20);
  });

  it("is fully vested at the end and never more", () => {
    expect(vestedPoints(credit, at("2027-01-17T12:00:00Z"))).toBe(120);
    expect(vestedPoints(credit, at("2030-01-01T00:00:00Z"))).toBe(120);
    expect(vestPhase(credit, at("2027-02-01T00:00:00Z"))).toBe("fully_vested");
  });

  it("stops vesting at a maintainer void", () => {
    const voided = { ...credit, status: "voided" as const, voidedAt: "2026-05-01T00:00:00Z" };
    const atVoid = vestedPoints(voided, at("2026-05-01T00:00:00Z"));
    expect(atVoid).toBe(30);
    expect(vestedPoints(voided, at("2026-12-01T00:00:00Z"))).toBe(atVoid);
    expect(vestedPoints(voided, at("2028-01-01T00:00:00Z"))).toBe(atVoid);
    expect(vestPhase(voided, at("2026-12-01T00:00:00Z"))).toBe("voided");
  });

  it("vests nothing, ever, when voided inside the dispute window", () => {
    const voided = { ...credit, status: "voided" as const, voidedAt: "2026-01-12T00:00:00Z" };
    expect(vestedPoints(voided, at("2030-01-01T00:00:00Z"))).toBe(0);
  });

  it("clamps month arithmetic to the end of short months", () => {
    expect(addMonthsUTC(new Date("2026-01-31T00:00:00Z"), 1).toISOString()).toBe("2026-02-28T00:00:00.000Z");
  });
});
