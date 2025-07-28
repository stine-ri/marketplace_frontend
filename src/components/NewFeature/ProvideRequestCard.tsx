// ProviderRequestCard.tsx
import { useState } from 'react';
import { Request } from '../../types/types';

interface ProviderRequestCardProps {
  request: Request;
  onPlaceBid: (requestId: number, price: number, message: string) => Promise<void>;
}

export function ProviderRequestCard({ request, onPlaceBid }: ProviderRequestCardProps) {
  const [price, setPrice] = useState(request.desiredPrice);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onPlaceBid(request.id, price, message);
      setMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold">
            {request.isService ? 'Service Request' : `Product: ${request.productName || 'Unknown'}`}
          </h2>
          <div className="mt-2 space-y-1">
            <p>
              <span className="font-medium">Client's Price:</span> ${request.desiredPrice.toFixed(2)}
            </p>
            <p>
              <span className="font-medium">Location:</span> {request.location}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Bid Price ($)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="w-full p-2 border rounded"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message to Client
            </label>
            <textarea
              className="w-full p-2 border rounded"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
          </button>
        </div>
      </div>
    </div>
  );
}