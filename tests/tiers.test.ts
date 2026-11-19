import { describe, expect, it } from "vitest";
import { parseTicker } from "@/lib/constitution";
import { tierFor } from "@/lib/tiers";

describe("priority tiers", () => {
  it("maps a locked holding to the highest tier it reaches", () => {
    expect(tierFor(0).name).toBe("Community");
    expect(tierFor(999).name).toBe("Community");
    expect(tierFor(1_000).name).toBe("Backer");
    expect(tierFor(19_999).name).toBe("Partner");
    expect(tierFor(1_000_000).name).toBe("Sponsor");
  });
});

describe("ticker", () => {
  it("reads the ticker line from a constitution", () => {
    expect(parseTicker("# x\n\n**Ticker:** $REPO (proposed)\n")).toBe("REPO");
    expect(parseTicker("Ticker: $abc1")).toBe("ABC1");
    expect(parseTicker("**Ticker:** not set")).toBeNull();
    expect(parseTicker("no ticker here")).toBeNull();
  });
});
