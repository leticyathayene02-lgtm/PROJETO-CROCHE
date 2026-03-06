/**
 * Edge-safe middleware — only reads cookies, zero DB/Node.js imports.
 * Full session validation happens server-side in requireWorkspace().
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionToken = req.cookies.get("session")?.value;

  const isAuthenticated = !!sessionToken;

  // Protect /app/* — redirect to login if no session cookie
  if (pathname.startsWith("/app") && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authenticated users away from /login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/app/overview", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip static files, images, favicon, and ALL /api/* routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
