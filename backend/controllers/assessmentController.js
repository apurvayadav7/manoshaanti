const { db } = require('../db/database');

const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    text: 'In the last week, how often did you feel stressed or overwhelmed?',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Sometimes', score: 1 },
      { label: 'Often', score: 2 },
      { label: 'Almost always', score: 3 },
    ],
  },
  {
    id: 2,
    text: 'How often did you feel anxious or worried without clear reason?',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Sometimes', score: 1 },
      { label: 'Often', score: 2 },
      { label: 'Almost always', score: 3 },
    ],
  },
  {
    id: 3,
    text: 'How often did you feel low, sad, or hopeless?',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Sometimes', score: 1 },
      { label: 'Often', score: 2 },
      { label: 'Almost always', score: 3 },
    ],
  },
  {
    id: 4,
    text: 'How difficult was it to control your emotions in daily situations?',
    options: [
      { label: 'Not difficult', score: 0 },
      { label: 'Slightly difficult', score: 1 },
      { label: 'Very difficult', score: 2 },
      { label: 'Extremely difficult', score: 3 },
    ],
  },
  {
    id: 5,
    text: 'How often did your mood affect your sleep, focus, or routine?',
    options: [
      { label: 'Never', score: 0 },
      { label: 'Sometimes', score: 1 },
      { label: 'Often', score: 2 },
      { label: 'Almost always', score: 3 },
    ],
  },
];

function getAssessmentCategory(score) {
  if (score <= 5) return 'Mild Anxiety/Stress';
  if (score <= 10) return 'Moderate Mental Distress';
  return 'Severe Depression Risk';
}

function getRecommendationsByCategory(category) {
  const recommendationMap = {
    'Mild Anxiety/Stress': [
      'Breathing exercise',
      'Sleep helper',
      'Calm music',
      'Mini games',
    ],
    'Moderate Mental Distress': [
      'Journaling',
      'Grounding exercises',
      'Mood tracking',
      'Relaxation activities',
    ],
    'Severe Depression Risk': [
      'Grounding techniques',
      'Emergency helpline',
      'Counselor support',
      'Guided breathing',
      'Chatbot conversation',
    ],
  };

  return recommendationMap[category] || [];
}

function submitAssessment(req, res) {
  const { userId, answers } = req.body;

  const numericUserId = Number(userId);
  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    return res.status(400).json({ error: 'userId must be a positive integer.' });
  }

  if (!Array.isArray(answers) || answers.length !== 5) {
    return res.status(400).json({ error: 'answers must be an array of exactly 5 values.' });
  }

  const normalizedAnswers = answers.map((value) => Number(value));
  const hasInvalidAnswer = normalizedAnswers.some(
    (value) => !Number.isInteger(value) || value < 0 || value > 3
  );

  if (hasInvalidAnswer) {
    return res.status(400).json({ error: 'Each answer score must be an integer between 0 and 3.' });
  }

  const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(numericUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const score = normalizedAnswers.reduce((total, value) => total + value, 0);
  const category = getAssessmentCategory(score);

  const insert = db
    .prepare('INSERT INTO assessments (user_id, score, category) VALUES (?, ?, ?)')
    .run(numericUserId, score, category);

  const savedAssessment = db
    .prepare(
      'SELECT id, user_id AS userId, score, category, created_at AS createdAt FROM assessments WHERE id = ?'
    )
    .get(insert.lastInsertRowid);

  return res.status(201).json({
    message: 'Assessment submitted successfully.',
    assessment: savedAssessment,
    interpretation: {
      score,
      category,
    },
  });
}

function getAssessmentRecommendations(req, res) {
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
        SELECT
          id,
          user_id AS userId,
          score,
          category,
          created_at AS createdAt
        FROM assessments
        WHERE user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `
    )
    .get(numericUserId);

  if (!latestAssessment) {
    return res.status(404).json({ error: 'No assessment found for this user yet.' });
  }

  const recommendations = getRecommendationsByCategory(latestAssessment.category);

  return res.json({
    userId: numericUserId,
    latestAssessment,
    recommendations,
  });
}

module.exports = {
  submitAssessment,
  ASSESSMENT_QUESTIONS,
  getAssessmentRecommendations,
};
