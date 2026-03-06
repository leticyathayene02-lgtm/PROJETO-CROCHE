import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

/**
 * Read the current session from the cookie and validate it against the DB.
 * Returns null if no session cookie or session is expired/not found.
 */
export async function getSession(): Promise<{ user: SessionUser } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: { select: { id: true, email: true, name: true, image: true } } },
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  return { user: session.user };
}

/**
 * Create a new session for the given user and return the token.
 * Call setSessionCookie() after this to send the cookie to the browser.
 */
export async function createSession(userId: string): Promise<string> {
  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: { sessionToken, userId, expires },
  });

  return sessionToken;
}

/**
 * Delete the session record for the current cookie token.
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return;

  await prisma.session.deleteMany({ where: { sessionToken: token } });
}

/**
 * Build the Set-Cookie header value for the session token.
 * Used in API route responses (NextResponse.cookies.set).
 */
export function sessionCookieOptions(token: string, expires: Date) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    expires,
    secure: process.env.NODE_ENV === "production",
  };
}

export { COOKIE_NAME as SESSION_COOKIE_NAME, SESSION_TTL_MS };
