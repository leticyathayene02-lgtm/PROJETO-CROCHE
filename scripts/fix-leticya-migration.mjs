/**
 * fix-leticya-migration.mjs
 * Corrige a migração do usuário leticya331331@gmail.com:
 * - Atualiza passwordHash no Neon para o hash local (login funciona)
 * - Migra materiais, cálculos, transações e pedidos apontando para
 *   o workspace correto no Neon
 */
import pg from "pg";

const LOCAL_URL = "postgresql://postgres:postgres@localhost:5432/projeto_croche";
const NEON_URL = process.env.NEON_URL;

if (!NEON_URL) {
  console.error("❌ Defina NEON_URL antes de rodar este script.");
  process.exit(1);
}

const LOCAL_USER_EMAIL = "leticya331331@gmail.com";
const LOCAL_WS_ID      = "cmme025380007fkvpgktlsxip"; // workspace local
const NEON_WS_ID       = "cmmwf5sws000104l8ey22m535"; // workspace neon

async function main() {
  const local = new pg.Client({ connectionString: LOCAL_URL });
  const neon  = new pg.Client({ connectionString: NEON_URL });
  await local.connect();
  await neon.connect();

  // 1. Busca dados do usuário local
  const { rows: [localUser] } = await local.query(
    `SELECT id, name, "passwordHash" FROM "User" WHERE email = $1`,
    [LOCAL_USER_EMAIL]
  );
  if (!localUser) throw new Error("Usuário local não encontrado!");
  console.log(`✅ Usuário local encontrado: ${localUser.id}`);

  // 2. Atualiza passwordHash + name no Neon (para login funcionar)
  await neon.query(
    `UPDATE "User" SET "passwordHash" = $1, name = $2 WHERE email = $3`,
    [localUser.passwordHash, localUser.name, LOCAL_USER_EMAIL]
  );
  console.log(`✅ Senha e nome atualizados no Neon para ${LOCAL_USER_EMAIL}`);

  // 3. Migra materiais (local workspaceId → neon workspaceId)
  const { rows: materials } = await local.query(
    `SELECT * FROM "Material" WHERE "workspaceId" = $1`, [LOCAL_WS_ID]
  );
  console.log(`\n📦 Migrando ${materials.length} materiais...`);
  let matOk = 0;
  for (const m of materials) {
    const row = { ...m, workspaceId: NEON_WS_ID };
    const cols = Object.keys(row).map(c => `"${c}"`).join(", ");
    const vals = Object.values(row).map((v, i) =>
      v !== null && typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v
    );
    const ph = vals.map((_, i) => `$${i + 1}`).join(", ");
    try {
      const r = await neon.query(
        `INSERT INTO "Material" (${cols}) VALUES (${ph}) ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, category = EXCLUDED.category, brand = EXCLUDED.brand,
          color = EXCLUDED.color, unit = EXCLUDED.unit, "costPerUnit" = EXCLUDED."costPerUnit",
          stock = EXCLUDED.stock, "lowStockMin" = EXCLUDED."lowStockMin",
          supplier = EXCLUDED.supplier, notes = EXCLUDED.notes,
          "weightPerRoll" = EXCLUDED."weightPerRoll", "pricePerRoll" = EXCLUDED."pricePerRoll",
          rolls = EXCLUDED.rolls, "updatedAt" = EXCLUDED."updatedAt"`,
        vals
      );
      matOk++;
    } catch (err) {
      console.error(`  ⚠️  Material "${m.name}": ${err.message}`);
    }
  }
  console.log(`  ✅ ${matOk}/${materials.length} materiais migrados`);

  // 4. Migra PriceCalculations
  const { rows: calcs } = await local.query(
    `SELECT * FROM "PriceCalculation" WHERE "workspaceId" = $1`, [LOCAL_WS_ID]
  );
  console.log(`\n📦 Migrando ${calcs.length} cálculos...`);
  let calcOk = 0;
  for (const c of calcs) {
    const row = { ...c, workspaceId: NEON_WS_ID };
    const cols = Object.keys(row).map(x => `"${x}"`).join(", ");
    const vals = Object.values(row).map(v =>
      v !== null && typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v
    );
    const ph = vals.map((_, i) => `$${i + 1}`).join(", ");
    try {
      await neon.query(
        `INSERT INTO "PriceCalculation" (${cols}) VALUES (${ph}) ON CONFLICT (id) DO NOTHING`,
        vals
      );
      calcOk++;
    } catch (err) {
      console.error(`  ⚠️  Cálculo: ${err.message}`);
    }
  }
  console.log(`  ✅ ${calcOk}/${calcs.length} cálculos migrados`);

  // 5. Migra Transactions
  const { rows: txns } = await local.query(
    `SELECT * FROM "Transaction" WHERE "workspaceId" = $1`, [LOCAL_WS_ID]
  );
  console.log(`\n📦 Migrando ${txns.length} transações...`);
  let txOk = 0;
  for (const t of txns) {
    const row = { ...t, workspaceId: NEON_WS_ID };
    const cols = Object.keys(row).map(x => `"${x}"`).join(", ");
    const vals = Object.values(row).map(v =>
      v !== null && typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v
    );
    const ph = vals.map((_, i) => `$${i + 1}`).join(", ");
    try {
      await neon.query(
        `INSERT INTO "Transaction" (${cols}) VALUES (${ph}) ON CONFLICT (id) DO NOTHING`,
        vals
      );
      txOk++;
    } catch (err) {
      console.error(`  ⚠️  Transação: ${err.message}`);
    }
  }
  console.log(`  ✅ ${txOk}/${txns.length} transações migradas`);

  // 6. Migra Orders
  const { rows: orders } = await local.query(
    `SELECT * FROM "Order" WHERE "workspaceId" = $1`, [LOCAL_WS_ID]
  );
  console.log(`\n📦 Migrando ${orders.length} pedidos...`);
  let ordOk = 0;
  for (const o of orders) {
    const row = { ...o, workspaceId: NEON_WS_ID };
    const cols = Object.keys(row).map(x => `"${x}"`).join(", ");
    const vals = Object.values(row).map(v =>
      v !== null && typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v
    );
    const ph = vals.map((_, i) => `$${i + 1}`).join(", ");
    try {
      await neon.query(
        `INSERT INTO "Order" (${cols}) VALUES (${ph}) ON CONFLICT (id) DO NOTHING`,
        vals
      );
      ordOk++;
    } catch (err) {
      console.error(`  ⚠️  Pedido: ${err.message}`);
    }
  }
  console.log(`  ✅ ${ordOk}/${orders.length} pedidos migrados`);

  // 7. Migra UsageCounter
  const { rows: usage } = await local.query(
    `SELECT * FROM "UsageCounter" WHERE "workspaceId" = $1`, [LOCAL_WS_ID]
  );
  for (const u of usage) {
    const row = { ...u, workspaceId: NEON_WS_ID };
    const cols = Object.keys(row).map(x => `"${x}"`).join(", ");
    const vals = Object.values(row);
    const ph = vals.map((_, i) => `$${i + 1}`).join(", ");
    try {
      await neon.query(
        `INSERT INTO "UsageCounter" (${cols}) VALUES (${ph}) ON CONFLICT ("workspaceId", "monthYYYYMM") DO NOTHING`,
        vals
      );
    } catch (_) {}
  }

  console.log("\n🎉 Correção concluída! Verifique os dados no Neon.");
  await local.end();
  await neon.end();
}

main().catch(err => {
  console.error("❌ Fatal:", err.message);
  process.exit(1);
});
