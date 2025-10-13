import React, { useState, useEffect, useCallback } from 'react';
import { Star, MapPin, Package, ShoppingBag, Loader, AlertCircle, Wrench, RefreshCw, Filter, Users, ArrowRight, Phone, MessageCircle } from 'lucide-react';

type Service = { 
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string;
  providerCount?: number;
  minPrice?: number | null;
  avgRating?: number;
  price?: number;
  stock?: number;
  rating?: number;
  seller?: string;
  sellerId?: string;
  location?: string;
  reviews?: number;
  provider?: any;
};

type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  image?: string | null;
  seller: string;
  sellerId?: string;
  location?: string;
  price: number;
  rating?: number;
  reviews?: number;
  provider?: any;
  stock?: number;
  providerCount?: number;
  minPrice?: number | null;
  avgRating?: number;
};

type Category = {
  id: string;
  name: string;
  count?: number;
};

const FeaturedSection = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<{ totalServices: number; totalProducts: number; totalCategories: number }>({ 
    totalServices: 0, 
    totalProducts: 0, 
    totalCategories: 0 
  });

  const BASE_URL = 'https://mkt-backend-sz2s.onrender.com';

  const fetchCategories = useCallback(async () => {
    try {
      const [servicesRes, productsCategoriesRes] = await Promise.allSettled([
        fetch(`${BASE_URL}/api/all/services`),
        fetch(`${BASE_URL}/api/public/categories`)
      ]);

      if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
        const servicesData = await servicesRes.value.json();
        const servicesList = Array.isArray(servicesData) ? servicesData : [];
        
        const serviceCategoriesMap = new Map();
        servicesList.forEach((service) => {
          const categoryName = service.category || 'General';
          if (serviceCategoriesMap.has(categoryName)) {
            serviceCategoriesMap.set(categoryName, serviceCategoriesMap.get(categoryName) + 1);
          } else {
            serviceCategoriesMap.set(categoryName, 1);
          }
        });

        const serviceCategoriesList = Array.from(serviceCategoriesMap.entries()).map(([name, count], index) => ({
          id: `service-${index}`,
          name: name,
          count: count
        }));

        setServiceCategories(serviceCategoriesList);
      }

      if (productsCategoriesRes.status === 'fulfilled' && productsCategoriesRes.value.ok) {
        const productCategoriesData = await productsCategoriesRes.value.json();
        const categoriesList = Array.isArray(productCategoriesData) ? productCategoriesData : productCategoriesData?.data || [];
        
        const formattedProductCategories = categoriesList.map((category: any) => ({
          id: category.id || category._id || category.name || '',
          name: category.name || category.category || 'Unknown Category',
          count: category.count || category.productCount || 0
        }));
        
        setProductCategories(formattedProductCategories);
      }
    } catch (err) {
      // Silent error handling
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let servicesUrl = `${BASE_URL}/api/all/services`;
      let productsUrl = `${BASE_URL}/api/products`;
      
      const selectedCategoryName = selectedCategory === 'all' 
        ? null 
        : (activeTab === 'services' ? serviceCategories : productCategories).find(cat => String(cat.id) === selectedCategory)?.name || selectedCategory;

      if (selectedCategoryName) {
        servicesUrl += `?category=${encodeURIComponent(selectedCategoryName)}`;
        productsUrl += `?category=${encodeURIComponent(selectedCategoryName)}`;
      }

      const [servicesRes, productsRes] = await Promise.allSettled([
        fetch(servicesUrl),
        fetch(productsUrl)
      ]);

      let totalServicesCount = 0;
      let totalProductsCount = 0;

      if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
        const servicesData = await servicesRes.value.json();
        const servicesList = Array.isArray(servicesData) ? servicesData : [];
        
        totalServicesCount = servicesList.length;

        const formattedServices = servicesList.slice(0, 8).map((service) => {
          const providerCount = parseInt(String(service.providerCount || 0), 10);
          
          return {
            id: String(service.id),
            name: service.name || 'Unnamed Service',
            description: service.description || '',
            category: service.category || 'General',
            image: service.image,
            providerCount: providerCount,
            minPrice: service.minPrice || null,
            avgRating: service.avgRating || 4.5
          };
        });
        
        setServices(formattedServices);
      }

      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const productsData = await productsRes.value.json();
        const productsList = Array.isArray(productsData) ? productsData : [];
        
        totalProductsCount = productsList.length;

        const formattedProducts = productsList.slice(0, 8).map((product) => {
          const sellerName = product.provider ? 
            `${product.provider.firstName || ''} ${product.provider.lastName || ''}`.trim() : 
            'Verified Seller';
            
          return {
            id: String(product.id),
            name: product.name,
            description: product.description,
            seller: sellerName,
            sellerId: product.provider?.id,
            location: 'Nairobi, Kenya',
            price: product.price || 0,
            image: product.images?.[0] || null,
            category: product.categoryName || product.category?.name || 'General',
            rating: product.provider?.rating || 4.5,
            reviews: product.provider?.completedSales || 0,
            provider: product.provider,
            stock: product.stock || 0
          };
        });
        
        setProducts(formattedProducts);
      }

      setStats({
        totalServices: totalServicesCount,
        totalProducts: totalProductsCount,
        totalCategories: serviceCategories.length + productCategories.length
      });

    } catch (err) {
      setError('Failed to load data. Please try again later.');
      setServices([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, activeTab, serviceCategories, productCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setSelectedCategory('all');
  }, [activeTab]);

  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string' && isNaN(Number(price))) {
      return price;
    }

    const numericPrice: number = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(numericPrice) || numericPrice === 0) {
      return 'Contact for price';
    }

    return `KSh ${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getCategoryIcon = (category: string): string => {
    if (!category || typeof category !== 'string') {
      return '🛍️';
    }

    const icons: { [key: string]: string } = {
      'web': '💻', 'tech': '💻', 'development': '💻',
      'cleaning': '🧹', 'housekeeping': '🧹',
      'tutoring': '📚', 'education': '📚',
      'photography': '📸',
      'landscaping': '🌿', 'gardening': '🌿',
      'pet': '🐕',
      'electronics': '⚡',
      'crafts': '🎨', 'art': '🎨',
      'decor': '🏺', 'home': '🏺',
      'fashion': '👕',
      'books': '📖',
      'plumbing': '🔧',
      'electrical': '💡',
      'carpentry': '🪚',
      'beauty': '💄',
      'painting': '🎨',
      'roofing': '🏠',
      'tile': '🔲',
      'handmade': '✋',
      'baking': '🍰',
      'furniture': '🪑',
      'catering': '🍽️',
      'event': '🎉',
      'auto': '🚗',
      'repair': '🔧',
      'moving': '📦',
      'security': '🔒',
      'fitness': '💪',
      'massage': '💆',
      'tailoring': '✂️',
      'laundry': '🧺'
    };

    const lowerCategory: string = category.toLowerCase();
    for (const key in icons) {
      if (lowerCategory.includes(key)) {
        return icons[key];
      }
    }
    return '🛍️';
  };

  const getServiceImage = (serviceName: string, category: string): string => {
    const name = serviceName.toLowerCase();
    const cat = category.toLowerCase();
    
    const imageMap: { [key: string]: string } = {
      'plumb': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=400&fit=crop&q=80',
      'electric': 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=400&fit=crop&q=80',
      'carpent': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=400&fit=crop&q=80',
      'wood': 'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=600&h=400&fit=crop&q=80',
      'paint': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop&q=80',
      'clean': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop&q=80',
      'garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&q=80',
      'landscap': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop&q=80',
      'hair': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&q=80',
      'beauty': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&q=80',
      'salon': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&q=80',
      'furniture': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop&q=80',
      'roof': 'https://plus.unsplash.com/premium_photo-1682617326551-4749611516f6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1033',
      'tile': 'https://media.istockphoto.com/id/487274754/photo/laying-the-tiles.jpg?s=612x612&w=0&k=20&c=igznbimBNuaPgQwCYN0rgCUmqCavf6VnxkuA4SVulsE=',
      'baking': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop&q=80',
      'cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop&q=80',
      'handmade': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=400&fit=crop&q=80',
      'craft': 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=400&fit=crop&q=80',
      'tutor': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop&q=80',
      'photo': 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600&h=400&fit=crop&q=80',
      'cater': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&h=400&fit=crop&q=80',
      'event': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop&q=80',
      'auto': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&q=80',
      'car': 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop&q=80',
      'repair': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=400&fit=crop&q=80',
      'moving': 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop&q=80',
      'security': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=400&fit=crop&q=80',
      'fitness': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&q=80',
      'massage': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop&q=80',
      'tailor': 'https://images.unsplash.com/photo-1558769132-cb1aea8f29d3?w=600&h=400&fit=crop&q=80',
      'laundry': 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&h=400&fit=crop&q=80',
      'pet': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop&q=80'
    };
    
    for (const key in imageMap) {
      if (name.includes(key) || cat.includes(key)) {
        return imageMap[key];
      }
    }
    
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop&q=80';
  };

  const renderStars = (rating: number): JSX.Element => {
    const fullStars: number = Math.floor(rating);
    const hasHalfStar: boolean = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center text-yellow-400 text-sm">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < fullStars
                ? 'fill-current'
                : i === fullStars && hasHalfStar
                ? 'fill-current opacity-50'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  const handleViewServiceProviders = (serviceId: string) => {
    window.location.href = `/services/${serviceId}`;
  };

  const handleViewProductDetails = (productId: string) => {
    window.location.href = `/products/${productId}`;
  };

  const currentItems = activeTab === 'services' ? services : products;
  const currentCategories = activeTab === 'services' ? serviceCategories : productCategories;

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              {activeTab === 'services' ? '🛠️ Professional Services' : '🛍️ Quality Products'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 leading-tight">
            {activeTab === 'services' ? 'Browse Service Categories' : 'Featured Products'}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            {activeTab === 'services' 
              ? 'Connect with skilled professionals ready to help with your projects' 
              : 'Discover handpicked products from our most trusted sellers'}
          </p>
          
          {/* Tab Switcher */}
          <div className="flex flex-col items-center mt-8">
            <div className="inline-flex border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white p-1">
              <button 
                className={`px-6 sm:px-8 py-3 font-semibold flex items-center gap-2.5 transition-all duration-300 text-sm sm:text-base rounded-xl ${
                  activeTab === 'services' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105' 
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`} 
                onClick={() => setActiveTab('services')}
              >
                <Wrench size={18} className={activeTab === 'services' ? 'animate-pulse' : ''} />
                <span>Services</span>
                {stats.totalServices > 0 && (
                  <span className="ml-1 text-xs bg-white/25 px-2 py-0.5 rounded-full font-bold">
                    {stats.totalServices}
                  </span>
                )}
              </button>
              <button 
                className={`px-6 sm:px-8 py-3 font-semibold flex items-center gap-2.5 transition-all duration-300 text-sm sm:text-base rounded-xl ${
                  activeTab === 'products' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105' 
                    : 'bg-transparent text-gray-600 hover:bg-gray-50'
                }`} 
                onClick={() => setActiveTab('products')}
              >
                <ShoppingBag size={18} className={activeTab === 'products' ? 'animate-pulse' : ''} />
                <span>Products</span>
                {stats.totalProducts > 0 && (
                  <span className="ml-1 text-xs bg-white/25 px-2 py-0.5 rounded-full font-bold">
                    {stats.totalProducts}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-0">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">Filter by Category</h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105 ring-4 ring-blue-100'
                  : 'bg-white text-gray-700 hover:bg-blue-50 hover:scale-105 border-2 border-gray-200 hover:border-blue-300 shadow-sm'
              }`}
            >
              ✨ All {activeTab}
            </button>
            
            {currentCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(String(category.id))}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === String(category.id)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105 ring-4 ring-blue-100'
                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:scale-105 border-2 border-gray-200 hover:border-blue-300 shadow-sm'
                }`}
              >
                <span className="mr-1.5 text-base">{getCategoryIcon(category.name)}</span>
                <span>{String(category.name)}</span>
                {category.count !== undefined && (
                  <span className={`ml-1.5 text-xs font-bold ${selectedCategory === String(category.id) ? 'opacity-90' : 'opacity-60'}`}>
                    ({category.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading amazing {activeTab}...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-700 font-semibold text-lg mb-4">{error}</p>
            <button 
              onClick={fetchData}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              <RefreshCw size={16} className="inline mr-2" />
              Try Again
            </button>
          </div>
        )}

        {/* Content Grid */}
        {!loading && !error && (
          <>
            {currentItems.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="text-7xl mb-6 animate-bounce">
                  {activeTab === 'services' ? '🛠️' : '📦'}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  No {activeTab} available yet
                </h3>
                <p className="text-gray-600 text-lg">Check back soon for new additions!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-7">
                {currentItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden aspect-[4/3]">
                      {activeTab === 'services' ? (
                        item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getServiceImage(item.name, item.category);
                            }}
                          />
                        ) : (
                          <img
                            src={getServiceImage(item.name, item.category)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )
                      ) : (
                        item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-6xl group-hover:scale-110 transition-transform duration-500">
                            {getCategoryIcon(item.category)}
                          </div>
                        )
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-3 right-3">
                        {activeTab === 'services' ? (
                          <div className={`backdrop-blur-md text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xl ${
                            item.providerCount && item.providerCount > 0 ? 'bg-blue-600/90' : 'bg-gray-600/90'
                          }`}>
                            <Users size={14} />
                            <span>
                              {item.providerCount === 0 || !item.providerCount
                                ? 'No providers'
                                : `${item.providerCount} ${item.providerCount === 1 ? 'provider' : 'providers'}`
                              }
                            </span>
                          </div>
                        ) : (
                          <div className="backdrop-blur-md bg-green-600/90 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl">
                            {(item.stock ?? 0) > 0 ? `${item.stock} in stock` : '✓ Available'}
                          </div>
                        )}
                      </div>
                      
                      {/* Category Badge for Services */}
                      {activeTab === 'services' && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                            <span className="text-white font-bold text-sm">{item.category}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      {activeTab === 'services' ? (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            {renderStars(item.avgRating || 4.5)}
                            <span className="ml-2 text-sm font-semibold text-gray-700">
                              {(item.avgRating || 4.5).toFixed(1)}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 leading-snug">
                            {item.name}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center text-gray-700 text-sm font-semibold">
                              <div className="p-1.5 bg-blue-100 rounded-lg mr-2">
                                <Users size={16} className="text-blue-600" />
                              </div>
                              <span>
                                {item.providerCount || 0} available
                              </span>
                            </div>
                            <button 
                              onClick={() => handleViewServiceProviders(item.id)}
                              className="flex items-center text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors group/btn"
                            >
                              View All
                              <ArrowRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide truncate bg-gray-100 px-2 py-1 rounded-lg">
                              {item.category}
                            </span>
                            <div className="flex items-center gap-1">
                              {renderStars(item.rating || 4.5)}
                              <span className="ml-1 text-sm font-semibold text-gray-700">
                                {(item.rating || 4.5).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-2 shadow-md">
                              {item.seller ? item.seller.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <span className="text-sm text-gray-700 font-semibold truncate">
                              {item.seller || 'Seller'}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-bold mb-2 line-clamp-2 text-gray-900 leading-snug">
                            {item.name}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500 mb-0.5">Price</span>
                              <span className="text-blue-600 font-bold text-lg">
                                {formatPrice(item.price ?? 0)}
                              </span>
                            </div>
                            <button 
                              onClick={() => handleViewProductDetails(item.id)}
                              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                            >
                              View Details
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;