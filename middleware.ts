/**
 * Edge-safe middleware — only reads cookies, zero DB/Node.js imports.
 * Full session validation happens server-side in requireWorkspace().
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get("session")?.value;

  // Protect /app/* — redirect to login if no session cookie
  if (pathname.startsWith("/app") && !sessionToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect /admin/* (except /admin/login) — redirect to admin login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login") && !sessionToken) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip static files, images, favicon, and ALL /api/* routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
