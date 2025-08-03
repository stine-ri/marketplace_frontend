// src/components/ProfileCompletionModal.tsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ProviderProfileFormData, Service, College, PastWork } from '../../types/types';
import ProviderProfile from './ProviderProfile';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onComplete: (profile: ProviderProfileFormData) => Promise<void>;
  onClose: () => void;
  initialProfile?: ProviderProfileFormData;
}

export default function ProfileCompletionModal({
  isOpen,
  onComplete,
  onClose,
  initialProfile,
}: ProfileCompletionModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pastWorks, setPastWorks] = useState<PastWork[]>(initialProfile?.pastWorks || []);
const [newPastWork, setNewPastWork] = useState<{ description: string; image: File | null }>({
  description: '',
  image: null
});
const [pastWorkImagePreview, setPastWorkImagePreview] = useState<string | null>(null);
const pastWorkFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<ProviderProfileFormData>(initialProfile || {
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
    rating: 0,
    completedRequests: 0,
    profileImageUrl: '',
    pastWorks: [], 
  });
const [showPreview, setShowPreview] = useState(false);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
  setIsSuccess(false);

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
    let imageUrl = formData.profileImageUrl;
    
    try {
      // Upload image if new one was selected
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);
        const token = localStorage.getItem('token');
        const uploadResponse = await axios.post(`${baseURL}/api/provider/profile/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
             Authorization: `Bearer ${token}`,
          },
        });
        
        imageUrl = uploadResponse.data.url;
      }
    } catch (uploadError) {
      console.error('Image upload failed, continuing without image:', uploadError);
      // Continue with the existing image URL if upload fails
    }
       // Update form data with image URL
    const completeProfile = {
      ...formData,
      profileImageUrl: imageUrl,
      pastWorks: pastWorks
    };

    await onComplete(completeProfile);
    setIsSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 3000);
  } catch (err) {
    setError('Failed to save profile. Please try again.');
    console.error('Error saving profile:', err);
  }
};

  if (!isOpen) return null;

// Add these handler functions
const handlePastWorkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    setNewPastWork(prev => ({ ...prev, image: file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPastWorkImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

const handleAddPastWork = () => {
  if (!newPastWork.description || !newPastWork.image) {
    setError('Please add both an image and description for your past work');
    return;
  }

  // In a real implementation, you would upload the image first
  // For now, we'll just add it to the local state
  const newWork: PastWork = {
    imageUrl: pastWorkImagePreview || '',
    description: newPastWork.description
  };

  setPastWorks(prev => [...prev, newWork]);
  setNewPastWork({ description: '', image: null });
  setPastWorkImagePreview(null);
  if (pastWorkFileInputRef.current) {
    pastWorkFileInputRef.current.value = '';
  }
};

const handleRemovePastWork = (index: number) => {
  setPastWorks(prev => prev.filter((_, i) => i !== index));
};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {initialProfile ? 'Edit Your Profile' : 'Complete Your Profile'}
            </h2>
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
              {isSuccess && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                  Profile updated successfully!
                  <div className="mt-2 text-sm text-green-600">
                    Your changes have been saved.
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center">
                  <div className="mr-4">
                    {imagePreview || formData.profileImageUrl ? (
                      <img 
                        src={imagePreview || formData.profileImageUrl} 
                        alt="Profile preview" 
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      {imagePreview || formData.profileImageUrl ? 'Change Image' : 'Upload Image'}
                    </button>
                    <p className="mt-1 text-xs text-gray-500">
                      JPEG, PNG (Max 2MB)
                    </p>
                  </div>
                </div>
              </div>

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
<label className="block text-sm font-medium text-gray-700 mb-2">
    Past Works (Showcase your previous projects)
  </label>
  
  {/* Current past works */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
    {pastWorks.map((work, index) => (
      <div key={index} className="relative group">
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img 
            src={work.imageUrl} 
            alt={`Past work ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{work.description}</p>
        <button
          type="button"
          onClick={() => handleRemovePastWork(index)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    ))}
  </div>

  {/* Add new past work */}
  <div className="border border-dashed border-gray-300 rounded-lg p-4">
    <h3 className="text-sm font-medium text-gray-700 mb-2">Add New Past Work</h3>
    
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Image upload */}
      <div className="flex-1">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {pastWorkImagePreview ? (
            <img 
              src={pastWorkImagePreview} 
              alt="Past work preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={pastWorkFileInputRef}
          onChange={handlePastWorkImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => pastWorkFileInputRef.current?.click()}
          className="mt-2 w-full px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          {pastWorkImagePreview ? 'Change Image' : 'Upload Image'}
        </button>
      </div>
      
      {/* Description */}
      <div className="flex-1">
        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea
          value={newPastWork.description}
          onChange={(e) => setNewPastWork(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full p-2 border border-gray-300 rounded text-sm"
          placeholder="Describe this work (what you did, results, etc.)"
        />
        
        <button
          type="button"
          onClick={handleAddPastWork}
          disabled={!newPastWork.description || !newPastWork.image}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 text-sm"
        >
          Add to Portfolio
        </button>
      </div>
    </div>
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
    type="button"
    onClick={() => setShowPreview(true)}
    className="px-4 py-2 text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
  >
    Preview Profile
  </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Save Profile
                </button>
              </div>

{showPreview && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Profile Preview</h2>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <ProviderProfile 
          profile={{
            ...formData,
            profileImageUrl: imagePreview || formData.profileImageUrl || ''
          }} 
          colleges={colleges} 
          services={services} 
        />
        
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setShowPreview(false)}
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Back to Editing
          </button>
        </div>
      </div>
    </div>
  </div>
)}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}