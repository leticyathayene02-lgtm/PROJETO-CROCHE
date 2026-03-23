import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "admin2328@tramapro.com";

/**
 * Emails that always have lifetime PREMIUM access regardless of subscription status.
 */
export const SUPER_ADMIN_EMAILS: string[] = [
  "leticya331331@gmail.com",
];

export function isSuperAdmin(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }
  return session.user;
}
