import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { maskApiKey } from "@/lib/crypto";
import { PageHeader } from "@/components/admin/page-header";
import { PaymentForm } from "@/components/admin/payment-settings/payment-form";

export const metadata = { title: "Configurações de Pagamento — Admin" };

export default async function PaymentSettingsPage() {
  await requireAdmin();

  const config = await prisma.paymentConfig.findFirst({ where: { provider: "ASAAS" } });

  // Descriptografa para gerar máscara — NUNCA envia a chave real para o frontend
  let maskedKey: string | null = null;
  if (config?.apiKeyEnc) {
    try {
      const { decrypt } = await import("@/lib/crypto");
      const realKey = decrypt(config.apiKeyEnc);
      maskedKey = maskApiKey(realKey);
    } catch {
      maskedKey = "••••• (erro ao ler)";
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações de Pagamento"
        description="Configure a integração com a API Asaas"
      />
      <PaymentForm
        hasConfig={!!config}
        maskedKey={maskedKey}
        environment={config?.environment ?? "SANDBOX"}
        lastTestedAt={config?.lastTestedAt?.toISOString() ?? null}
        lastTestOk={config?.lastTestOk ?? null}
        lastTestMsg={config?.lastTestMsg ?? null}
      />
    </div>
  );
}
