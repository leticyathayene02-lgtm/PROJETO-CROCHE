import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

/**
 * Emails que têm acesso ao painel administrativo.
 */
const ADMIN_EMAILS: string[] = [
  "admin2328@tramapro.com",
];

/**
 * Emails that always have lifetime PREMIUM access regardless of subscription status.
 */
export const SUPER_ADMIN_EMAILS: string[] = [
  "leticya331331@gmail.com",
  "admin@tramapro.com",
];

export function isSuperAdmin(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    redirect("/admin/login");
  }
  return session.user;
}
