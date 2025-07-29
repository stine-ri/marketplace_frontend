// src/pages/ProviderPublicProfile.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProviderProfile from '../components/NewFeature/ProviderProfile';
import { ProviderProfileFormData, Service, College } from '../types/types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function ProviderPublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState<ProviderProfileFormData | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, servicesRes, collegesRes] = await Promise.all([
          axios.get(`${baseURL}/api/provider/profiles/${id}`),
          axios.get(`${baseURL}/api/services`),
          axios.get(`${baseURL}/api/colleges`)
        ]);
        
        setProfile(profileRes.data);
        setServices(servicesRes.data);
        setColleges(collegesRes.data);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-8 text-gray-500">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ProviderProfile 
        profile={profile} 
        colleges={colleges} 
        services={services} 
      />
      
      {/* Contact Button */}
      <div className="mt-8 flex justify-center">
        <button 
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          onClick={() => {
            // Implement contact functionality
            window.location.href = `tel:${profile.phoneNumber}`;
          }}
        >
          Contact Provider
        </button>
      </div>
    </div>
  );
}