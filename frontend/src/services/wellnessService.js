import { apiClient } from './apiClient';

export async function fetchBreathingPattern() {
  const { data } = await apiClient.get('/breathing/pattern');
  return data;
}

export async function fetchWordleWord() {
  const { data } = await apiClient.get('/games/wordle/word');
  return data;
}

export async function submitAssessment({ userId, answers }) {
  const { data } = await apiClient.post('/assessment/submit', { userId, answers });
  return data;
}

export async function fetchRecommendations(userId) {
  const { data } = await apiClient.get(`/assessment/recommendations/${userId}`);
  return data;
}

export async function saveJournalSettings(payload) {
  const { data } = await apiClient.post('/journal/settings', payload);
  return data;
}

export async function saveJournalEntry(payload) {
  const { data } = await apiClient.post('/journal/entry', payload);
  return data;
}

export async function fetchJournalEntries(userId, journalPassword) {
  const { data } = await apiClient.get(`/journal/entries/${userId}`, {
    params: { journalPassword },
  });
  return data;
}

export async function awardAction(payload) {
  const { data } = await apiClient.post('/rewards/action', payload);
  return data;
}

export async function awardActivityCompletion(payload) {
  const { data } = await apiClient.post('/rewards/activity-complete', payload);
  return data;
}

export async function fetchRewards(userId) {
  const { data } = await apiClient.get(`/rewards/users/${userId}`);
  return data;
}

export async function fetchLeaderboard(limit = 10) {
  const { data } = await apiClient.get('/rewards/leaderboard', { params: { limit } });
  return data;
}

export async function fetchMoodWeekly(userId) {
  const { data } = await apiClient.get(`/mood/weekly/${userId}`);
  return data;
}

export async function fetchActivitySuggestions(userId) {
  const { data } = await apiClient.get(`/activities/suggestions/${userId}`);
  return data;
}
