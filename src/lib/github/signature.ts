import { createHmac, timingSafeEqual } from "node:crypto";

/** Verifies GitHub's X-Hub-Signature-256 header against the raw request body. */
export function verifyWebhookSignature(
  secret: string,
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!secret || !signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = Buffer.from(
    "sha256=" + createHmac("sha256", secret).update(rawBody, "utf8").digest("hex"),
    "utf8",
  );
  const given = Buffer.from(signatureHeader, "utf8");
  return expected.length === given.length && timingSafeEqual(expected, given);
}
