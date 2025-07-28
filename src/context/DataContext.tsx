// src/context/DataContext.tsx
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import axios from 'axios';
import { Service, College } from '../types/types';
const baseURL = import.meta.env.VITE_API_BASE_URL;

// Define a reusable no-op async function to satisfy ESLint
const asyncNoop = () => Promise.resolve();


type DataContextType = {
  services: Service[];
  colleges: College[];
  loading: boolean;
  error: string | null;
  refreshServices: () => Promise<void>;
  refreshColleges: () => Promise<void>;
};

const DataContext = createContext<DataContextType>({
  services: [],
  colleges: [],
  loading: true,
  error: null,
  refreshServices: asyncNoop,
  refreshColleges: asyncNoop
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const res = await axios.get<Service[]>(`${baseURL}/api/services`);
      setServices(res.data);
    } catch (err) {
      setError('Failed to load services');
      console.error(err);
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await axios.get<College[]>(`${baseURL}/api/colleges`);
      setColleges(res.data);
    } catch (err) {
      setError('Failed to load colleges');
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchServices(), fetchColleges()]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  return (
    <DataContext.Provider value={{ 
      services, 
      colleges, 
      loading, 
      error,
      refreshServices: fetchServices,
      refreshColleges: fetchColleges
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
