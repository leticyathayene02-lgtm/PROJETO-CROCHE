export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, sessionCookieOptions, SESSION_TTL_MS } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      // Avoid timing attacks: still run bcrypt compare
      await bcrypt.compare(password, "$2a$12$invalidhashpadding000000000000000000000000000000000000");
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
    }

    const sessionToken = await createSession(user.id);
    const expires = new Date(Date.now() + SESSION_TTL_MS);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieOptions(sessionToken, expires));
    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[login] ERROR:", msg, err);
    return NextResponse.json(
      { error: "Erro interno do servidor.", _debug: process.env.NODE_ENV !== "production" ? msg : undefined },
      { status: 500 }
    );
  }
}
