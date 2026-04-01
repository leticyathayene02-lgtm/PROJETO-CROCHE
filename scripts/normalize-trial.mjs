/**
 * normalize-trial.mjs
 *
 * Corrige trialEndAt de todos os registros para trialStartAt + 7 dias.
 * Usuários antigos foram criados com trial de 3 dias — este script
 * normaliza para 7 dias corridos.
 *
 * Uso:
 *   node scripts/normalize-trial.mjs                  # usa DATABASE_URL do .env
 *   DATABASE_URL="postgresql://..." node scripts/normalize-trial.mjs  # banco específico
 */
import pg from "pg";
import { config } from "dotenv";

config(); // load .env

const TRIAL_DAYS = 7;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    // 1. Show current state
    const before = await client.query(`
      SELECT s.id, w.name as workspace, s."trialStartAt", s."trialEndAt", s."accessStatus", s.status
      FROM "Subscription" s
      JOIN "Workspace" w ON w.id = s."workspaceId"
      WHERE s."trialStartAt" IS NOT NULL
      ORDER BY s."trialStartAt" DESC
    `);

    console.log("\n📋 Estado atual:\n");
    console.log("Workspace".padEnd(25), "trialStartAt".padEnd(22), "trialEndAt".padEnd(22), "status".padEnd(12), "accessStatus");
    console.log("-".repeat(100));

    for (const row of before.rows) {
      const start = row.trialStartAt?.toISOString().slice(0, 19) ?? "—";
      const end = row.trialEndAt?.toISOString().slice(0, 19) ?? "—";
      console.log(
        (row.workspace ?? "—").padEnd(25),
        start.padEnd(22),
        end.padEnd(22),
        row.status.padEnd(12),
        row.accessStatus
      );
    }

    // 2. Update trialEndAt = trialStartAt + 7 days for all records
    const result = await client.query(`
      UPDATE "Subscription"
      SET "trialEndAt" = "trialStartAt" + INTERVAL '${TRIAL_DAYS} days',
          "updatedAt" = NOW()
      WHERE "trialStartAt" IS NOT NULL
        AND "trialEndAt" != "trialStartAt" + INTERVAL '${TRIAL_DAYS} days'
    `);

    console.log(`\n✅ ${result.rowCount} registro(s) atualizado(s) — trialEndAt = trialStartAt + ${TRIAL_DAYS} dias.\n`);

    // 3. Show updated state
    const after = await client.query(`
      SELECT s.id, w.name as workspace, s."trialStartAt", s."trialEndAt",
             CASE
               WHEN s."accessStatus" = 'ACTIVE' AND s.status = 'ACTIVE' THEN 'Ativo'
               WHEN s.status = 'CANCELED' THEN 'Cancelado'
               WHEN s.status = 'PAST_DUE' THEN 'Vencido'
               WHEN s."trialStartAt" + INTERVAL '${TRIAL_DAYS} days' > NOW() THEN 'Trial'
               ELSE 'Vencido'
             END as status_calculado
      FROM "Subscription" s
      JOIN "Workspace" w ON w.id = s."workspaceId"
      WHERE s."trialStartAt" IS NOT NULL
      ORDER BY s."trialStartAt" DESC
    `);

    console.log("📋 Estado após normalização:\n");
    console.log("Workspace".padEnd(25), "trialStartAt".padEnd(22), "trialEndAt".padEnd(22), "Status Real");
    console.log("-".repeat(85));

    for (const row of after.rows) {
      const start = row.trialStartAt?.toISOString().slice(0, 19) ?? "—";
      const end = row.trialEndAt?.toISOString().slice(0, 19) ?? "—";
      const emoji = row.status_calculado === "Vencido" ? "🔴" : row.status_calculado === "Trial" ? "🔵" : "🟢";
      console.log(
        (row.workspace ?? "—").padEnd(25),
        start.padEnd(22),
        end.padEnd(22),
        `${emoji} ${row.status_calculado}`
      );
    }

    console.log("");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Erro:", err);
  process.exit(1);
});
