import { useState, useEffect } from 'react';
import api from '../../api/api'; // ✅ Adjust path if needed

import { ClientRequestCard } from '../NewFeature/CllientRequesrCard';
import useWebSocket from '../../hooks/useWebSocket';
import { PlusIcon, BellIcon, ArrowPathIcon} from '@heroicons/react/24/outline';
import { NewRequestModal } from '../NewFeature/NewRequestModal';
import { useAuth } from '../../context/AuthContext';
// const baseURL = import.meta.env.VITE_API_BASE_URL;
export function ClientDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const { user } = useAuth();
 const userId = user?.userId;
  const { lastMessage, notifications, unreadCount } = useWebSocket(userId);
  const [showNotifications, setShowNotifications] = useState(false);
const fetchRequests = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('token');
    
    // Check if token exists
    if (!token) {
      console.error('No token found in localStorage');
      // Redirect to login or handle authentication
      // window.location.href = '/login';
      return;
    }

    // Log token info for debugging
    console.log('Token exists:', !!token);
    console.log('Token length:', token.length);
    
    // Decode and log JWT payload for debugging (without exposing sensitive data)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', {
          role: payload.role,
          exp: payload.exp,
          isExpired: payload.exp ? Date.now() / 1000 > payload.exp : 'No exp field',
          userId: payload.sub?.id || 'No user ID'
        });
        
        // Check if token is expired
        if (payload.exp && Date.now() / 1000 > payload.exp) {
          console.error('Token is expired');
          localStorage.removeItem('token');
          // Redirect to login
          // window.location.href = '/login';
          return;
        }
      } else {
        console.error('Invalid token format - not 3 parts');
      }
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError);
    }

    console.log('Making request to:', `${api.defaults.baseURL || ''}/api/client/requests`);
    
    const response = await api.get(`/api/client/requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log('Request successful:', response.status);
    setRequests(response.data);
    
  }  catch (error) {
  console.error('Error fetching requests:', error);

  if (error instanceof Response) {
    // Error from fetch with a Response object
    const status = error.status;
    console.error('Response status:', status);

    error.headers && console.error('Response headers:', error.headers);

    try {
      const data = await error.json();
      console.error('Response data:', data);
    } catch (jsonErr) {
      console.error('Failed to parse response JSON:', jsonErr);
    }

    switch (status) {
      case 400:
        console.error('Bad Request - Likely invalid token payload');
        break;
      case 401:
        console.error('Unauthorized - Token invalid or expired');
        localStorage.removeItem('token');
        // window.location.href = '/login';
        break;
      case 403:
        console.error('Forbidden - Insufficient permissions');
        break;
      case 404:
        console.error('Not Found - API endpoint may not exist');
        break;
      case 500:
        console.error('Internal Server Error');
        break;
      default:
        console.error('Unexpected error status:', status);
    }
  } else if (error instanceof TypeError) {
    // Likely a network error or request blocked
    console.error('Network or fetch setup error:', error.message);
  } else {
    // Unknown error
    console.error('Unexpected error:', error);
  }

  // Optional: log entire error
  console.error('Complete error object:', error);
} finally {
  setLoading(false);
}

};

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'new_bid') {
        setRequests(prev => prev.map(req => 
          req.id === data.requestId 
            ? { ...req, bids: [...(req.bids || []), data.bid] }
            : req
        ));
      }
    }
  }, [lastMessage]);

  const handleAcceptBid = async (requestId: number, bidId: number) => {
    try {
      await api.post(`/api/client/bids/${bidId}/accept`);
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'closed' } 
            : req
        )
      );
      // Refresh bids for this request
      const response = await api.get(`/api/client/requests/${requestId}/bids`);
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, bids: response.data } 
          : req
      ));
    } catch (error) {
      console.error('Error accepting bid:', error);
      throw error;
    }
  };

  const filteredRequests = requests.filter(request => 
    activeTab === 'active' 
      ? request.status === 'open' || request.status === 'pending'
      : request.status === 'closed' || request.status === 'accepted'
  );

const createNewRequest = async (requestData: any) => {
  try {
    console.log('Submitting requestData:', requestData); // ✅ Add this
    const response = await api.post(`/api/client/requests`, requestData);
    setRequests(prev => [response.data, ...prev]);
    setShowNewRequestModal(false);
  } catch (error: any) {
    console.error('Error creating request:', error);
    console.log('Response data:', error?.response?.data); // ✅ Add this too
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => fetchRequests()}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Refresh requests"
            >
              <ArrowPathIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="relative">
              <button  onClick={() => setShowNotifications(!showNotifications)}className="p-2 rounded-full hover:bg-gray-100">
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
              Active Requests
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`${activeTab === 'completed' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Completed Requests
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
                {filteredRequests.map(request => (
                  <ClientRequestCard 
                    key={request.id} 
                    request={request} 
                    onAcceptBid={handleAcceptBid}
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