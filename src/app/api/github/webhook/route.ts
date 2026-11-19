import { GitHubAppApi } from "@/lib/github/api";
import { verifyWebhookSignature } from "@/lib/github/signature";
import { getWriteStore } from "@/lib/store";
import { handleWebhook } from "@/lib/webhook";

/**
 * GitHub App webhook. Verifies X-Hub-Signature-256 against the raw body,
 * then hands the event to the credit pipeline. Idempotent on the delivery id
 * and on (project, PR number, merge sha).
 */
export async function POST(request: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const store = getWriteStore();
  if (!secret || !appId || !privateKey || !store) {
    return Response.json({ error: "repocoin webhook is not configured" }, { status: 503 });
  }

  const raw = await request.text();
  if (!verifyWebhookSignature(secret, raw, request.headers.get("x-hub-signature-256"))) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = request.headers.get("x-github-event");
  const deliveryId = request.headers.get("x-github-delivery");
  if (!event || !deliveryId) {
    return Response.json({ error: "missing GitHub event headers" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  try {
    const result = await handleWebhook(event, deliveryId, payload, {
      store,
      github: new GitHubAppApi(appId, privateKey),
      now: () => new Date(),
    });
    return Response.json(result);
  } catch (err) {
    console.error("repocoin webhook failed", deliveryId, err instanceof Error ? err.message : err);
    // 500 lets GitHub's redelivery retry; the delivery claim was released.
    return Response.json({ error: "processing failed" }, { status: 500 });
  }
}
