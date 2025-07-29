import { useState, useEffect, useCallback } from 'react';
import api from '../../api/api';
import { ClientRequestCard } from '../NewFeature/CllientRequesrCard';
import useWebSocket from '../../hooks/useWebSocket';
import { PlusIcon, BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { NewRequestModal } from '../NewFeature/NewRequestModal';
import { useAuth } from '../../context/AuthContext';
import { Bid } from '../../types/types';
import { Request } from '../../types/types'; 
import { Link } from 'react-router-dom';

export function ClientDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showNotifications, setShowNotifications] = useState(false);

  const { user } = useAuth();
  const userId = user?.userId;

  const { lastMessage, notifications, unreadCount } = useWebSocket(userId);

  const fetchRequests = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Show loading only if not a background refresh
      if (!refreshing) setLoading(true);

      const response = await api.get('/api/client/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && Array.isArray(response.data)) {
        // Ensure each request has bids array and proper status
        const normalizedRequests = response.data.map(request => ({
          ...request,
          bids: Array.isArray(request.bids) ? request.bids : [],
          status: request.status || 'open'
        }));
        setRequests(normalizedRequests);
      } else {
        console.error('Invalid response format');
        setRequests([]);
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
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
      if (data.type === 'new_bid') {
        // Provider submitted a bid to client's request
        setRequests(prev => prev.map(req => 
          req.id === data.requestId ? { 
            ...req, 
            bids: [...(req.bids || []), data.bid],
            status: req.status // Maintain existing status
          } : req
        ));
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
                ...req,
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
                ...req,
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
      // Stringify location for backend
      const requestPayload = {
        ...requestData,
        location: JSON.stringify({
          address: requestData.address,
          lat: requestData.lat,
          lng: requestData.lng
        })
      };

      const response = await api.post('/api/client/requests', requestPayload);
      
      setRequests(prev => [{
        ...response.data,
        bids: [],
        location: requestData.location // Keep object format in frontend
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
      request={{
        ...request,
        createdAt: request.createdAt || new Date().toISOString(),
      }}
      bidsCount={request.bids?.length?.toString() || '0'}
      bids={request.bids || []}
      status={request.status || 'open'}
      onAcceptBid={handleAcceptBid}
      onRejectBid={handleRejectBid}
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