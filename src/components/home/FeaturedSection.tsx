import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock, Package, ShoppingBag, Loader, AlertCircle, Wrench } from 'lucide-react';

interface ServiceItem {
  id: string | number;
  name: string;
  title?: string;
  description: string;
  provider: string;
  location: string;
  rating: number;
  reviews: number;
  price: string | number;
  image?: string;
  images?: string[];
  category: string;
  duration?: string;
  availability?: string;
}

interface ProductItem {
  id: string | number;
  name: string;
  title?: string;
  description: string;
  seller: string;
  location: string;
  price: string | number;
  originalPrice?: string | number;
  image?: string;
  images?: string[];
  category: string;
  rating: number;
  reviews: number;
  discount?: number;
  isNew?: boolean;
}

export const FeaturedSection = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [servicesRes, productsRes] = await Promise.allSettled([
          fetch('https://mkt-backend-sz2s.onrender.com/api/services'),
          fetch('https://mkt-backend-sz2s.onrender.com/api/products')
        ]);

        // Handle services
        if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
          const servicesData = await servicesRes.value.json();
          const servicesList = Array.isArray(servicesData) ? servicesData : servicesData?.data || [];
          
          const formattedServices = servicesList.slice(0, 8).map((service: any) => ({
            id: service.id || service._id || Math.random().toString(36).substr(2, 9),
            name: service.name || service.title || 'Service',
            description: service.description || 'Professional service available',
            provider: service.provider || service.user?.name || service.company || 'Verified Provider',
            location: service.location || 'Nairobi, Kenya',
            rating: service.rating || (4 + Math.random() * 0.9),
            reviews: service.reviews || Math.floor(Math.random() * 50) + 5,
            price: service.price || 'Contact for pricing',
            image: service.image || service.images?.[0],
            category: service.category || 'General',
            duration: service.duration || service.estimatedTime || 'Varies',
            availability: service.availability || 'Available'
          }));
          
          setServices(formattedServices);
        }

        // Handle products
        if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
          const productsData = await productsRes.value.json();
          const productsList = Array.isArray(productsData) ? productsData : productsData?.data || [];
          
          const formattedProducts = productsList.slice(0, 8).map((product: any) => ({
            id: product.id || product._id || Math.random().toString(36).substr(2, 9),
            name: product.name || product.title || 'Product',
            description: product.description || 'Quality product available',
            seller: product.seller || product.user?.name || product.company || 'Verified Seller',
            location: product.location || product.seller?.location || 'Nairobi, Kenya',
            price: product.price || 0,
            originalPrice: product.originalPrice || product.msrp,
            image: product.image || product.images?.[0],
            category: product.category || 'General',
            rating: product.rating || (4 + Math.random() * 0.9),
            reviews: product.reviews || Math.floor(Math.random() * 50) + 5,
            discount: product.discount || (product.originalPrice && product.price ? 
              Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0),
            isNew: product.isNew || Math.random() > 0.7
          }));
          
          setProducts(formattedProducts);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (price: string | number): string => {
    if (typeof price === 'string' && isNaN(Number(price))) {
      return price; // Return as-is if it's a string like "Contact for pricing"
    }
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice) || numericPrice === 0) {
      return 'Contact for price';
    }
    
    return `KSh ${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'web': '💻', 'tech': '💻', 'development': '💻',
      'cleaning': '🧹', 'housekeeping': '🧹',
      'tutoring': '📚', 'education': '📚', 'teaching': '📚',
      'photography': '📸', 'photo': '📸',
      'landscaping': '🌿', 'gardening': '🌿',
      'pet': '🐕', 'animal': '🐕',
      'electronics': '⚡', 'gadgets': '⚡',
      'crafts': '🎨', 'art': '🎨', 'handmade': '🎨',
      'decor': '🏺', 'home': '🏺',
      'fashion': '👕', 'clothing': '👕',
      'books': '📖', 'literature': '📖',
      'sports': '⚽', 'fitness': '⚽',
      'beauty': '💄', 'cosmetics': '💄',
      'food': '🍕', 'restaurant': '🍕',
      'automotive': '🚗', 'car': '🚗',
      'health': '🏥', 'medical': '🏥'
    };

    const lowerCategory = category.toLowerCase();
    for (const key in icons) {
      if (lowerCategory.includes(key)) {
        return icons[key];
      }
    }
    return '🛍️';
  };

  const handleAction = (type: 'service' | 'product', action: 'book' | 'purchase' | 'details') => {
    const actionText = action === 'book' ? 'book services' : 
                     action === 'purchase' ? 'purchase products' : 'view details';
    alert(`Please register or login to ${actionText}`);
    window.location.href = '/register';
  };

  const renderImage = (item: ServiceItem | ProductItem) => {
    const imageUrl = item.image || (item.images && item.images[0]);
    
    if (imageUrl && imageUrl.trim()) {
      return (
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    }
    
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-6xl">
        {getCategoryIcon(item.category)}
      </div>
    );
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center text-yellow-500 text-sm">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={14}
            className={i < fullStars ? 'fill-current' : 
                      i === fullStars && hasHalfStar ? 'fill-current opacity-50' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const currentItems = activeTab === 'services' ? services : products;

  return (
    <section className="py-12 lg:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Featured Listings</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our top-rated services and products from trusted providers and sellers
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mt-6">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className={`px-6 py-2 font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'services' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`} 
                onClick={() => setActiveTab('services')}
              >
                <Wrench size={16} />
                Services
              </button>
              <button 
                className={`px-6 py-2 font-medium flex items-center gap-2 transition-colors ${
                  activeTab === 'products' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`} 
                onClick={() => setActiveTab('products')}
              >
                <ShoppingBag size={16} />
                Products
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading {activeTab}...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {currentItems.length === 0 ? (
              // Empty State
              <div className="text-center py-16">
                <div className="text-6xl mb-6">
                  {activeTab === 'services' ? '🛠️' : '📦'}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No {activeTab} available yet
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Be the first to {activeTab === 'services' ? 'offer services' : 'list products'} 
                  on our platform and start earning today!
                </p>
                <button 
                  onClick={() => window.location.href = '/register?role=provider'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  {activeTab === 'services' ? 'Become a Service Provider' : 'Start Selling'}
                  <Wrench size={16} />
                </button>
              </div>
            ) : (
              // Items Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-lg group"
                  >
                    {/* Image Section */}
                    <div className="relative overflow-hidden">
                      {renderImage(item)}
                      <div className="hidden w-full h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-6xl">
                        {getCategoryIcon(item.category)}
                      </div>
                      
                      {/* Badges */}
                      <div className="absolute top-2 right-2">
                        {activeTab === 'products' && (item as ProductItem).discount && (item as ProductItem).discount! > 0 && (
                          <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-1">
                            {(item as ProductItem).discount}% OFF
                          </div>
                        )}
                        {activeTab === 'products' && (item as ProductItem).isNew && (
                          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                            New Arrival
                          </div>
                        )}
                        {activeTab === 'services' && (
                          <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                            Featured
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      {activeTab === 'services' ? (
                        // Service Card Content
                        <>
                          <div className="flex items-center mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                              {(item as ServiceItem).provider.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-medium">{(item as ServiceItem).provider}</h4>
                              <div className="flex items-center gap-1">
                                {renderStars(item.rating)}
                                <span className="text-gray-600 ml-1 text-sm">({item.reviews})</span>
                              </div>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold mb-2 line-clamp-2">
                            {item.name}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center text-gray-500 text-sm mb-3">
                            <MapPin size={14} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{item.location}</span>
                            {(item as ServiceItem).duration && (
                              <>
                                <Clock size={14} className="ml-3 mr-1 flex-shrink-0" />
                                <span>{(item as ServiceItem).duration}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-blue-600 font-bold">
                              {formatPrice(item.price)}
                            </span>
                            <button 
                              onClick={() => handleAction('service', 'book')}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              Book Now
                            </button>
                          </div>
                        </>
                      ) : (
                        // Product Card Content
                        <>
                          <div className="flex items-center mb-3">
                            <Package size={16} className="text-blue-600 mr-2" />
                            <span className="text-sm text-gray-600 capitalize">{item.category}</span>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs mr-2">
                              {(item as ProductItem).seller.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-600 font-medium">{(item as ProductItem).seller}</span>
                          </div>
                          
                          <h3 className="text-lg font-bold mb-2 line-clamp-2">
                            {item.name}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1">
                              {renderStars(item.rating)}
                              <span className="text-gray-600 ml-1 text-sm">({item.reviews})</span>
                            </div>
                            <div className="flex items-center text-gray-500 text-xs">
                              <MapPin size={12} className="mr-1" />
                              <span className="truncate max-w-20">{item.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              {(item as ProductItem).originalPrice && (item as ProductItem).discount! > 0 && (
                                <span className="text-gray-400 line-through text-sm">
                                  {formatPrice((item as ProductItem).originalPrice!)}
                                </span>
                              )}
                              <span className="text-blue-600 font-bold">
                                {formatPrice(item.price)}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleAction('product', 'purchase')}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center transition-colors"
                            >
                              <ShoppingBag size={14} className="mr-1" />
                              Add to Cart
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Button */}
            {currentItems.length > 0 && (
              <div className="text-center mt-10">
                <button 
                  onClick={() => window.location.href = '/register'}
                  className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 font-medium transition-colors"
                >
                  View All {activeTab === 'services' ? 'Services' : 'Products'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

// Helper function to handle user actions
const handleAction = (type: 'service' | 'product', action: 'book' | 'purchase' | 'details') => {
  const actionText = action === 'book' ? 'book services' : 
                   action === 'purchase' ? 'purchase products' : 'view details';
  alert(`Please register or login to ${actionText}`);
  window.location.href = '/register';
};

// Helper function to render images with fallback
const renderImage = (item: ServiceItem | ProductItem) => {
  const imageUrl = item.image || (item.images && item.images[0]);
  
  if (imageUrl && imageUrl.trim()) {
    return (
      <img
        src={imageUrl}
        alt={item.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) {
            fallback.classList.remove('hidden');
          }
        }}
      />
    );
  }
  
  return null;
};

// Helper function to format prices
const formatPrice = (price: string | number): string => {
  if (typeof price === 'string' && isNaN(Number(price))) {
    return price; // Return as-is if it's a string like "Contact for pricing"
  }
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice) || numericPrice === 0) {
    return 'Contact for price';
  }
  
  return `KSh ${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

// Helper function to get category icons
const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    'web': '💻', 'tech': '💻', 'development': '💻',
    'cleaning': '🧹', 'housekeeping': '🧹',
    'tutoring': '📚', 'education': '📚', 'teaching': '📚',
    'photography': '📸', 'photo': '📸',
    'landscaping': '🌿', 'gardening': '🌿',
    'pet': '🐕', 'animal': '🐕',
    'electronics': '⚡', 'gadgets': '⚡',
    'crafts': '🎨', 'art': '🎨', 'handmade': '🎨',
    'decor': '🏺', 'home': '🏺',
    'fashion': '👕', 'clothing': '👕',
    'books': '📖', 'literature': '📖',
    'sports': '⚽', 'fitness': '⚽',
    'beauty': '💄', 'cosmetics': '💄',
    'food': '🍕', 'restaurant': '🍕',
    'automotive': '🚗', 'car': '🚗',
    'health': '🏥', 'medical': '🏥'
  };

  const lowerCategory = category.toLowerCase();
  for (const key in icons) {
    if (lowerCategory.includes(key)) {
      return icons[key];
    }
  }
  return '🛍️';
};

export default FeaturedSection;