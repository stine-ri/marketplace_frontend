// Enhanced ProviderPublicProfile.tsx - Allow all roles to make requests
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
  PaperAirplaneIcon 
} from '@heroicons/react/24/outline';
import DirectServiceRequest from '../components/NewFeature/ServiceRequests';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { PriceRange } from '../utilis/priceFormatter';
import { formatPrice } from '../utilis/priceFormatter';
import { useToast } from '../context/ToastContext';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

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
      {/* Stars */}
      <div className="flex items-center space-x-0.5">
        {hasRating ? (
          <>
            {/* Full Stars */}
            {Array(fullStars).fill(0).map((_, i) => (
              <StarIconSolid
                key={`full-${i}`}
                className={`${sizeClasses[size]} text-amber-400 ${
                  interactive ? 'cursor-pointer hover:text-amber-500' : ''
                }`}
                onClick={() => interactive && onRatingClick?.(i + 1)}
              />
            ))}
            
            {/* Half Star */}
            {hasHalfStar && (
              <div className="relative">
                <StarIcon className={`${sizeClasses[size]} text-slate-300`} />
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <StarIconSolid className={`${sizeClasses[size]} text-amber-400`} />
                </div>
              </div>
            )}
            
            {/* Empty Stars */}
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
          // Show empty stars for no rating
          Array(5).fill(0).map((_, i) => (
            <StarIcon
              key={`empty-${i}`}
              className={`${sizeClasses[size]} text-slate-300`}
            />
          ))
        )}
      </div>

      {/* Rating Text & Review Count */}
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

// Enhanced Service Card Component - Updated to allow all authenticated users
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
            {formatPrice(service.price)}
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
    
    {service.description && (
      <p className="text-sm text-slate-600 line-clamp-2 mb-3">
        {service.description}
      </p>
    )}
    
    {service.features && service.features.length > 0 && (
      <div className="space-y-1 mb-4">
        {service.features.slice(0, 3).map((feature, index) => (
          <div key={index} className="flex items-center text-xs text-slate-600">
            <CheckBadgeIcon className="h-3 w-3 text-green-500 mr-1.5 flex-shrink-0" />
            {feature}
          </div>
        ))}
        {service.features.length > 3 && (
          <div className="text-xs text-slate-500 mt-1">
            +{service.features.length - 3} more features
          </div>
        )}
      </div>
    )}

    {/* Request Service Button - Show for all authenticated users except on own profile */}
    {user && !isOwnProfile && onRequestService && (
      <button
        onClick={() => onRequestService(service.id, service.name)}
        className="w-full mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all font-medium flex items-center justify-center"
      >
        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
        Request This Service
      </button>
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

        // Handle profile data
        if (profileRes.status === 'fulfilled') {
          const profileData = profileRes.value.data?.data ?? null;
          
          // Transform the services structure if needed
          if (profileData && profileData.services) {
            // Check if services are nested in service property
            const transformedServices = profileData.services.map((service: any) => {
              // If service is nested in a service property, extract it
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

  // Handle service request for all authenticated users
  const handleServiceRequest = (serviceId: number, serviceName: string) => {
   if (!user) {
      addToast('Please log in to request services', 'info');
      navigate('/login');
      return;
    }
    
    setSelectedServiceId(serviceId);
    setSelectedServiceName(serviceName);
    setShowServiceRequest(true);
  };

  const handleServiceRequestSuccess = () => {
    setShowServiceRequest(false);
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

  const isOwnProfile = user?.providerId?.toString() === id;
  const priceInfo = formatPriceRange(profile.services);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden mb-8">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left: Profile Image and Basic Info */}
              <div className="lg:w-1/3">
                <div className="text-center lg:text-left">
                  {/* Profile Image */}
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

                  {/* Basic Info */}
                  <h1 className="text-2xl lg:text-3xl font-medium text-slate-800 mb-2">
                    {profile.firstName} {profile.lastName}
                  </h1>

                  {profile.college && (
                    <div className="flex items-center justify-center lg:justify-start text-slate-600 mb-2">
                      <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                      <span>{profile.college.name}</span>
                    </div>
                  )}

                  {profile.address && (
                    <div className="flex items-center justify-center lg:justify-start text-slate-600 mb-4">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span className="truncate">{profile.address}</span>
                    </div>
                  )}

                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Rating Card */}
                    <div className="bg-slate-50/70 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                         onClick={() => !isOwnProfile && setShowRatingModal(true)}>
                     <RatingDisplay
                        rating={profile.rating || 0}
                        reviewCount={profile.reviewCount || 0}
                        size="sm"
                        showCount={false}
                      />
                      <p className="text-xs text-slate-600 mt-1">
                        {profile.reviewCount || 0} review{(profile.reviewCount || 0) !== 1 ? 's' : ''}
                      </p>
                    </div>
                    
                    {/* Completed Requests */}
                    <div className="bg-slate-50/70 rounded-xl p-4 text-center">
                      <div className="text-xl font-light text-slate-800 mb-2">
                        {profile.completedRequests || 0}
                      </div>
                      <p className="text-xs text-slate-600">Completed</p>
                    </div>
                  </div>

                  {/* Action Buttons - Updated to show for all authenticated users */}
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
                        {/* Contact buttons - show if phone number is available */}
                        {profile.phoneNumber && (
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

                        {/* Show login prompt for non-authenticated users */}
                        {!user && (
                          <div className="p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 text-center">
                            <p className="text-sm mb-3">
                              Sign in to request services from this provider
                            </p>
                            <button
                              onClick={() => navigate('/login')}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Sign In
                            </button>
                          </div>
                        )}

                        {/* Info message for users without contact info */}
                        {!profile.phoneNumber && (
                          <div className="p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
                            <p className="text-sm">
                              This provider has not shared contact information. 
                              {user ? ' You can request services through the service cards below.' : ' Sign in to request services.'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Detailed Information */}
              <div className="lg:w-2/3 space-y-8">
                {/* Bio Section */}
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

                {/* Enhanced Services Section */}
                {profile.services && profile.services.length > 0 && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                      <h2 className="text-xl font-medium text-slate-800 flex items-center mb-4 sm:mb-0">
                        <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                        Services & Pricing
                      </h2>
                      <div className="text-center sm:text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {priceInfo.range}
                        </div>
                        {priceInfo.hasVariation && (
                          <div className="text-sm text-slate-500">
                            Price range for all services
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

                {/* Portfolio Section */}
                {profile.pastWorks && profile.pastWorks.length > 0 && (
                  <div>
                    <h2 className="text-xl font-medium text-slate-800 mb-4 flex items-center">
                      <PhotoIcon className="h-6 w-6 mr-2" />
                      Portfolio ({profile.pastWorks.length} items)
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {profile.pastWorks.map((work, index) => (
                        <div key={index} className="group relative bg-slate-50/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 cursor-pointer">
                          <div className="aspect-square relative">
                            <img
                              src={work.imageUrl}
                              alt={work.description || `Portfolio item ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-work.png';
                              }}
                              onClick={() => setSelectedImage(work.imageUrl)}
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
                    </div>
                  </div>
                )}

                {/* Contact Information - Show to all users if available */}
                {profile.phoneNumber && (
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
              </div>
            </div>
          </div>
        </div>

        {/* Add the Direct Service Request Modal */}
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

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Rate this Provider</h3>
              <div className="text-center mb-6">
                <RatingDisplay
                  rating={0}
                  size="lg"
                  showCount={false}
                  interactive={true}
                  onRatingClick={(rating) => {
                    console.log('Rating clicked:', rating);
                    // Handle rating submission here
                    setShowRatingModal(false);
                  }}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
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