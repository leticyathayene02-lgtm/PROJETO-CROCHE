import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsappOtp } from "@/lib/whatsapp";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { phone, email } = await req.json();

    if (!phone || !email) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      return NextResponse.json(
        { error: "Número inválido. Use o formato com DDD, ex: 11999999999." },
        { status: 400 }
      );
    }

    // Check if phone already registered
    const phoneInUse = await prisma.user.findFirst({
      where: { phone: { in: [digits, `55${digits}`, digits.replace(/^55/, "")] } },
    });
    if (phoneInUse) {
      return NextResponse.json(
        { error: "Este número de WhatsApp já está cadastrado." },
        { status: 409 }
      );
    }

    // Check if email already registered
    const emailInUse = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (emailInUse) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado." },
        { status: 409 }
      );
    }

    // Invalidate previous OTPs for this phone
    await prisma.whatsappOtp.updateMany({
      where: { phone: digits, usedAt: null, expiresAt: { gt: new Date() } },
      data: { expiresAt: new Date() },
    });

    const code = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.whatsappOtp.create({
      data: { phone: digits, code, expiresAt },
    });

    await sendWhatsappOtp(digits, code);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[send-register-otp]", err);
    const message = err instanceof Error ? err.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
