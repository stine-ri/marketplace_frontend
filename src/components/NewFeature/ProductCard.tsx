import React from 'react';
import { StarIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { formatPrice } from '../../utilis/priceFormatter';
import { Product } from '../../types/types'; 
interface ProductCardProps {
  product: Product;
  onViewDetails: (product: any) => void;  // New prop for view details
  onPurchase: (product: any) => void;     // New prop for purchase
  showPurchaseButton?: boolean;
}

export const ProductCard = ({ 
  product, 
  onViewDetails,  // Changed from onClick
  onPurchase,     // New prop
  showPurchaseButton = false 
}: ProductCardProps) => {
  // Provide default value of 0 if rating is undefined/null
  const rating = product.provider.rating || 0;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const firstImage = product.images?.[0] || '';

  const getInitials = () => {
    const firstInitial = product.provider.firstName?.charAt(0) || '';
    const lastInitial = product.provider.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onViewDetails(product);
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPurchase(product);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.png';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
        
        {/* Stock badge */}
        {product.stock !== undefined && (
          <div className="absolute top-2 left-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              product.stock > 10 
                ? 'bg-green-100 text-green-800' 
                : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
            }`}>
              {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
            </span>
          </div>
        )}

        {/* Price badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="min-h-0 flex-1">
          {/* Product name */}
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1 mb-2 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>

          {/* Product description */}
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Provider info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
              {product.provider.profileImageUrl ? (
                <img
                  src={product.provider.profileImageUrl}
                  alt={`${product.provider.firstName} ${product.provider.lastName}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-profile.png';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  {getInitials() ? (
                    <span className="text-xs text-gray-600">
                      {getInitials()}
                    </span>
                  ) : (
                    <UserIcon className="w-4 h-4 text-gray-500" />
                  )}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {product.provider.firstName} {product.provider.lastName}
              </p>
            </div>
          </div>

          {/* Rating */}
          {/* Rating */}
<div className="flex items-center gap-1 mb-4">
  <div className="flex items-center">
    {[...Array(5)].map((_, i) => {
      if (i < fullStars) {
        return (
          <StarIconSolid key={i} className="w-4 h-4 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        return (
          <div key={i} className="relative">
            <StarIcon className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <StarIconSolid className="w-4 h-4 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        return (
          <StarIcon key={i} className="w-4 h-4 text-gray-300" />
        );
      }
    })}
  </div>
  <span className="text-sm text-gray-600 ml-1">
    {rating > 0 ? rating.toFixed(1) : 'New'}
  </span>
</div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            {showPurchaseButton && (
              <button
                onClick={handlePurchaseClick}
                disabled={product.stock === 0}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                {product.stock === 0 ? 'Out of Stock' : 'Purchase'}
              </button>
            )}
            
            <button
              onClick={handleClick}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};