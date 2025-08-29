import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../api/api';
import { NewBidModal } from '../NewFeature/NewBidModal';
import ProfileCompletionModal from '../NewFeature/ProfileCompletionModal';
import useWebSocket from '../../hooks/useWebSocket';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { BellIcon, ArrowPathIcon, CurrencyDollarIcon, ClockIcon, PencilIcon, TrashIcon, EyeIcon, MapPinIcon, CalendarIcon, TagIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import type { ProviderProfile, User, InterestWithChatRoom } from '../../types/types';
import { Request, Bid,  ProviderProfileFormData, Interest, PastWork , College, Service, ChatRoom, ChatMessage,CombinedChatRoom } from '../../types/types';
import { ProviderRequestCard } from './ProvideRequestCard';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import { ProductManagementSection } from '../NewFeature/ProductManagementSection';
import { useNavigate } from 'react-router-dom';

interface ClientRequest extends Request {
  deadline?: string;
  client?: {
    id: number;
    name: string;
    email: string;
  };
  bids?: Bid[];
  interests?: Interest[];
  allowBids?: boolean;
  allowInterests?: boolean;
  serviceName: string; 
}

interface ExtendedBid extends Bid {
  request?: {
    id: number;
    title: string;
    description: string;
    budget: number;
    category: string;
    status: string;
    client?: {
      name: string;
      email: string;
    };
  };
  canEdit?: boolean;
  canWithdraw?: boolean;
}

interface ProviderProfileProps {
  profile: ProviderProfileFormData;
  colleges: College[];
  services: Service[];
}

const ProviderProfile: React.FC<ProviderProfileProps> = ({ profile, colleges, services }) => {
  const { pastWorks } = profile;
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="flex-shrink-0">
          {profile.profileImageUrl ? (
            <img
              className="w-32 h-32 rounded-full object-cover"
              src={profile.profileImageUrl}
              alt={`${profile.firstName} ${profile.lastName}`}
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl font-medium text-gray-500">
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.collegeId && (
            <p className="text-lg text-gray-600 mt-1">
              {colleges.find(c => c.id === profile.collegeId)?.name}
            </p>
          )}
          {profile.bio && <p className="mt-4 text-gray-700">{profile.bio}</p>}
        </div>
      </div>

      {/* Services Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Services Offered</h2>
        <div className="flex flex-wrap gap-2">
          {services.map(service => (
            <span
              key={service.id}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full"
            >
              {service.name}
            </span>
          ))}
        </div>
      </section>

      {/* Past Works Section */}
      {pastWorks && pastWorks.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Past Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastWorks.map((work, index) => (
              <div
                key={index}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-100 relative">
                  <img
                    src={work.imageUrl}
                    alt={`Past work ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/default-work.png';
                    }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-gray-700">{work.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

interface Location {
  lat: number;
  lng: number;
}

const LocationControls = ({
  useLocationFilter,
  enableLocationFilter,
  disableLocationFilter,
  locationError,
  userLocation,
  searchRadius,
  setSearchRadius,
  isLocationLoading,
  refreshWithLocation,
  fetchAvailableRequests
}: {
  useLocationFilter: boolean;
  enableLocationFilter: () => Promise<void>;
  disableLocationFilter: () => void;
  locationError: string | null;
  userLocation: Location | null;
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  isLocationLoading: boolean;
  refreshWithLocation: () => Promise<void>;
  fetchAvailableRequests: () => Promise<void>;
}) => (
  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Location-Based Search</h3>
      <div className="flex items-center space-x-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useLocationFilter}
            onChange={(e) => {
              if (e.target.checked) {
                enableLocationFilter();
              } else {
                disableLocationFilter();
              }
            }}
            className="mr-2"
          />
          Use my location
        </label>
      </div>
    </div>

    {locationError && (
      <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>{locationError}</p>
        <button
          onClick={enableLocationFilter}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )}

    {useLocationFilter && (
      <div className="space-y-4">
        {userLocation && (
          <div className="text-sm text-gray-600">
            📍 Current location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </div>
        )}

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <span>Search radius:</span>
            <select
              value={searchRadius}
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
              <option value={200}>200 km</option>
            </select>
          </label>

          <button
            onClick={refreshWithLocation}
            disabled={isLocationLoading}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLocationLoading ? 'Getting location...' : 'Refresh location'}
          </button>
        </div>
      </div>
    )}

    <div className="mt-4 flex space-x-2">
      <button
        onClick={fetchAvailableRequests}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Search Requests
      </button>
      
      {useLocationFilter && (
        <button
          onClick={disableLocationFilter}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Show All Requests
        </button>
      )}
    </div>
  </div>
);

function formatLocation(location: any): string {
  if (!location) return 'Location not provided';
  
  // Handle the new location object format
  if (typeof location === 'object' && location !== null) {
    if (location.address && location.address !== 'Not specified') {
      return location.address;
    }
    
    if (location.lat != null && location.lng != null) {
      return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
    }
  }
  
  // Handle string format (backward compatibility)
  if (typeof location === 'string') {
    try {
      const parsed = JSON.parse(location);
      return formatLocation(parsed);
    } catch {
      return location !== '{}' && location !== 'Not specified' 
        ? location 
        : 'Location not provided';
    }
  }
  
  return 'Location not provided';
}
// Kenya-specific date formatting
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Date not available';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Nairobi'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Date format error';
  }
}

function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Just now';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    
    const kenyaDate = new Date(date.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
    const kenyaNow = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Nairobi' }));
    
    const diffInMs = kenyaNow.getTime() - kenyaDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
  } catch (error) {
    return formatDate(dateString);
  }
}

export function ProviderDashboard() {
  const [availableRequests, setAvailableRequests] = useState<ClientRequest[]>([]);
  const [myBids, setMyBids] = useState<ExtendedBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'mybids' | 'requests' | 'myinterests' | 'chat'>('available');

  const [showNotifications, setShowNotifications] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(50);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(false);
  const [useLocationFilter, setUseLocationFilter] = useState<boolean>(false);

  const [showNewBidModal, setShowNewBidModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);

  const [requests, setRequests] = useState<Request[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);

  const [selectedBid, setSelectedBid] = useState<ExtendedBid | null>(null);
  const [showBidDetailsModal, setShowBidDetailsModal] = useState(false);
  const [showEditBidModal, setShowEditBidModal] = useState(false);
  const [bidFilters, setBidFilters] = useState({
    status: 'all',
    sortBy: 'newest',
    searchTerm: ''
  });

  const { user, logout } = useAuth();
  const userId = user?.userId;
  const providerId = user?.providerId || provider?.id;
  const { socket } = useWebSocketContext();

  const { lastMessage, notifications, unreadCount } = useWebSocket();
  const [myInterests, setMyInterests] = useState<Interest[]>([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChatRoom, setCurrentChatRoom] = useState<ChatRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProviderProfile = async () => {
      try {
        const res = await api.get('/api/provider/profile');
        setProvider(res.data);
        
        if (!res.data.isProfileComplete) {
          setShowProfileModal(true);
        }
      } catch (error) {
        console.error('Error fetching provider profile:', error);
        setShowProfileModal(true);
      }
    };

    fetchProviderProfile();
  }, []);

  const getCurrentLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      setIsLocationLoading(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setIsLocationLoading(false);
          resolve(location);
        },
        (error: GeolocationPositionError) => {
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
          
          setLocationError(errorMessage);
          setIsLocationLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }, []);

  // FIXED: Consolidated fetch function to prevent conflicts
  const fetchAvailableRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please log in again");
        return;
      }

      console.log('⌛ Fetching requests...');
      const startTime = Date.now();
      
      // Build query parameters
      const params: any = {};
      
      // Only add location params if explicitly using location filter
      if (useLocationFilter && userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.radius = searchRadius; // Changed from 'range' to 'radius' to match expected API
      }

      const response = await api.get('/api/provider/requests', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params // Only include params if they exist
      });

      console.log(`✅ Requests fetched in ${Date.now() - startTime}ms`);
      
      const requestsWithDefaults = response.data.map((request: any) => {
        let location = request.location;
        if (typeof location === 'string') {
          try {
            location = JSON.parse(location);
          } catch {
            console.warn('Failed to parse location string:', location);
            location = null;
          }
        }
        
        return {
          ...request,
          location,
          serviceName: request.serviceName || request.service?.name || 'Service Request', // Fix undefined serviceName
          allowBids: request.allowBids !== false,
          allowInterests: request.allowInterests !== false
        };
      });

      setAvailableRequests(requestsWithDefaults || []);
    } catch (error) {
      console.error('Error fetching requests:', {
        error,
        time: new Date().toISOString(),
        userLocation,
        searchRadius,
        useLocationFilter
      });
      
      // More specific error handling
      if (error instanceof AxiosError) {
        if (error.response?.status === 500) {
          toast.error("Server error - trying without location filter");
          // Retry without location parameters
          if (useLocationFilter) {
            setUseLocationFilter(false);
            setUserLocation(null);
          }
        } else {
          toast.error(error.response?.data?.message || "Failed to load requests");
        }
      } else {
        toast.error("Failed to load available requests");
      }
      
      setAvailableRequests([]);
    }
  }, [userLocation, searchRadius, useLocationFilter]);

  const enableLocationFilter = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setUseLocationFilter(true);
      await fetchAvailableRequests();
    } catch (error) {
      console.error('Failed to get location:', error);
      setLocationError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [getCurrentLocation, fetchAvailableRequests]);

  const disableLocationFilter = useCallback(() => {
    setUseLocationFilter(false);
    setUserLocation(null);
    setLocationError(null);
    fetchAvailableRequests();
  }, [fetchAvailableRequests]);

  const refreshWithLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      await fetchAvailableRequests();
    } catch (error) {
      console.error('Failed to refresh location:', error);
      setLocationError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [getCurrentLocation, fetchAvailableRequests]);

  useEffect(() => {
    fetchAvailableRequests();
  }, [fetchAvailableRequests]);

  const fetchMyBids = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get('/api/provider/bids', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data)) {
        const enhancedBids = response.data.map((bid: ExtendedBid) => ({
          ...bid,
          canEdit: bid.status === 'pending' && !bid.request?.status?.includes('closed'),
          canWithdraw: ['pending', 'accepted'].includes(bid.status) && !bid.request?.status?.includes('closed')
        }));
        setMyBids(enhancedBids);
        setBids(response.data);
      }
    } catch (error) {
      console.error('Error fetching my bids:', error);
    }
  }, []);

  // REMOVED: Duplicate fetchRequests function to avoid conflicts
  const fetchMyInterests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await api.get('/api/interests/my', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMyInterests(Array.isArray(response.data.data) ? response.data.data : []);
      console.log('Fetched interests:', response.data);
    } catch (error) {
      console.error('Error fetching my interests:', error);
    }
  }, []);

  const fetchChatRooms = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please log in to access chat");
        return;
      }

      const response = await api.get('/api/chat', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const enhancedRooms = response.data.map((room: any) => ({
        ...room,
        otherParty: room.clientId === user?.userId ? room.provider : room.client,
        lastMessage: room.messages?.[0] || null,
        unreadCount: room.unreadCount || 0
      }));

      setChatRooms(enhancedRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      toast.error('Failed to load chat rooms');
    }
  }, [user?.userId]);

  const fetchChatMessages = useCallback(async (roomId: number) => {
    try {
      const response = await api.get(`/api/chat/${roomId}/messages`);
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  }, []);

  const sendChatMessage = useCallback(async () => {
    if (!currentChatRoom || !newMessage.trim()) return;

    try {
      const response = await api.post(`/api/chat/${currentChatRoom.id}/messages`, {
        content: newMessage
      });
      setChatMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [currentChatRoom, newMessage]);

  // FIXED: Simplified data loading to prevent conflicts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchAvailableRequests(), 
          fetchMyBids(), 
          fetchMyInterests()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchAvailableRequests, fetchMyBids, fetchMyInterests]);

  useEffect(() => {
    if (!lastMessage) return;

    try {
      let data;
      if (typeof lastMessage.data === 'string') {
        data = JSON.parse(lastMessage.data);
      } else {
        data = lastMessage.data;
      }

      if (data.type === 'new_request') {
        setAvailableRequests(prev => [data.request, ...prev]);
      } else if (data.type === 'bid_accepted' || data.type === 'bid_rejected') {
        setMyBids(prev => prev.map(bid => 
          bid.id === data.bidId ? { ...bid, status: data.status } : bid
        ));
      } else if (data.type === 'bid_status_updated') {
        setMyBids(prev => prev.map(bid => 
          bid.id === data.bidId ? { 
            ...bid, 
            status: data.status,
            canEdit: data.status === 'pending' && !bid.request?.status?.includes('closed'),
            canWithdraw: ['pending', 'accepted'].includes(data.status) && !bid.request?.status?.includes('closed')
          } : bid
        ));
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      console.error('lastMessage.data type:', typeof lastMessage.data);
      console.error('lastMessage.data value:', lastMessage.data);
    }
  }, [lastMessage]);

  // REMOVED: Duplicate useEffect for socket handling
  
  const handleExpressInterest = async (requestId: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const existingRequest = availableRequests.find(req => req.id === requestId);
      const hasExistingInterest = existingRequest?.interests?.some(i => 
        Number(i.providerId) === Number(providerId)
      );
      
      if (hasExistingInterest) {
        toast.info("You have already expressed interest in this request");
        return;
      }

      const tempId = Date.now() + Math.random();

      setAvailableRequests(prev => 
        prev.map(req => {
          if (req.id !== requestId) return req;
          
          const existingInterests = req.interests || [];
          const tempInterest: Interest = {
            id: tempId,
            requestId,
            providerId: providerId!,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'pending'
          };
          
          return {
            ...req,
            interests: [...existingInterests, tempInterest]
          };
        })
      );

      const { data } = await api.post<Interest>(
        `/api/interests/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setAvailableRequests(prev => 
        prev.map(req => {
          if (req.id !== requestId) return req;
          
          const existingInterests = req.interests || [];
          const cleanedInterests = existingInterests.filter(i => 
            i.id !== tempId && Number(i.providerId) !== Number(providerId)
          );
          
          return {
            ...req,
            interests: [...cleanedInterests, data]
          };
        })
      );

      setMyInterests(prev => {
        const filtered = prev.filter(i => i.requestId !== requestId);
        return [...filtered, data];
      });

      toast.success("Interest expressed successfully!");
    } catch (error: any) {
      console.error("Express interest error:", {
        error,
        requestId,
        providerId,
        time: new Date().toISOString()
      });
      
      setAvailableRequests(prev => 
        prev.map(req => {
          if (req.id !== requestId) return req;
          
          const existingInterests = req.interests || [];
          return {
            ...req,
            interests: existingInterests.filter(i => 
              Number(i.providerId) !== Number(providerId)
            )
          };
        })
      );
      
      const errorMessage = error.response?.data?.error 
        || error.message 
        || "Failed to express interest";
        
      toast.error(errorMessage);
      
      if (error.response?.status === 409) {
        fetchMyInterests();
        fetchAvailableRequests();
      }
    }
  };

  const isRequestRelevant = (request: Request): boolean => {
    if (!provider || !Array.isArray(provider.services)) return false;
    if (request.serviceId === undefined) return false;

    return provider.services.some(s => s.id === request.serviceId) &&
           (!request.collegeFilterId || request.collegeFilterId === provider.collegeId);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      if (activeTab === 'available') setAvailableRequests([]);
      if (activeTab === 'mybids') setMyBids([]);
      if (activeTab === 'myinterests') setMyInterests([]);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      switch (activeTab) {
        case 'available':
          await fetchAvailableRequests();
          break;
        case 'mybids':
          await fetchMyBids();
          break;
        case 'myinterests':
          await fetchMyInterests();
          break;
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleBidOnRequest = (request: ClientRequest) => {
    setSelectedRequest(request);
    setShowNewBidModal(true);
  };

  const handleBidCreated = (newBid: Bid) => {
    setMyBids(prev => [{
      ...newBid,
      canEdit: true,
      canWithdraw: true
    } as ExtendedBid, ...prev]);
    
    setAvailableRequests(prev => prev.map(req => 
      req.id === selectedRequest?.id 
        ? { ...req, bids: [...(req.bids || []), newBid] }
        : req
    ));
    
    setShowNewBidModal(false);
    setSelectedRequest(null);
  };

  const handleEditBid = async (bidId: number, newPrice: number, newMessage: string) => {
    try {
      const response = await api.put(`/api/bids/${bidId}`, {
        price: newPrice,
        message: newMessage
      });

      setMyBids(prev => prev.map(bid => 
        bid.id === bidId ? { ...bid, price: newPrice, message: newMessage } : bid
      ));

      setShowEditBidModal(false);
      setSelectedBid(null);
    } catch (error) {
      console.error('Error editing bid:', error);
    }
  };

  const handleWithdrawBid = async (bidId: number) => {
    if (!confirm('Are you sure you want to withdraw this bid?')) return;

    try {
      await api.delete(`/api/bids/${bidId}`);
      
      setMyBids(prev => prev.filter(bid => bid.id !== bidId));
      
      setAvailableRequests(prev => prev.map(req => ({
        ...req,
        bids: req.bids?.filter(bid => bid.id !== bidId) || []
      })));
    } catch (error) {
      console.error('Error withdrawing bid:', error);
    }
  };

  const handleProfileComplete = async (formData: ProviderProfileFormData) => {
    try {
      const res = await api.put('/api/provider/profile', formData);
      setProvider(res.data);
      setShowProfileModal(false);
      
      if (res.data.isProfileComplete) {
        await fetchAvailableRequests();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getBidStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const hasAlreadyBid = (requestId: number) => {
    return myBids.some(bid => bid.requestId === requestId && bid.status !== 'withdrawn');
  };

  const withdrawInterest = async (interestId: number) => {
    try {
      await api.delete(`/api/interests/${interestId}`);
      setMyInterests(prev => prev.filter(i => i.id !== interestId));
      setAvailableRequests(prev => prev.map(req => ({
        ...req,
        interests: req.interests?.filter(i => i.id !== interestId) || []
      })));
      toast.success("Interest withdrawn successfully");
    } catch (error) {
      toast.error("Failed to withdraw interest");
    }
  };

  const filteredAndSortedBids = myBids
    .filter(bid => {
      if (bidFilters.status !== 'all' && bid.status !== bidFilters.status) return false;
      if (bidFilters.searchTerm && !bid.request?.title?.toLowerCase().includes(bidFilters.searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (bidFilters.sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (!user || user.role !== 'service_provider') {
    return <Navigate to="/login" replace />;
  }

  const RequestDetailsModal = ({ 
    request, 
    onClose 
  }: {
    request: ClientRequest | null;
    onClose: () => void;
  }) => {
    if (!request) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
        <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full sm:w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Request Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Service Information</h3>
              <div className="mt-2 bg-gray-50 p-3 rounded">
                <p className="font-medium">{request.serviceName || 'Service Request'}</p>
                <p className="text-gray-600 mt-2">{request.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900">Budget</h3>
                <div className="mt-2 bg-blue-50 p-3 rounded">
                  <p className="font-medium">KSh {request.desired_price?.toLocaleString() || 'Negotiable'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Location</h3>
                <div className="mt-2 bg-green-50 p-3 rounded">
                  <p>{formatLocation(request.location)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900">Timing</h3>
              <div className="mt-2 bg-yellow-50 p-3 rounded">
                <p>Posted: {formatDate(request.createdAt)}</p>
                {request.deadline && (
                  <p className="mt-1">
                    Deadline: {formatDate(request.deadline)}
                    {request.deadline && new Date(request.deadline) < new Date() && (
                      <span className="ml-2 text-red-600 text-sm">(Expired)</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {request.client && (
              <div>
                <h3 className="font-medium text-gray-900">Client Information</h3>
                <div className="mt-2 bg-purple-50 p-3 rounded">
                  <p className="font-medium">{request.client.name}</p>
                  <p className="text-gray-600">{request.client.email}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRequestActions = (request: ClientRequest) => {
    if (!providerId) {
      console.warn('No providerId available');
      return null;
    }

    const hasBid = myBids.some(bid => bid.requestId === request.id && bid.status !== 'withdrawn');
    
    const hasInterest = 
      request.interests?.some(i => 
        Number(i.providerId) === Number(providerId)
      ) ||
      myInterests.some(i => 
        i.requestId === request.id && Number(i.providerId) === Number(providerId)
      ) ||
      false;
    
    const allowBids = request.allowBids !== false;
    const allowInterests = request.allowInterests !== false;
    
    return (
      <div className="flex flex-col gap-2 min-w-[120px]">
        {allowBids && (
          <button
            onClick={() => handleBidOnRequest(request)}
            disabled={hasBid}
            className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              hasBid
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
            {hasBid ? 'Bid Placed' : 'Place Bid'}
          </button>
        )}
        
        {allowInterests && (
          <button
            onClick={() => handleExpressInterest(request.id)}
            disabled={hasInterest}
            className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              hasInterest
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <HandThumbUpIcon className="h-4 w-4 mr-1" />
            {hasInterest ? 'Interest Shown' : 'Express Interest'}
          </button>
        )}
        
        <button
          onClick={() => {
            setSelectedRequest(request);
            setShowDetailsModal(true);
          }}
          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <EyeIcon className="h-4 w-4 mr-1" />
          View Details
        </button>
      </div>
    );
  };

  const getDisplayName = (party: User | ProviderProfile | undefined): string => {
    if (!party) return 'Unknown';
    
    if ('name' in party) {
      return party.name || party.full_name || 'User';
    }
    
    if (party.user?.fullName) {
      return party.user.fullName;
    }
    
    return `${party.firstName} ${party.lastName}`.trim() || 'Provider';
  };

  function isUser(party: User | ProviderProfile): party is User {
    return (party as User).role !== undefined;
  }

  function isProviderProfile(party: User | ProviderProfile): party is ProviderProfile {
    return (party as ProviderProfile).firstName !== undefined;
  }

  const getAvatarUrl = (party: User | ProviderProfile | undefined): string | undefined => {
    if (!party) return undefined;
    
    if (isUser(party)) {
      return party.avatar;
    } else if (isProviderProfile(party)) {
      return party.user?.avatar || party.profileImageUrl;
    }

    return undefined;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showProfileModal && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onComplete={async (profile) => {
            toast.success("✅ Profile updated successfully");
            await handleProfileComplete(profile);
          }}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Provider Dashboard</h1>
          <div className="flex items-center justify-end sm:justify-normal space-x-2 sm:space-x-3 w-full sm:w-auto">
         
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${
                refreshing ? 'bg-gray-100' : ''
              }`}
              title="Refresh"
            >
              <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${
                refreshing ? 'text-blue-500 animate-spin' : 'text-gray-600'
              }`} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1 sm:p-2 rounded-full hover:bg-gray-100"
              >
                <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-md shadow-lg overflow-hidden z-10">
                  <div className="py-1">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-2 text-xs sm:text-sm text-gray-700">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-3 py-2 text-xs sm:text-sm ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-gray-600">{notification.message}</p>
                          <p className="text-xxs sm:text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {provider?.isProfileComplete && (
              <button
                onClick={() => setShowProfileModal(true)}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded hover:bg-blue-50"
              >
                Edit Profile
              </button>
            )}

            {showDetailsModal && (
              <RequestDetailsModal 
                request={selectedRequest} 
                onClose={() => setShowDetailsModal(false)} 
              />
            )}
            
            <button
              onClick={logout}
              className="text-xs sm:text-sm text-red-600 hover:text-red-800 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4 lg:px-6 lg:py-6">
        {!provider?.isProfileComplete ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm text-yellow-700">
                  Please complete your profile to start receiving service requests.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-gray-200 mb-3 sm:mb-6 overflow-x-auto">
              <nav className="-mb-px flex space-x-1 sm:space-x-2 md:space-x-4 lg:space-x-8 min-w-max">
                <button
                  onClick={() => setActiveTab('available')}
                  className={`${activeTab === 'available' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 sm:py-3 sm:px-2 border-b-2 font-medium text-xs sm:text-sm`}
                >
                  Available Requests ({availableRequests.length})
                </button>
                <button
                  onClick={() => setActiveTab('mybids')}
                  className={`${activeTab === 'mybids' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 sm:py-3 sm:px-2 border-b-2 font-medium text-xs sm:text-sm`}
                >
                  My Bids ({myBids.length})
                </button>
                <button
                  onClick={() => setActiveTab('myinterests')}
                  className={`${activeTab === 'myinterests' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 sm:py-3 sm:px-2 border-b-2 font-medium text-xs sm:text-sm`}
                >
                  My Interests ({myInterests.length})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('chat');
                    fetchChatRooms();
                  }}
                  className={`${activeTab === 'chat' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 sm:py-3 sm:px-2 border-b-2 font-medium text-xs sm:text-sm`}
                >
                  Messages ({chatRooms.filter(r => (r.unreadCount ?? 0) > 0).length})
                </button>
               
              </nav>
            </div>

            {(loading || isLoading) ? (
              <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {activeTab === 'available' && (
                  <div className="space-y-3 sm:space-y-4">
                    <LocationControls
                      useLocationFilter={useLocationFilter}
                      enableLocationFilter={enableLocationFilter}
                      disableLocationFilter={disableLocationFilter}
                      locationError={locationError}
                      userLocation={userLocation}
                      searchRadius={searchRadius}
                      setSearchRadius={setSearchRadius}
                      isLocationLoading={isLocationLoading}
                      refreshWithLocation={refreshWithLocation}
                      fetchAvailableRequests={fetchAvailableRequests}
                    />
                    {availableRequests.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
                        <ClockIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                        <h3 className="mt-2 text-sm sm:text-base md:text-lg font-medium text-gray-900">
                          No available requests
                        </h3>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500">
                          Check back later for new service requests.
                        </p>
                      </div>
                    ) : (
                      availableRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-lg shadow p-4 mb-4">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {request.serviceName || 'Service Request'}
                              </h3>

                              <p className="text-gray-600 mb-3">{request.description}</p>

                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center">
                                  <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>
                                       Budget: KSh {request.budget?.toLocaleString() || request.desired_price?.toLocaleString() || 'Negotiable'}
                                  </span>
                                </div>

                                <div className="flex items-center">
                                  <MapPinIcon className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>Location: {formatLocation(request.location)}</span>
                                </div>

                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                                  <span title={formatDate(request.createdAt)}>
                                    {formatRelativeTime(request.createdAt)}
                                  </span>
                                </div>

                                {request.deadline && (
                                  <div className="flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                                    <span title={formatDate(request.deadline)}>
                                      Deadline: {formatRelativeTime(request.deadline)}
                                      {new Date(request.deadline) < new Date() && (
                                        <span className="ml-1 text-red-600 text-xs">(Expired)</span>
                                      )}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center">
                                  <TagIcon className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>Status: {request.status || 'Open'}</span>
                                </div>
                              </div>

                              {request.bids && request.bids.length > 0 && (
                                <div className="mt-3 text-sm text-blue-600">
                                  {request.bids.length} {request.bids.length === 1 ? 'bid' : 'bids'} placed
                                </div>
                              )}
                            </div>

                            {renderRequestActions(request)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'mybids' && (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white p-2 sm:p-3 md:p-4 rounded-lg shadow">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={bidFilters.status}
                            onChange={(e) => setBidFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                          >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sort By</label>
                          <select
                            value={bidFilters.sortBy}
                            onChange={(e) => setBidFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                          >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="price_low">Price: Low to High</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Search</label>
                          <input
                            type="text"
                            placeholder="Search by request title..."
                            value={bidFilters.searchTerm}
                            onChange={(e) => setBidFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-xs sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {filteredAndSortedBids.length === 0 ? (
                        <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
                          <CurrencyDollarIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                          <h3 className="mt-2 text-sm sm:text-base md:text-lg font-medium text-gray-900">No bids found</h3>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500">
                            {bidFilters.status !== 'all' || bidFilters.searchTerm 
                              ? 'Try adjusting your filters.' 
                              : 'Start bidding on available requests to see them here.'}
                          </p>
                        </div>
                      ) : (
                        filteredAndSortedBids.map((bid) => (
                          <div key={bid.id} className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                                  <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">
                                    {bid.request?.title || `Request #${bid.requestId}`}
                                  </h3>
                                  {getBidStatusBadge(bid.status)}
                                </div>
                                
                                {bid.request?.description && (
                                  <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">{bid.request.description}</p>
                                )}
                                
                                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Your message: {bid.message}</p>
                                
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                                  <span className="font-medium text-sm sm:text-base md:text-lg text-gray-900">KSh {bid.price?.toLocaleString()}</span>
                                  <span>•</span>
                                  <span>Submitted: {new Date(bid.createdAt).toLocaleDateString()}</span>
                                  {bid.request?.budget && (
                                    <>
                                      <span>•</span>
                                      <span>Client Budget: KSh {bid.request.budget?.toLocaleString()}</span>
                                    </>
                                  )}
                                </div>

                                {bid.isGraduateOfRequestedCollege && (
                                  <span className="inline-block mt-1 sm:mt-2 px-1.5 py-0.5 text-xxs sm:text-xs rounded-full bg-green-100 text-green-800">
                                    Meets college requirement
                                  </span>
                                )}

                                {bid.request?.client && (
                                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                                    Client: {bid.request.client.name}
                                  </div>
                                )}
                              </div>
                              
                              <div className="w-full sm:w-auto flex flex-wrap sm:flex-col gap-1 sm:gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setSelectedBid(bid);
                                    setShowBidDetailsModal(true);
                                  }}
                                  className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-1 md:px-3 md:py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                  View
                                </button>
                                
                                {bid.canEdit && (
                                  <button
                                    onClick={() => {
                                      setSelectedBid(bid);
                                      setShowEditBidModal(true);
                                    }}
                                    className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-1 md:px-3 md:py-1 border border-indigo-300 rounded-md text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                  >
                                    <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                    Edit
                                  </button>
                                )}
                                
                                {bid.canWithdraw && (
                                  <button
                                    onClick={() => handleWithdrawBid(bid.id)}
                                    className="inline-flex items-center px-2 py-1 sm:px-2 sm:py-1 md:px-3 md:py-1 border border-red-300 rounded-md text-xs sm:text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                                  >
                                    <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
                                    Withdraw
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'myinterests' && (
                  <div className="space-y-4">
                    {myInterests.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg shadow">
                        <HandThumbUpIcon className="mx-auto h-10 w-10 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No interests yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Express interest in requests to see them here.
                        </p>
                      </div>
                    ) : (
                      myInterests.map(interest => (
                        <div key={interest.id} className="bg-white rounded-lg shadow p-4">
                          <h3 className="font-medium">Request ID: {interest.requestId}</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            Expressed on: {new Date(interest.createdAt).toLocaleDateString()}
                          </p>
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => withdrawInterest(interest.id)}
                              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              Withdraw Interest
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

         

                {activeTab === 'chat' && (
                  <div className="space-y-4">
                    {chatRooms.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg shadow">
                        <div className="text-gray-400 text-lg mb-2">💬</div>
                        <h3 className="text-lg font-medium text-gray-900">No conversations yet</h3>
                        <p className="text-sm text-gray-500">
                          Chat rooms will appear here when clients contact you about your bids or services.
                        </p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {chatRooms.map(room => {
                          const isProvider = room.providerId === user?.userId;
                          const otherParty = isProvider ? room.client : room.provider;
                          const isInterestRoom = room.fromInterest;
                          
                          return (
                            <div 
                              key={room.id}
                              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => navigate(`/chat/${room.id}`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      {getAvatarUrl(otherParty) ? (
                                        <img 
                                          src={getAvatarUrl(otherParty)} 
                                          alt={getDisplayName(otherParty)}
                                          className="w-10 h-10 rounded-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-sm font-medium text-gray-600">
                                          {getDisplayName(otherParty)?.charAt(0) || '?'}
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      <h3 className="font-medium text-gray-900">
                                        {getDisplayName(otherParty) || 'Client'}
                                        {isInterestRoom && (
                                          <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                                            From Interest
                                          </span>
                                        )}
                                      </h3>
                                      <p className="text-sm text-gray-500">
                                        {room.request?.productName || `Request #${room.requestId}`}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {room.lastMessage && (
                                    <div className="text-sm text-gray-600">
                                      <p className="truncate">
                                        {room.lastMessage.content}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {new Date(room.lastMessage.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="text-right">
                                  {(room.unreadCount ?? 0) > 0 && (
                                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-white bg-red-500 rounded-full">
                                      {room.unreadCount}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {selectedRequest && (
        <NewBidModal
          isOpen={showNewBidModal}
          onClose={() => {
            setShowNewBidModal(false);
            setSelectedRequest(null);
          }}
          providerId={providerId}
          requestId={selectedRequest.id}
          onBidCreated={handleBidCreated}
        />
      )}

      {selectedBid && showBidDetailsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-2 sm:p-4">
          <div className="relative top-2 sm:top-4 md:top-10 lg:top-20 mx-auto p-3 sm:p-4 md:p-5 border w-full sm:w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Bid Details</h3>
              <button
                onClick={() => setShowBidDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Request Information</h4>
                <div className="mt-2 bg-gray-50 p-3 rounded">
                  <p className="font-medium">{selectedBid.request?.title}</p>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">{selectedBid.request?.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                    <span>Budget: KSh {selectedBid.request?.budget?.toLocaleString()}</span>
                    <span>•</span>
                    <span>Category: {selectedBid.request?.category}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Your Bid</h4>
                <div className="mt-2 bg-blue-50 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm sm:text-base md:text-lg">KSh {selectedBid.price?.toLocaleString()}</span>
                    {getBidStatusBadge(selectedBid.status)}
                  </div>
                  <p className="text-gray-700 text-xs sm:text-sm">{selectedBid.message}</p>
                  <p className="text-xxs sm:text-xs text-gray-500 mt-1 sm:mt-2">
                    Submitted: {new Date(selectedBid.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {selectedBid.request?.client && (
                <div>
                  <h4 className="font-medium text-gray-900">Client Information</h4>
                  <div className="mt-2 bg-gray-50 p-3 rounded">
                    <p className="font-medium">{selectedBid.request.client.name}</p>
                    <p className="text-gray-600 text-xs sm:text-sm">{selectedBid.request.client.email}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 sm:space-x-3 mt-4 sm:mt-6">
              {selectedBid.canEdit && (
                <button
                  onClick={() => {
                    setShowBidDetailsModal(false);
                    setShowEditBidModal(true);
                  }}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs sm:text-sm"
                >
                  Edit Bid
                </button>
              )}
              <button
                onClick={() => setShowBidDetailsModal(false)}
                className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-xs sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBid && showEditBidModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
          <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full sm:w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Bid</h3>
              <button
                onClick={() => {
                  setShowEditBidModal(false);
                  setSelectedBid(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (selectedBid) {
                handleEditBid(
                  selectedBid.id, 
                  selectedBid.price, 
                  selectedBid.message || ''
                );
              }
            }} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Price (KSh)
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={selectedBid.price || 0}
                  onChange={(e) => setSelectedBid(prev => prev ? {
                    ...prev,
                    price: parseInt(e.target.value) || 0
                  } : null)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                {selectedBid.request?.budget && (
                  <p className="text-sm text-gray-500 mt-1">
                    Client's budget: KSh {selectedBid.request.budget.toLocaleString()}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Client
                </label>
                <textarea
                  value={selectedBid.message || ''}
                  onChange={(e) => setSelectedBid(prev => prev ? {
                    ...prev,
                    message: e.target.value
                  } : null)}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Describe your qualifications and approach..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBidModal(false);
                    setSelectedBid(null);
                  }}
                  className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BidCard({ bid, onEdit, onWithdraw, onView }: { 
  bid: Bid | ExtendedBid;
  onEdit?: () => void;
  onWithdraw?: () => void;
  onView?: () => void;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Bid on Request #{bid.requestId}</h3>
          <p className="text-gray-600">Your price: KSh {bid.price?.toLocaleString()}</p>
          {bid.message && (
            <p className="text-gray-600 mt-2">Your message: {bid.message}</p>
          )}
          {('isGraduateOfRequestedCollege' in bid && bid.isGraduateOfRequestedCollege) && (
            <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              Meets college requirement
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            {new Date(bid.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="mt-4 flex space-x-2">
        {onView && (
          <button
            onClick={onView}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            View Details
          </button>
        )}
        {onEdit && ('canEdit' in bid && bid.canEdit) && (
          <button
            onClick={onEdit}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Edit Bid
          </button>
        )}
        {onWithdraw && ('canWithdraw' in bid && bid.canWithdraw) && (
          <button
            onClick={onWithdraw}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Withdraw
          </button>
        )}
      </div>
    </div>
  );
}