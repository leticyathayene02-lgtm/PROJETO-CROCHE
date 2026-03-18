import { NextRequest, NextResponse } from "next/server";
import { processWebhookEvent } from "@/lib/subscription-service";
import type { AsaasWebhookEvent } from "@/lib/asaas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. Validate webhook token
  const webhookToken = req.headers.get("asaas-webhook-token");
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

  if (expectedToken && webhookToken !== expectedToken) {
    console.warn("[Asaas Webhook] Invalid token received. Ignoring.");
    // Return 200 anyway so Asaas stops retrying — but log the issue
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 200 });
  }

  // 2. Parse event body
  let event: AsaasWebhookEvent;
  try {
    event = await req.json();
  } catch (err) {
    console.error("[Asaas Webhook] Failed to parse body:", err);
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 200 });
  }

  console.log(`[Asaas Webhook] Received event: ${event?.event}, paymentId: ${event?.payment?.id}`);

  // 3. Process event — always return 200 to avoid Asaas retries
  try {
    await processWebhookEvent(event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Asaas Webhook] Handler error:", err);
    // Still return 200 — log the error for debugging but don't trigger retries
    return NextResponse.json({ ok: false, error: "Handler error" }, { status: 200 });
  }
}
