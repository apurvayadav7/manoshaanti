import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('manoshaanti_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  if (error?.code === 'ECONNABORTED' || error?.message === 'Network Error' || !error?.response) {
    return 'Cannot reach backend API. Start backend on http://localhost:5000 and try again.';
  }
  return error?.response?.data?.error || error?.response?.data?.detail || fallback;
}
