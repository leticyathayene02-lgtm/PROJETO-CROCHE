export const runtime = "nodejs";

import { NextResponse } from "next/server";
import pg from "pg";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  const info: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    database_url_set: !!dbUrl,
    database_url_preview: dbUrl
      ? dbUrl.replace(/:([^@]+)@/, ":***@")
      : "NOT SET",
  };

  if (!dbUrl) {
    return NextResponse.json(
      { status: "error", error: "DATABASE_URL not set", ...info },
      { status: 500 }
    );
  }

  try {
    const pool = new pg.Pool({ connectionString: dbUrl, max: 1 });
    const result = await pool.query(
      "SELECT COUNT(*) as user_count FROM \"User\""
    );
    await pool.end();
    return NextResponse.json({
      status: "ok",
      user_count: result.rows[0].user_count,
      ...info,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        code: (error as NodeJS.ErrnoException).code,
        ...info,
      },
      { status: 500 }
    );
  }
}
