import { prisma } from "@/lib/prisma";
import { TRIAL_DURATION_MS } from "@/lib/trial";

export type AccessResult =
  | { allowed: true; status: "TRIAL"; daysLeft: number; hoursLeft: number }
  | { allowed: true; status: "ACTIVE" }
  | { allowed: false; status: "TRIAL_EXPIRED" }
  | { allowed: false; status: "BLOCKED" };

type SubscriptionLike = {
  workspaceId: string;
  status: string;
  accessStatus: string;
  trialStartAt?: Date | null;
  trialEndAt?: Date | null;
};

/**
 * Check workspace access.
 *
 * Trial expiration is ALWAYS computed from timestamps:
 *   trialStartAt + 7 days > now → allowed
 *
 * When a trial is found expired, the DB field `accessStatus` is
 * updated to BLOCKED so webhooks and other checks stay consistent.
 */
export async function checkAccess(
  workspaceId: string,
  existingSub?: SubscriptionLike | null
): Promise<AccessResult> {
  const sub = existingSub ?? await prisma.subscription.findUnique({ where: { workspaceId } });
  if (!sub) return { allowed: false, status: "BLOCKED" };

  // Assinatura ativa com pagamento confirmado
  if (sub.accessStatus === "ACTIVE" && sub.status === "ACTIVE") {
    return { allowed: true, status: "ACTIVE" };
  }

  // Trial — compute from trialStartAt + 7 days (source of truth)
  const trialEnd = sub.trialStartAt
    ? new Date(sub.trialStartAt.getTime() + TRIAL_DURATION_MS)
    : sub.trialEndAt;

  if (trialEnd && (sub.accessStatus === "TRIAL" || sub.status === "TRIALING")) {
    const now = new Date();
    if (now < trialEnd) {
      const msLeft = trialEnd.getTime() - now.getTime();
      const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
      const daysLeft = Math.floor(hoursLeft / 24);
      return { allowed: true, status: "TRIAL", daysLeft, hoursLeft };
    }
    // Trial expirado — atualiza status no banco para manter consistência
    if (sub.accessStatus !== "BLOCKED") {
      await prisma.subscription.update({
        where: { workspaceId },
        data: { accessStatus: "BLOCKED" },
      });
    }
    return { allowed: false, status: "TRIAL_EXPIRED" };
  }

  // Qualquer outro caso bloqueado
  return { allowed: false, status: "BLOCKED" };
}
