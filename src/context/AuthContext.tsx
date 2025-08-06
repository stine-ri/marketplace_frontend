import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { AxiosError } from 'axios';
import { decodeToken } from '../utilis/token';

// Types
type Role = 'admin' | 'service_provider' | 'client';

export type UserType = {
  userId: number;
  email: string;
  role: Role;
  full_name?: string;
  contact_phone?: string;
  address?: string;
  collegeId?: number;
  latitude?: number;
  longitude?: number;
  services?: number[];
  providerId?: number;
  providerProfile?: ProviderProfile;
};

export interface ProviderProfile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  collegeId: number;
  latitude: number | null;
  longitude: number | null;
  address: string;
  bio: string;
  isProfileComplete: boolean;
  rating: number | null;
  completedRequests: number;
  createdAt: string;
  updatedAt: string;
  college: College | null;
  services: Service[];
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

// Context Type
interface AuthContextType {
  user: UserType | null;
  token: string | null;
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);

  // Helper: Validate token
const verifyToken = (): boolean => {
  const storedToken = localStorage.getItem('token');
  if (!storedToken) {
    logout(); // This clears storage and sets user to null
    navigate('/login'); // Force redirect
    return false;
  }

  const decoded = decodeToken(storedToken);
  if (!decoded || (decoded.exp && decoded.exp < Date.now() / 1000)) {
    logout();
    navigate('/login'); // Force redirect
    return false;
  }

  return true;
};

  // Load user from storage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && verifyToken()) {
      setUser(JSON.parse(storedUser));
    }
    setHydrated(true);
  }, []);

  // Login
const login = async (email: string, password: string): Promise<UserType> => {
  setLoading(true);
  setError(null);

  try {
    const response = await api.post('/api/login', { email, password });
    const { token, user } = response.data;

    let finalUser: UserType = {
      ...user,
      providerId: null,
      providerProfile: null,
    };

    if (user.role === 'service_provider') {
      const defaultProviderId = user.userId;

      try {
        const providerRes = await api.get('/api/provider/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        finalUser = {
          ...user,
          providerId: providerRes.data?.id ?? defaultProviderId,
          providerProfile: providerRes.data || null,
        };
      } catch (err) {
        console.error('Failed to fetch provider profile:', err);
        finalUser = {
          ...user,
          providerId: defaultProviderId,
          providerProfile: null,
        };
      }
    }

    setUser(finalUser);
    setToken(token);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(finalUser));
    return finalUser;
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

  // Register
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
        const { data } = await api.post('/api/register', {
            full_name: formData.full_name,
            email: formData.email,
            contact_phone: formData.contact_phone,
            address: formData.address,
            role: formData.role,
            password: formData.password,
            confirmPassword: formData.password // Add this line
        });
        
        if (!data.token || !data.user) {
            throw new Error('Registration response incomplete');
        }

        const userData: UserType = {
            ...data.user,
            providerId: data.user.providerId || null,
            providerProfile: null
        };

        setUser(userData);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        return userData;
    } catch (err) {
        let errorMessage = 'Registration failed';
        
        if (err instanceof AxiosError) {
            errorMessage = err.response?.data?.error || 
                         err.response?.data?.message || 
                         'Registration failed';
            
            // Log detailed error for debugging
            console.error('Registration error details:', {
                status: err.response?.status,
                data: err.response?.data,
                headers: err.response?.headers
            });
        }

        setError(errorMessage);
        throw new Error(errorMessage);
    } finally {
        setLoading(false);
    }
};

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth(): AuthContextType & { isPublic: boolean } {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
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
