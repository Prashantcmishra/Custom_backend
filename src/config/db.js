import pg from "pg";
import config from "./env.js";

const { Pool } = pg;

// ─────────────────────────────────────────────────────────────────────────────
//  PostgreSQL Connection Pool
//
//  A "pool" keeps multiple DB connections open so requests don't wait.
//  Think of it like a pool of workers — each query grabs a free worker,
//  uses it, then returns it to the pool.
//
//  Config priority:
//    1. DATABASE_URL  → used on Render / Railway / Supabase (cloud)
//    2. Individual fields (DB_HOST, DB_PORT etc.) → used locally with DBeaver
// ─────────────────────────────────────────────────────────────────────────────

const poolConfig = config.db.connectionString
  ? {
      connectionString: config.db.connectionString,
      ssl: config.db.ssl,
    }
  : {
      host:     config.db.host,
      port:     config.db.port,
      database: config.db.database,
      user:     config.db.user,
      password: config.db.password,
      ssl:      config.db.ssl,
    };

const pool = new Pool(poolConfig);

// ─────────────────────────────────────────────────────────────────────────────
//  Test connection on startup
// ─────────────────────────────────────────────────────────────────────────────
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅  PostgreSQL connected →", config.db.connectionString
      ? "cloud (DATABASE_URL)"
      : `${config.db.host}:${config.db.port}/${config.db.database}`
    );
    client.release(); // return the test connection back to pool
  } catch (err) {
    console.error("❌  PostgreSQL connection failed:", err.message);
    console.error("    Check your .env DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD");
    process.exit(1); // stop the server — no point running without a DB
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: run a query
//  Usage: const result = await query("SELECT * FROM users WHERE id = $1", [id])
//  Always use $1, $2... placeholders — NEVER string-concatenate user input (SQL injection)
// ─────────────────────────────────────────────────────────────────────────────
export const query = (text, params) => pool.query(text, params);

export default pool;