const { db } = require('../db/database');

function getLevel(totalPoints) {
  return Math.floor(totalPoints / 100) + 1;
}

function getBadges(totalPoints) {
  const badges = [];

  if (totalPoints >= 50) badges.push('Calm Starter');
  if (totalPoints >= 150) badges.push('Mindful Explorer');
  if (totalPoints >= 300) badges.push('Consistency Champion');
  if (totalPoints >= 600) badges.push('Wellness Warrior');

  return badges;
}

function getUserSummary(userId) {
  const totalRow = db
    .prepare('SELECT COALESCE(SUM(points), 0) AS totalPoints, COUNT(*) AS totalEvents FROM reward_events WHERE user_id = ?')
    .get(userId);

  const totalPoints = Number(totalRow.totalPoints || 0);
  return {
    totalPoints,
    totalEvents: Number(totalRow.totalEvents || 0),
    level: getLevel(totalPoints),
    badges: getBadges(totalPoints),
  };
}

function createUser(req, res) {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'name is required and must be a non-empty string.' });
  }

  const cleanName = name.trim();
  const existing = db.prepare('SELECT id, name, created_at FROM users WHERE name = ?').get(cleanName);
  if (existing) {
    return res.status(200).json({
      message: 'User already exists.',
      user: existing,
      rewards: getUserSummary(existing.id),
    });
  }

  const insert = db.prepare('INSERT INTO users (name) VALUES (?)').run(cleanName);
  const user = db.prepare('SELECT id, name, created_at FROM users WHERE id = ?').get(insert.lastInsertRowid);

  return res.status(201).json({
    message: 'User created successfully.',
    user,
    rewards: getUserSummary(user.id),
  });
}

function awardPoints(req, res) {
  const { userId, points, activityType, note } = req.body;
  const numericUserId = Number(userId);
  const numericPoints = Number(points);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  if (!Number.isFinite(numericPoints) || numericPoints <= 0) {
    return res.status(400).json({ error: 'points must be a positive number.' });
  }

  const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const safeActivityType =
    activityType && typeof activityType === 'string' && activityType.trim()
      ? activityType.trim().toLowerCase()
      : 'general';

  const safeNote = note && typeof note === 'string' ? note.trim() : null;

  db.prepare(
    'INSERT INTO reward_events (user_id, points, activity_type, note) VALUES (?, ?, ?, ?)'
  ).run(numericUserId, Math.round(numericPoints), safeActivityType, safeNote || null);

  return res.status(201).json({
    message: 'Points awarded successfully.',
    user,
    lastAward: {
      points: Math.round(numericPoints),
      activityType: safeActivityType,
      note: safeNote,
    },
    rewards: getUserSummary(numericUserId),
  });
}

function getUserRewards(req, res) {
  const numericUserId = Number(req.params.userId);
  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  const user = db.prepare('SELECT id, name, created_at FROM users WHERE id = ?').get(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const history = db
    .prepare(
      'SELECT id, points, activity_type AS activityType, note, created_at AS createdAt FROM reward_events WHERE user_id = ? ORDER BY id DESC LIMIT 20'
    )
    .all(numericUserId);

  return res.json({
    user,
    rewards: getUserSummary(numericUserId),
    recentHistory: history,
  });
}

function getLeaderboard(req, res) {
  const limitRaw = Number(req.query.limit || 10);
  const limit = Number.isInteger(limitRaw) && limitRaw > 0 && limitRaw <= 50 ? limitRaw : 10;

  const rows = db
    .prepare(
      `
      SELECT
        u.id,
        u.name,
        COALESCE(SUM(re.points), 0) AS totalPoints,
        COUNT(re.id) AS totalEvents
      FROM users u
      LEFT JOIN reward_events re ON re.user_id = u.id
      GROUP BY u.id
      ORDER BY totalPoints DESC, totalEvents DESC, u.id ASC
      LIMIT ?
      `
    )
    .all(limit)
    .map((row, index) => {
      const totalPoints = Number(row.totalPoints || 0);
      return {
        rank: index + 1,
        userId: row.id,
        name: row.name,
        totalPoints,
        totalEvents: Number(row.totalEvents || 0),
        level: getLevel(totalPoints),
        badges: getBadges(totalPoints),
      };
    });

  return res.json({
    leaderboard: rows,
  });
}

module.exports = {
  createUser,
  awardPoints,
  getUserRewards,
  getLeaderboard,
};
