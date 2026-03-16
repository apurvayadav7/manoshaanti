const { setEmotion } = require('./chatController');
const { db } = require('../db/database');

const ALLOWED_EMOTIONS = [
  'neutral',
  'happy',
  'sad',
  'angry',
  'fearful',
  'disgusted',
  'surprised',
];

function handleEmotion(req, res) {
  const rawEmotion = req.body?.emotion;
  const rawUserId = req.body?.userId;

  if (!rawEmotion || typeof rawEmotion !== 'string') {
    return res.status(400).json({
      error: 'Emotion is required and must be a string.',
      allowed: ALLOWED_EMOTIONS,
    });
  }

  const emotion = rawEmotion.trim().toLowerCase();

  if (!emotion) {
    return res.status(400).json({
      error: 'Emotion cannot be empty.',
      allowed: ALLOWED_EMOTIONS,
    });
  }

  if (!ALLOWED_EMOTIONS.includes(emotion)) {
    return res.status(400).json({
      error: 'Unsupported emotion value.',
      received: emotion,
      allowed: ALLOWED_EMOTIONS,
    });
  }

  let userId = null;
  if (rawUserId !== undefined && rawUserId !== null && rawUserId !== '') {
    const parsedUserId = Number(rawUserId);
    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      return res.status(400).json({
        error: 'userId must be a positive integer when provided.',
      });
    }

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(parsedUserId);
    if (!user) {
      return res.status(404).json({ error: 'User not found for mood log.' });
    }
    userId = parsedUserId;
  }

  setEmotion(emotion);

  db.prepare('INSERT INTO mood_logs (user_id, emotion) VALUES (?, ?)').run(userId, emotion);

  return res.json({
    message: 'Emotion received successfully.',
    emotion,
    userId,
    source: 'face-api.js-client',
  });
}

module.exports = {
  handleEmotion,
};
