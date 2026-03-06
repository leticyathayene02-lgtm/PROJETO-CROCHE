export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST() {
  await deleteSession();

  const response = NextResponse.json({ ok: true });
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
