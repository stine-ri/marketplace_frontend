import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../../api/api';
import { NewBidModal } from '../NewFeature/NewBidModal';
import ProfileCompletionModal from '../NewFeature/ProfileCompletionModal';
import useWebSocket from '../../hooks/useWebSocket';
import { useWebSocketContext } from '../../context/WebSocketContext';
import { BellIcon, ArrowPathIcon, CurrencyDollarIcon, ClockIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { Request, Bid, ProviderProfile, ProviderProfileFormData } from '../../types/types';
import { ProviderRequestCard } from './ProvideRequestCard';

interface ClientRequest extends Request {
  client?: {
    id: number;
    name: string;
    email: string;
  };
  bids?: Bid[];
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

export function ProviderDashboard() {
  // State from first implementation
  const [availableRequests, setAvailableRequests] = useState<ClientRequest[]>([]);
  const [myBids, setMyBids] = useState<ExtendedBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'mybids' | 'requests'>('available');
  const [showNotifications, setShowNotifications] = useState(false);
  
  // New Bid Modal state
  const [showNewBidModal, setShowNewBidModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);

  // State from second implementation
  const [requests, setRequests] = useState<Request[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);

  // Enhanced bid management state
  const [selectedBid, setSelectedBid] = useState<ExtendedBid | null>(null);
  const [showBidDetailsModal, setShowBidDetailsModal] = useState(false);
  const [showEditBidModal, setShowEditBidModal] = useState(false);
  const [bidFilters, setBidFilters] = useState({
    status: 'all', // all, pending, accepted, rejected, withdrawn
    sortBy: 'newest', // newest, oldest, price_high, price_low
    searchTerm: ''
  });

  const { user, logout } = useAuth();
  const userId = user?.userId;
const providerId = user?.providerId; 
  const { socket } = useWebSocketContext();

  const { lastMessage, notifications, unreadCount } = useWebSocket(userId);

  // Fetch provider profile
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

  // Fetch available client requests
  const fetchAvailableRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await api.get('/api/provider/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data)) {
        setAvailableRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching available requests:', error);
    }
  }, []);

  // Enhanced fetch for provider's bids with detailed information
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
      }
    } catch (error) {
      console.error('Error fetching my bids:', error);
    }
  }, []);

  // Fetch requests for second implementation compatibility
  const fetchRequests = useCallback(async () => {
    if (!provider?.isProfileComplete) return;
    
    try {
      setIsLoading(true);
      const res = await api.get('/api/provider/requests', {
        params: {
          lat: provider?.latitude,
          lng: provider?.longitude,
          range: 50
        }
      });
      setRequests(res.data.filter(isRequestRelevant));
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [provider?.isProfileComplete]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAvailableRequests(), 
        fetchMyBids(), 
        fetchRequests()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchAvailableRequests, fetchMyBids, fetchRequests]);

  // Handle WebSocket updates from first implementation
  useEffect(() => {
    if (!lastMessage) return;

    try {
      const data = JSON.parse(lastMessage.data);
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
    }
  }, [lastMessage]);

  // Handle real-time requests from second implementation
  useEffect(() => {
    if (!socket || !provider?.isProfileComplete) return;

    const handleNewRequest = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'new-request' && isRequestRelevant(message.data)) {
          setRequests(prev => [message.data, ...prev]);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleNewRequest);
    return () => socket.removeEventListener('message', handleNewRequest);
  }, [socket, provider?.isProfileComplete]);

  // Check if request is relevant to provider
  const isRequestRelevant = (request: Request): boolean => {
    if (!provider || !Array.isArray(provider.services)) return false;
    if (request.serviceId === undefined) return false;

    return provider.services.some(s => s.id === request.serviceId) &&
           (!request.collegeFilterId || request.collegeFilterId === provider.collegeId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    switch (activeTab) {
      case 'available':
        await fetchAvailableRequests();
        break;
      case 'mybids':
        await fetchMyBids();
        break;
      case 'requests':
        await fetchRequests();
        break;
    }
    setRefreshing(false);
  };

  const handleBidOnRequest = (request: ClientRequest) => {
    setSelectedRequest(request);
    setShowNewBidModal(true);
  };

  const handleBidCreated = (newBid: Bid) => {
    // Add to my bids
    setMyBids(prev => [{
      ...newBid,
      canEdit: true,
      canWithdraw: true
    } as ExtendedBid, ...prev]);
    
    // Update available requests to show bid was placed
    setAvailableRequests(prev => prev.map(req => 
      req.id === selectedRequest?.id 
        ? { ...req, bids: [...(req.bids || []), newBid] }
        : req
    ));
    
    // Update requests for second implementation
    setRequests(prev => prev.map(req => 
      req.id === selectedRequest?.id ? {...req, hasBid: true} : req
    ));
    
    // Close modal
    setShowNewBidModal(false);
    setSelectedRequest(null);
  };

  // Enhanced bid management functions
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
      
      // Update available requests
      setAvailableRequests(prev => prev.map(req => ({
        ...req,
        bids: req.bids?.filter(bid => bid.id !== bidId) || []
      })));

      // Update requests
      setRequests(prev => prev.map(req => 
        myBids.find(bid => bid.id === bidId && bid.requestId === req.id)
          ? {...req, hasBid: false} 
          : req
      ));
    } catch (error) {
      console.error('Error withdrawing bid:', error);
    }
  };

  const placeBid = async (requestId: number, price: number, message: string) => {
    try {
      const res = await api.post('/api/bids', {
        requestId,
        price,
        message,
        providerCollegeId: provider?.collegeId
      });
      
      setBids(prev => [...prev, res.data]);
      setRequests(prev => prev.map(req => 
        req.id === requestId ? {...req, hasBid: true} : req
      ));
    } catch (error) {
      console.error('Error placing bid:', error);
    }
  };

  const handleProfileComplete = async (formData: ProviderProfileFormData) => {
    try {
      const res = await api.put('/api/provider/profile', formData);
      setProvider(res.data);
      setShowProfileModal(false);
      
      if (res.data.isProfileComplete) {
        await fetchRequests();
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

  // Filter and sort bids
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

  // Redirect if not authenticated as provider
  if (!user || user.role !== 'service_provider') {
    return <Navigate to="/login" replace />;
  }

  // CollegeFilterBadge component
  const CollegeFilterBadge = ({ request }: { request: Request }) => {
    if (!request.collegeFilterId || !provider) return null;
    const meetsRequirement = provider.collegeId === request.collegeFilterId;
    
    return (
      <div className={`mt-2 p-2 rounded text-sm ${
        meetsRequirement ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {meetsRequirement ? '✓ Meets college requirement' : '✗ Doesn\'t meet college requirement'}
      </div>
    );
  };

return (
  <div className="min-h-screen bg-gray-50">
    {/* Profile Completion Modal */}
    {showProfileModal && (
      <ProfileCompletionModal
        isOpen={showProfileModal}
        onComplete={handleProfileComplete}
        onClose={() => setShowProfileModal(false)}
      />
    )}

    {/* Header */}
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Provider Dashboard</h1>
        <div className="flex items-center justify-end sm:justify-normal space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 sm:p-2 rounded-full hover:bg-gray-100"
            title="Refresh"
          >
            <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
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
          
          <button
            onClick={logout}
            className="text-xs sm:text-sm text-red-600 hover:text-red-800 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    {/* Main Content */}
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
          {/* Tabs */}
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
                onClick={() => setActiveTab('requests')}
                className={`${activeTab === 'requests' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 sm:py-3 sm:px-2 border-b-2 font-medium text-xs sm:text-sm`}
              >
                New Requests ({requests.length})
              </button>
            </nav>
          </div>

          {/* Loading State */}
          {(loading || isLoading) ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              {/* Available Requests Tab */}
              {activeTab === 'available' && (
                <div className="space-y-3 sm:space-y-4">
                  {availableRequests.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
                      <ClockIcon className="mx-auto h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                      <h3 className="mt-2 text-sm sm:text-base md:text-lg font-medium text-gray-900">No available requests</h3>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">Check back later for new service requests.</p>
                    </div>
                  ) : (
                    availableRequests.map((request) => (
                      <div key={request.id} className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900">{request.title}</h3>
                            <p className="mt-1 text-xs sm:text-sm text-gray-600">{request.description}</p>
                            <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                              <span>Budget: ${request.budget}</span>
                              <span>•</span>
                              <span>Category: {request.category}</span>
                              <span>•</span>
                              <span>Posted: {new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                            {request.location && (
                              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                Location:{' '}
                                {(() => {
                                  try {
                                    const loc = typeof request.location === 'string'
                                      ? JSON.parse(request.location)
                                      : request.location;

                                    return loc?.address || loc?.name || 'Unknown';
                                  } catch (error) {
                                    return request.location;
                                  }
                                })()}
                              </p>
                            )}
                          </div>
                          <div className="w-full sm:w-auto flex justify-end">
                            {hasAlreadyBid(request.id) ? (
                              <span className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium bg-gray-100 text-gray-800">
                                Already Bid
                              </span>
                            ) : (
                              <button
                                onClick={() => handleBidOnRequest(request)}
                                className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <CurrencyDollarIcon className="-ml-0.5 mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                                Place Bid
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* My Bids Tab with Enhanced Features */}
              {activeTab === 'mybids' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Bid Filters */}
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

                  {/* Bids List */}
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
                                <span className="font-medium text-sm sm:text-base md:text-lg text-gray-900">${bid.price}</span>
                                <span>•</span>
                                <span>Submitted: {new Date(bid.createdAt).toLocaleDateString()}</span>
                                {bid.request?.budget && (
                                  <>
                                    <span>•</span>
                                    <span>Client Budget: ${bid.request.budget}</span>
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

              {/* New Requests Tab */}
              {activeTab === 'requests' && (
                <div className="space-y-3 sm:space-y-4">
                  {requests.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-gray-500 bg-white rounded-lg shadow">
                      No new requests available at the moment.
                    </div>
                  ) : (
                    requests.map(request => (
                      <div key={request.id} className="space-y-2">
                        <ProviderRequestCard 
                          request={request} 
                          onPlaceBid={placeBid} 
                        />
                        <CollegeFilterBadge request={request} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </main>

    {/* New Bid Modal */}
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

    {/* Bid Details Modal */}
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
                  <span>Budget: ${selectedBid.request?.budget}</span>
                  <span>•</span>
                  <span>Category: {selectedBid.request?.category}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">Your Bid</h4>
              <div className="mt-2 bg-blue-50 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm sm:text-base md:text-lg">${selectedBid.price}</span>
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

    {/* Edit Bid Modal */}
    {selectedBid && showEditBidModal && (
      <EditBidModal
        bid={selectedBid}
        isOpen={showEditBidModal}
        onClose={() => {
          setShowEditBidModal(false);
          setSelectedBid(null);
        }}
        onSave={handleEditBid}
      />
    )}
  </div>
);
}

// Enhanced Bid Card Component
function BidCard({ bid }: { bid: Bid }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Bid on Request #{bid.requestId}</h3>
          <p className="text-gray-600">Your price: ${bid.price.toFixed(2)}</p>
          {bid.message && (
            <p className="text-gray-600 mt-2">Your message: {bid.message}</p>
          )}
          {bid.isGraduateOfRequestedCollege && (
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
    </div>
  );
}

// Edit Bid Modal Component
interface EditBidModalProps {
  bid: ExtendedBid;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bidId: number, price: number, message: string) => void;
}

function EditBidModal({ bid, isOpen, onClose, onSave }: EditBidModalProps) {
  const [price, setPrice] = useState(bid.price);
  const [message, setMessage] = useState(bid.message);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(bid.id, price, message ?? 'No message provided');

    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
    <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border w-full sm:w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h3 className="text-lg font-bold text-gray-900">Edit Bid</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
          {bid.request?.budget && (
            <p className="text-sm text-gray-500 mt-1">
              Client's budget: ${bid.request.budget}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message to Client
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Describe your qualifications and approach..."
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2 sm:space-x-3 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 sm:px-4 sm:py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
);
}