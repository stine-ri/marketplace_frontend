// src/api/api.ts
import axios from 'axios';
import { isTokenExpired } from '../utilis/token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com',
});
// Add to your API service
// In your api.ts file
export const acceptInterest = async (interestId: number) => {
  const response = await api.post(`/api/interests/${interestId}/accept`);
  return response;
};

export const rejectInterest = (interestId: number) => {
  return api.post(`/api/interests/${interestId}/reject`);
};

export const getRequestInterests = (requestId: number) => {
  return api.get(`/api/interests/request/${requestId}`);
};

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
