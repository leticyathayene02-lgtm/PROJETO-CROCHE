import { NextRequest, NextResponse } from "next/server";
import { processWebhookEvent } from "@/lib/subscription-service";
import type { AsaasWebhookEvent } from "@/lib/asaas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. Validate webhook token (REQUIRED in production)
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  const receivedToken =
    req.headers.get("asaas-access-token") ??
    req.headers.get("asaas-webhook-token");

  if (!expectedToken) {
    console.error("[Asaas Webhook] ASAAS_WEBHOOK_TOKEN not configured!");
    return NextResponse.json({ ok: false, error: "Webhook not configured" }, { status: 500 });
  }

  if (receivedToken !== expectedToken) {
    console.warn("[Asaas Webhook] Invalid token received. Ignoring.");
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 200 });
  }

  // 2. Parse event body (limit size to prevent abuse)
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength > 1_000_000) {
    return NextResponse.json({ ok: false, error: "Payload too large" }, { status: 413 });
  }

  let event: AsaasWebhookEvent;
  try {
    event = await req.json();
  } catch (err) {
    console.error("[Asaas Webhook] Failed to parse body:", err);
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 200 });
  }

  console.log(`[Asaas Webhook] Received event: ${event?.event}, paymentId: ${event?.payment?.id ?? "n/a"}`);

  // 3. Process event — always return 200 to avoid Asaas retries
  try {
    await processWebhookEvent(event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Asaas Webhook] Handler error:", err);
    return NextResponse.json({ ok: false, error: "Handler error" }, { status: 200 });
  }
}
