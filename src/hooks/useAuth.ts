// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// hooks/useAuth.ts
export const useAuthCheck = () => {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't make any decisions until AuthContext is hydrated
    if (!hydrated) {
      setIsLoading(true);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || !user?.id) {
      console.log('Auth check failed - token:', !!token, 'user:', !!user?.id);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setIsLoading(false);
      navigate('/login');
      return;
    }
    
    console.log('Auth check passed');
    setIsAuthenticated(true);
    setIsLoading(false); // Move this to after all checks are done
  }, [user, navigate, hydrated]);

  return { isAuthenticated, isLoading };
};