const { setEmotion } = require('./chatController');

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

  setEmotion(emotion);

  return res.json({
    message: 'Emotion received successfully.',
    emotion,
    source: 'face-api.js-client',
  });
}

module.exports = {
  handleEmotion,
};
