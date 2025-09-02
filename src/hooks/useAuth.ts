// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useAuthCheck = () => {
  const { user, hydrated } = useAuth(); // Use the hydrated flag
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Don't make any decisions until AuthContext is hydrated
    if (!hydrated) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || !user?.id) {
      console.log('Auth check failed - token:', !!token, 'user:', !!user?.userId);
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    
    console.log('Auth check passed');
    setIsAuthenticated(true);
  }, [user, navigate, hydrated]); // Add hydrated to dependencies

  return isAuthenticated;
};