import { query } from "../config/db.js";

// ─────────────────────────────────────────────────────────────────────────────
//  User Model
//
//  All database operations for the users table live here.
//  Controllers call these functions — they never write SQL directly.
//
//  Column naming:
//    DB uses snake_case  (first_name, password_hash)
//    JS uses camelCase   (firstName, passwordHash)
//  The toJS() helper converts between them.
// ─────────────────────────────────────────────────────────────────────────────

// Convert a DB row (snake_case) → JS object (camelCase)
const toJS = (row) => {
  if (!row) return null;
  return {
    id:             row.id,
    firstName:      row.first_name,
    lastName:       row.last_name,
    email:          row.email,
    passwordHash:   row.password_hash,
    profilePicture: row.profile_picture,
    location:       row.location || {},
    createdAt:      row.created_at,
    updatedAt:      row.updated_at,
  };
};

const UserModel = {
  // ── Find a user by their UUID ─────────────────────────────────────────────
  findById: async (id) => {
    const result = await query(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    return toJS(result.rows[0]);
  },

  // ── Find a user by email (case-insensitive) ───────────────────────────────
  findByEmail: async (email) => {
    const result = await query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    return toJS(result.rows[0]);
  },

  // ── Create a new user — returns the created row ───────────────────────────
  create: async ({ firstName, lastName, email, passwordHash, profilePicture, location }) => {
    const result = await query(
      `INSERT INTO users
        (first_name, last_name, email, password_hash, profile_picture, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        firstName.trim(),
        lastName.trim(),
        email.toLowerCase().trim(),
        passwordHash,
        profilePicture || null,
        JSON.stringify(location || {}),
      ]
    );
    return toJS(result.rows[0]);
  },

  // ── Check if email already exists (for duplicate check) ──────────────────
  emailExists: async (email) => {
    const result = await query(
      "SELECT 1 FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    return result.rows.length > 0;
  },
};

export default UserModel;