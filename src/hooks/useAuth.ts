// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useAuthCheck = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user?.userId) {
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [user, navigate]);

  return isAuthenticated;
};