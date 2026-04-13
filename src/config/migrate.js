import { query } from "./db.js";

// ─────────────────────────────────────────────────────────────────────────────
//  Database Migration — runs once on server startup
//
//  "CREATE TABLE IF NOT EXISTS" = only creates the table if it doesn't exist yet.
//  Safe to run every time — won't break existing data.
//
//  In a real production app you'd use a proper migration tool (like db-migrate
//  or Flyway), but for a 4–5 LPA project this pattern is perfectly fine.
// ─────────────────────────────────────────────────────────────────────────────

export const runMigrations = async () => {
  try {
    // ── Users table ────────────────────────────────────────────────────────────
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name       VARCHAR(100)  NOT NULL,
        last_name        VARCHAR(100)  NOT NULL,
        email            VARCHAR(255)  UNIQUE NOT NULL,
        password_hash    TEXT          NOT NULL,
        profile_picture  TEXT,

        -- Location stored as JSONB so we can query city, country etc. later
        location         JSONB         DEFAULT '{}',

        created_at       TIMESTAMPTZ   DEFAULT NOW(),
        updated_at       TIMESTAMPTZ   DEFAULT NOW()
      );
    `);

    // ── Auto-update updated_at on any row change ────────────────────────────
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await query(`
      DROP TRIGGER IF EXISTS users_updated_at ON users;
      CREATE TRIGGER users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `);

    console.log("✅  Database migrations ran successfully");
  } catch (err) {
    console.error("❌  Migration failed:", err.message);
    process.exit(1);
  }
};