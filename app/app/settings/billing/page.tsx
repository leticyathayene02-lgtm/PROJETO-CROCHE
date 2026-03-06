import { requireWorkspace } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { getCurrentMonthKey, PLAN_LIMITS } from "@/lib/limits";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { createCheckoutSession, createBillingPortalSession } from "@/lib/stripe";
import { redirect } from "next/navigation";

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const { workspace, subscription } = await requireWorkspace();
  const params = await searchParams;
  const workspaceId = workspace.id;

  const plan =
    subscription?.plan === "PREMIUM" &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING")
      ? "PREMIUM"
      : "FREE";

  const monthKey = getCurrentMonthKey();
  const usage = await prisma.usageCounter.findUnique({
    where: { workspaceId_monthYYYYMM: { workspaceId, monthYYYYMM: monthKey } },
  });
  const productCount = await prisma.product.count({ where: { workspaceId } });

  const limits = PLAN_LIMITS[plan];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assinatura</h1>
        <p className="text-sm text-gray-500">
          Gerencie seu plano e faturamento
        </p>
      </div>

      {/* Success / Cancel messages */}
      {params.success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-3 text-sm font-medium text-green-800">
            ✅ Assinatura ativada com sucesso! Bem-vinda ao Premium ✨
          </CardContent>
        </Card>
      )}
      {params.canceled && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3 text-sm text-amber-800">
            Checkout cancelado. Você continua no plano gratuito.
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plano atual</CardTitle>
            <Badge
              className={
                plan === "PREMIUM"
                  ? "bg-rose-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }
            >
              {plan === "PREMIUM" ? "Premium ✨" : "Gratuito"}
            </Badge>
          </div>
          <CardDescription>
            {plan === "PREMIUM"
              ? `Renovação em ${formatDate(subscription?.currentPeriodEnd)}`
              : "Acesso limitado. Faça upgrade para recursos ilimitados."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage meters */}
          <div className="space-y-3">
            <UsageMeter
              label="Cálculos este mês"
              current={usage?.pricingCalculationsCount ?? 0}
              limit={limits.pricingCalculations}
            />
            <UsageMeter
              label="Transações este mês"
              current={usage?.transactionsCount ?? 0}
              limit={limits.transactions}
            />
            <UsageMeter
              label="Produtos cadastrados"
              current={productCount}
              limit={limits.products}
            />
          </div>

          {/* Actions */}
          <div className="pt-2">
            {plan === "FREE" ? (
              <form
                action={async () => {
                  "use server";
                  const { user } = await import("@/lib/workspace").then((m) =>
                    m.requireWorkspace()
                  );
                  const session = await createCheckoutSession({
                    workspaceId,
                    userId: user.id,
                    email: user.email!,
                    customerId: subscription?.stripeCustomerId,
                  });
                  redirect(session.url!);
                }}
              >
                <Button
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700"
                >
                  Assinar Premium — R$ 29,90/mês ✨
                </Button>
              </form>
            ) : (
              <form
                action={async () => {
                  "use server";
                  if (!subscription?.stripeCustomerId) {
                    throw new Error("No customer ID");
                  }
                  const session = await createBillingPortalSession(
                    subscription.stripeCustomerId
                  );
                  redirect(session.url);
                }}
              >
                <Button type="submit" variant="outline" className="w-full">
                  Gerenciar assinatura no Stripe
                </Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">O que está incluso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-2 font-semibold text-gray-700">
                Gratuito
              </p>
              <ul className="space-y-1 text-gray-500">
                <li>✓ 3 cálculos/mês</li>
                <li>✓ 5 transações/mês</li>
                <li>✓ 3 produtos</li>
                <li>✓ Controle de estoque</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-rose-700">
                Premium ✨
              </p>
              <ul className="space-y-1 text-rose-600">
                <li>✓ Cálculos ilimitados</li>
                <li>✓ Transações ilimitadas</li>
                <li>✓ Produtos ilimitados</li>
                <li>✓ Histórico completo</li>
                <li>✓ Metas financeiras</li>
                <li>✓ Suporte prioritário</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsageMeter({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number;
}) {
  const isUnlimited = limit === Infinity;
  const percent = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percent >= 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span className={isNearLimit ? "text-rose-600 font-medium" : ""}>
          {current} / {isUnlimited ? "∞" : limit}
        </span>
      </div>
      {!isUnlimited && (
        <Progress
          value={percent}
          className={`h-1.5 ${isNearLimit ? "[&>div]:bg-rose-500" : "[&>div]:bg-gray-300"}`}
        />
      )}
    </div>
  );
}
