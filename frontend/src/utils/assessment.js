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

export function recommendationMap(category, score = 0) {
  if (category === 'Mild Anxiety/Stress') {
    if (score <= 2) {
      return ['4-4-4 breathing exercise', 'Calm music session', 'Guided journaling'];
    }

    return ['A short mini-game reset', 'Guided journaling', 'Calm music session'];
  }

  if (category === 'Moderate Mental Distress') {
    if (score <= 7) {
      return ['5-4-3-2-1 grounding technique', 'Guided journaling', 'Calm music session'];
    }

    return ['5-4-3-2-1 grounding technique', '4-4-4 breathing exercise', 'Talk with Naina AI Chat'];
  }

  if (category === 'Severe Depression Risk') {
    if (score <= 12) {
      return ['Breathing and grounding now', 'Talk with Naina AI Chat', 'Reach immediate support resources and trusted contacts'];
    }

    return ['5-4-3-2-1 grounding technique', 'Talk with Naina AI Chat', 'Reach immediate support resources and trusted contacts'];
  }

  return [];
}
