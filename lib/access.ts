import { prisma } from "@/lib/prisma";

export type AccessResult =
  | { allowed: true; status: "TRIAL"; daysLeft: number; hoursLeft: number }
  | { allowed: true; status: "ACTIVE" }
  | { allowed: false; status: "TRIAL_EXPIRED" }
  | { allowed: false; status: "BLOCKED" };

export async function checkAccess(workspaceId: string): Promise<AccessResult> {
  const sub = await prisma.subscription.findUnique({ where: { workspaceId } });
  if (!sub) return { allowed: false, status: "BLOCKED" };

  // Assinatura ativa com pagamento confirmado
  if (sub.accessStatus === "ACTIVE" && sub.status === "ACTIVE") {
    return { allowed: true, status: "ACTIVE" };
  }

  // Trial ativo
  if (sub.accessStatus === "TRIAL" && sub.trialEndAt) {
    const now = new Date();
    if (now < sub.trialEndAt) {
      const msLeft = sub.trialEndAt.getTime() - now.getTime();
      const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
      const daysLeft = Math.floor(hoursLeft / 24);
      return { allowed: true, status: "TRIAL", daysLeft, hoursLeft };
    }
    // Trial expirado — atualiza status no banco
    await prisma.subscription.update({
      where: { workspaceId },
      data: { accessStatus: "BLOCKED" },
    });
    return { allowed: false, status: "TRIAL_EXPIRED" };
  }

  // Qualquer outro caso bloqueado
  return { allowed: false, status: "BLOCKED" };
}
