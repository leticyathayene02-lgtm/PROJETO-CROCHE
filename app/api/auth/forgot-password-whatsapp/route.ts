import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsappOtp } from "@/lib/whatsapp";
import crypto from "crypto";

export const runtime = "nodejs";

function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Número inválido." }, { status: 400 });
    }

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      return NextResponse.json(
        { error: "Número inválido. Use o formato com DDD, ex: 11999999999." },
        { status: 400 }
      );
    }

    // Always return success to avoid phone enumeration
    const user = await prisma.user.findFirst({
      where: {
        phone: { in: [digits, `55${digits}`, digits.replace(/^55/, "")] },
      },
    });

    if (user) {
      // Invalidate previous OTPs for this phone
      await prisma.whatsappOtp.updateMany({
        where: { phone: digits, usedAt: null, expiresAt: { gt: new Date() } },
        data: { expiresAt: new Date() },
      });

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await prisma.whatsappOtp.create({
        data: { phone: digits, code, expiresAt },
      });

      await sendWhatsappOtp(digits, code);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password-whatsapp]", err);
    const message = err instanceof Error ? err.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
