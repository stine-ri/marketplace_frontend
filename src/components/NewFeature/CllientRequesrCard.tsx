import { useState, useEffect } from 'react';
import { Request, Bid, ClientRequest, Interest } from '../../types/types';
import api from '../../api/api';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface ClientRequestCardProps {
  request: ClientRequest;
  bidsCount: string;
  bids: Bid[];
  status?: "pending" | "accepted" | "open" | "closed";
  interests?: Interest[];
  allowBids?: boolean;
  allowInterests?: boolean;
  onAcceptBid: (requestId: number, bidId: number) => Promise<void>;
  onRejectBid?: (requestId: number, bidId: number) => Promise<void>;
  onAcceptInterest?: (requestId: number, interestId: number) => void;
  onRejectInterest?: (requestId: number, interestId: number) => void;
}

export function ClientRequestCard({
  request,
  bidsCount,
  bids: initialBids,
  status: propStatus,
  allowBids,
  allowInterests,
  onAcceptBid,
  onRejectBid,
  onAcceptInterest,
  onRejectInterest,
}: ClientRequestCardProps) {
  const [showBids, setShowBids] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [processingInterests, setProcessingInterests] = useState<Record<number, 'accept' | 'reject' | null>>({});

  // Use propStatus if provided, otherwise fall back to request.status
  const status = propStatus || request.status || 'open';

  useEffect(() => {
    if (initialBids && initialBids.length > 0) {
      setBids(initialBids);
    }
  }, [initialBids]);

  const fetchBids = async () => {
    if (!request.id) return;
    setLoadingBids(true);
    try {
      const response = await api.get(`/api/client/requests/${request.id}/bids`);
      setBids(
        response.data.map((bid: any) => ({
          ...bid,
          status: bid.status || 'pending',
          price: bid.price || 0,
          createdAt: bid.createdAt || new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error('❌ Error fetching bids:', error);
    } finally {
      setLoadingBids(false);
    }
  };

  const toggleBids = () => {
    if (!showBids) fetchBids();
    setShowBids(!showBids);
  };

 const handleAcceptBid = async (bidId: number) => {
    try {
      await onAcceptBid(request.id, bidId);
      await fetchBids();
    } catch (error) {
      console.error('❌ Error accepting bid:', error);
    }
  };
  
const parseLocation = (location: any): { display: string; coords?: { lat: number; lng: number } } => {
    if (!location) return { display: 'Location not specified' };

    try {
      if (typeof location === 'string') {
        if (location.trim() === '{}') return { display: 'Location not specified' };
        try {
          const parsed = JSON.parse(location);
          if (parsed && typeof parsed === 'object') {
            return {
              display: parsed.address || parsed.name || 'Location specified',
              coords: parsed.lat && parsed.lng ? { lat: parsed.lat, lng: parsed.lng } : undefined
            };
          }
        } catch {
          return { display: location };
        }
      }

      if (typeof location === 'object') {
        return {
          display: location.address || location.name || 'Location specified',
          coords: location.lat && location.lng ? { lat: location.lat, lng: location.lng } : undefined
        };
      }

      return { display: 'Location not specified' };
    } catch {
      return { display: 'Location not specified' };
    }
  };

  const { display: locationDisplay, coords: locationCoords } = parseLocation(request.location);

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getRequestTitle = () => {
    if (request.isService) {
      return request.serviceName || 'Service Request';
    }
    return request.productName || 'Product Request';
  };

  const getPrice = () => {
    const price = request.desired_price || request.desiredPrice;
    return price ? `$${Number(price).toFixed(2)}` : 'Price not specified';
  };
const handleImageError = (id: string, fallbackUrl = '/default-avatar.png') => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
    return fallbackUrl;
  };

  const getAvatarUrl = (provider: any) => {
    // Try profileImageUrl first, then user.avatar, then default
    return provider?.profileImageUrl || provider?.user?.avatar || '/default-avatar.png';
  };
const handleAcceptInterest = async (interestId: number) => {
    if (!onAcceptInterest) return;
    
    try {
      setProcessingInterests(prev => ({ ...prev, [interestId]: 'accept' }));
      await onAcceptInterest(request.id, interestId);
    } catch (error) {
      console.error('Error accepting interest:', error);
    } finally {
      setProcessingInterests(prev => ({ ...prev, [interestId]: null }));
    }
  };

  const handleRejectInterest = async (interestId: number) => {
    if (!onRejectInterest) return;
    
    try {
      setProcessingInterests(prev => ({ ...prev, [interestId]: 'reject' }));
      await onRejectInterest(request.id, interestId);
    } catch (error) {
      console.error('Error rejecting interest:', error);
    } finally {
      setProcessingInterests(prev => ({ ...prev, [interestId]: null }));
    }
  }
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold">
            {getRequestTitle()}
          </h2>

          <div className="mt-2 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Status:</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  statusColors[status.toLowerCase() as keyof typeof statusColors] || 'bg-gray-100'
                }`}
              >
                {status}
              </span>
            </div>

            <p className="flex flex-wrap items-center gap-2">
              <span className="font-medium">Price:</span> 
              <span>{getPrice()}</span>
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="font-medium">Location:</span>
              <div>
                <p>{locationDisplay}</p>
                {locationCoords && (
                  <button
                    onClick={() => setMapVisible(!mapVisible)}
                    className="text-blue-600 text-sm mt-1 hover:underline"
                  >
                    {mapVisible ? 'Hide map' : 'View map'}
                  </button>
                )}
              </div>
            </div>

            {mapVisible && locationCoords && (
              <div className="mt-2 bg-gray-100 p-2 rounded">
                <div className="h-40 bg-blue-50 flex items-center justify-center text-gray-500">
                  Map View: {locationCoords.lat.toFixed(4)}, {locationCoords.lng.toFixed(4)}
                </div>
              </div>
            )}

            {request.description && (
              <div className="mt-2">
                <p className="font-medium">Description:</p>
                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{request.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="text-sm text-gray-500">{formatDate(request.createdAt)}</span>
          <button
            onClick={toggleBids}
            disabled={loadingBids}
            className={`px-3 py-1 rounded text-sm ${
              loadingBids ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {showBids ? 'Hide Bids' : 'View Bids'} ({bidsCount})
          </button>
        </div>
      </div>

      {showBids && (
        <div className="mt-4 pt-4 border-t">
          {loadingBids ? (
            <div className="flex justify-center py-2">
              <span className="animate-pulse">Loading bids...</span>
            </div>
          ) : bids.length === 0 ? (
            <div className="text-center py-2 text-gray-500">No bids received yet</div>
          ) : (
            <div className="grid gap-3">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`p-3 rounded-lg ${
                    bid.status === 'accepted'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold">${bid.price.toFixed(2)}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        From: {bid.provider?.firstName} {bid.provider?.lastName}
                      </p>
                      {bid.message && <p className="mt-2 text-sm whitespace-pre-wrap">{bid.message}</p>}
                      {bid.isGraduateOfRequestedCollege && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Graduate of requested college
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(bid.createdAt).toLocaleTimeString()}
                      </span>
                      {bid.status === 'pending' && status === 'open' && (
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Accept Bid
                        </button>
                      )}
                      {bid.status === 'accepted' && (
                        <div className="text-sm text-green-600 font-medium">✓ Accepted</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Interests section */}
 {request.interests && request.interests.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Expressed Interests ({request.interests.length})
          </h3>
          <div className="space-y-3">
            {request.interests.map(interest => {
              const provider = interest.provider;
              const user = provider?.user;
              const providerId = provider?.id || interest.id;
              
              const providerName = user?.fullName || 
                                `${provider?.firstName || ''} ${provider?.lastName || ''}`.trim() || 
                                'Provider';

              const avatarUrl = getAvatarUrl(provider);
              const imageFailed = failedImages[providerId];
              const isProcessing = processingInterests[interest.id];
              const isAccepted = interest.status === 'accepted';
              const isRejected = interest.status === 'rejected';

              return (
                <div 
                  key={interest.id} 
                  className={`flex items-start justify-between p-3 rounded ${
                    isProcessing ? 'bg-gray-100 opacity-75' : 
                    isAccepted ? 'bg-green-50' : 
                    isRejected ? 'bg-gray-100' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={imageFailed ? '/default-avatar.png' : avatarUrl}
                        alt={providerName}
                        onError={() => handleImageError(providerId.toString())}
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {providerName}
                      </p>
                      <p className="text-xs text-gray-500">
                        Expressed on: {format(new Date(interest.createdAt), 'MMM dd, yyyy h:mm a')}
                      </p>
                      {isAccepted && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Accepted - You can chat with this provider
                        </p>
                      )}
                      {isRejected && (
                        <p className="text-xs text-gray-500 mt-1">
                          ✗ Rejected
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {request.status === 'open' && !isAccepted && !isRejected && (
  <div className="flex space-x-2">
    <button
      onClick={() => handleAcceptInterest(interest.id)}
      disabled={isProcessing === 'accept'}
      className={`
        inline-flex items-center px-3 py-1.5 border border-transparent 
        text-xs font-medium rounded-md shadow-sm 
        ${isProcessing === 'accept' 
          ? 'bg-green-400 cursor-not-allowed' 
          : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
        }
        text-white
      `}
    >
      {isProcessing === 'accept' ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Accepting...
        </>
      ) : 'Accept'}
    </button>
    
    <button
      onClick={() => handleRejectInterest(interest.id)}
      disabled={isProcessing === 'reject'}
      className={`
        inline-flex items-center px-3 py-1.5 border border-gray-300 
        text-xs font-medium rounded-md shadow-sm 
        ${isProcessing === 'reject' 
          ? 'bg-gray-200 cursor-not-allowed' 
          : 'bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        }
        text-gray-700
      `}
    >
      {isProcessing === 'reject' ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Rejecting...
        </>
      ) : 'Reject'}
    </button>
  </div>
)}
                  
                  {isAccepted && interest.chatRoomId && (
  <Link
    to={`/chat/${interest.chatRoomId}`}
    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    Chat Now
  </Link>
)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}