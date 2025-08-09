// src/components/ProductDetail.tsx
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api/api';
import { StarIcon } from '@heroicons/react/24/solid';
import { formatPrice } from '../../utilis/priceFormatter';

interface Provider {
  firstName: string;
  lastName: string;
  rating: number;
  profileImageUrl?: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  images: string[];
  provider: Provider;
}

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get<Product>(`/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images.map((image: string, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={image}
                alt={`${product.name} - ${index + 1}`}
                className="w-full h-auto object-cover"
              />
            </div>
          ))}
        </div>
        
        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-indigo-600">
            {formatPrice(product.price)}
          </p>
          <p className="text-gray-700">{product.description}</p>
          
          {/* Provider Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-lg font-medium mb-4">Provider</h2>
            <div className="flex items-center space-x-4">
              {product.provider.profileImageUrl ? (
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src={product.provider.profileImageUrl}
                  alt={`${product.provider.firstName} ${product.provider.lastName}`}
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-sm text-gray-600">
                    {product.provider.firstName?.charAt(0)}{product.provider.lastName?.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium">
                  {product.provider.firstName} {product.provider.lastName}
                </p>
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 text-gray-600">
                    {product.provider.rating?.toFixed(1) || 'New'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};