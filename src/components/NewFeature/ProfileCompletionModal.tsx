// src/components/ProfileCompletionModal.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ProviderProfileFormData, Service, College } from '../../types/types';
const baseURL = import.meta.env.VITE_API_BASE_URL;

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onComplete: (profile: ProviderProfileFormData) => Promise<void>;
  onClose: () => void;
}



export default function ProfileCompletionModal({
  isOpen,
  onComplete,
  onClose,
}: ProfileCompletionModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

const [formData, setFormData] = useState<ProviderProfileFormData>({
  firstName: '',
  lastName: '',
  phoneNumber: '',
  collegeId: 0,
  services: [],
  latitude: null,
  longitude: null,
  address: '',
  bio: '',
  isProfileComplete: true,
  rating: 0,               // <-- Add missing field
  completedRequests: 0,    // <-- Add missing field
});


  // Fetch services and colleges on component mount
useEffect(() => {
  const fetchData = async () => {
    console.log('🚀 Starting data fetch process...');
    console.log('📍 Base URL:', baseURL);
    console.log('⏰ Fetch initiated at:', new Date().toISOString());
    
    try {
      setIsLoading(true);
      console.log('🔄 Loading state set to true');
      
      console.log('📡 Making parallel API calls...');
      console.log('🎯 Services endpoint:', `${baseURL}/api/services`);
      console.log('🏫 Colleges endpoint:', `${baseURL}/api/colleges`);
      
      const startTime = performance.now();
      
      const [servicesRes, collegesRes] = await Promise.all([
        axios.get<Service[]>(`${baseURL}/api/services`),
        axios.get<College[]>(`${baseURL}/api/colleges`),
      ]);

      const endTime = performance.now();
      console.log(`⚡ API calls completed in ${(endTime - startTime).toFixed(2)}ms`);

      // Log services response
      console.log('✅ Services API Response:');
      console.log('   Status:', servicesRes.status);
      console.log('   Status Text:', servicesRes.statusText);
      console.log('   Data type:', typeof servicesRes.data);
      console.log('   Data length:', Array.isArray(servicesRes.data) ? servicesRes.data.length : 'Not an array');
      console.log('   Raw services data:', servicesRes.data);
      
      if (Array.isArray(servicesRes.data) && servicesRes.data.length > 0) {
        console.log('   First service sample:', servicesRes.data[0]);
        console.log('   Service fields:', Object.keys(servicesRes.data[0]));
      }

      // Log colleges response
      console.log('✅ Colleges API Response:');
      console.log('   Status:', collegesRes.status);
      console.log('   Status Text:', collegesRes.statusText);
      console.log('   Data type:', typeof collegesRes.data);
      console.log('   Data length:', Array.isArray(collegesRes.data) ? collegesRes.data.length : 'Not an array');
      console.log('   Raw colleges data:', collegesRes.data);
      
      if (Array.isArray(collegesRes.data) && collegesRes.data.length > 0) {
        console.log('   First college sample:', collegesRes.data[0]);
        console.log('   College fields:', Object.keys(collegesRes.data[0]));
      }

      // Set state and log the updates
      console.log('📝 Updating component state...');
      setServices(servicesRes.data);
      setColleges(collegesRes.data);
      
      console.log('✅ State updated successfully');
      console.log('   Services in state:', servicesRes.data.length, 'items');
      console.log('   Colleges in state:', collegesRes.data.length, 'items');
      
    } catch (err) {
      console.error('❌ Error occurred during data fetch:');
      console.error('   Error type:', typeof err);
      console.error('   Error message:', err instanceof Error ? err.message : 'Unknown error');
      console.error('   Full error object:', err);
      
      // Log axios-specific error details if available
      if (axios.isAxiosError(err)) {
        console.error('🔍 Axios Error Details:');
        console.error('   Response status:', err.response?.status);
        console.error('   Response statusText:', err.response?.statusText);
        console.error('   Response data:', err.response?.data);
        console.error('   Request URL:', err.config?.url);
        console.error('   Request method:', err.config?.method);
        console.error('   Request headers:', err.config?.headers);
        
        if (err.code) {
          console.error('   Error code:', err.code);
        }
        
        if (err.response) {
          console.error('   Server responded with error');
        } else if (err.request) {
          console.error('   No response received from server');
          console.error('   Request details:', err.request);
        } else {
          console.error('   Error in request setup');
        }
      }
      
      setError('Failed to load required data. Please try again later.');
      console.error('💥 Error state set for user display');
      
    } finally {
      setIsLoading(false);
      console.log('🏁 Loading state set to false');
      console.log('🔚 Data fetch process completed at:', new Date().toISOString());
      console.log('==========================================');
    }
  };

  console.log('🎯 useEffect triggered - isOpen:', isOpen);
  
  if (isOpen) {
    console.log('✅ Modal is open, proceeding with data fetch');
    fetchData();
  } else {
    console.log('❌ Modal is closed, skipping data fetch');
  }
}, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceChange = (service: Service) => {
  setFormData(prev => {
    const serviceExists = prev.services.some(s => s.id === service.id);
    const newServices = serviceExists
      ? prev.services.filter(s => s.id !== service.id)
      : [...prev.services, service];
    
    return {
      ...prev,
      services: newServices,
    };
  });
};

  const handleLocationFetch = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsFetchingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Optional: Reverse geocode to get address
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
              lat: latitude,
              lon: longitude,
              format: 'json',
            },
          });

          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            address: response.data.display_name || '',
          }));
        } catch (err) {
          console.error('Error getting address:', err);
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (err) => {
        setLocationError('Unable to retrieve your location. Please enter it manually.');
        setIsFetchingLocation(false);
        console.error('Error getting location:', err);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.collegeId === 0) {
      setError('Please select a college');
      return;
    }

    if (formData.services.length === 0) {
      setError('Please select at least one service');
      return;
    }

    try {
      onComplete(formData);
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Error saving profile:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Complete Your Profile</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College *
                  </label>
                  <select
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    <option value="0">Select a college</option>
                    {colleges.map(college => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services Offered *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {services.map(service => (
  <div key={service.id} className="flex items-center">
    <input
      type="checkbox"
      id={`service-${service.id}`}
      checked={formData.services.some(s => s.id === service.id)}
      onChange={() => handleServiceChange(service)}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-gray-700">
      {service.name}
    </label>
  </div>
))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location Information
                </label>
                <div className="flex flex-col space-y-4">
                  <div>
                    <button
                      type="button"
                      onClick={handleLocationFetch}
                      disabled={isFetchingLocation}
                      className="flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      {isFetchingLocation ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Detecting...
                        </>
                      ) : (
                        <>
                          <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Use My Current Location
                        </>
                      )}
                    </button>
                    {locationError && (
                      <p className="mt-1 text-sm text-red-600">{locationError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (Tell clients about yourself)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}