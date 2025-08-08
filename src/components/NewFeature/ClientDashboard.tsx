import { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { acceptInterest, rejectInterest,getRequestInterests  } from '../../api/api'; // Adjust the path accordingly
import { ClientRequestCard } from '../NewFeature/CllientRequesrCard';
import useWebSocket from '../../hooks/useWebSocket';
import { PlusIcon, BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { NewRequestModal } from '../NewFeature/NewRequestModal';
import { useAuth } from '../../context/AuthContext';
import { Bid } from '../../types/types';
import { Request } from '../../types/types'; 
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { parseLocation } from '../../utilis/location';
export function ClientDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showNotifications, setShowNotifications] = useState(false);
const [processingInterests, setProcessingInterests] = useState<Record<number, 'accept' | 'reject' | null>>({});

  const { user } = useAuth();
  const userId = user?.userId;

  const { lastMessage, notifications, unreadCount } = useWebSocket();
const navigate = useNavigate();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';



const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 404) {
      // Special handling for chat rooms
      if (url.includes('/api/chat/')) {
        const parts = url.split('/');
        const chatRoomId = parts[parts.length - 1];

        // Attempt to create the chat room if it doesn't exist
        if (confirm('Chat room not found. Would you like to create it?')) {
          const createResponse: Response = await fetchWithAuth('/api/chat/from-interest', {
            method: 'POST',
            body: JSON.stringify({ interestId: chatRoomId })
          });
          return createResponse;
        }
      }
      throw new Error('The requested resource was not found');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};




const fetchRequests = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!refreshing) setLoading(true);

    const response = await api.get('/api/client/requests', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        include: 'interests'
      }
    });

    if (response.data) {
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';
      
      const normalizedRequests = response.data.map((request: Request) => {
        return {
          ...request,
          interests: (request.interests || []).map(interest => ({
            ...interest,
            provider: interest.provider ? {
              ...interest.provider,
              // Handle both possible avatar locations
              profileImageUrl: interest.provider.profileImageUrl 
                ? interest.provider.profileImageUrl.startsWith('http')
                  ? interest.provider.profileImageUrl
                  : `${baseURL}${interest.provider.profileImageUrl}`
                : '/default-profile.png',
              user: interest.provider.user ? {
                ...interest.provider.user,
                avatar: interest.provider.user.avatar 
                  ? interest.provider.user.avatar.startsWith('http')
                    ? interest.provider.user.avatar
                    : `${baseURL}${interest.provider.user.avatar}`
                  : '/default-avatar.png'
              } : null
            } : null
          }))
        };
      });

      setRequests(normalizedRequests);
    }
  } catch (error) {
    console.error('Fetch error:', error);
    toast.error('Failed to load requests');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [refreshing]);

  // Initial load and refresh
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Handle WebSocket updates for new bids from providers
useEffect(() => {
  if (!lastMessage) return;

  try {
    const data = JSON.parse(lastMessage.data);
    console.log('WebSocket message:', data); // Debug log
    
    if (data.type === 'new_interest') {
      console.log('Processing new interest:', data); // Debug log
      setRequests(prev => prev.map(req =>
        req.id === data.requestId
          ? {
              ...req,
              interests: [
                ...(req.interests || []),
                {
                  id: data.interest.id,
                  requestId: data.requestId,
                  providerId: data.interest.providerId,
                  message: data.interest.message,
                  status: 'pending',
                  provider: data.provider,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            }
          : req
      ));
      toast.info(`New interest from ${data.provider.user?.fullName || 'a provider'}`);
    }
  } catch (error) {
    console.error('WebSocket error:', error);
  }
}, [lastMessage]);
  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAcceptBid = async (requestId: number, bidId: number) => {
    try {
      await api.post(`/api/client/bids/${bidId}/accept`);

      // Update the request status and bids
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req, // Preserve all original request data
                status: 'closed',
                bids: req.bids?.map((bid: Bid) =>
                  bid.id === bidId
                    ? { ...bid, status: 'accepted' }
                    : bid
                ) || []
              }
            : req
        )
      );
    } catch (error) {
      console.error('Error accepting bid:', error);
    }
  };

  const handleRejectBid = async (requestId: number, bidId: number) => {
    try {
      await api.post(`/api/client/bids/${bidId}/reject`);

      // Update the bid status to rejected
      setRequests(prev =>
        prev.map(req =>
          req.id === requestId
            ? {
                ...req, // Preserve all original request data
                bids: req.bids?.map((bid: Bid) =>
                  bid.id === bidId
                    ? { ...bid, status: 'rejected' }
                    : bid
                ) || []
              }
            : req
        )
      );
    } catch (error) {
      console.error('Error rejecting bid:', error);
    }
  };

  const createNewRequest = async (requestData: any) => {
    try {
      // Prepare request data exactly as user entered it
      const requestPayload = {
        ...requestData,
        // Only stringify location for backend if it's an object
        location: typeof requestData.location === 'object' 
          ? JSON.stringify(requestData.location)
          : requestData.location
      };

      const response = await api.post('/api/client/requests', requestPayload);
      
      // Add new request to the list, preserving all original data
      setRequests(prev => [{
        ...response.data,
        bids: [],
        // Keep location in its original format for frontend display
        location: requestData.location,
        createdAt: response.data.createdAt || new Date().toISOString()
      }, ...prev]);
      
      setShowNewRequestModal(false);
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const filteredRequests = requests.filter(request =>
    activeTab === 'active'
      ? request.status === 'open' || request.status === 'pending'
      : request.status === 'closed' || request.status === 'accepted'
  );
// Add interest handling functions

const handleAcceptInterest = async (requestId: number, interestId: number) => {
  try {
    setProcessingInterests(prev => ({ ...prev, [interestId]: 'accept' }));
    
    // 1. Accept the interest and create chat room in one call
    const response = await api.post(`/api/interests/${interestId}/accept`);
    
    console.log('Backend response:', response.data); // Add this for debugging
    
    // The backend returns the full chat room object with 'id', not 'chatRoomId'
    if (!response.data?.id) {
      throw new Error('Chat room creation failed');
    }
    
    const chatRoomId = response.data.id; // Extract the ID
  
    
    // Skip verification for now since /api/chat/{id}/verify might not exist
    // await verifyChatRoom(chatRoomId);
    
    // 3. Update UI state
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              interests: req.interests?.map(interest =>
                interest.id === interestId
                  ? {
                      ...interest,
                      status: 'accepted',
                      chatRoomId: chatRoomId
                    }
                  : interest
              ) || []
            }
          : req
      )
    );
    
    // 4. Navigate to chat
    navigate(`/api/chat/chats/${chatRoomId}`);
    
  } catch (error) {
    console.error('Error accepting interest:', error);
    if (error instanceof Error) {
      toast.error(
        <div>
          Failed to accept interest: {error.message}
          <button
            onClick={() => handleAcceptInterest(requestId, interestId)}
            className="ml-2 text-blue-500"
          >
            Retry
          </button>
        </div>
      );
    } else {
      toast.error(
        <div>
          Failed to accept interest
          <button
            onClick={() => handleAcceptInterest(requestId, interestId)}
            className="ml-2 text-blue-500"
          >
            Retry
          </button>
        </div>
      );
    }
  } finally {
    setProcessingInterests(prev => ({ ...prev, [interestId]: null }));
  }
};


const handleRejectInterest = async (requestId: number, interestId: number) => {
  try {
    await rejectInterest(interestId);
    
    setRequests(prev =>
      prev.map(req =>
        req.id === requestId
          ? {
              ...req,
              interests: req.interests?.map(interest =>
                interest.id === interestId
                  ? { ...interest, status: 'rejected' }
                  : interest
              ) || []
            }
          : req
      )
    );
    
    toast.success("Interest rejected successfully!");
    return Promise.resolve();
  } catch (error) {
    console.error('Error rejecting interest:', error);
    toast.error("Failed to reject interest");
    return Promise.reject(error);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Service Requests</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Refresh requests"
            >
              <ArrowPathIcon className={`h-5 w-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <BellIcon className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg overflow-hidden z-10">
                  <div className="py-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-700">No notifications</div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-2 text-sm ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Request
            </button>
          </div>
        </div>
       
        <Link 
          to="/providers"
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Find Providers
        </Link>
        <Link 
  to="/chat"
  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
>
  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
  Messages
</Link>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`${activeTab === 'active' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Active Requests ({filteredRequests.filter(r => r.status === 'open' || r.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${activeTab === 'completed' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Completed Requests ({filteredRequests.filter(r => r.status === 'closed' || r.status === 'accepted').length})
            </button>
          </nav>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No {activeTab === 'active' ? 'active' : 'completed'} requests
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'active' 
                    ? 'Get started by creating a new service request.'
                    : 'Your completed requests will appear here.'}
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowNewRequestModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    New Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request, index) => (
                  <ClientRequestCard
                    key={request.id || `request-${index}`}
                    request={request} // Pass the complete request object without modifications
                    bidsCount={request.bids?.length?.toString() || '0'}
                    bids={request.bids || []}
                    interests={request.interests || []} 
                    status={request.status || 'open'}
                    onAcceptBid={handleAcceptBid}
                    onRejectBid={handleRejectBid}
                    onAcceptInterest={handleAcceptInterest}
                    onRejectInterest={handleRejectInterest}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* New Request Modal */}
      <NewRequestModal
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
        onSubmit={createNewRequest}
      />
    </div>
  );
}