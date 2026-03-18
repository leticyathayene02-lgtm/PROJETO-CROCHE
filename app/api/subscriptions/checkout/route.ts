import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { startSubscription } from "@/lib/subscription-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    // 2. Get workspace from request body (optional — falls back to user's first workspace)
    let workspaceId: string | undefined;
    try {
      const body = await req.json();
      workspaceId = body?.workspaceId;
    } catch {
      // No body or invalid JSON — we'll look up the workspace below
    }

    // 3. Find the workspace for this user
    const member = await prisma.workspaceMember.findFirst({
      where: workspaceId
        ? { workspaceId, userId: session.user.id }
        : { userId: session.user.id },
      include: {
        workspace: {
          include: { subscription: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    if (!member) {
      return NextResponse.json({ error: "Workspace não encontrado." }, { status: 404 });
    }

    const ws = member.workspace;
    const sub = ws.subscription;

    // 4. Check if already ACTIVE
    if (
      sub?.asaasSubscriptionId &&
      (sub.status === "ACTIVE" || sub.status === "TRIALING")
    ) {
      return NextResponse.json(
        { error: "Este workspace já possui uma assinatura ativa." },
        { status: 400 }
      );
    }

    // 5. Start subscription via Asaas
    console.log(`[POST /api/subscriptions/checkout] Starting for workspace: ${ws.id}, user: ${session.user.email}`);

    const result = await startSubscription(ws.id, {
      name: session.user.name,
      email: session.user.email,
    });

    console.log(`[POST /api/subscriptions/checkout] Payment URL: ${result.paymentUrl}`);

    return NextResponse.json({ url: result.paymentUrl, subscriptionId: result.subscriptionId });
  } catch (err) {
    const error = err as Error;
    console.error("[POST /api/subscriptions/checkout] Error:", error);

    // Known business errors return 400
    if (
      error.message?.includes("já possui uma assinatura") ||
      error.message?.includes("não configurado")
    ) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Erro interno ao processar assinatura." }, { status: 500 });
  }
}
