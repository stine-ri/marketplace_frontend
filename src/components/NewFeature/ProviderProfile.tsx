import React, { useState, useEffect, useCallback } from 'react';
import { 
  PencilIcon, 
  XMarkIcon, 
  CheckIcon, 
  CameraIcon, 
  TrashIcon, 
  PlusIcon, 
  MapPinIcon, 
  StarIcon,
  EyeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import type { ProviderProfileFormData, College, Service, PastWork } from '../../types/types';

interface EnhancedProviderProfileProps {
  profile: ProviderProfileFormData;
  colleges: College[];
  services: Service[];
  onProfileUpdate: (updatedProfile: ProviderProfileFormData) => Promise<void>;
  onImageUpload?: (file: File) => Promise<string>;
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedProviderProfile: React.FC<EnhancedProviderProfileProps> = ({
  profile,
  colleges,
  services,
  onProfileUpdate,
  onImageUpload,
  isOpen,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProviderProfileFormData>({
  ...profile,
  pastWorks: profile.pastWorks?.map(work => ({ ...work })) || []
});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Update edited profile when profile prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditedProfile(profile);
      setImagePreview(null);
    }
  }, [profile, isEditing]);

  useEffect(() => {
    if (isOpen && !isEditing) {
      setEditedProfile(profile);
      setImagePreview(null);
    }
  }, [isOpen, profile]);

  const handleInputChange = (field: keyof ProviderProfileFormData, value: any) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setEditedProfile(prev => {
      const isSelected = prev.services.some(s => s.id === serviceId);
      
      if (isSelected) {
        return {
          ...prev,
          services: prev.services.filter(s => s.id !== serviceId)
        };
      } else {
        return {
          ...prev,
          services: [...prev.services, service]
        };
      }
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onImageUpload) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP)');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      setIsLoading(true);
      const imageUrl = await onImageUpload(file);
      
      // Update both the preview and the profile
      setImagePreview(imageUrl);
      setEditedProfile(prev => ({
        ...prev,
        profileImageUrl: imageUrl
      }));
      
      toast.success('Profile image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setEditedProfile(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setLocationLoading(false);
        toast.success('Location updated successfully');
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        toast.error(errorMessage);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

const addPastWork = () => {
  setEditedProfile(prev => ({
    ...prev,
    pastWorks: [...(prev.pastWorks || []), { 
      imageUrl: '', 
      description: '',
      shouldDelete: false 
    }]
  }));
};

  const removePastWork = (index: number) => {
  setEditedProfile(prev => {
    const updatedPastWorks = [...(prev.pastWorks || [])];
    const workToRemove = updatedPastWorks[index];
    
    if (workToRemove.id) {
      // Mark existing work for deletion
      updatedPastWorks[index] = {
        ...workToRemove,
        shouldDelete: true
      };
    } else {
      // Remove new work that hasn't been saved yet
      updatedPastWorks.splice(index, 1);
    }
    
    return {
      ...prev,
      pastWorks: updatedPastWorks
    };
  });
};


const handlePastWorkImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
  const file = event.target.files?.[0];
  if (!file || !onImageUpload) return;

  try {
    setUploadingIndex(index);
    const imageUrl = await onImageUpload(file);
    
    // ✅ Add validation
    if (!imageUrl) {
      throw new Error('No image URL returned from upload');
    }
    
    setEditedProfile(prev => {
      const updatedPastWorks = [...(prev.pastWorks || [])];
      if (index >= 0 && index < updatedPastWorks.length) {
        updatedPastWorks[index] = {
          ...updatedPastWorks[index],
          imageUrl: imageUrl
        };
      }
      return {
        ...prev,
        pastWorks: updatedPastWorks
      };
    });
    
    toast.success('Portfolio image uploaded successfully');
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image: ' + (error as Error).message);
  } finally {
    setUploadingIndex(null);
  }
};

  const updatePastWork = (index: number, field: keyof PastWork, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      pastWorks: prev.pastWorks?.map((work, i) => 
        i === index ? { ...work, [field]: value } : work
      ) || []
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!editedProfile.firstName.trim() || !editedProfile.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    if (editedProfile.phoneNumber && !/^(\+254|0)[17]\d{8}$/.test(editedProfile.phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number');
      return;
    }

    if (editedProfile.services.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    try {
    setIsLoading(true);
    
    // Prepare past works data - only include if modified
    let pastWorksToSend: PastWork[] | undefined = undefined;
    if (editedProfile.pastWorks) {
      const hasModifications = editedProfile.pastWorks.some(work => 
        !work.id || // New work
        work.shouldDelete || // Marked for deletion
        work.description !== profile.pastWorks?.find(pw => pw.id === work.id)?.description ||
        work.imageUrl !== profile.pastWorks?.find(pw => pw.id === work.id)?.imageUrl
      );
      
      if (hasModifications) {
        // Filter out works marked for deletion (they'll be handled by backend)
        pastWorksToSend = editedProfile.pastWorks.filter(work => !work.shouldDelete);
      }
    }
    
    // Create the profile object without the pastWorks property if it's undefined
    const profileToSave: ProviderProfileFormData = {
      ...editedProfile,
      isProfileComplete: true,
    };
    
    // Only add pastWorks if we have modifications
    if (pastWorksToSend !== undefined) {
      (profileToSave as any).pastWorks = pastWorksToSend;
    }
    
    await onProfileUpdate(profileToSave);
    setImagePreview(null);
    setIsEditing(false);
    
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile');
  } finally {
    setIsLoading(false);
  }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setImagePreview(null);
    setIsEditing(false);
  };

  const formatPrice = (price: number | undefined): string => {
    if (!price) return 'Price not set';
    return `KSh ${price.toLocaleString()}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditing ? 'Edit Profile' : 'Provider Profile'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isEditing ? 'Update your profile information' : 'View your complete profile'}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-80px)] px-6 py-6">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Left Sidebar - Profile Overview */}
                <div className="xl:col-span-1">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 sticky top-0">
                    {/* Profile Image */}
                    <div className="text-center mb-6">
                      <div className="relative w-32 h-32 mx-auto mb-4">
                        {(imagePreview || editedProfile.profileImageUrl) ? (
                          <img
                            src={imagePreview || editedProfile.profileImageUrl}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/default-avatar.png';
                            }}
                          />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-4 border-white shadow-lg flex items-center justify-center">
                            <span className="text-3xl font-bold text-white">
                              {editedProfile.firstName?.charAt(0)}{editedProfile.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        {isEditing && (
                          <label className="absolute bottom-2 right-2 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 shadow-lg transition-colors">
                            <CameraIcon className="h-5 w-5 text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={isLoading}
                            />
                          </label>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900">
                        {editedProfile.firstName} {editedProfile.lastName}
                      </h3>
                      {editedProfile.college && (
                        <p className="text-sm text-gray-600 mt-1">{editedProfile.college.name}</p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-blue-600">
                          {editedProfile.completedRequests || 0}
                        </div>
                        <div className="text-xs text-gray-500">Completed</div>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center">
                          {editedProfile.rating ? (
                            <>
                              <StarIcon className="h-5 w-5 fill-current mr-1" />
                              {editedProfile.rating.toFixed(1)}
                            </>
                          ) : (
                            'New'
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>

                    {/* Services Summary */}
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                      <div className="text-sm text-gray-600">
                        {editedProfile.services.length} service{editedProfile.services.length !== 1 ? 's' : ''} offered
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="xl:col-span-3 space-y-8">
                  {/* Basic Information */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">First Name *</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{editedProfile.firstName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Last Name *</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            required
                          />
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{editedProfile.lastName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editedProfile.phoneNumber || ''}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="+254700000000"
                          />
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{editedProfile.phoneNumber || 'Not provided'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">College</label>
                        {isEditing ? (
                          <select
                            value={editedProfile.collegeId || ''}
                            onChange={(e) => {
                              const collegeId = e.target.value ? parseInt(e.target.value) : undefined;
                              const college = colleges.find(c => c.id === collegeId);
                              handleInputChange('collegeId', collegeId);
                              handleInputChange('college', college);
                            }}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          >
                            <option value="">Select a college</option>
                            {colleges.map(college => (
                              <option key={college.id} value={college.id}>
                                {college.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                            {editedProfile.college?.name || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Services Offered *</h4>
                    
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {services.map(service => (
                          <label key={service.id} className="group flex items-start space-x-3 p-4 border-2 rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all">
                            <input
                              type="checkbox"
                              checked={editedProfile.services.some(s => s.id === service.id)}
                              onChange={() => handleServiceToggle(service.id)}
                              className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 group-hover:text-blue-900">
                                {service.name}
                              </div>
                              {service.description && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {service.description}
                                </div>
                              )}
                              {service.price && (
                                <div className="text-sm text-blue-600 mt-1 font-medium">
                                  {formatPrice(service.price)}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {editedProfile.services.map(service => (
                          <div key={service.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                            <div className="font-medium text-gray-900">{service.name}</div>
                            {service.description && (
                              <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                            )}
                            {service.price && (
                              <div className="text-sm text-blue-600 mt-2 font-medium">
                                {formatPrice(service.price)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">Location Information</h4>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        {isEditing ? (
                          <textarea
                            value={editedProfile.address || ''}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter your full address"
                          />
                        ) : (
                          <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{editedProfile.address || 'Not provided'}</p>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="h-6 w-6 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900">Use Current Location</p>
                              <p className="text-sm text-gray-600">Get your GPS coordinates automatically</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={locationLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {locationLoading ? 'Getting...' : 'Get Location'}
                          </button>
                        </div>
                      )}

                      {editedProfile.latitude && editedProfile.longitude && (
                        <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Location Set</span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            {editedProfile.latitude && editedProfile.longitude ? (
                              `${Number(editedProfile.latitude).toFixed(4)}, ${Number(editedProfile.longitude).toFixed(4)}`
                            ) : (
                              'Location not set'
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h4 className="text-lg font-semibold text-gray-900 mb-6">About Me</h4>
                    
                    {isEditing ? (
                      <textarea
                        value={editedProfile.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-900 whitespace-pre-line leading-relaxed">
                          {editedProfile.bio || 'No bio provided'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Portfolio/Past Works */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Portfolio</h4>
                        <p className="text-sm text-gray-500 mt-1">Showcase your best work</p>
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={addPastWork}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Work
                        </button>
                      )}
                    </div>

                    {editedProfile.pastWorks && editedProfile.pastWorks.length > 0 ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {editedProfile.pastWorks.map((work, index) => (
      // Add the conditional styling classes here
      <div 
        key={index} 
        className={`group relative bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
          work.shouldDelete ? 'opacity-50 grayscale' : ''
        }`}
      >
        {/* Rest of your portfolio item code */}
        {isEditing && (
          <button
            type="button"
            onClick={() => removePastWork(index)}
            className={`absolute top-3 right-3 z-20 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg ${
              work.shouldDelete 
                ? 'bg-gray-400 text-gray-200 hover:bg-gray-500' 
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
            title={work.shouldDelete ? 'Undo deletion' : 'Delete this work'}
          >
            {work.shouldDelete ? (
              <PlusIcon className="h-4 w-4 transform rotate-45" />
            ) : (
              <TrashIcon className="h-4 w-4" />
            )}
          </button>
        )}

        {work.shouldDelete && (
          <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center z-10">
            <div className="text-center p-4">
              <TrashIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-700 font-medium">Marked for deletion</p>
              <button
                type="button"
                onClick={() => {
                  setEditedProfile(prev => {
                    const updatedPastWorks = [...(prev.pastWorks || [])];
                    updatedPastWorks[index] = {
                      ...work,
                      shouldDelete: false
                    };
                    return { ...prev, pastWorks: updatedPastWorks };
                  });
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Undo
              </button>
            </div>
          </div>
        )}
                            
                            <div className="aspect-square relative">
                              
                              {work.imageUrl ? (
                                
                                <div className="relative h-full">
                                  <img
                                    src={work.imageUrl}
                                    alt={work.description || `Portfolio item ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/default-work.png';
                                    }}
                                  />
                                  {!isEditing && (
                                    <button
                                      onClick={() => setSelectedImage(work.imageUrl)}
                                      className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-all"
                                    >
                                      <EyeIcon className="h-8 w-8 text-white drop-shadow-lg" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <PhotoIcon className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                              
                              {uploadingIndex === index && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                  <div className="bg-white rounded-lg p-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <label className="block">
                                    <span className="text-sm font-medium text-gray-700">Upload Image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handlePastWorkImageUpload(e, index)}
                                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                      disabled={uploadingIndex === index}
                                    />
                                  </label>
                                  
                                  <textarea
                                    value={work.description}
                                    onChange={(e) => updatePastWork(index, 'description', e.target.value)}
                                    placeholder="Describe this work..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              ) : (
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {work.description || 'No description provided'}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <PhotoIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h5 className="text-lg font-medium text-gray-900 mb-2">No portfolio items yet</h5>
                        <p className="text-gray-500 mb-6">
                          {isEditing ? 'Add some examples of your work to showcase your skills' : 'Portfolio items will appear here once added'}
                        </p>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={addPastWork}
                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-sm"
                          >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Your First Work
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center transition-all shadow-md"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-5 w-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Portfolio item"
              className="w-full h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedProviderProfile;