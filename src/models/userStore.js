// ─────────────────────────────────────────────────────────────────────────────
//  In-Memory User Store
//  Replace this entire file with a real DB adapter (MongoDB/PostgreSQL)
//  when you're ready. The rest of the app won't need to change.
// ─────────────────────────────────────────────────────────────────────────────

const users = [];

const UserStore = {
  /** Find a user by id */
  findById: (id) => users.find((u) => u.id === id) || null,

  /** Find a user by email (case-insensitive) */
  findByEmail: (email) =>
    users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null,

  /** Insert a new user and return it */
  create: (userData) => {
    users.push(userData);
    return userData;
  },

  /** Return all users (admin use) */
  findAll: () => [...users],
};

export default UserStore;