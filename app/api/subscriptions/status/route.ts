import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const member = await prisma.workspaceMember.findFirst({
    where: { userId: session.user.id },
    include: { workspace: { include: { subscription: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const sub = member?.workspace?.subscription;

  return NextResponse.json({
    plan: sub?.plan ?? "FREE",
    status: sub?.status ?? "CANCELED",
    accessStatus: sub?.accessStatus ?? "BLOCKED",
  });
}
