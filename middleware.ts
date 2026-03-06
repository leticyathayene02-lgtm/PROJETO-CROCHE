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

  // If user is on /login with a session cookie, try to send them to dashboard.
  // If the session is stale (deleted from DB), requireWorkspace() in the layout
  // will redirect back to /login and clear the cookie — so no infinite loop.
  if (pathname === "/login" && isAuthenticated) {
    // Allow ?force=logout to bypass redirect (so user can always reach login)
    const force = req.nextUrl.searchParams.get("force");
    if (force === "logout") {
      // Clear the stale cookie and show login page
      const response = NextResponse.next();
      response.cookies.set("session", "", { path: "/", expires: new Date(0) });
      return response;
    }
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
