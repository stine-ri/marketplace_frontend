// src/api/api.ts
import axios from 'axios';
import { isTokenExpired } from '../utilis/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

// REQUEST interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');

  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return config; // or throw an error if you want to cancel the request
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
