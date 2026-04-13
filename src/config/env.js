import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
//  If JWT secrets are missing or still using the example values,
//  auto-generate secure ones and WARN the developer.
//  This prevents the app from running with weak/empty secrets by accident.
// ─────────────────────────────────────────────────────────────────────────────
const EXAMPLE_SECRET = "a3f8c2e1d9b74f6a0e5c8d2b1f4e7a9c3d6b8e2f5a1c4d7e0b3f6a9c2e5d8b1f4";

const resolveSecret = (envValue, name) => {
  if (!envValue || envValue === EXAMPLE_SECRET) {
    const generated = crypto.randomBytes(64).toString("hex");
    console.warn(
      `\n⚠️  WARNING: ${name} is not set in your .env file.`
      + `\n   Auto-generated for this session: ${generated.slice(0, 20)}...`
      + `\n   → Add this to your .env: ${name}=${generated}\n`
    );
    return generated;
  }
  return envValue;
};

const config = {
  // ── Server ──────────────────────────────────────────────────────────────────
  port: parseInt(process.env.PORT) || 5000,
  baseUrl: process.env.BASE_URL || "http://localhost:5000",
  clientUrl: process.env.CLIENT_URL || "*",
  nodeEnv: process.env.NODE_ENV || "development",

  // ── JWT ─────────────────────────────────────────────────────────────────────
  jwt: {
    accessSecret:   resolveSecret(process.env.ACCESS_TOKEN_SECRET,  "ACCESS_TOKEN_SECRET"),
    refreshSecret:  resolveSecret(process.env.REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET"),
    accessExpires:  process.env.ACCESS_TOKEN_EXPIRES  || "15m",
    refreshExpires: process.env.REFRESH_TOKEN_EXPIRES || "7d",
  },

  // ── PostgreSQL ───────────────────────────────────────────────────────────────
  // Priority: DATABASE_URL (Render/cloud) → individual fields (local/DBeaver)
  db: {
    connectionString: process.env.DATABASE_URL || null,
    host:     process.env.DB_HOST     || "localhost",
    port:     parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME     || "custom_backend_db",
    user:     process.env.DB_USER     || "postgres",
    password: process.env.DB_PASSWORD || "",
    // SSL is required on Render/cloud Postgres — disabled locally
    ssl: process.env.DATABASE_URL
      ? { rejectUnauthorized: false }
      : false,
  },
};

export default config;