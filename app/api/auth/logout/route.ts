export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE_NAME } from "@/lib/session";

function clearSessionResponse() {
  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "https://tramapro.site"));
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
  return response;
}

export async function POST() {
  await deleteSession();
  return clearSessionResponse();
}

export async function GET() {
  await deleteSession();
  return clearSessionResponse();
}
