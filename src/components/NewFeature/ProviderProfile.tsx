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
  isOwnProfile: boolean; 
}

const EnhancedProviderProfile: React.FC<EnhancedProviderProfileProps> = ({
  profile,
  colleges,
  services,
  onProfileUpdate,
  onImageUpload,
  isOpen,
  onClose,
  isOwnProfile,
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

  // In EnhancedProviderProfile component, update the service toggle function
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
      // Add service with default price or existing price if available
      const existingService = profile.services.find(s => s.id === serviceId);
      return {
        ...prev,
        services: [...prev.services, {
          ...service,
          price: existingService?.price || service.price || 0
        }]
      };
    }
  });
};

// Add a function to update service price
const updateServicePrice = (serviceId: number, price: string) => {
  setEditedProfile(prev => ({
    ...prev,
    services: prev.services.map(service => 
      service.id === serviceId 
        ? { ...service, price: parseFloat(price) || 0 }
        : service
    )
  }));
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

const formatPrice = (price: string | number | null | undefined): string => {
  if (price === undefined || price === null) return 'Price not set';

  // Convert to number safely
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice)) return 'Price not set';

  return `KSh ${numericPrice.toLocaleString()}`;
};


  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/5 backdrop-blur-[2px] overflow-y-auto h-full w-full z-50">
        <div className="min-h-screen flex items-center justify-center p-2 sm:p-4">
          <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.08)] border border-white/50 w-full max-w-7xl max-h-[95vh] overflow-hidden">
            {/* Header */}
<div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100/80 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 z-10">
  <div className="flex-1 min-w-0">
    <h2 className="text-xl sm:text-2xl font-light text-slate-800 truncate">
      {isEditing ? 'Edit Profile' : 'Provider Profile'}
    </h2>
    <p className="text-sm text-slate-500 mt-1 truncate">
      {isEditing ? 'Update your profile information' : 'View your complete profile'}
    </p>
  </div>
  
  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
    {!isEditing && isOwnProfile && (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm text-sm font-medium"
      >
        <PencilIcon className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Edit Profile</span>
        <span className="sm:hidden">Edit</span>
      </button>
    )}
    <button
      onClick={onClose}
      className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200"
    >
      <XMarkIcon className="h-5 w-5" />
    </button>
  </div>
</div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(95vh-80px)] px-4 sm:px-6 py-6">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
                {/* Left Sidebar - Profile Overview */}
                <div className="xl:col-span-1">
                  <div className="bg-slate-50/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-100/80 sticky top-0">
                    {/* Profile Image */}
                    <div className="text-center mb-6">
                      <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4">
                        {(imagePreview || editedProfile.profileImageUrl) ? (
                          <img
                            src={imagePreview || editedProfile.profileImageUrl}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover border-3 border-white shadow-lg"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/default-avatar.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-slate-200 border-3 border-white shadow-lg flex items-center justify-center">
                            <span className="text-xl sm:text-3xl font-light text-slate-600">
                              {editedProfile.firstName?.charAt(0)}{editedProfile.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        {isEditing && (
                          <label className="absolute bottom-1 right-1 bg-white rounded-full p-2 cursor-pointer hover:bg-slate-50 shadow-md border border-slate-200 transition-colors">
                            <CameraIcon className="h-4 w-4 text-slate-600" />
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

                      <h3 className="text-lg sm:text-xl font-medium text-slate-800">
                        {editedProfile.firstName} {editedProfile.lastName}
                      </h3>
                      {editedProfile.college && (
                        <p className="text-sm text-slate-500 mt-1">{editedProfile.college.name}</p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/80 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-slate-100">
                        <div className="text-xl sm:text-2xl font-light text-slate-700">
                          {editedProfile.completedRequests || 0}
                        </div>
                        <div className="text-xs text-slate-500">Completed</div>
                      </div>
                      <div className="bg-white/80 rounded-xl p-3 sm:p-4 text-center shadow-sm border border-slate-100">
                        <div className="text-xl sm:text-2xl font-light text-slate-700 flex items-center justify-center">
                          {editedProfile.rating ? (
                            <>
                              <StarIcon className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                              {editedProfile.rating.toFixed(1)}
                            </>
                          ) : (
                            'New'
                          )}
                        </div>
                        <div className="text-xs text-slate-500">Rating</div>
                      </div>
                    </div>

                    {/* Services Summary */}
                    <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-slate-100">
                      <h4 className="font-medium text-slate-800 mb-2 text-sm">Services</h4>
                      <div className="text-sm text-slate-600">
                        {editedProfile.services.length} service{editedProfile.services.length !== 1 ? 's' : ''} offered
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="xl:col-span-3 space-y-6 lg:space-y-8">
                  {/* Basic Information */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-4 sm:p-6 shadow-sm">
                    <h4 className="text-lg font-medium text-slate-800 mb-6">Basic Information</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">First Name *</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400"
                            required
                          />
                        ) : (
                          <p className="px-4 py-3 bg-slate-50/50 rounded-xl text-slate-800 border border-slate-100">{editedProfile.firstName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Last Name *</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedProfile.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400"
                            required
                          />
                        ) : (
                          <p className="px-4 py-3 bg-slate-50/50 rounded-xl text-slate-800 border border-slate-100">{editedProfile.lastName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Phone Number</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editedProfile.phoneNumber || ''}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400"
                            placeholder="+254700000000"
                          />
                        ) : (
                          <p className="px-4 py-3 bg-slate-50/50 rounded-xl text-slate-800 border border-slate-100">{editedProfile.phoneNumber || 'Not provided'}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">College</label>
                        {isEditing ? (
                          <select
                            value={editedProfile.collegeId || ''}
                            onChange={(e) => {
                              const collegeId = e.target.value ? parseInt(e.target.value) : undefined;
                              const college = colleges.find(c => c.id === collegeId);
                              handleInputChange('collegeId', collegeId);
                              handleInputChange('college', college);
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                          >
                            <option value="">Select a college</option>
                            {colleges.map(college => (
                              <option key={college.id} value={college.id}>
                                {college.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="px-4 py-3 bg-slate-50/50 rounded-xl text-slate-800 border border-slate-100">
                            {editedProfile.college?.name || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-4 sm:p-6 shadow-sm">
                    <h4 className="text-lg font-medium text-slate-800 mb-6">Services Offered *</h4>
                    
{isEditing ? (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
    {services.map(service => {
      const isSelected = editedProfile.services.some(s => s.id === service.id);
      const selectedService = editedProfile.services.find(s => s.id === service.id);
      
      return (
        <label key={service.id} className={`group flex flex-col p-4 border-2 rounded-xl transition-all ${
          isSelected 
            ? 'bg-blue-50/80 border-blue-200/50' 
            : 'border-slate-100 hover:bg-slate-50/30 hover:border-slate-200'
        }`}>
          <div className="flex items-start space-x-3 mb-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleServiceToggle(service.id)}
              className="mt-1 h-4 w-4 text-blue-500 border-slate-300 rounded focus:ring-blue-500/20 focus:ring-2"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800 group-hover:text-blue-800 text-sm">
                {service.name}
              </div>
              {service.description && (
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {service.description}
                </div>
              )}
            </div>
          </div>
          
          {isSelected && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <label className="text-xs font-medium text-slate-700 mb-2 block">
                Set Your Price (KSh)
              </label>
              <input
                type="number"
                value={selectedService?.price || ''}
                onChange={(e) => updateServicePrice(service.id, e.target.value)}
                placeholder="Enter price"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 bg-white/70"
                min="0"
                step="50"
              />
            </div>
          )}
        </label>
      );
    })}
  </div>
) : (


                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                        {editedProfile.services.map(service => (
                          <div key={service.id} className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                            <div className="font-medium text-slate-800 text-sm">{service.name}</div>
                            {service.description && (
                              <div className="text-xs text-slate-600 mt-1 line-clamp-2">{service.description}</div>
                            )}
                            {service.price && (
                              <div className="text-xs text-blue-600 mt-2 font-medium">
                                {formatPrice(service.price)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-4 sm:p-6 shadow-sm">
                    <h4 className="text-lg font-medium text-slate-800 mb-6">Location Information</h4>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Address</label>
                        {isEditing ? (
                          <textarea
                            value={editedProfile.address || ''}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 resize-none"
                            placeholder="Enter your full address"
                          />
                        ) : (
                          <p className="px-4 py-3 bg-slate-50/50 rounded-xl text-slate-800 border border-slate-100 min-h-[80px] whitespace-pre-line">{editedProfile.address || 'Not provided'}</p>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100/50 gap-4">
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-800 text-sm">Use Current Location</p>
                              <p className="text-xs text-slate-600">Get your GPS coordinates automatically</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleGetLocation}
                            disabled={locationLoading}
                            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm font-medium flex-shrink-0"
                          >
                            {locationLoading ? 'Getting...' : 'Get Location'}
                          </button>
                        </div>
                      )}

                      {editedProfile.latitude && editedProfile.longitude && (
                        <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50">
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Location Set</span>
                          </div>
                          <p className="text-xs text-green-700 mt-1 font-mono">
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
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-4 sm:p-6 shadow-sm">
                    <h4 className="text-lg font-medium text-slate-800 mb-6">About Me</h4>
                    
                    {isEditing ? (
                      <textarea
                        value={editedProfile.bio || ''}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all placeholder:text-slate-400 resize-none"
                        placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                      />
                    ) : (
                      <div className="px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 min-h-[120px]">
                        <p className="text-slate-800 whitespace-pre-line leading-relaxed text-sm">
                          {editedProfile.bio || 'No bio provided'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Portfolio/Past Works */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                      <div>
                        <h4 className="text-lg font-medium text-slate-800">Portfolio</h4>
                        <p className="text-sm text-slate-500 mt-1">Showcase your best work</p>
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={addPastWork}
                          className="inline-flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm text-sm font-medium"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Work
                        </button>
                      )}
                    </div>

                    {editedProfile.pastWorks && editedProfile.pastWorks.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                        {editedProfile.pastWorks.map((work, index) => (
                          <div 
                            key={index} 
                            className={`group relative bg-slate-50/70 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 ${
                              work.shouldDelete ? 'opacity-50 grayscale' : ''
                            }`}
                          >
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removePastWork(index)}
                                className={`absolute top-2 right-2 z-20 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-md border ${
                                  work.shouldDelete 
                                    ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200' 
                                    : 'bg-white text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300'
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
                              <div className="absolute inset-0 bg-red-50/80 backdrop-blur-sm flex items-center justify-center z-10">
                                <div className="text-center p-4">
                                  <TrashIcon className="h-6 w-6 text-red-400 mx-auto mb-2" />
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
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline font-medium"
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
                                      className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-all backdrop-blur-[1px]"
                                    >
                                      <EyeIcon className="h-6 w-6 text-white drop-shadow-lg" />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                  <PhotoIcon className="h-8 w-8 text-slate-400" />
                                </div>
                              )}
                              
                              {uploadingIndex === index && (
                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto"></div>
                                    <p className="text-xs text-slate-600 mt-2">Uploading...</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="p-4">
                              {isEditing ? (
                                <div className="space-y-3">
                                  <label className="block">
                                    <span className="text-xs font-medium text-slate-700">Upload Image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handlePastWorkImageUpload(e, index)}
                                      className="mt-1 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 file:border file:border-slate-200"
                                      disabled={uploadingIndex === index}
                                    />
                                  </label>
                                  
                                  <textarea
                                    value={work.description}
                                    onChange={(e) => updatePastWork(index, 'description', e.target.value)}
                                    placeholder="Describe this work..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 bg-white/50 placeholder:text-slate-400 resize-none"
                                  />
                                </div>
                              ) : (
                                <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                                  {work.description || 'No description provided'}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <PhotoIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h5 className="text-base font-medium text-slate-800 mb-2">No portfolio items yet</h5>
                        <p className="text-slate-500 mb-6 text-sm">
                          {isEditing ? 'Add some examples of your work to showcase your skills' : 'Portfolio items will appear here once added'}
                        </p>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={addPastWork}
                            className="inline-flex items-center px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm font-medium"
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Add Your First Work
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-6 py-3 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center transition-all shadow-sm font-medium"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-2" />
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
              <img
                src={selectedImage}
                alt="Portfolio item"
                className="w-full h-full object-contain rounded-xl shadow-2xl max-h-[80vh]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnhancedProviderProfile;