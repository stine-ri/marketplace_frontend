import React from 'react';
import { ShoppingBagIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { formatPrice } from '../../utilis/priceFormatter'; 

interface Purchase {
  id: number;
  product: {
    name: string;
    price: string | number;
    image: string;
    provider: string;
  };
  quantity: number;
  totalPrice: string | number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

interface PurchaseHistoryCardProps {
  purchase: Purchase;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};

export function PurchaseHistoryCard({ purchase }: PurchaseHistoryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image */}
          <div className="flex-shrink-0 w-full sm:w-20 lg:w-24 h-48 sm:h-20 lg:h-24 bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={purchase.product.image}
              alt={purchase.product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/default-product.png';
              }}
            />
          </div>

          {/* Purchase Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              {/* Left side - Product info */}
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {purchase.product.name}
                </h3>
                
                {/* Provider info */}
                <div className="flex items-center mt-2 text-sm text-gray-600">
                  <UserIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Provider: {purchase.product.provider}</span>
                </div>

                {/* Quantity and price */}
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                  <span className="text-gray-600">
                    Quantity: <span className="font-medium text-gray-900">{purchase.quantity}</span>
                  </span>
                  <span className="text-gray-600">
                    Unit Price: <span className="font-medium text-gray-900">{formatPrice(purchase.product.price)}</span>
                  </span>
                </div>
              </div>

              {/* Right side - Status and total */}
              <div className="flex flex-col items-start sm:items-end gap-3">
                {/* Status badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[purchase.status]}`}>
                  {statusLabels[purchase.status]}
                </span>

                {/* Total price */}
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(purchase.totalPrice)}</p>
                </div>
              </div>
            </div>

            {/* Purchase date */}
            <div className="flex items-center mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Purchased on {new Date(purchase.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}