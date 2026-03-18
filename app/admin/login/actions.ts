"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, sessionCookieOptions, SESSION_TTL_MS } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "admin2328@tramapro.com";

export async function adminLogin(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (email !== ADMIN_EMAIL) {
    return { error: "Acesso negado." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Credenciais inválidas." };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: "Credenciais inválidas." };

  const token = await createSession(user.id);
  const expires = new Date(Date.now() + SESSION_TTL_MS);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieOptions(token, expires));

  redirect("/admin");
}
