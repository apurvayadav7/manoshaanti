export const assessmentQuestions = [
  'In the last week, how often did you feel stressed or overwhelmed?',
  'How often did you feel anxious or worried without clear reason?',
  'How often did you feel low, sad, or hopeless?',
  'How difficult was it to regulate your emotions in daily situations?',
  'How often did your mood affect sleep, focus, or routine?',
];

export const answerOptions = [
  { label: 'Never', value: 0 },
  { label: 'Sometimes', value: 1 },
  { label: 'Often', value: 2 },
  { label: 'Almost Always', value: 3 },
];

export function classifyAssessment(score) {
  if (score <= 5) {
    return 'Mild Anxiety/Stress';
  }
  if (score <= 10) {
    return 'Moderate Mental Distress';
  }
  return 'Severe Depression Risk';
}

export function recommendationMap(category) {
  const map = {
    'Mild Anxiety/Stress': [
      '4-4-4 breathing exercise',
      'Calm music session',
      'A short mini-game reset',
    ],
    'Moderate Mental Distress': [
      'Guided journaling',
      '5-4-3-2-1 grounding technique',
      'Relaxation activity and routine reset',
    ],
    'Severe Depression Risk': [
      'Breathing and grounding now',
      'Talk with the ManoShaanti chatbot',
      'Reach immediate support resources and trusted contacts',
    ],
  };

  return map[category] || [];
}
