import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const digits = phone.replace(/\D/g, "");

    const otp = await prisma.whatsappOtp.findFirst({
      where: {
        phone: digits,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        { error: "Código inválido ou expirado." },
        { status: 400 }
      );
    }

    // Find the user by phone
    const user = await prisma.user.findFirst({
      where: {
        phone: { in: [digits, `55${digits}`, digits.replace(/^55/, "")] },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    // Mark OTP as used
    await prisma.whatsappOtp.update({
      where: { id: otp.id },
      data: { usedAt: new Date() },
    });

    // Create a password reset token (reuses existing flow)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes to set new password

    await prisma.passwordResetToken.create({
      data: { token, email: user.email, expiresAt },
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("[verify-otp]", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
