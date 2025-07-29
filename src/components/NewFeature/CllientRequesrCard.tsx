import { useState, useEffect } from 'react';
import { getLocationString, parseLocation } from '../../utilis/location';
import { Request, Bid } from '../../types/types';
import api from '../../api/api';

interface ClientRequestCardProps {
  request: Request;
  bidsCount: string;
  bids: Bid[];
  status: string;
  onAcceptBid: (requestId: number, bidId: number) => Promise<void>;
  onRejectBid: (requestId: number, bidId: number) => Promise<void>;
}

export function ClientRequestCard({
  request,
  bidsCount,
  bids: initialBids,
  status,
  onAcceptBid,
  onRejectBid,
}: ClientRequestCardProps) {
  const [showBids, setShowBids] = useState(false);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

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

  const location = parseLocation(request.location);
  const locationString = getLocationString(request.location);

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">
            {request.isService
              ? `Service Request: ${request.serviceId ? `#${request.serviceId}` : ''}`
              : `Product: ${request.productName || 'Unspecified'}`}
          </h2>

          <div className="mt-2 space-y-2">
            <div>
              <span className="font-medium">Status:</span>
              <span
                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  statusColors[request.status.toLowerCase() as keyof typeof statusColors] || 'bg-gray-100'
                }`}
              >
                {request.status}
              </span>
            </div>

            <p>
              <span className="font-medium">Price:</span> ${Number(request.desiredPrice || 0).toFixed(2)}
            </p>

            <div className="flex items-start">
              <span className="font-medium">Location:</span>
              <div className="ml-2">
                <p>{locationString}</p>
                {location && (
                  <button
                    onClick={() => setMapVisible(!mapVisible)}
                    className="text-blue-600 text-sm mt-1 hover:underline"
                  >
                    {mapVisible ? 'Hide map' : 'View map'}
                  </button>
                )}
              </div>
            </div>

            {mapVisible && location && (
              <div className="mt-2 bg-gray-100 p-2 rounded">
                <div className="h-40 bg-blue-50 flex items-center justify-center text-gray-500">
                  Map View: {location.lat}, {location.lng}
                </div>
              </div>
            )}

            {request.collegeFilterId && (
              <p>
                <span className="font-medium">College:</span>{' '}
                {request.college?.name || `ID: ${request.collegeFilterId}`}
              </p>
            )}

            {request.description && (
              <div className="mt-2">
                <p className="font-medium">Description:</p>
                <p className="text-gray-700 mt-1">{request.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-right ml-4">
          <span className="text-sm text-gray-500">{formatDate(request.createdAt)}</span>
          <button
            onClick={toggleBids}
            disabled={loadingBids}
            className={`mt-2 px-3 py-1 rounded text-sm ${
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
            <div className="space-y-3">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`p-3 rounded-lg ${
                    bid.status === 'accepted'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">${bid.price.toFixed(2)}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        From: {bid.provider?.firstName} {bid.provider?.lastName}
                      </p>
                      {bid.message && <p className="mt-2 text-sm">{bid.message}</p>}
                      {bid.isGraduateOfRequestedCollege && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Graduate of requested college
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {new Date(bid.createdAt).toLocaleTimeString()}
                      </span>
                      {bid.status === 'pending' && request.status === 'open' && (
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Accept Bid
                        </button>
                      )}
                      {bid.status === 'accepted' && (
                        <div className="mt-2 text-sm text-green-600 font-medium">✓ Accepted</div>
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
