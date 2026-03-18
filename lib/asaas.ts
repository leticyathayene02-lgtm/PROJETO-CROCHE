import "server-only";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
}

export interface AsaasSubscription {
  id: string;
  status: string;
  value: number;
  nextDueDate: string;
  billingType: string;
  cycle: string;
  customer: string;
  description?: string;
}

export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  paymentDate?: string;
  subscription?: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  billingType: string;
}

export interface AsaasWebhookEvent {
  event: string;
  payment: AsaasPayment;
}

// ─────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────

async function getConfig(): Promise<{ apiKey: string; baseUrl: string }> {
  const config = await prisma.paymentConfig.findFirst({
    where: { provider: "ASAAS", isActive: true },
  });

  if (!config) {
    throw new Error(
      "Asaas não configurado. Configure a API Key no painel admin em Configurações → Pagamento."
    );
  }

  let apiKey: string;
  try {
    apiKey = decrypt(config.apiKeyEnc);
  } catch {
    throw new Error("Erro ao descriptografar a API Key do Asaas. Reconfigure no painel admin.");
  }

  const baseUrl =
    config.environment === "PRODUCTION"
      ? "https://api.asaas.com/api/v3"
      : "https://sandbox.asaas.com/api/v3";

  return { apiKey, baseUrl };
}

async function asaasRequest<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const { apiKey, baseUrl } = await getConfig();

  const url = `${baseUrl}${path}`;
  console.log(`[Asaas] ${method} ${url}`);

  const res = await fetch(url, {
    method,
    headers: {
      access_token: apiKey,
      "Content-Type": "application/json",
      "User-Agent": "TramaPro/1.0",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[Asaas] Error ${res.status} on ${method} ${path}:`, errText);
    throw new Error(`Asaas ${method} ${path} → ${res.status}: ${errText}`);
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────
// Customer functions
// ─────────────────────────────────────────

export async function createCustomer(data: {
  name: string;
  email: string;
  cpfCnpj?: string;
}): Promise<AsaasCustomer> {
  console.log(`[Asaas] Creating customer for: ${data.email}`);
  const customer = await asaasRequest<AsaasCustomer>("POST", "/customers", {
    name: data.name,
    email: data.email,
    ...(data.cpfCnpj ? { cpfCnpj: data.cpfCnpj } : {}),
  });
  console.log(`[Asaas] Customer created: ${customer.id}`);
  return customer;
}

export async function findCustomerByEmail(
  email: string
): Promise<AsaasCustomer | null> {
  console.log(`[Asaas] Looking up customer by email: ${email}`);

  const res = await asaasRequest<{ data: AsaasCustomer[]; totalCount: number }>(
    "GET",
    `/customers?email=${encodeURIComponent(email)}&limit=1`
  );

  if (res.data && res.data.length > 0) {
    console.log(`[Asaas] Found existing customer: ${res.data[0].id}`);
    return res.data[0];
  }

  console.log(`[Asaas] No customer found for: ${email}`);
  return null;
}

// ─────────────────────────────────────────
// Subscription functions
// ─────────────────────────────────────────

export async function createSubscription(data: {
  customer: string;
  billingType: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  description?: string;
}): Promise<AsaasSubscription> {
  console.log(`[Asaas] Creating subscription for customer: ${data.customer}`);
  const subscription = await asaasRequest<AsaasSubscription>(
    "POST",
    "/subscriptions",
    {
      customer: data.customer,
      billingType: data.billingType,
      value: data.value,
      nextDueDate: data.nextDueDate,
      cycle: data.cycle,
      description: data.description,
    }
  );
  console.log(`[Asaas] Subscription created: ${subscription.id}, status: ${subscription.status}`);
  return subscription;
}

export async function cancelAsaasSubscription(
  subscriptionId: string
): Promise<void> {
  console.log(`[Asaas] Canceling subscription: ${subscriptionId}`);
  await asaasRequest("DELETE", `/subscriptions/${subscriptionId}`);
  console.log(`[Asaas] Subscription canceled: ${subscriptionId}`);
}

export async function getSubscriptionPayments(
  subscriptionId: string
): Promise<AsaasPayment[]> {
  console.log(`[Asaas] Fetching payments for subscription: ${subscriptionId}`);
  const res = await asaasRequest<{ data: AsaasPayment[] }>(
    "GET",
    `/subscriptions/${subscriptionId}/payments?limit=1`
  );
  return res.data ?? [];
}
