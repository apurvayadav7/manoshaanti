const { db } = require('../db/database');

const BASE_SUGGESTIONS = [
  {
    id: 'hydration-break',
    title: 'Drink Water + Stretch',
    type: 'quick_reset',
    durationMinutes: 3,
    reason: 'Small physical resets can quickly reduce mental fatigue.',
  },
  {
    id: 'digital-detox',
    title: 'Screen-Off Pause',
    type: 'mindfulness',
    durationMinutes: 10,
    reason: 'A short break from screens helps calm an overloaded mind.',
  },
];

const SUGGESTIONS_BY_ASSESSMENT = {
  'Mild Anxiety/Stress': [
    {
      id: 'box-breathing',
      title: 'Box Breathing',
      type: 'breathing',
      durationMinutes: 5,
      reason: 'Steady breathing helps lower stress quickly.',
    },
    {
      id: 'focus-sprint',
      title: '10-Min Focus Sprint',
      type: 'productivity',
      durationMinutes: 10,
      reason: 'Short focused blocks reduce overwhelm and improve momentum.',
    },
  ],
  'Moderate Mental Distress': [
    {
      id: 'guided-journaling',
      title: 'Guided Journaling',
      type: 'journaling',
      durationMinutes: 12,
      reason: 'Writing thoughts can reduce emotional pressure.',
    },
    {
      id: 'grounding-54321',
      title: '5-4-3-2-1 Grounding',
      type: 'grounding',
      durationMinutes: 7,
      reason: 'Grounding techniques help regulate anxious thoughts.',
    },
  ],
  'Severe Depression Risk': [
    {
      id: 'support-check-in',
      title: 'Reach Out to Trusted Person',
      type: 'support',
      durationMinutes: 10,
      reason: 'Social support is important when distress is high.',
    },
    {
      id: 'helpline-readiness',
      title: 'Keep Helpline Ready',
      type: 'safety',
      durationMinutes: 2,
      reason: 'Preparing support contacts can improve safety during low moments.',
    },
  ],
};

const SUGGESTIONS_BY_EMOTION = {
  sad: [
    {
      id: 'sunlight-walk',
      title: 'Sunlight Walk',
      type: 'movement',
      durationMinutes: 15,
      reason: 'Light movement can gently improve mood.',
    },
    {
      id: 'gratitude-note',
      title: 'Write 3 Good Things',
      type: 'journaling',
      durationMinutes: 6,
      reason: 'Gratitude reflection can rebalance negative thinking.',
    },
  ],
  angry: [
    {
      id: 'cooldown-breath',
      title: 'Cooldown Breathing',
      type: 'breathing',
      durationMinutes: 4,
      reason: 'Slow breathing helps reduce emotional intensity.',
    },
    {
      id: 'body-release',
      title: 'Tension Release Stretch',
      type: 'movement',
      durationMinutes: 8,
      reason: 'Muscle relaxation helps release anger-related tension.',
    },
  ],
  fearful: [
    {
      id: 'safe-space-visualization',
      title: 'Safe Space Visualization',
      type: 'mindfulness',
      durationMinutes: 7,
      reason: 'Visualization can reduce fear response.',
    },
    {
      id: 'fact-check-thought',
      title: 'Thought Fact Check',
      type: 'cognitive',
      durationMinutes: 8,
      reason: 'Checking thoughts helps reduce fear spirals.',
    },
  ],
  disgusted: [
    {
      id: 'reset-routine',
      title: 'Clean-and-Reset Routine',
      type: 'self_care',
      durationMinutes: 10,
      reason: 'A reset routine can improve emotional comfort.',
    },
  ],
  surprised: [
    {
      id: 'pause-and-plan',
      title: 'Pause and Plan',
      type: 'planning',
      durationMinutes: 6,
      reason: 'A short plan helps handle sudden changes calmly.',
    },
  ],
  happy: [
    {
      id: 'keep-the-momentum',
      title: 'Celebrate and Set One Goal',
      type: 'motivation',
      durationMinutes: 5,
      reason: 'Positive moments are great for building consistency.',
    },
  ],
  neutral: [
    {
      id: 'micro-reflection',
      title: 'Micro Reflection',
      type: 'journaling',
      durationMinutes: 5,
      reason: 'Small reflections improve emotional awareness.',
    },
  ],
};

function mergeUniqueSuggestions(groups) {
  const map = new Map();

  for (const group of groups) {
    for (const item of group) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }
  }

  return Array.from(map.values());
}

function getActivitySuggestions(req, res) {
  const numericUserId = Number(req.params.userId);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const latestAssessment = db
    .prepare(
      `
        SELECT category, score, created_at AS createdAt
        FROM assessments
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `
    )
    .get(numericUserId);

  const dominantMoodRow = db
    .prepare(
      `
        SELECT emotion, COUNT(*) AS count
        FROM mood_logs
        WHERE user_id = ?
          AND DATE(logged_at) >= DATE('now', '-6 days')
        GROUP BY emotion
        ORDER BY count DESC, emotion ASC
        LIMIT 1
      `
    )
    .get(numericUserId);

  const assessmentCategory = latestAssessment?.category || null;
  const dominantMood = dominantMoodRow?.emotion || null;

  const assessmentSuggestions = assessmentCategory
    ? SUGGESTIONS_BY_ASSESSMENT[assessmentCategory] || []
    : [];

  const moodSuggestions = dominantMood ? SUGGESTIONS_BY_EMOTION[dominantMood] || [] : [];

  const suggestions = mergeUniqueSuggestions([
    assessmentSuggestions,
    moodSuggestions,
    BASE_SUGGESTIONS,
  ]).slice(0, 6);

  return res.json({
    userId: numericUserId,
    context: {
      latestAssessmentCategory: assessmentCategory,
      dominantMoodLast7Days: dominantMood,
    },
    suggestions,
    metadata: {
      totalSuggestions: suggestions.length,
      source: 'phase13-activity-engine',
    },
  });
}

module.exports = {
  getActivitySuggestions,
};
