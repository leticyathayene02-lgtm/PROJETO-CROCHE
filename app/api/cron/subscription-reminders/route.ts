import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSubscriptionExpiringEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * Cron endpoint — envia lembretes de expiração de assinatura.
 * Chamado diariamente via Vercel Cron ou serviço externo.
 *
 * Protegido por CRON_SECRET para evitar acesso não autorizado.
 * Envia lembretes com 3 dias e 1 dia de antecedência.
 */
export async function GET(req: NextRequest) {
  // Validate cron secret
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find subscriptions expiring in 1 or 3 days
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const oneDayFromNow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  // Subscriptions expiring between now and 3 days from now
  const expiring = await prisma.subscription.findMany({
    where: {
      plan: "PREMIUM",
      status: "ACTIVE",
      currentPeriodEnd: {
        gte: now,
        lte: threeDaysFromNow,
      },
    },
    include: {
      workspace: {
        include: { owner: { select: { email: true, name: true } } },
      },
    },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const sub of expiring) {
    const owner = sub.workspace.owner;
    if (!owner?.email) continue;

    const msLeft = sub.currentPeriodEnd!.getTime() - now.getTime();
    const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));

    // Only send at 3 days and 1 day marks
    if (daysLeft !== 3 && daysLeft !== 1) continue;

    try {
      await sendSubscriptionExpiringEmail(owner.email, owner.name, daysLeft);
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${owner.email}: ${msg}`);
    }
  }

  // Also check trial subscriptions expiring soon
  const trialExpiring = await prisma.subscription.findMany({
    where: {
      status: "TRIALING",
      trialEndAt: {
        gte: now,
        lte: oneDayFromNow,
      },
    },
    include: {
      workspace: {
        include: { owner: { select: { email: true, name: true } } },
      },
    },
  });

  for (const sub of trialExpiring) {
    const owner = sub.workspace.owner;
    if (!owner?.email || !sub.trialEndAt) continue;

    const msLeft = sub.trialEndAt.getTime() - now.getTime();
    const daysLeft = Math.max(1, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));

    try {
      await sendSubscriptionExpiringEmail(owner.email, owner.name, daysLeft);
      sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${owner.email}: ${msg}`);
    }
  }

  console.log(`[Cron] Subscription reminders: ${sent} sent, ${errors.length} errors`);

  return NextResponse.json({
    ok: true,
    sent,
    errors: errors.length,
    ...(errors.length > 0 ? { errorDetails: errors } : {}),
  });
}
