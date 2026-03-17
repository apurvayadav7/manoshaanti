const { db } = require('../db/database');

const STOPWORDS = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'have', 'from', 'your', 'about',
  'just', 'feel', 'feeling', 'been', 'were', 'what', 'when', 'where', 'which',
  'into', 'very', 'really', 'today', 'they', 'them', 'then', 'than', 'because',
  'want', 'need', 'like', 'much', 'more', 'less', 'have', 'has', 'had', 'you',
  'are', 'was', 'did', 'not', 'too', 'can', 'could', 'would', 'should', 'will',
  'my', 'our', 'their', 'its', 'but', 'also', 'still', 'only', 'some', 'any',
]);

const JOURNAL_THEME_KEYWORDS = [
  'stress',
  'anxiety',
  'sleep',
  'exams',
  'deadlines',
  'loneliness',
  'focus',
  'work',
  'family',
  'motivation',
  'panic',
  'overthinking',
  'burnout',
  'sadness',
  'anger',
  'fear',
  'relationship',
  'self-esteem',
  'confidence',
  'financial',
];

function normalizeWord(word) {
  return String(word || '')
    .toLowerCase()
    .replace(/[^a-z\-]/g, '')
    .trim();
}

function tokenize(text) {
  return String(text || '')
    .split(/\s+/g)
    .map(normalizeWord)
    .filter((word) => word.length >= 4 && !STOPWORDS.has(word));
}

function pickTopKeywords(texts, limit = 4) {
  const counts = new Map();
  texts.forEach((text) => {
    tokenize(text).forEach((word) => {
      counts.set(word, (counts.get(word) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function capitalizeWords(value) {
  return String(value || '')
    .split(/\s+/g)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function getAssessmentContext(userId) {
  if (!userId) return 'Not Available';

  const latest = db
    .prepare(
      `
        SELECT category
        FROM assessments
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `
    )
    .get(userId);

  return latest?.category || 'Not Available';
}

function getEmotionContext(userId, fallbackEmotion = null) {
  if (fallbackEmotion) {
    return capitalizeWords(fallbackEmotion);
  }

  if (!userId) return 'Neutral';

  const latest = db
    .prepare(
      `
        SELECT emotion
        FROM mood_logs
        WHERE user_id = ?
        ORDER BY logged_at DESC, id DESC
        LIMIT 1
      `
    )
    .get(userId);

  return latest?.emotion ? capitalizeWords(latest.emotion) : 'Neutral';
}

function getChatSummary(userId) {
  if (!userId) return 'No recent conversation summary available.';

  const rows = db
    .prepare(
      `
        SELECT user_message AS userMessage
        FROM chat_history
        WHERE user_id = ?
          AND DATETIME(created_at) >= DATETIME('now', '-7 days')
        ORDER BY created_at DESC, id DESC
        LIMIT 12
      `
    )
    .all(userId);

  if (!rows.length) {
    return 'No recent conversation summary available.';
  }

  const keywords = pickTopKeywords(rows.map((row) => row.userMessage), 3);
  if (!keywords.length) {
    return 'User has recent conversations but no dominant themes were detected.';
  }

  return `User frequently talks about ${keywords.join(', ')}.`;
}

function getJournalThemes(userId) {
  if (!userId) return [];

  const settings = db
    .prepare('SELECT allows_chatbot_access AS allowsChatbotAccess FROM journal_settings WHERE user_id = ?')
    .get(userId);

  if (!settings || Number(settings.allowsChatbotAccess) !== 1) {
    return [];
  }

  const rows = db
    .prepare(
      `
        SELECT entry_text AS entryText
        FROM journals
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 12
      `
    )
    .all(userId);

  if (!rows.length) return [];

  const textBlob = rows.map((row) => row.entryText).join(' ');
  const blobLower = textBlob.toLowerCase();

  const matchedThemeCounts = JOURNAL_THEME_KEYWORDS
    .map((theme) => ({
      theme,
      count: (blobLower.match(new RegExp(`\\b${theme.replace('-', '\\-')}\\b`, 'g')) || []).length,
    }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((entry) => entry.theme);

  if (matchedThemeCounts.length) {
    return matchedThemeCounts;
  }

  return pickTopKeywords(rows.map((row) => row.entryText), 5);
}

function getProfileContext(userId) {
  if (!userId) {
    return {
      age_group: 'unknown',
      occupation: 'unknown',
      preferred_language: 'English',
    };
  }

  const user = db
    .prepare(
      `
        SELECT username
        FROM users
        WHERE id = ?
        LIMIT 1
      `
    )
    .get(userId);

  // Keep profile context minimal and non-sensitive.
  return {
    age_group: 'unknown',
    occupation: user?.username?.toLowerCase().includes('student') ? 'Student' : 'unknown',
    preferred_language: 'English',
  };
}

function buildContext(userId, { detectedEmotion } = {}) {
  return {
    assessment_level: getAssessmentContext(userId),
    detected_emotion: getEmotionContext(userId, detectedEmotion),
    chat_summary: getChatSummary(userId),
    journal_themes: getJournalThemes(userId),
    profile_context: getProfileContext(userId),
  };
}

function buildStructuredPrompt(userMessage, context) {
  return [
    'You are an empathetic AI mental wellness assistant.',
    '',
    'User context:',
    `Assessment level: ${context.assessment_level}`,
    `Detected emotion: ${context.detected_emotion}`,
    `Recent conversation summary: ${context.chat_summary}`,
    `Journal themes: ${context.journal_themes.length ? context.journal_themes.join(', ') : 'None'}`,
    `Profile: ${JSON.stringify(context.profile_context)}`,
    '',
    'Respond with supportive, calm, and non-judgmental language.',
    'Suggest activities appropriate to the user\'s mental state, such as breathing exercises, journaling, grounding techniques, or relaxation activities.',
    'Avoid sounding clinical or overly technical.',
    '',
    'Context priority order:',
    '1. Crisis detection',
    '2. Assessment level',
    '3. Current emotion',
    '4. Chat history summary',
    '5. Journal themes',
    '6. Profile context',
    '',
    'User message:',
    userMessage,
  ].join('\n');
}

module.exports = {
  getAssessmentContext,
  getEmotionContext,
  getChatSummary,
  getJournalThemes,
  getProfileContext,
  buildContext,
  buildStructuredPrompt,
};
