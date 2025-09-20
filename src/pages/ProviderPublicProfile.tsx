// Enhanced ProviderPublicProfile.tsx - Eased restrictions for non-authenticated users
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ProviderProfile from '../components/NewFeature/ProviderProfile';
import ProvidersList from './ProviderList';
import { ProviderProfileFormData, Service, College, Review } from '../types/types';
import { 
  PhoneIcon, 
  ChatBubbleLeftRightIcon, 
  StarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  UserIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  EyeIcon,
  XMarkIcon,
  PencilIcon,
  ClockIcon,
  CheckBadgeIcon,
  TagIcon,
  PaperAirplaneIcon,
  LockClosedIcon 
} from '@heroicons/react/24/outline';
import DirectServiceRequest from '../components/NewFeature/ServiceRequests';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { PriceRange } from '../utilis/priceFormatter';
import { formatPrice } from '../utilis/priceFormatter';
import { useToast } from '../context/ToastContext';
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

// Rating Modal Component
const RatingModal = ({ 
  isOpen, 
  onClose, 
  providerName, 
  providerId,
  onSuccess 
}: {
  isOpen: boolean;
  onClose: () => void;
  providerName: string;
  providerId: number;
  onSuccess: (rating: { averageRating: number }) => void;
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      toast.warning("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const { token } = useAuth();
      
      const response = await axios.post(`${baseURL}/api/reviews`, {
        providerId,
        rating: selectedRating,
        comment: comment.trim() || undefined
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      onSuccess(response.data);
      onClose();
      setSelectedRating(0);
      setComment('');
    } catch (error) {
      console.error('Rating submission error:', error);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Rate {providerName}</h3>
        <p className="text-slate-600 text-sm mb-6">Share your experience with other users</p>
        
        <div className="text-center mb-6">
          <div className="flex justify-center space-x-1 mb-3">
            {Array(5).fill(0).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedRating(i + 1)}
                className="transition-colors hover:scale-110 transform"
              >
                {i < selectedRating ? (
                  <StarIconSolid className="h-8 w-8 text-amber-400" />
                ) : (
                  <StarIcon className="h-8 w-8 text-slate-300 hover:text-amber-300" />
                )}
              </button>
            ))}
          </div>
          {selectedRating > 0 && (
            <p className="text-sm text-slate-600">
              {selectedRating === 1 && "Poor"}
              {selectedRating === 2 && "Fair"}
              {selectedRating === 3 && "Good"}
              {selectedRating === 4 && "Very Good"}
              {selectedRating === 5 && "Excellent"}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about your experience..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-slate-500 mt-1">{comment.length}/500</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedRating === 0 || isSubmitting}
            className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
              selectedRating > 0 && !isSubmitting
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const formatPriceRange = (services: Service[] = []): PriceRange => {
  if (services.length === 0) {
    return {
      min: 'N/A',
      max: 'N/A',
      range: 'No services listed',
      hasVariation: false,
      validPrices: []
    };
  }

  const validPrices = services
    .map(service => {
      if (service.price === undefined || service.price === null) return null;

      if (typeof service.price === 'string') {
        return parseFloat(service.price.replace(/[KSh\s,]/g, ''));
      }

      if (typeof service.price === 'number') {
        return service.price;
      }

      return null;
    })
    .filter((price): price is number => price !== null && !isNaN(price) && price > 0)
    .sort((a, b) => a - b);

  if (validPrices.length === 0) {
    return {
      min: 'N/A',
      max: 'N/A',
      range: 'Prices on request',
      hasVariation: false,
      validPrices: []
    };
  }

  const min = Math.min(...validPrices);
  const max = Math.max(...validPrices);
  const hasVariation = min !== max;

  const formattedMin = formatPrice(min);
  const formattedMax = formatPrice(max);

  return {
    min: formattedMin,
    max: formattedMax,
    range: hasVariation ? `${formattedMin} - ${formattedMax}` : formattedMin,
    hasVariation,
    validPrices
  };
};

// Enhanced Rating Display Component
const RatingDisplay = ({ 
  rating,
  reviewCount = 0, 
  size = 'md',
  showCount = true,
  interactive = false,
  onRatingClick
}: {
  rating?: number | null;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  interactive?: boolean;
  onRatingClick?: (rating: number) => void;
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const currentRating = rating || 0;
  const hasRating = rating !== null && rating !== undefined && rating > 0;
  const fullStars = Math.floor(currentRating);
  const hasHalfStar = currentRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {hasRating ? (
          <>
            {Array(fullStars).fill(0).map((_, i) => (
              <StarIconSolid
                key={`full-${i}`}
                className={`${sizeClasses[size]} text-amber-400 ${
                  interactive ? 'cursor-pointer hover:text-amber-500' : ''
                }`}
                onClick={() => interactive && onRatingClick?.(i + 1)}
              />
            ))}
            
            {hasHalfStar && (
              <div className="relative">
                <StarIcon className={`${sizeClasses[size]} text-slate-300`} />
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <StarIconSolid className={`${sizeClasses[size]} text-amber-400`} />
                </div>
              </div>
            )}
            
            {Array(emptyStars).fill(0).map((_, i) => (
              <StarIcon
                key={`empty-${i}`}
                className={`${sizeClasses[size]} text-slate-300 ${
                  interactive ? 'cursor-pointer hover:text-amber-200' : ''
                }`}
                onClick={() => interactive && onRatingClick?.(fullStars + (hasHalfStar ? 1 : 0) + i + 1)}
              />
            ))}
          </>
        ) : (
          Array(5).fill(0).map((_, i) => (
            <StarIcon
              key={`empty-${i}`}
              className={`${sizeClasses[size]} text-slate-300`}
            />
          ))
        )}
      </div>

      <div className="flex items-center space-x-1">
        <span className={`font-medium text-slate-700 ${textSizeClasses[size]}`}>
          {hasRating ? currentRating.toFixed(1) : 'New'}
        </span>
        {showCount && reviewCount > 0 && (
          <span className={`text-slate-500 ${textSizeClasses[size]}`}>
            ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
          </span>
        )}
      </div>
    </div>
  );
};

// Enhanced Service Card Component - Updated to show more info to non-authenticated users
const ServiceCard = ({ 
  service, 
  isHighlighted = false,
  onRequestService,
  isOwnProfile,
  user
}: { 
  service: Service; 
  isHighlighted?: boolean;
  onRequestService?: (serviceId: number, serviceName: string) => void;
  isOwnProfile: boolean;
  user: any;
}) => (
  <div className={`relative p-4 rounded-xl border transition-all ${
    isHighlighted 
      ? 'bg-blue-50/80 border-blue-200 shadow-sm' 
      : 'bg-white/60 border-slate-200 hover:bg-slate-50/80 hover:border-slate-300'
  }`}>
    {isHighlighted && (
      <div className="absolute -top-2 -right-2">
        <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Popular
        </div>
      </div>
    )}
    
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1">
        <h4 className="font-semibold text-slate-800 text-sm mb-1">{service.name}</h4>
        <div className="flex items-center space-x-2">
          <div className="text-lg font-bold text-blue-600">
            {user ? (
              formatPrice(service.price)
            ) : (
              <div className="flex items-center text-sm text-slate-500">
                <span className="text-base">Contact for pricing</span>
              </div>
            )}
          </div>
          {service.duration && (
            <div className="flex items-center text-xs text-slate-500">
              <ClockIcon className="h-3 w-3 mr-1" />
              {service.duration}
            </div>
          )}
        </div>
      </div>
      
      {service.isPopular && (
        <TagIcon className="h-4 w-4 text-amber-500" />
      )}
    </div>
    
    {/* Show service description to everyone */}
    {service.description && (
      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
        {service.description}
      </p>
    )}
    
    {/* Show features to everyone but limit for non-authenticated */}
    {service.features && service.features.length > 0 && (
      <div className="space-y-1 mb-4">
        {service.features.slice(0, user ? 3 : 2).map((feature, index) => (
          <div key={index} className="flex items-center text-xs text-slate-600">
            <CheckBadgeIcon className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0" />
            {feature}
          </div>
        ))}
        {service.features.length > (user ? 3 : 2) && (
          <div className="text-xs text-slate-500 mt-1">
            {user ? (
              `+${service.features.length - 3} more features`
            ) : (
              <div className="flex items-center">
                <span>+{service.features.length - 2} more features</span>
                <LockClosedIcon className="h-3 w-3 ml-1" />
                <span className="ml-1 text-blue-600">Sign in to see all</span>
              </div>
            )}
          </div>
        )}
      </div>
    )}

    {/* Request Service Button - Show for authenticated users except on own profile */}
    {user && !isOwnProfile && onRequestService && (
      <button
        onClick={() => onRequestService(service.id, service.name)}
        className="w-full mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all font-medium flex items-center justify-center group"
      >
        <PaperAirplaneIcon className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
        Request This Service
      </button>
    )}

    {/* Sign up prompt for non-authenticated users */}
    {!user && (
      <div className="w-full mt-3 px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-200 text-center">
        <div className="flex items-center justify-center mb-1">
          <UserIcon className="h-3 w-3 mr-1" />
          <span>Sign up to request this service</span>
        </div>
      </div>
    )}
  </div>
);

export default function ProviderPublicProfile() {
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { id } = params;

  const [profile, setProfile] = useState<ProviderProfileFormData | null>(null);
  const [colleges, setColleges] = useState<College[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showServiceRequest, setShowServiceRequest] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState<string>('');

  const isOwnProfile = user?.providerId?.toString() === id;
  
  useEffect(() => {
    const fetchData = async () => {
      if (!id || isNaN(Number(id))) {
        setError('Invalid or missing provider ID in URL.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [profileRes, servicesRes, collegesRes] = await Promise.allSettled([
          axios.get(`${baseURL}/api/provider/public/${id}`, { timeout: 5000 }),
          axios.get(`${baseURL}/api/services`, { timeout: 5000 }),
          axios.get(`${baseURL}/api/colleges`, { timeout: 5000 }),
        ]);

        if (profileRes.status === 'fulfilled') {
          const profileData = profileRes.value.data?.data ?? null;
          
          if (profileData && profileData.services) {
            const transformedServices = profileData.services.map((service: any) => {
              return service.service ? service.service : service;
            });
            
            setProfile({
              ...profileData,
              services: transformedServices
            });
          } else {
            setProfile(profileData);
          }
        }

        if (servicesRes.status === 'fulfilled') {
          setServices(servicesRes.value.data);
        }

        if (collegesRes.status === 'fulfilled') {
          setColleges(collegesRes.value.data);
        }
      } catch (err) {
        setError('Something went wrong while loading the profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, location.pathname]);

  const handleContact = (method: 'call' | 'message') => {
    if (!user) {
      addToast('Please sign in to access contact information', 'info');
      navigate('/register');
      return;
    }

    if (!profile) return;

    const { phoneNumber, firstName } = profile;

    if (method === 'call' && phoneNumber) {
      if (confirm(`Call ${firstName} at ${phoneNumber}?`)) {
        window.location.href = `tel:${phoneNumber}`;
      }
    } else if (method === 'message' && phoneNumber) {
      if (confirm(`Message ${firstName} at ${phoneNumber}?`)) {
        window.location.href = `sms:${phoneNumber}`;
      }
    } else if (!phoneNumber) {
      addToast('This provider has not shared contact information', 'warning');
    }
  };

  const handleProfileUpdate = async (updatedProfile: ProviderProfileFormData) => {
    console.log('Profile update requested:', updatedProfile);
    setProfile(updatedProfile);
    setShowProfileEditor(false);
  };

  const handleServiceRequest = (serviceId: number, serviceName: string) => {
    if (!user) {
      addToast('Please sign up to request services', 'info');
      navigate('/register');
      return;
    }
    
    if (isOwnProfile) {
      addToast('You cannot request your own services', 'warning');
      return;
    }
    
    setSelectedServiceId(serviceId);
    setSelectedServiceName(serviceName);
    setShowServiceRequest(true);
  };

  const handleServiceRequestSuccess = () => {
    setShowServiceRequest(false);
    setSelectedServiceId(null);
    setSelectedServiceName('');
    addToast('Service request sent successfully!', 'success');
  };

  // Helper function to get general location (city/area only)
  const getGeneralLocation = (address: string | undefined | null) => {
    if (!address) return null;
    const parts = address.split(',');
    // Return the last part (usually city) or first part if only one part
    return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading provider profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl shadow-sm p-6 mb-8">
            <h3 className="font-medium text-lg mb-2">Error Loading Profile</h3>
            <p className="mb-4">{error}</p>
          </div>
          <ProvidersList />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100/80">
            <UserIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">Profile Not Found</h3>
            <p className="text-slate-600 mb-6">The requested provider profile could not be found.</p>
            <button
              onClick={() => navigate('/providers')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm"
            >
              Browse All Providers
            </button>
          </div>
        </div>
      </div>
    );
  }

  const priceInfo = formatPriceRange(profile.services);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Call-to-action for Non-Logged Users - More welcoming */}
        {!user && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserIcon className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-800">Want to connect with {profile.firstName}?</h3>
                  <p className="text-sm text-blue-700">Sign up to access contact details and request services</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm text-sm"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden mb-8">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Profile Image and Basic Info */}
              <div className="lg:w-1/3">
                <div className="text-center lg:text-left">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-2xl overflow-hidden mx-auto lg:mx-0 mb-6 shadow-lg ring-4 ring-white">
                    {profile.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt={`${profile.firstName} ${profile.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-slate-100 flex items-center justify-center">
                        <span className="text-3xl font-light text-slate-600">
                          {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <h1 className="text-2xl lg:text-3xl font-medium text-slate-800 mb-2">
                    {profile.firstName} {profile.lastName}
                  </h1>

                  {profile.college && (
                    <div className="flex items-center justify-center lg:justify-start text-slate-600 mb-2">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      <span>{profile.college.name}</span>
                    </div>
                  )}

                  {/* Address - Show general location for everyone */}
                  {profile.address && (
                    <div className="flex items-center justify-center lg:justify-start text-slate-600 mb-4">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span className="truncate">
                        {user ? profile.address : getGeneralLocation(profile.address)}
                      </span>
                    </div>
                  )}

                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div 
                      className={`bg-slate-50/70 rounded-xl p-4 text-center transition-colors ${
                        user && !isOwnProfile 
                          ? 'cursor-pointer hover:bg-slate-100/70 hover:shadow-sm' 
                          : ''
                      }`}
                      onClick={() => {
                        if (user && !isOwnProfile) {
                          setShowRatingModal(true);
                        } else if (!user) {
                          addToast('Sign up to rate this provider', 'info');
                          navigate('/register');
                        }
                      }}
                    >
                      <RatingDisplay
                        rating={profile.rating || 0}
                        reviewCount={profile.reviewCount || 0}
                        size="sm"
                        showCount={false}
                      />
                      <p className="text-xs text-slate-600 mt-1">
                        {profile.reviewCount || 0} review{(profile.reviewCount || 0) !== 1 ? 's' : ''}
                      </p>
                      {user && !isOwnProfile && (
                        <p className="text-xs text-blue-600 mt-1 font-medium">Click to rate</p>
                      )}
                      {!user && (
                        <p className="text-xs text-slate-500 mt-1">Sign up to rate</p>
                      )}
                    </div>
                    
                    <div className="bg-slate-50/70 rounded-xl p-4 text-center">
                      <div className="text-xl font-light text-slate-800 mb-2">
                        {profile.completedRequests || 0}
                      </div>
                      <p className="text-xs text-slate-600">Completed</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    {isOwnProfile ? (
                      <button
                        onClick={() => setShowProfileEditor(true)}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-all shadow-sm flex items-center justify-center"
                      >
                        <PencilIcon className="h-5 w-5 mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {/* Contact buttons - show for logged users only */}
                        {user && profile.phoneNumber && (
                          <>
                            <button
                              onClick={() => handleContact('call')}
                              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium flex items-center justify-center shadow-sm"
                            >
                              <PhoneIcon className="h-5 w-5 mr-2" />
                              Call Now
                            </button>
                            <button
                              onClick={() => handleContact('message')}
                              className="w-full px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all font-medium flex items-center justify-center"
                            >
                              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                              Send Message
                            </button>
                          </>
                        )}

                        {/* Show general contact info for logged users when phone not available */}
                        {user && !profile.phoneNumber && (
                          <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                            <p className="text-sm">
                              This provider has not shared contact information. 
                              You can request services through the service cards below.
                            </p>
                          </div>
                        )}

                        {/* Show sign up prompt for non-authenticated users */}
                        {!user && (
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 text-blue-800 rounded-xl border border-blue-200 text-center">
                            <div className="flex items-center justify-center mb-3">
                              <UserIcon className="h-5 w-5 mr-2" />
                              <span className="font-medium">Ready to connect?</span>
                            </div>
                            <ul className="text-sm mb-4 space-y-1">
                              <li>• Get contact information</li>
                              <li>• Request services directly</li>
                              <li>• View complete portfolio</li>
                              <li>• Rate and review providers</li>
                            </ul>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => navigate('/login')}
                                className="flex-1 px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                              >
                                Sign In
                              </button>
                              <button
                                onClick={() => navigate('/register')}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Sign Up
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Detailed Information */}
              <div className="lg:w-2/3 space-y-8">
                {/* Bio Section - Show to everyone */}
                {profile.bio && (
                  <div>
                    <h2 className="text-xl font-medium text-slate-800 mb-4">About Me</h2>
                    <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                      <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Enhanced Services Section - Show more to everyone */}
                {profile.services && profile.services.length > 0 && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                      <h2 className="text-xl font-medium text-slate-800 flex items-center mb-4 sm:mb-0">
                        <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                        Services & Pricing
                      </h2>
                      <div className="text-center sm:text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {user ? priceInfo.range : 'Contact for pricing'}
                        </div>
                        {user && priceInfo.hasVariation && (
                          <div className="text-sm text-slate-500">
                            Price range for all services
                          </div>
                        )}
                        {!user && (
                          <div className="text-sm text-slate-500">
                            Pricing available after sign up
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {profile.services.map((service, index) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          isHighlighted={index === 0 && profile.services!.length > 1}
                          onRequestService={handleServiceRequest}
                          isOwnProfile={isOwnProfile}
                          user={user}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio Section - Show previews to everyone */}
                {profile.pastWorks && profile.pastWorks.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium text-slate-800 mb-4 flex items-center">
                      <PhotoIcon className="h-6 w-6 mr-2" />
                      Portfolio ({profile.pastWorks.length} items)
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {profile.pastWorks.slice(0, user ? profile.pastWorks.length : 6).map((work, index) => (
                        <div key={index} className="group relative bg-slate-50/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 cursor-pointer">
                          <div className="aspect-square relative">
                            <img
                              src={work.imageUrl}
                              alt={work.description || `Portfolio item ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-work.png';
                              }}
                              onClick={() => {
                                if (user) {
                                  setSelectedImage(work.imageUrl);
                                } else {
                                  addToast('Sign up to view full portfolio', 'info');
                                  navigate('/register');
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all">
                              <EyeIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                            </div>
                          </div>
                          
                          {work.description && (
                            <div className="p-4">
                              <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">
                                {work.description}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Show "more items" indicator for non-logged users */}
                      {!user && profile.pastWorks.length > 6 && (
                        <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-xl aspect-square border border-blue-200">
                          <div className="text-center p-4">
                            <UserIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                            <span className="text-sm text-blue-700 font-medium">
                              +{profile.pastWorks.length - 6} more
                            </span>
                            <p className="text-xs text-blue-600 mt-1">Sign up to see all</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {!user && (
                      <div className="mt-6 text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                        <UserIcon className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                        <h3 className="font-medium text-blue-800 mb-2">See Complete Portfolio</h3>
                        <p className="text-blue-700 text-sm mb-4">
                          Sign up to view all {profile.pastWorks.length} portfolio items with full descriptions
                        </p>
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => navigate('/register')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            Sign Up Free
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact Information - Show only to authenticated users */}
                {user && profile.phoneNumber && (
                  <div>
                    <h2 className="text-xl font-medium text-slate-800 mb-4">Contact Information</h2>
                    <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                      <div className="flex items-center">
                        <PhoneIcon className="h-6 w-6 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-slate-800">Phone Number</p>
                          <p className="text-slate-600">{profile.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact info call-to-action for non-authenticated users */}
                {!user && (
                  <div>
                    <h2 className="text-xl font-medium text-slate-800 mb-4 flex items-center">
                      Contact Information
                    </h2>
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                      <div className="text-center py-4">
                        <PhoneIcon className="h-12 w-12 text-blue-400 mx-auto mb-3" />
                        <h3 className="font-medium text-blue-800 mb-2">Get in Touch with {profile.firstName}</h3>
                        <p className="text-blue-700 mb-4">Sign up to access phone number and direct messaging</p>
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => navigate('/register')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
                          >
                            Sign Up Free
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Service Request Modal */}
        {showServiceRequest && selectedServiceId && (
          <DirectServiceRequest
            providerId={Number(id)}
            serviceId={selectedServiceId}
            serviceName={selectedServiceName}
            providerName={`${profile.firstName} ${profile.lastName}`}
            isOpen={showServiceRequest}
            onClose={() => setShowServiceRequest(false)}
            onSuccess={handleServiceRequestSuccess}
          />
        )}

        {/* Profile Editor Modal */}
        {showProfileEditor && isOwnProfile && (
          <ProviderProfile
            profile={profile}
            colleges={colleges}
            services={services}
            onProfileUpdate={handleProfileUpdate}
            isOpen={showProfileEditor}
            onClose={() => setShowProfileEditor(false)}
            isOwnProfile={isOwnProfile}
          />
        )}

        {/* Rating Modal - Available for all authenticated users */}
        {showRatingModal && user && !isOwnProfile && (
          <RatingModal
            isOpen={showRatingModal}
            onClose={() => setShowRatingModal(false)}
            providerName={`${profile.firstName} ${profile.lastName}`}
            providerId={Number(id)}
            onSuccess={(newRating) => {
              setProfile(prev => prev ? {
                ...prev,
                rating: newRating.averageRating,
                reviewCount: (prev.reviewCount || 0) + 1
              } : prev);
              addToast('Rating submitted successfully!', 'success');
            }}
          />
        )}

        {/* Quick Service Request - Floating Action Button for logged users (not own profile) */}
        {user && !isOwnProfile && profile.services && profile.services.length > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => {
                const firstService = profile.services![0];
                handleServiceRequest(firstService.id, firstService.name);
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
              title="Quick Service Request"
            >
              <PaperAirplaneIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Floating Sign Up Button for non-authenticated users */}
        {!user && (
          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group text-sm font-medium"
              title="Sign up to request services"
            >
              <UserIcon className="h-5 w-5 inline mr-2 group-hover:scale-110 transition-transform" />
              Sign Up Free
            </button>
          </div>
        )}

        {/* Image Preview Modal - For all users */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
      </div>
    </div>
  );
}