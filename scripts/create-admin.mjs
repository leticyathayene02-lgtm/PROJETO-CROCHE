/**
 * create-admin.mjs — Cria o usuário admin no banco especificado.
 * Uso:
 *   node scripts/create-admin.mjs local
 *   NEON_URL="..." node scripts/create-admin.mjs neon
 */
import pg from "pg";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "admin2328@tramapro.com";
const ADMIN_PASSWORD = "23280812A";
const ADMIN_NAME = "Admin Trama Pro";

const target = process.argv[2] ?? "local";

const DB_URL =
  target === "neon"
    ? process.env.NEON_URL
    : "postgresql://postgres:postgres@localhost:5432/projeto_croche";

if (!DB_URL) {
  console.error("❌ Defina NEON_URL para usar target=neon.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: DB_URL });
await client.connect();

const { rows: existing } = await client.query(
  `SELECT id FROM "User" WHERE email = $1`,
  [ADMIN_EMAIL]
);

if (existing.length > 0) {
  // Atualiza a senha caso já exista
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await client.query(
    `UPDATE "User" SET "passwordHash" = $1, name = $2 WHERE email = $3`,
    [hash, ADMIN_NAME, ADMIN_EMAIL]
  );
  console.log(`✅ Admin já existia — senha atualizada (${target}).`);
} else {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const { rows } = await client.query(
    `INSERT INTO "User" (id, email, name, "passwordHash", "createdAt", "updatedAt")
     VALUES (gen_random_uuid()::text, $1, $2, $3, now(), now())
     RETURNING id`,
    [ADMIN_EMAIL, ADMIN_NAME, hash]
  );
  console.log(`✅ Admin criado com id=${rows[0].id} (${target}).`);
}

await client.end();
