const { db } = require('../db/database');

function getWeeklyMood(req, res) {
  const numericUserId = Number(req.params.userId);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const rows = db
    .prepare(
      `
        SELECT
          DATE(logged_at) AS day,
          emotion,
          COUNT(*) AS count
        FROM mood_logs
        WHERE user_id = ?
          AND DATE(logged_at) >= DATE('now', '-6 days')
        GROUP BY day, emotion
        ORDER BY day ASC
      `
    )
    .all(numericUserId);

  const byDay = {};
  for (const row of rows) {
    if (!byDay[row.day]) {
      byDay[row.day] = {
        day: row.day,
        totalLogs: 0,
        emotionBreakdown: {},
      };
    }

    const count = Number(row.count || 0);
    byDay[row.day].emotionBreakdown[row.emotion] = count;
    byDay[row.day].totalLogs += count;
  }

  const weeklyLogs = Object.values(byDay);

  return res.json({
    userId: numericUserId,
    range: 'last_7_days',
    weeklyLogs,
  });
}

module.exports = {
  getWeeklyMood,
};
