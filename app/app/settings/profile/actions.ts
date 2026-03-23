"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWorkspace } from "@/lib/workspace";
import { getSession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function updateProfile(data: { name: string; phone: string }) {
  const session = await getSession();
  if (!session?.user?.id) return { success: false, error: "Não autenticado." };

  const phone = data.phone.replace(/\D/g, "") || null;

  // Check phone uniqueness if provided
  if (phone) {
    const existing = await prisma.user.findFirst({
      where: { phone, NOT: { id: session.user.id } },
    });
    if (existing) return { success: false, error: "Este WhatsApp já está em uso por outra conta." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: data.name.trim() || null, phone },
  });

  revalidatePath("/app/settings/profile");
  return { success: true };
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) return { success: false, error: "Não autenticado." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { success: false, error: "Usuário não encontrado." };

  const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Senha atual incorreta." };

  if (data.newPassword.length < 6)
    return { success: false, error: "A nova senha deve ter pelo menos 6 caracteres." };

  const passwordHash = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash } });

  return { success: true };
}

export async function updateHourlyRate(rate: number) {
  const { workspace } = await requireWorkspace();

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: { defaultHourlyRate: rate },
  });

  revalidatePath("/app/settings/profile");
  revalidatePath("/app/pricing/new");
  return { success: true };
}
