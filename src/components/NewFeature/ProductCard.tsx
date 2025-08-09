import { StarIcon } from '@heroicons/react/24/solid';
import { formatPrice } from '../../utilis/priceFormatter';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: string;
    images: string[];
    provider: {
      firstName?: string; // Make optional
      lastName?: string; // Make optional
      rating: number;
      profileImageUrl?: string;
    };
  };
  onClick: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  // Get initials safely
  const getInitials = () => {
    const firstInitial = product.provider.firstName?.charAt(0) || '';
    const lastInitial = product.provider.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative pb-[75%] bg-gray-100">
        {product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="absolute h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-lg font-semibold text-indigo-600 mb-2">
          {formatPrice(product.price)}
        </p>
        <div className="flex items-center mt-2">
          <div className="flex-shrink-0 mr-2">
            {product.provider.profileImageUrl ? (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={product.provider.profileImageUrl}
                alt={`${product.provider.firstName || ''} ${product.provider.lastName || ''}`}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  {getInitials()}
                </span>
              </div>
            )}
          </div>
          <div className="text-sm">
            <p className="text-gray-900">
              {product.provider.firstName} {product.provider.lastName}
            </p>
            <div className="flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-400" />
              <span className="ml-1 text-gray-600">
                {product.provider.rating?.toFixed(1) || 'New'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};