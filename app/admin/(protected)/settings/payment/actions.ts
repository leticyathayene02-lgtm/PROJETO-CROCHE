"use server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";

const ASAAS_BASE: Record<"SANDBOX" | "PRODUCTION", string> = {
  SANDBOX: "https://sandbox.asaas.com/api/v3",
  PRODUCTION: "https://api.asaas.com/v3",
};

export async function savePaymentConfig(data: {
  apiKey?: string;
  environment: "SANDBOX" | "PRODUCTION";
}) {
  await requireAdmin();

  const existing = await prisma.paymentConfig.findFirst({ where: { provider: "ASAAS" } });

  // Só atualiza apiKeyEnc se uma nova chave foi fornecida
  const apiKeyEnc = data.apiKey ? encrypt(data.apiKey) : existing?.apiKeyEnc;
  if (!apiKeyEnc) return { error: "API Key é obrigatória." };

  if (existing) {
    await prisma.paymentConfig.update({
      where: { id: existing.id },
      data: { apiKeyEnc, environment: data.environment, isActive: true },
    });
  } else {
    await prisma.paymentConfig.create({
      data: { provider: "ASAAS", apiKeyEnc, environment: data.environment, isActive: true },
    });
  }

  return { success: true };
}

export async function testPaymentConnection() {
  await requireAdmin();

  const config = await prisma.paymentConfig.findFirst({ where: { provider: "ASAAS" } });
  if (!config) return { success: false, message: "Nenhuma configuração salva." };

  let apiKey: string;
  try {
    apiKey = decrypt(config.apiKeyEnc);
  } catch {
    return { success: false, message: "Erro ao descriptografar a API Key." };
  }

  const baseUrl = ASAAS_BASE[config.environment];

  try {
    const res = await fetch(`${baseUrl}/customers?limit=1`, {
      headers: { access_token: apiKey },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      await prisma.paymentConfig.update({
        where: { id: config.id },
        data: {
          lastTestedAt: new Date(),
          lastTestOk: true,
          lastTestMsg: `Conectado com sucesso (${config.environment})`,
        },
      });
      return { success: true, message: `Conectado com sucesso (${config.environment})` };
    } else {
      const msg =
        res.status === 401
          ? "API Key inválida (401 Unauthorized)."
          : res.status === 403
            ? "API Key sem permissão (403 Forbidden)."
            : `Erro ${res.status} da API Asaas.`;
      await prisma.paymentConfig.update({
        where: { id: config.id },
        data: { lastTestedAt: new Date(), lastTestOk: false, lastTestMsg: msg },
      });
      return { success: false, message: msg };
    }
  } catch (err: unknown) {
    const error = err as { name?: string; message?: string };
    const msg =
      error?.name === "TimeoutError"
        ? "Timeout: API não respondeu em 8s."
        : `Erro de rede: ${error?.message ?? "desconhecido"}`;
    await prisma.paymentConfig.update({
      where: { id: config.id },
      data: { lastTestedAt: new Date(), lastTestOk: false, lastTestMsg: msg },
    });
    return { success: false, message: msg };
  }
}
