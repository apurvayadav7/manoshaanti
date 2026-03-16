const bcrypt = require('bcrypt');
const { db } = require('../db/database');

const SALT_ROUNDS = 10;

function parseUserId(value) {
  const userId = Number(value);
  if (!Number.isInteger(userId) || userId <= 0) {
    return null;
  }
  return userId;
}

function getUserById(userId) {
  return db.prepare('SELECT id, name, journal_password_hash FROM users WHERE id = ?').get(userId);
}

async function verifyJournalPassword(user, plainPassword) {
  if (!user || !user.journal_password_hash) {
    return false;
  }
  return bcrypt.compare(plainPassword, user.journal_password_hash);
}

async function saveJournalSettings(req, res) {
  const { userId, allows_chatbot_access, journalPassword } = req.body;
  const numericUserId = parseUserId(userId);

  if (!numericUserId) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  if (typeof allows_chatbot_access !== 'boolean') {
    return res.status(400).json({ error: 'allows_chatbot_access must be boolean.' });
  }

  if (!journalPassword || typeof journalPassword !== 'string' || journalPassword.trim().length < 4) {
    return res.status(400).json({ error: 'journalPassword must be at least 4 characters.' });
  }

  const user = getUserById(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  try {
    const passwordHash = await bcrypt.hash(journalPassword.trim(), SALT_ROUNDS);

    const tx = db.transaction(() => {
      db.prepare('UPDATE users SET journal_password_hash = ? WHERE id = ?').run(passwordHash, numericUserId);
      db.prepare(
        `
          INSERT INTO journal_settings (user_id, allows_chatbot_access)
          VALUES (?, ?)
          ON CONFLICT(user_id) DO UPDATE SET allows_chatbot_access = excluded.allows_chatbot_access
        `
      ).run(numericUserId, allows_chatbot_access ? 1 : 0);
    });

    tx();

    return res.status(200).json({
      message: 'Journal settings saved successfully.',
      settings: {
        userId: numericUserId,
        allows_chatbot_access,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save journal settings.', details: error.message });
  }
}

async function createJournalEntry(req, res) {
  const { userId, entryText, isPrivate, journalPassword } = req.body;
  const numericUserId = parseUserId(userId);

  if (!numericUserId) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  if (!entryText || typeof entryText !== 'string' || !entryText.trim()) {
    return res.status(400).json({ error: 'entryText is required.' });
  }

  if (!journalPassword || typeof journalPassword !== 'string') {
    return res.status(400).json({ error: 'journalPassword is required.' });
  }

  const user = getUserById(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const passwordOk = await verifyJournalPassword(user, journalPassword);
  if (!passwordOk) {
    return res.status(401).json({ error: 'Invalid journal password.' });
  }

  const result = db
    .prepare('INSERT INTO journals (user_id, entry_text, is_private) VALUES (?, ?, ?)')
    .run(numericUserId, entryText.trim(), isPrivate === false ? 0 : 1);

  const created = db
    .prepare(
      'SELECT id, user_id AS userId, entry_text AS entryText, created_at AS createdAt, is_private AS isPrivate FROM journals WHERE id = ?'
    )
    .get(result.lastInsertRowid);

  return res.status(201).json({
    message: 'Journal entry saved successfully.',
    entry: {
      ...created,
      isPrivate: Boolean(created.isPrivate),
    },
  });
}

async function getJournalEntries(req, res) {
  const numericUserId = parseUserId(req.params.userId);
  const journalPassword = (req.query.journalPassword || req.headers['x-journal-password'] || '').toString();

  if (!numericUserId) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  if (!journalPassword) {
    return res.status(400).json({ error: 'journalPassword is required in query or x-journal-password header.' });
  }

  const user = getUserById(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const passwordOk = await verifyJournalPassword(user, journalPassword);
  if (!passwordOk) {
    return res.status(401).json({ error: 'Invalid journal password.' });
  }

  const entries = db
    .prepare(
      `
        SELECT
          id,
          user_id AS userId,
          entry_text AS entryText,
          created_at AS createdAt,
          is_private AS isPrivate
        FROM journals
        WHERE user_id = ?
        ORDER BY created_at DESC
      `
    )
    .all(numericUserId)
    .map((entry) => ({ ...entry, isPrivate: Boolean(entry.isPrivate) }));

  return res.json({ userId: numericUserId, entries });
}

function getJournalContextForChat(userId) {
  const numericUserId = parseUserId(userId);
  if (!numericUserId) {
    return [];
  }

  const settings = db
    .prepare('SELECT allows_chatbot_access AS allowsChatbotAccess FROM journal_settings WHERE user_id = ?')
    .get(numericUserId);

  if (!settings || Number(settings.allowsChatbotAccess) !== 1) {
    return [];
  }

  return db
    .prepare(
      `
        SELECT entry_text AS entryText
        FROM journals
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 3
      `
    )
    .all(numericUserId)
    .map((row) => row.entryText);
}

module.exports = {
  saveJournalSettings,
  createJournalEntry,
  getJournalEntries,
  getJournalContextForChat,
};
