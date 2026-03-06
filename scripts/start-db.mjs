/**
 * start-db.mjs — Starts an embedded PostgreSQL for local dev.
 *
 * Uso:
 *   node scripts/start-db.mjs          # inicia e mantém rodando (Ctrl+C para parar)
 *   node scripts/start-db.mjs stop     # para o servidor
 *   node scripts/start-db.mjs status   # verifica status
 *
 * Fluxo:
 *   1. Na primeira vez: initdb (cria cluster) + pg_ctl start (inicia servidor)
 *   2. Nas vezes seguintes: só pg_ctl start (cluster já existe)
 *   O servidor roda como processo independente (sobrevive ao script Node.js)
 */
import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";
import path from "path";
import { execSync, spawnSync } from "child_process";
import { existsSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DB_PORT = 5432;
const DB_USER = "postgres";
const DB_PASS = "postgres";
const DB_NAME = "projeto_croche";
const DATA_DIR = path.join(ROOT, "data", "db");

// Path to pg_ctl shipped by embedded-postgres
const BIN_DIR = path.join(
  ROOT,
  "node_modules",
  "@embedded-postgres",
  "windows-x64",
  "native",
  "bin"
);
const PG_CTL = path.join(BIN_DIR, "pg_ctl.exe");
const LOG_FILE = path.join(ROOT, "data", "pg.log");

function pgCtl(...args) {
  const result = spawnSync(PG_CTL, args, {
    env: {
      ...process.env,
      LC_MESSAGES: "en_US.UTF-8",
    },
    encoding: "utf-8",
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status ?? 1,
  };
}

async function waitForPg(retries = 30, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    const client = new pg.Client({
      host: "127.0.0.1",
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      database: "postgres",
      connectionTimeoutMillis: 2000,
    });
    try {
      await client.connect();
      await client.end();
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

async function ensureDatabase(dbName) {
  const client = new pg.Client({
    host: "127.0.0.1",
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: "postgres",
  });
  await client.connect();
  const { rows } = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );
  if (rows.length === 0) {
    await client.query(`CREATE DATABASE "${dbName}"`);
    console.log(`✅ Banco "${dbName}" criado.`);
  } else {
    console.log(`✅ Banco "${dbName}" já existe.`);
  }
  await client.end();
}

async function isRunning() {
  const client = new pg.Client({
    host: "127.0.0.1",
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: "postgres",
    connectionTimeoutMillis: 1500,
  });
  try {
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const cmd = process.argv[2];

  // ── stop ──────────────────────────────────────────────
  if (cmd === "stop") {
    console.log("⏹  Parando PostgreSQL...");
    const r = pgCtl("stop", "-D", DATA_DIR, "-m", "fast");
    console.log(r.stdout || r.stderr || "Parado.");
    return;
  }

  // ── status ────────────────────────────────────────────
  if (cmd === "status") {
    const up = await isRunning();
    console.log(up ? "🟢 PostgreSQL está rodando." : "🔴 PostgreSQL está parado.");
    return;
  }

  // ── start ─────────────────────────────────────────────
  if (await isRunning()) {
    console.log("🟢 PostgreSQL já está rodando na porta", DB_PORT);
    await ensureDatabase(DB_NAME);
    console.log(`\n   URL: postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}\n`);
    return;
  }

  // initdb if first time
  const needsInit = !existsSync(path.join(DATA_DIR, "PG_VERSION"));
  if (needsInit) {
    console.log("🔧 Inicializando cluster PostgreSQL (primeira vez, pode demorar ~1-2 min)...");
    const ep = new EmbeddedPostgres({
      databaseDir: DATA_DIR,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
      persistent: true,
      authMethod: "password",
      initdbFlags: ["--locale=C", "--encoding=UTF8"],
      onLog: () => {},   // quiet
      onError: () => {},
    });
    // Only run initialise(), NOT start() — we'll use pg_ctl to start
    await ep.initialise();
    console.log("✅ Cluster inicializado.");
  }

  // Start via pg_ctl (truly detached — survives Node.js exit)
  console.log("🚀 Iniciando servidor PostgreSQL (pg_ctl)...");
  const startResult = pgCtl(
    "start",
    "-D", DATA_DIR,
    "-l", LOG_FILE,
    "-o", `-p ${DB_PORT}`,
    "-w",          // wait for server to be ready
    "-t", "60",    // timeout 60s
  );

  if (startResult.status !== 0) {
    console.error("❌ Falha ao iniciar PostgreSQL:");
    console.error(startResult.stderr || startResult.stdout);
    process.exit(1);
  }

  console.log("✅ Servidor iniciado.");
  console.log("🔁 Aguardando conexões...");

  const ready = await waitForPg();
  if (!ready) {
    console.error("❌ Servidor não respondeu a tempo. Veja o log:", LOG_FILE);
    process.exit(1);
  }

  await ensureDatabase(DB_NAME);

  console.log(`\n✅ PostgreSQL pronto!`);
  console.log(`   URL: postgresql://${DB_USER}:${DB_PASS}@localhost:${DB_PORT}/${DB_NAME}`);
  console.log(`   Para parar: node scripts/start-db.mjs stop\n`);
}

main().catch((err) => {
  console.error("❌ Fatal:", err.message);
  process.exit(1);
});
