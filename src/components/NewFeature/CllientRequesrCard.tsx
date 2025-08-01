import { useState, useEffect } from 'react';
import { Request, Bid, ClientRequest } from '../../types/types';
import api from '../../api/api';

interface ClientRequestCardProps {
  request: ClientRequest;
  bidsCount: string;
  bids: Bid[];
  status?: "pending" | "accepted" | "open" | "closed"; // Made optional since we can get it from request
  onAcceptBid: (requestId: number, bidId: number) => Promise<void>;
  onRejectBid?: (requestId: number, bidId: number) => Promise<void>; // Made optional
}

export function ClientRequestCard({
  request,
  bidsCount,
  bids: initialBids,
  status: propStatus,
  onAcceptBid,
  onRejectBid, // Still not used but now optional
}: ClientRequestCardProps) {
  const [showBids, setShowBids] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

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
          <span className="text-sm text-gray-500">{formatDate(request.created_at)}</span>
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
    </div>
  );
}