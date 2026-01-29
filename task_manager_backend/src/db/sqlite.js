const path = require('path');
const sqlite3 = require('sqlite3').verbose();

/**
 * Resolve SQLite DB file path.
 * Prefer SQLITE_DB env var (as per database container), otherwise default to the shared DB file path.
 */
function resolveDbPath() {
  // Allow the orchestrator to provide SQLITE_DB in the backend .env in the future.
  if (process.env.SQLITE_DB && process.env.SQLITE_DB.trim().length > 0) {
    return process.env.SQLITE_DB.trim();
  }

  // Default to the database container's DB file path in this monorepo workspace.
  // This avoids hardcoding credentials and matches the provided db_connection.txt.
  return path.resolve(
    __dirname,
    '../../../../task-management-system-206918-206927/task_manager_database/myapp.db'
  );
}

let db;

/**
 * PUBLIC_INTERFACE
 * Get (and lazily initialize) the SQLite database connection.
 * Ensures the `tasks` table exists.
 *
 * @returns {sqlite3.Database} sqlite3 database instance
 */
function getDb() {
  /** This is a public function. */
  if (db) return db;

  const dbPath = resolveDbPath();
  db = new sqlite3.Database(dbPath);

  // Ensure schema exists (id, description, created_at, completed) to match database container init_db.py.
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1))
      )
    `);
  });

  return db;
}

/**
 * PUBLIC_INTERFACE
 * Close the database connection (best-effort).
 *
 * @returns {Promise<void>} resolves once close completes
 */
function closeDb() {
  /** This is a public function. */
  return new Promise((resolve) => {
    if (!db) return resolve();
    db.close(() => resolve());
  });
}

module.exports = {
  getDb,
  closeDb,
};

