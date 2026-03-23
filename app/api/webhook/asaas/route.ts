import { NextRequest, NextResponse } from "next/server";
import { processWebhookEvent } from "@/lib/subscription-service";
import type { AsaasWebhookEvent } from "@/lib/asaas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // Asaas envia o token no header "asaas-access-token"
  const receivedToken = req.headers.get("asaas-access-token");
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;

  if (expectedToken && receivedToken !== expectedToken) {
    console.warn("[Asaas Webhook] Token inválido recebido. Ignorando.");
    // Retorna 200 mesmo assim para o Asaas não ficar retentando
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 200 });
  }

  let event: AsaasWebhookEvent;
  try {
    event = await req.json();
  } catch (err) {
    console.error("[Asaas Webhook] Falha ao parsear body:", err);
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 200 });
  }

  console.log(
    `[Asaas Webhook] Evento recebido: ${event?.event}, paymentId: ${event?.payment?.id ?? "n/a"}`
  );

  try {
    await processWebhookEvent(event);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Asaas Webhook] Erro no handler:", err);
    return NextResponse.json({ ok: false, error: "Handler error" }, { status: 200 });
  }
}
