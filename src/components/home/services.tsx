// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;