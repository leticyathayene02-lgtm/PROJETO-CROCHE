import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "admin2328@tramapro.com";

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }
  return session.user;
}
