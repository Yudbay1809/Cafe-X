import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
});

export const API_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000').replace(/\/api\/v1$/, '');


api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cafex_customer_token') : null;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
