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

  CREATE TABLE IF NOT EXISTS journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    entry_text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_private INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_journals_user_id_created_at
  ON journals(user_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS journal_settings (
    user_id INTEGER PRIMARY KEY,
    allows_chatbot_access INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    category TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_assessments_user_id_created_at
  ON assessments(user_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS mood_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    emotion TEXT NOT NULL,
    logged_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_mood_logs_user_id_logged_at
  ON mood_logs(user_id, logged_at DESC);

  CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_auth_tokens_user_id
  ON auth_tokens(user_id);

  CREATE INDEX IF NOT EXISTS idx_auth_tokens_expires_at
  ON auth_tokens(expires_at);

  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_message TEXT NOT NULL,
    assistant_reply TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_chat_history_user_id_created_at
  ON chat_history(user_id, created_at DESC);
`);

const userColumns = db.prepare('PRAGMA table_info(users)').all();
const hasJournalPasswordHash = userColumns.some((column) => column.name === 'journal_password_hash');
if (!hasJournalPasswordHash) {
  db.exec('ALTER TABLE users ADD COLUMN journal_password_hash TEXT');
}

const hasPasswordHash = userColumns.some((column) => column.name === 'password_hash');
if (!hasPasswordHash) {
  db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT');
}

const hasUsername = userColumns.some((column) => column.name === 'username');
if (!hasUsername) {
  db.exec('ALTER TABLE users ADD COLUMN username TEXT');
}

const hasEmail = userColumns.some((column) => column.name === 'email');
if (!hasEmail) {
  db.exec('ALTER TABLE users ADD COLUMN email TEXT');
}

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
  ON users(username COLLATE NOCASE);

  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique
  ON users(email COLLATE NOCASE);
`);

db.exec('UPDATE users SET username = name WHERE username IS NULL AND name IS NOT NULL');

module.exports = {
  db,
  dbPath,
};
