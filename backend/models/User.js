const { db } = require('../db/database');

function normalize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function findByEmail(email) {
  const cleanEmail = normalize(email).toLowerCase();
  if (!cleanEmail) return null;

  return db
    .prepare(
      `
      SELECT
        id,
        username,
        email,
        password_hash AS passwordHash,
        created_at AS createdAt
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `
    )
    .get(cleanEmail);
}

function findByUsername(username) {
  const cleanUsername = normalize(username).toLowerCase();
  if (!cleanUsername) return null;

  return db
    .prepare(
      `
      SELECT
        id,
        username,
        email,
        password_hash AS passwordHash,
        created_at AS createdAt
      FROM users
      WHERE LOWER(username) = ?
      LIMIT 1
      `
    )
    .get(cleanUsername);
}

function createUser({ username, email, passwordHash }) {
  const cleanUsername = normalize(username);
  const cleanEmail = normalize(email).toLowerCase();

  const result = db
    .prepare(
      `
      INSERT INTO users (name, username, email, password_hash)
      VALUES (?, ?, ?, ?)
      `
    )
    .run(cleanUsername, cleanUsername, cleanEmail, passwordHash);

  return db
    .prepare(
      `
      SELECT
        id,
        username,
        email,
        created_at AS createdAt
      FROM users
      WHERE id = ?
      LIMIT 1
      `
    )
    .get(result.lastInsertRowid);
}

module.exports = {
  findByEmail,
  findByUsername,
  createUser,
};
