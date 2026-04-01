/**
 * fix-super-admins.mjs
 *
 * Atualiza a subscription dos super admins para PREMIUM/ACTIVE no banco.
 * Correção real no banco, sem hack de frontend.
 *
 * Uso:
 *   node scripts/fix-super-admins.mjs                                    # usa DATABASE_URL do .env
 *   DATABASE_URL="postgresql://...neon..." node scripts/fix-super-admins.mjs  # banco específico
 */
import pg from "pg";
import { config } from "dotenv";

config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL não definida.");
  process.exit(1);
}

const SUPER_ADMIN_EMAILS = [
  "leticya331331@gmail.com",
  "admin@tramapro.com",
];

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // 1. Show current state
    const before = await client.query(`
      SELECT u.email, u.name, s.plan, s.status, s."accessStatus"
      FROM "User" u
      JOIN "Workspace" w ON w."ownerId" = u.id
      JOIN "Subscription" s ON s."workspaceId" = w.id
      WHERE u.email = ANY($1)
    `, [SUPER_ADMIN_EMAILS]);

    console.log("\nEstado ANTES:");
    console.table(before.rows);

    // 2. Update to PREMIUM/ACTIVE
    const workspaceIds = await client.query(`
      SELECT w.id FROM "User" u
      JOIN "Workspace" w ON w."ownerId" = u.id
      WHERE u.email = ANY($1)
    `, [SUPER_ADMIN_EMAILS]);

    const ids = workspaceIds.rows.map(r => r.id);

    if (ids.length === 0) {
      console.log("Nenhum workspace encontrado para esses emails.");
      return;
    }

    const result = await client.query(`
      UPDATE "Subscription"
      SET plan = 'PREMIUM',
          status = 'ACTIVE',
          "accessStatus" = 'ACTIVE',
          "updatedAt" = NOW()
      WHERE "workspaceId" = ANY($1)
    `, [ids]);

    console.log(`\n${result.rowCount} registro(s) atualizado(s) para PREMIUM/ACTIVE.`);

    // 3. Verify
    const after = await client.query(`
      SELECT u.email, u.name, s.plan, s.status, s."accessStatus"
      FROM "User" u
      JOIN "Workspace" w ON w."ownerId" = u.id
      JOIN "Subscription" s ON s."workspaceId" = w.id
      WHERE u.email = ANY($1)
    `, [SUPER_ADMIN_EMAILS]);

    console.log("\nEstado DEPOIS:");
    console.table(after.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
