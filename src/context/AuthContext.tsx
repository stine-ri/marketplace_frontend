import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AxiosError } from 'axios';
import { decodeToken } from '../utilis/token';

type Role = 'admin' | 'service_provider' | 'client';

export type UserType = {
  userId: number;
  email: string;
  role: 'admin' | 'service_provider' | 'client';
  full_name?: string;
  contact_phone?: string;
  address?: string;
  collegeId?: number;
  latitude?: number;
  longitude?: number;
  services?: number[];
  providerId?: number; // ✅ Add this
  providerProfile?: ProviderProfile; // ✅ Optional if needed
};

export interface ProviderProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  collegeId: number;
  latitude: number | null;  // Change to null instead of undefined
  longitude: number | null; // Change to null instead of undefined
  address: string;
  bio: string;
  isProfileComplete: boolean;
  rating: number | null;
  completedRequests: number;
  createdAt: string;
  updatedAt: string;
  college: College | null;
  services: Service[];      // Array of Service objects
}
export type Service = {
  id: number;
  name: string;
  category?: string;
};

export type College = {
  id: number;
  name: string;
  location?: string;
};
interface AuthContextType {
  user: UserType | null;
  login: (email: string, password: string) => Promise<UserType>;
  register: (data: {
    full_name: string;
    email: string;
    contact_phone: string;
    address: string;
    role: Role;
    password: string;
  }) => Promise<UserType>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Add token verification helper
  // Update your verifyToken function to use decodeToken
const verifyToken = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const decoded = decodeToken(token);
  
  // Check if token is invalid or expired
  if (!decoded || (decoded.exp && decoded.exp < Date.now() / 1000)) {
    logout();
    return false;
  }
  
  return true;
};
   // Update your useEffect to verify token
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && verifyToken()) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<UserType> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/login', { email, password });
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // ✅ Store user
      return data.user;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: {
    full_name: string;
    email: string;
    contact_phone: string;
    address: string;
    role: Role;
    password: string;
  }): Promise<UserType> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/register', formData);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // ✅ Store user
      return data.user;
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Registration failed');
      } else {
        setError('Registration failed');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // ✅ Remove stored user
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}



export function useAuth(): AuthContextType & { isPublic: boolean } {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      login: async () => {
        throw new Error('Login not available in public mode');
      },
      register: async () => {
        throw new Error('Register not available in public mode');
      },
      logout: () => {
  // No-op in public mode
},

      loading: false,
      error: null,
      isPublic: true,
    };
  }

  return {
    ...context,
    isPublic: false,
  };
}

