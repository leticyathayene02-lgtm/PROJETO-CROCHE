export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, sessionCookieOptions, SESSION_TTL_MS } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: email.toLowerCase().trim(),
        passwordHash,
      },
    });

    // Create workspace for the new user
    const now = new Date();
    const monthYYYYMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const workspace = await prisma.workspace.create({
      data: {
        name: name ? `Ateliê de ${name.trim().split(" ")[0]}` : "Meu Ateliê",
        slug: `atelier-${user.id.slice(-8)}`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: "OWNER" } },
        subscription: {
          create: {
            plan: "FREE",
            status: "TRIALING",
            accessStatus: "TRIAL",
            trialStartAt: new Date(),
            trialEndAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
          },
        },
      },
    });

    await prisma.usageCounter.create({
      data: { workspaceId: workspace.id, monthYYYYMM },
    });

    // Create session
    const sessionToken = await createSession(user.id);
    const expires = new Date(Date.now() + SESSION_TTL_MS);

    const response = NextResponse.json({ ok: true }, { status: 201 });
    response.cookies.set(sessionCookieOptions(sessionToken, expires));
    return response;
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
