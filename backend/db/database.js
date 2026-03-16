const path = require('path');
const Database = require('better-sqlite3');

function resolveDbPath() {
  const raw = process.env.DB_PATH || './db/manoshaanti.db';
  if (path.isAbsolute(raw)) {
    return raw;
  }

  const normalized = raw.replace(/^\.\//, '');
  return path.join(__dirname, '..', normalized);
}

const dbPath = resolveDbPath();
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reward_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    points INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_reward_events_user_id
  ON reward_events(user_id);
`);

module.exports = {
  db,
  dbPath,
};
