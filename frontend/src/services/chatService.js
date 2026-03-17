import { apiClient } from './apiClient';

export async function sendChatMessage({ message, userId }) {
  const payload = userId ? { message, userId } : { message };
  const { data } = await apiClient.post('/chat', payload);
  return data;
}

export async function submitEmotion({ emotion, userId }) {
  const payload = userId ? { emotion, userId } : { emotion };
  const { data } = await apiClient.post('/emotion', payload);
  return data;
}

export async function recognizeAsl({ frameBase64 }) {
  const { data } = await apiClient.post('/asl/recognize', { frameBase64 });
  return data;
}
