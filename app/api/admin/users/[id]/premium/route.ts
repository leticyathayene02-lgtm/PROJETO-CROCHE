import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();

  const { id: userId } = await params;
  const body = (await request.json().catch(() => ({}))) as { grant?: boolean };

  if (typeof body.grant !== "boolean") {
    return NextResponse.json(
      { error: "Campo 'grant' (boolean) obrigatório." },
      { status: 400 }
    );
  }

  const workspace = await prisma.workspace.findFirst({
    where: { ownerId: userId },
    include: { subscription: true },
  });

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace não encontrado para este usuário." },
      { status: 404 }
    );
  }

  if (body.grant) {
    await prisma.subscription.upsert({
      where: { workspaceId: workspace.id },
      create: {
        workspaceId: workspace.id,
        plan: "PREMIUM",
        status: "ACTIVE",
        accessStatus: "ACTIVE",
      },
      update: {
        plan: "PREMIUM",
        status: "ACTIVE",
        accessStatus: "ACTIVE",
      },
    });
  } else {
    if (workspace.subscription) {
      await prisma.subscription.update({
        where: { workspaceId: workspace.id },
        data: {
          plan: "FREE",
          status: "TRIALING",
          accessStatus: "TRIAL",
        },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
