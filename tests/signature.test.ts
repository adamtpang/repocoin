import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWebhookSignature } from "@/lib/github/signature";

const body = JSON.stringify({ hello: "world" });
const sign = (secret: string, b: string) => "sha256=" + createHmac("sha256", secret).update(b).digest("hex");

describe("GitHub webhook signature", () => {
  it("accepts a correct signature", () => {
    expect(verifyWebhookSignature("s3cret", body, sign("s3cret", body))).toBe(true);
  });
  it("rejects a wrong secret, a tampered body, and missing headers", () => {
    expect(verifyWebhookSignature("s3cret", body, sign("other", body))).toBe(false);
    expect(verifyWebhookSignature("s3cret", body + " ", sign("s3cret", body))).toBe(false);
    expect(verifyWebhookSignature("s3cret", body, null)).toBe(false);
    expect(verifyWebhookSignature("s3cret", body, "sha1=abc")).toBe(false);
    expect(verifyWebhookSignature("", body, sign("", body))).toBe(false);
  });
});
