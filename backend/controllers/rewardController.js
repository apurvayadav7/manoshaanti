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

function getPointsToNextLevel(totalPoints) {
  const nextLevelMinPoints = Math.ceil((totalPoints + 1) / 100) * 100;
  return nextLevelMinPoints - totalPoints;
}

function getStreakDays(userId) {
  const days = db
    .prepare(
      `
      SELECT DISTINCT DATE(created_at) AS day
      FROM reward_events
      WHERE user_id = ?
      ORDER BY day DESC
      `
    )
    .all(userId)
    .map((row) => row.day)
    .filter(Boolean);

  if (!days.length) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < days.length; i += 1) {
    const previous = new Date(`${days[i - 1]}T00:00:00Z`);
    const current = new Date(`${days[i]}T00:00:00Z`);
    const diffInMs = previous.getTime() - current.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
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
    streakDays: getStreakDays(userId),
    pointsToNextLevel: getPointsToNextLevel(totalPoints),
  };
}

const ACTIVITY_POINT_MAP = {
  'box-breathing': 10,
  'guided-journaling': 15,
  'grounding-54321': 14,
  'sunlight-walk': 12,
  'gratitude-note': 12,
  'hydration-break': 8,
  'digital-detox': 10,
  'support-check-in': 18,
  'helpline-readiness': 20,
};

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

function awardAction(req, res) {
  const { userId, action } = req.body;
  const numericUserId = Number(userId);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  const normalizedAction = typeof action === 'string' ? action.trim().toLowerCase() : '';
  if (!normalizedAction) {
    return res.status(400).json({ error: 'action is required.' });
  }

  // Phase 10 + 12 action points mapping.
  const actionPointMap = {
    breathing_exercise: 10,
    card_game: 15,
    word_game: 15,
  };

  const awardedPoints = actionPointMap[normalizedAction];
  if (!awardedPoints) {
    return res.status(400).json({
      error:
        "Unsupported action. Allowed actions: 'breathing_exercise', 'card_game', 'word_game'.",
    });
  }

  const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  db.prepare(
    'INSERT INTO reward_events (user_id, points, activity_type, note) VALUES (?, ?, ?, ?)'
  ).run(numericUserId, awardedPoints, normalizedAction, 'awarded from action endpoint');

  return res.status(201).json({
    message: 'Action points awarded successfully.',
    user,
    action: normalizedAction,
    awardedPoints,
    rewards: getUserSummary(numericUserId),
  });
}

function awardActivityCompletion(req, res) {
  const { userId, activityId } = req.body;
  const numericUserId = Number(userId);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  const normalizedActivityId = typeof activityId === 'string' ? activityId.trim().toLowerCase() : '';
  if (!normalizedActivityId) {
    return res.status(400).json({ error: 'activityId is required.' });
  }

  const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const duplicateInWindow = db
    .prepare(
      `
      SELECT COUNT(*) AS count
      FROM reward_events
      WHERE user_id = ?
        AND activity_type = 'activity_completion'
        AND note = ?
        AND DATETIME(created_at) >= DATETIME('now', '-30 minutes')
      `
    )
    .get(numericUserId, `activity:${normalizedActivityId}`);

  if (Number(duplicateInWindow.count || 0) > 0) {
    return res.status(429).json({
      error: 'This activity was already rewarded recently. Please try again later.',
      cooldownMinutes: 30,
    });
  }

  const awardedPoints = ACTIVITY_POINT_MAP[normalizedActivityId] || 10;

  db.prepare(
    'INSERT INTO reward_events (user_id, points, activity_type, note) VALUES (?, ?, ?, ?)'
  ).run(
    numericUserId,
    awardedPoints,
    'activity_completion',
    `activity:${normalizedActivityId}`
  );

  return res.status(201).json({
    message: 'Activity completion rewarded successfully.',
    user,
    activityId: normalizedActivityId,
    awardedPoints,
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
  awardAction,
  awardActivityCompletion,
  getUserRewards,
  getLeaderboard,
};
