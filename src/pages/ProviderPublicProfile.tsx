// Add this to your ProviderPublicProfile.tsx at the top of the component
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProviderProfile from '../components/NewFeature/ProviderProfile';
import ProvidersList from './ProviderList';
import { ProviderProfileFormData, Service, College } from '../types/types';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

export default function ProviderPublicProfile() {
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Enhanced debugging
  console.log('🌍 Current URL:', window.location.href);
  console.log('🗺️ Location pathname:', location.pathname);
  console.log('🔍 Raw useParams result:', params);
  console.log('🆔 Extracted ID:', params.id);
  console.log('🔢 ID type:', typeof params.id);
  console.log('🔢 ID value check:', params.id ? 'truthy' : 'falsy');
  console.log('🔢 Is ID numeric?', params.id ? !isNaN(Number(params.id)) : false);
  console.log('🔢 Number(id):', params.id ? Number(params.id) : 'N/A');

  const { id } = params;

  const [profile, setProfile] = useState<ProviderProfileFormData | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contactMethod, setContactMethod] = useState<'call' | 'message' | null>(null);

  useEffect(() => {
    console.log('🚀 useEffect triggered with ID:', id);
    console.log('🚀 Current pathname:', location.pathname);
    
    const fetchData = async () => {
      // Check for a valid numeric ID
      console.log('🔍 Validating ID...');
      
      if (!id) {
        console.error('❌ ID is missing/falsy:', id);
        console.error('❌ Current URL:', window.location.href);
        console.error('❌ Expected URL format: /provider/public/123');
        setError('Invalid or missing provider ID in URL.');
        setLoading(false);
        return;
      }
      
      if (isNaN(Number(id))) {
        console.error('❌ ID is not numeric:', id, 'Number conversion:', Number(id));
        setError('Invalid or missing provider ID in URL.');
        setLoading(false);
        return;
      }

      console.log('✅ ID validation passed:', id);

      try {
        setLoading(true);
        setError(null);
        
        const profileUrl = `${baseURL}/api/provider/public/${id}`;
        console.log('🌐 Making API call to:', profileUrl);

        const profilePromise = axios.get(profileUrl, { timeout: 5000 });
        const servicesPromise = axios.get(`${baseURL}/api/services`, { timeout: 5000 });
        const collegesPromise = axios.get(`${baseURL}/api/colleges`, { timeout: 5000 });

        console.log('⏳ Waiting for API responses...');
        const [profileRes, servicesRes, collegesRes] = await Promise.allSettled([
          profilePromise,
          servicesPromise,
          collegesPromise,
        ]);

        console.log('📊 API Results:');
        console.log('Profile status:', profileRes.status);
        console.log('Services status:', servicesRes.status);
        console.log('Colleges status:', collegesRes.status);

        if (profileRes.status === 'fulfilled') {
          console.log('✅ Profile data received:', profileRes.value.data);
          setProfile(profileRes.value.data?.data ?? null);
        } else {
          console.error('❌ Profile request failed:', profileRes.reason);
          setError('Failed to load provider profile.');
          return;
        }

        if (servicesRes.status === 'fulfilled') {
          console.log('✅ Services data received:', servicesRes.value.data);
          setServices(servicesRes.value.data);
        } else {
          console.warn('⚠️ Services request failed:', servicesRes.reason);
        }

        if (collegesRes.status === 'fulfilled') {
          console.log('✅ Colleges data received:', collegesRes.value.data);
          setColleges(collegesRes.value.data);
        } else {
          console.warn('⚠️ Colleges request failed:', collegesRes.reason);
        }
      } catch (err) {
        console.error('💥 Unexpected error in fetchData:', err);
        setError('Something went wrong while loading the profile.');
      } finally {
        console.log('🏁 fetchData completed, setting loading to false');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.pathname]);

  // Rest of your component code remains the same...
  const handleContact = (method: 'call' | 'message') => {
    console.log('📞 Contact method triggered:', method);
    
    if (!profile) {
      console.warn('⚠️ No profile data available for contact');
      return;
    }

    const { phoneNumber, firstName } = profile;
    console.log('📱 Phone number:', phoneNumber);
    console.log('👤 First name:', firstName);

    if (method === 'call' && phoneNumber) {
      if (confirm(`Call ${firstName} at ${phoneNumber}?`)) {
        console.log('📞 Initiating call to:', phoneNumber);
        window.location.href = `tel:${phoneNumber}`;
      }
    } else if (method === 'message' && phoneNumber) {
      if (confirm(`Message ${firstName} at ${phoneNumber}?`)) {
        console.log('💬 Initiating message to:', phoneNumber);
        window.location.href = `sms:${phoneNumber}`;
      }
    }
  };

  console.log('🎨 Rendering component - Loading:', loading, 'Error:', error, 'Profile:', profile ? 'exists' : 'null');

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (error) {
    console.log('❌ Rendering error state:', error);
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg shadow mb-8">
          <h3 className="font-bold">Error Loading Profile</h3>
          <p className="mt-1">{error}</p>
          <div className="mt-2 text-sm">
            <p><strong>Current URL:</strong> {window.location.href}</p>
            <p><strong>Expected format:</strong> /provider/public/[number]</p>
          </div>
        </div>
        <ProvidersList />
      </div>
    );
  }

  if (!profile) {
    console.log('❌ Rendering profile not found state');
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-xl font-medium text-gray-900">Profile Not Found</h3>
          <p className="mt-2 text-gray-600">The requested provider profile could not be found.</p>
          <button
            onClick={() => navigate('/providers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse All Providers
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.providerId?.toString() === id;
  console.log('👤 User provider ID:', user?.providerId);
  console.log('🔍 URL ID:', id);
  console.log('🤔 Is own profile?', isOwnProfile);

  console.log('✅ Rendering successful profile view');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <ProviderProfile profile={profile} colleges={colleges} services={services} />

        {!isOwnProfile && user?.role !== 'service_provider' && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact {profile.firstName}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.phoneNumber ? (
                <>
                  <button
                    onClick={() => handleContact('call')}
                    className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    📞 Call Now
                  </button>
                  <button
                    onClick={() => handleContact('message')}
                    className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    💬 Send Message
                  </button>
                </>
              ) : (
                <div className="col-span-full p-4 bg-yellow-50 text-yellow-800 rounded-lg">
                  <p>This provider has not shared contact information</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}