// src/pages/ProviderPublicProfile.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProviderProfile from '../components/NewFeature/ProviderProfile';
import { ProviderProfileFormData, Service, College } from '../types/types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function ProviderPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProviderProfileFormData | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 useEffect(() => {
  const isValidId = /^\d+$/.test(id ?? '');
  if (!isValidId) {
    setError('Invalid provider ID');
    setLoading(false);
    return;
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, servicesRes, collegesRes] = await Promise.all([
        axios.get(`${baseURL}/api/provider/profiles/public/${id}`),
        axios.get(`${baseURL}/api/services`),
        axios.get(`${baseURL}/api/colleges`)
      ]);

      if (profileRes.data?.id?.toString() !== id) {
        throw new Error('Profile ID mismatch');
      }

      setProfile(profileRes.data);
      setServices(servicesRes.data);
      setColleges(collegesRes.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
      navigate('/providers', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id, user?.providerId, navigate]);


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
      
      {/* Contact Button - Only show if not viewing own profile */}
      {user?.providerId?.toString() !== id && (
        <div className="mt-8 flex justify-center">
          <button 
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => {
              if (profile.phoneNumber) {
                window.location.href = `tel:${profile.phoneNumber}`;
              }
            }}
            disabled={!profile.phoneNumber}
          >
            {profile.phoneNumber ? 'Contact Provider' : 'No contact number available'}
          </button>
        </div>
      )}
    </div>
  );
}