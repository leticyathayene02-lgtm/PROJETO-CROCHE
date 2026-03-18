/**
 * migrate-to-neon.mjs
 * Copia todos os dados do banco local para o Neon (produção).
 * Uso: node scripts/migrate-to-neon.mjs
 */
import pg from "pg";

const LOCAL_URL =
  "postgresql://postgres:postgres@localhost:5432/projeto_croche";
const NEON_URL = process.env.NEON_URL;

if (!NEON_URL) {
  console.error("❌ Defina NEON_URL antes de rodar este script.");
  process.exit(1);
}

// Ordem respeitando foreign keys
const TABLES = [
  "User",
  "Workspace",
  "Session",
  "WorkspaceMember",
  "Subscription",
  "UsageCounter",
  "Yarn",
  "StockItem",
  "Material",
  "OverheadCost",
  "Product",
  "ProductVariant",
  "Customer",
  "PriceCalculation",
  "Transaction",
  "Order",
  "TimeEntry",
  "MonthlyGoal",
];

async function migrateTable(local, neon, table) {
  const { rows } = await local.query(`SELECT * FROM "${table}"`);
  if (rows.length === 0) {
    console.log(`  ⏭  ${table}: vazio`);
    return 0;
  }

  const columns = Object.keys(rows[0]);
  const colList = columns.map((c) => `"${c}"`).join(", ");
  let ok = 0;
  let skip = 0;

  for (const row of rows) {
    const values = columns.map((c) => {
      const v = row[c];
      if (v !== null && typeof v === "object" && !(v instanceof Date)) {
        return JSON.stringify(v);
      }
      return v;
    });
    const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
    try {
      const result = await neon.query(
        `INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
        values
      );
      if (result.rowCount > 0) ok++;
      else skip++;
    } catch (err) {
      console.error(`    ⚠️  linha ignorada em ${table}: ${err.message}`);
      skip++;
    }
  }

  console.log(
    `  ✅ ${table}: ${ok} inseridos${skip > 0 ? `, ${skip} já existiam` : ""}`
  );
  return ok;
}

async function main() {
  const local = new pg.Client({ connectionString: LOCAL_URL });
  const neon = new pg.Client({ connectionString: NEON_URL });

  console.log("🔌 Conectando ao banco local...");
  await local.connect();

  console.log("🔌 Conectando ao Neon...");
  await neon.connect();

  console.log("\n📦 Migrando dados...\n");

  let total = 0;
  for (const table of TABLES) {
    total += await migrateTable(local, neon, table);
  }

  console.log(`\n🎉 Migração concluída! ${total} registros transferidos.`);
  await local.end();
  await neon.end();
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  process.exit(1);
});
