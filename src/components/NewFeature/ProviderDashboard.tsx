import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Request, Bid, ProviderProfile, ProviderProfileFormData } from '../../types/types';
import { ProviderRequestCard } from './ProvideRequestCard';
import { useAuth } from '../../context/AuthContext';
import { useWebSocketContext } from '../../context/WebSocketContext';
import api from '../../api/api';
import ProfileCompletionModal from '../NewFeature/ProfileCompletionModal';

export default function ProviderDashboard() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'bids'>('requests');
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, logout } = useAuth();
  const { socket } = useWebSocketContext();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);

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

  // Fetch data based on active tab
  useEffect(() => {
    if (!provider?.isProfileComplete) return;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (activeTab === 'requests') {
          const res = await api.get('/api/provider/requests', {
            params: {
              lat: provider?.latitude,
              lng: provider?.longitude,
              range: 50
            }
          });
          setRequests(res.data.filter(isRequestRelevant));
        } else {
          const res = await api.get('/api/provider/bids');
          setBids(res.data);
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, provider?.isProfileComplete]);

  // Handle real-time requests
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
    if (!provider) return false;
    if (request.serviceId === undefined) return false;
    
    return provider.services.some(s => s.id === request.serviceId) &&
           (!request.collegeFilterId || request.collegeFilterId === provider.collegeId);
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
        const requestsRes = await api.get('/api/provider/requests', {
          params: {
            lat: res.data.latitude,
            lng: res.data.longitude,
            range: 50
          }
        });
        setRequests(requestsRes.data.filter(isRequestRelevant));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

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
    <div className="container mx-auto p-6">
      {showProfileModal && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onComplete={handleProfileComplete}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Provider Dashboard</h1>
        <div className="flex items-center space-x-4">
          {provider?.isProfileComplete && (
            <button
              onClick={() => setShowProfileModal(true)}
              className="text-blue-600 hover:text-blue-800 px-4 py-2 rounded hover:bg-blue-50"
            >
              Edit Profile
            </button>
          )}
          <button
            onClick={logout}
            className="text-red-600 hover:text-red-800 px-4 py-2 rounded hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
      
      {!provider?.isProfileComplete ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please complete your profile to start receiving service requests.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex border-b mb-6">
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'requests' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('requests')}
            >
              New Requests
            </button>
            <button
              className={`py-2 px-4 font-medium ${
                activeTab === 'bids' 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('bids')}
            >
              My Bids
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : activeTab === 'requests' ? (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
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
          ) : (
            <div className="space-y-4">
              {bids.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  You haven't placed any bids yet.
                </div>
              ) : (
                bids.map(bid => (
                  <BidCard key={bid.id} bid={bid} />
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

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