import React, { useState, useEffect, useCallback } from 'react';
import { Star, MapPin, Clock, Package, ShoppingBag, Loader, AlertCircle, Wrench, RefreshCw, Filter, ShoppingCart, Users, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

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

interface Category {
  id: number | string;
  name: string;
  count?: number;
}

interface Stats {
  totalServices: number;
  totalProducts: number;
  totalCategories: number;
}

export const FeaturedSection = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({ totalServices: 0, totalProducts: 0, totalCategories: 0 });

  const { isAuthenticated, user } = useAuth();
  const BASE_URL = 'https://mkt-backend-sz2s.onrender.com';

  // Enhanced authentication handlers
  const showLoginPrompt = (action: string) => {
    toast.info(
      <div className="flex flex-col space-y-2">
        <span>Please login to {action}</span>
        <button
          onClick={() => window.location.href = '/login'}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Login Now
        </button>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        closeOnClick: false,
      }
    );
  };

  const showSuccessMessage = (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
    });
  };

  // Enhanced action handlers
  const handleBookNow = async (item: any) => {
    if (!isAuthenticated) {
      showLoginPrompt("book services");
      setTimeout(() => {
        window.location.href = "/register";
      }, 1500);
      return;
    }

    // Check if user has service provider role
    if (!user || (user.role?.toLowerCase() !== 'service_provider' && user.role?.toLowerCase() !== 'provider')) {
      toast.info(
        <div className="flex flex-col space-y-2">
          <span>You need a Service Provider account to express interest in this service</span>
          <button
            onClick={() => (window.location.href = "/register?role=service_provider")}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Register as Service Provider
          </button>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: false,
        }
      );
      return;
    }

    setProcessingAction(`booking-${item.id}`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccessMessage(`Redirecting to Express Interest on "${item.title || item.name}"…`);

      setTimeout(() => {
        window.location.href = "/provider/dashboard";
      }, 1500);

    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Action failed. Please try again.");
    } finally {
      setProcessingAction(null);
    }
  };

const handleViewDetails = async (item: any) => {
  if (!isAuthenticated) {
    showLoginPrompt('view details');
    setTimeout(() => {
      window.location.href = '/register';
    }, 1500);
    return;
  }

  setProcessingAction(`details-${item.id}`);

  try {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (item.type === 'product') {
      if (user && user.role && user.role.toLowerCase() === 'client') {
        // ✅ Redirect to client dashboard → marketplace tab → product with id
        window.location.href = `/marketplace?product=${item.id}`;
      } else {
        toast.info(
          <div className="flex flex-col space-y-2">
            <span>You need a client account to view product details</span>
            <button
              onClick={() => window.location.href = '/register?role=client'}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Register as Client
            </button>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            closeOnClick: false,
          }
        );
      }
    } else {
      // ✅ Services work the same way
     window.location.href = `/marketplace?product=${item.id}`;
    }
  } catch (error) {
    console.error('Failed to load details:', error);
    toast.error('Failed to load details. Please try again.');
  } finally {
    setProcessingAction(null);
  }
};

  const handlePurchase = async (item: any) => {
    if (!isAuthenticated) {
      showLoginPrompt('purchase products');
      setTimeout(() => {
        window.location.href = '/register';
      }, 1500);
      return;
    }
    
    // Check if user has client role
    if (user && user.role && user.role.toLowerCase() !== 'client') {
      toast.info(
        <div className="flex flex-col space-y-2">
          <span>You need a client account to purchase products</span>
          <button
            onClick={() => window.location.href = '/register?role=client'}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Register as Client
          </button>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          closeOnClick: false,
        }
      );
      return;
    }

    try {
      setProcessingAction(`purchase-${item.id}`);
      
      const productData = encodeURIComponent(JSON.stringify({
        productId: item.id,
        quantity: 1,
        paymentMethod: 'card',
        shippingAddress: '',
      }));

      showSuccessMessage('Redirecting to complete your purchase...');
      
      setTimeout(() => {
        window.location.href = `/marketplace?product=${item.id}&action=purchase`;
      }, 1500);
      
    } catch (error) {
      console.error('Purchase redirect error:', error);
      toast.error('Failed to redirect to purchase. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const getUserDashboard = (user: any) => {
    if (!user?.role) return '/client/dashboard';
    
    switch (user.role.toLowerCase()) {
      case 'admin': return '/admin/dashboard';
      case 'service_provider':
      case 'provider': return '/provider/dashboard';
      case 'product_seller': 
      case 'seller': return '/seller/dashboard';
      case 'client':
      case 'customer': return '/client/dashboard';
      default: return '/client/dashboard';
    }
  };

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const [servicesCategoriesRes, productsCategoriesRes] = await Promise.allSettled([
        fetch(`${BASE_URL}/api/services/categories`),
        fetch(`${BASE_URL}/api/public/categories`)
      ]);

      // Handle service categories
      if (servicesCategoriesRes.status === 'fulfilled' && servicesCategoriesRes.value.ok) {
        const serviceCategoriesData = await servicesCategoriesRes.value.json();
        const categoriesList = Array.isArray(serviceCategoriesData) ? serviceCategoriesData : serviceCategoriesData?.data || [];
        
        const formattedServiceCategories = categoriesList.map((category: any, index: number) => ({
          id: category.id || category._id || `service-${index}`,
          name: String(category.name || category.category || 'Unknown Category'),
          count: Number(category.count || category.serviceCount || 0)
        }));
        
        setServiceCategories(formattedServiceCategories);
      } else {
        // Fallback categories
        const fallbackServiceCategories = [
          { id: 'cleaning', name: 'Cleaning', count: 0 },
          { id: 'tutoring', name: 'Tutoring', count: 0 },
          { id: 'photography', name: 'Photography', count: 0 },
          { id: 'landscaping', name: 'Landscaping', count: 0 },
          { id: 'web', name: 'Web Development', count: 0 },
          { id: 'tech', name: 'Technology', count: 0 }
        ];
        setServiceCategories(fallbackServiceCategories);
      }

      // Handle product categories
      if (productsCategoriesRes.status === 'fulfilled' && productsCategoriesRes.value.ok) {
        const productCategoriesData = await productsCategoriesRes.value.json();
        const categoriesList = Array.isArray(productCategoriesData) ? productCategoriesData : productCategoriesData?.data || [];
        
        const formattedProductCategories = categoriesList.map((category: any) => ({
          id: category.id || category._id || category.name,
          name: String(category.name || category.category || 'Unknown Category'),
          count: Number(category.count || category.productCount || 0)
        }));
        
        setProductCategories(formattedProductCategories);
      } else {
        try {
          const productsRes = await fetch(`${BASE_URL}/api/products`);
          if (productsRes.ok) {
            const productsData = await productsRes.json();
            const productsList = Array.isArray(productsData) ? productsData : productsData?.data || [];
            
            // Extract unique categories from products
            const uniqueCategories = new Map();
            productsList.forEach((product: any) => {
              const categoryName = String(product.category || 'General');
              if (uniqueCategories.has(categoryName)) {
                uniqueCategories.set(categoryName, uniqueCategories.get(categoryName) + 1);
              } else {
                uniqueCategories.set(categoryName, 1);
              }
            });

            const extractedCategories = Array.from(uniqueCategories.entries()).map(([name, count], index) => ({
              id: `product-${index}`,
              name: String(name),
              count: Number(count)
            }));

            setProductCategories(extractedCategories);
          }
        } catch (fallbackErr) {
          console.error('Error fetching product categories fallback:', fallbackErr);
          setProductCategories([]);
        }
      }

    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategoriesError('Failed to load categories');
      setServiceCategories([]);
      setProductCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // Fetch data from backend with enhanced stats collection
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build URLs with category filtering
      let servicesUrl = `${BASE_URL}/api/services`;
      let productsUrl = `${BASE_URL}/api/products`;
      
      // Get the actual category name for filtering
      const currentCategories = activeTab === 'services' ? serviceCategories : productCategories;
      const selectedCategoryName = selectedCategory === 'all' 
        ? null 
        : currentCategories.find(cat => String(cat.id) === selectedCategory)?.name || selectedCategory;

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

      // Handle services
      if (servicesRes.status === 'fulfilled' && servicesRes.value.ok) {
        const servicesData = await servicesRes.value.json();
        const servicesList = Array.isArray(servicesData) ? servicesData : servicesData?.data || [];
        
        let filteredServices = servicesList;
        
        // Apply client-side filtering if needed
        if (selectedCategoryName && selectedCategoryName !== 'all') {
          filteredServices = servicesList.filter((service: any) => {
            const serviceCategory = typeof service.category === 'object' 
              ? service.category?.name || 'General'
              : service.category || 'General';
            return String(serviceCategory).toLowerCase().includes(selectedCategoryName.toLowerCase()) ||
                   selectedCategoryName.toLowerCase().includes(String(serviceCategory).toLowerCase());
          });
        }
        
        totalServicesCount = filteredServices.length;
        
        const formattedServices = filteredServices.slice(0, 8).map((service: any) => ({
          id: service.id || service._id || Math.random().toString(36).substr(2, 9),
          name: String(service.name || service.title || 'Service'),
          description: String(service.description || 'Professional service available'),
          provider: String(service.provider || service.user?.name || service.company || 'Verified Provider'),
          location: String(service.location || 'Nairobi, Kenya'),
          rating: Number(service.rating) || (4 + Math.random() * 0.9),
          reviews: Number(service.reviews) || Math.floor(Math.random() * 50) + 5,
          price: service.price || 'Contact for pricing',
          image: service.image || service.images?.[0],
          category: String(
            typeof service.category === 'object' 
              ? service.category?.name || 'General'
              : service.category || 'General'
          ),
          duration: String(service.duration || service.estimatedTime || 'Varies'),
          availability: String(service.availability || 'Available')
        }));
        
        setServices(formattedServices);
      } else {
        setServices([]);
      }

      // Handle products
      if (productsRes.status === 'fulfilled' && productsRes.value.ok) {
        const productsData = await productsRes.value.json();
        const productsList = Array.isArray(productsData) ? productsData : productsData?.data || [];
        
        let filteredProducts = productsList;
        
        // Apply client-side filtering if needed
        if (selectedCategoryName && selectedCategoryName !== 'all') {
          filteredProducts = productsList.filter((product: any) => {
            const productCategory = typeof product.category === 'object' 
              ? product.category?.name || 'General'
              : product.category || product.categoryName || 'General';
            return String(productCategory).toLowerCase().includes(selectedCategoryName.toLowerCase()) ||
                   selectedCategoryName.toLowerCase().includes(String(productCategory).toLowerCase());
          });
        }
        
        totalProductsCount = filteredProducts.length;
        
        const formattedProducts = filteredProducts.slice(0, 8).map((product: any) => ({
          id: product.id || product._id || Math.random().toString(36).substr(2, 9),
          name: String(product.name || product.title || 'Product'),
          description: String(product.description || 'Quality product available'),
          seller: String(product.seller || product.provider?.firstName || product.provider || product.user?.name || product.company || 'Verified Seller'),
          location: String(product.location || product.seller?.location || 'Nairobi, Kenya'),
          price: product.price || 0,
          originalPrice: product.originalPrice || product.msrp,
          image: product.image || (Array.isArray(product.images) ? product.images[0] : null),
          category: String(
            typeof product.category === 'object' 
              ? product.category?.name || 'General'
              : product.category || product.categoryName || 'General'
          ),
          rating: Number(product.rating) || (4 + Math.random() * 0.9),
          reviews: Number(product.reviews) || Math.floor(Math.random() * 50) + 5,
          discount: Number(product.discount) || (product.originalPrice && product.price ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0),
          isNew: Boolean(product.isNew) || Math.random() > 0.7
        }));
        
        setProducts(formattedProducts);
      } else {
        setProducts([]);
      }

      // Update stats
      setStats({
        totalServices: totalServicesCount,
        totalProducts: totalProductsCount,
        totalCategories: serviceCategories.length + productCategories.length
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      setServices([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, activeTab, serviceCategories, productCategories]);

  // Load initial data
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset category when switching tabs
  useEffect(() => {
    setSelectedCategory('all');
  }, [activeTab]);

  // Utility functions
  const formatPrice = (price: string | number): string => {
    if (typeof price === 'string' && isNaN(Number(price))) {
      return price;
    }
    
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numericPrice) || numericPrice === 0) {
      return 'Contact for price';
    }
    
    return `KSh ${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  const getCategoryIcon = (category: string | null | undefined): string => {
    if (!category || typeof category !== 'string') {
      return '🛍️';
    }

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

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center text-yellow-400 text-sm">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            size={12}
            className={i < fullStars ? 'fill-current' : 
                      i === fullStars && hasHalfStar ? 'fill-current opacity-50' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const renderReviewCount = (reviews: number, compact: boolean = false) => {
    if (compact) {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users size={10} />
          <span>{reviews} reviews</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Users size={12} />
        <span>{reviews} customer reviews</span>
      </div>
    );
  };

  const currentItems = activeTab === 'services' ? services : products;
  const currentCategories = activeTab === 'services' ? serviceCategories : productCategories;

  // Calculate total items count
  const totalItemsCount = currentCategories.reduce((sum, cat) => sum + (cat.count || 0), 0);
  
  // Get selected category name for display
  const selectedCategoryName = selectedCategory === 'all' 
    ? 'All' 
    : currentCategories.find(cat => String(cat.id) === selectedCategory)?.name || selectedCategory;

  const handleRegisterRedirect = () => {
    if (!isAuthenticated) {
      window.location.href = '/register';
    } else {
      window.location.href = getUserDashboard(user);
    }
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-gray-900">Featured Listings</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Discover our top-rated services and products from trusted providers and sellers
          </p>
          
          {/* Tab Navigation with Stats */}
          <div className="flex flex-col items-center mt-6 sm:mt-8">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <button 
                className={`px-4 sm:px-6 py-2 sm:py-3 font-medium flex items-center gap-2 transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'services' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-blue-50'
                }`} 
                onClick={() => setActiveTab('services')}
              >
                <Wrench size={16} />
                <span className="hidden sm:inline">Services</span>
                <span className="sm:hidden">Services</span>
                {stats.totalServices > 0 && (
                  <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                    {stats.totalServices}
                  </span>
                )}
              </button>
              <button 
                className={`px-4 sm:px-6 py-2 sm:py-3 font-medium flex items-center gap-2 transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'products' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-white text-gray-600 hover:bg-blue-50'
                }`} 
                onClick={() => setActiveTab('products')}
              >
                <ShoppingBag size={16} />
                <span className="hidden sm:inline">Products</span>
                <span className="sm:hidden">Products</span>
                {stats.totalProducts > 0 && (
                  <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                    {stats.totalProducts}
                  </span>
                )}
              </button>
            </div>
            
            {/* Stats Summary */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-blue-600">
                  {activeTab === 'services' ? stats.totalServices : stats.totalProducts}
                </span>
                <span>Total {activeTab}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-blue-600">{currentCategories.length}</span>
                <span>Categories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <Filter size={18} className="text-gray-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Filter by Category</h3>
              {categoriesLoading && <Loader className="w-4 h-4 animate-spin text-blue-600" />}
            </div>
            
            {/* Refresh Categories Button */}
            <button
              onClick={fetchCategories}
              disabled={categoriesLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 bg-white rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <RefreshCw size={14} className={categoriesLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Categories Error State */}
          {categoriesError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-yellow-600" />
                <span className="text-yellow-800 text-sm">{categoriesError}</span>
                <button
                  onClick={fetchCategories}
                  className="ml-auto text-yellow-600 hover:text-yellow-800 text-sm underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Category Pills - Enhanced Responsiveness */}
          <div className="flex flex-wrap gap-2 justify-center">
            {/* All Categories Button */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:scale-105 border border-gray-200 hover:border-blue-300'
              }`}
            >
              All {activeTab}
              {totalItemsCount > 0 && (
                <span className="ml-1 text-xs opacity-75">({totalItemsCount})</span>
              )}
            </button>
            
            {/* Category Buttons - Enhanced Mobile View */}
            {currentCategories.length > 0 ? (
              currentCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(String(category.id))}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    selectedCategory === String(category.id)
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-600 hover:bg-blue-50 hover:scale-105 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="mr-1">{getCategoryIcon(category.name)}</span>
                  <span className="truncate max-w-24 sm:max-w-none">{String(category.name)}</span>
                  {category.count !== undefined && (
                    <span className="ml-1 text-xs opacity-75">({category.count})</span>
                  )}
                </button>
              ))
            ) : !categoriesLoading && !categoriesError && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No categories available for {activeTab}</p>
              </div>
            )}
          </div>

          {/* Category Loading State */}
          {categoriesLoading && currentCategories.length === 0 && (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">Loading categories...</p>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12 sm:py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading {activeTab}...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center mx-4 sm:mx-0">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-700 font-medium">{error}</p>
            <button 
              onClick={fetchData}
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
              // Enhanced Empty State with better messaging
              <div className="text-center py-12 sm:py-16 px-4">
                <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">
                  {selectedCategory === 'all' 
                    ? (activeTab === 'services' ? '🛠️' : '📦')
                    : '🔍'
                  }
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  {selectedCategory === 'all' 
                    ? `No ${activeTab} available yet` 
                    : `No ${activeTab} found in "${selectedCategoryName}" category`
                  }
                </h3>
                <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base">
                  {selectedCategory === 'all' 
                    ? `Be the first to ${activeTab === 'services' ? 'offer services' : 'list products'} on our platform and start earning today!`
                    : `We couldn't find any ${activeTab} in the "${selectedCategoryName}" category right now. This could be because:`
                  }
                </p>
                
                {selectedCategory !== 'all' && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• No providers have listed {activeTab} in this category yet</li>
                      <li>• The category is temporarily out of stock</li>
                      <li>• You might want to try a different category</li>
                    </ul>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  {selectedCategory !== 'all' && (
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 sm:px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
                    >
                      <Filter size={16} />
                      View All {activeTab}
                    </button>
                  )}
                  
                  <button 
                    onClick={() => window.location.href = '/register?role=provider'}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {activeTab === 'services' ? 'Become a Service Provider' : 'Start Selling Products'}
                    <Wrench size={16} />
                  </button>
                </div>

                {/* Suggestion for other categories */}
                {selectedCategory !== 'all' && currentCategories.filter(cat => cat.count && cat.count > 0).length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-gray-600 mb-4">Or explore these popular categories:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {currentCategories
                        .filter(cat => cat.count && cat.count > 0 && String(cat.id) !== selectedCategory)
                        .slice(0, 4)
                        .map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(String(category.id))}
                            className="px-3 py-1 bg-white border border-gray-300 text-gray-600 rounded-full text-sm hover:bg-gray-50 hover:border-blue-300 transition-colors"
                          >
                            <span className="mr-1">{getCategoryIcon(category.name)}</span>
                            {category.name} ({category.count})
                          </button>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="mb-6 text-center">
                  <p className="text-gray-600 text-sm sm:text-base">
                    {selectedCategory === 'all' 
                      ? `Showing ${currentItems.length} featured ${activeTab}`
                      : `Found ${currentItems.length} ${activeTab} in "${selectedCategoryName}" category`
                    }
                  </p>
                </div>

                {/* Items Grid - Enhanced Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {currentItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                    >
                      {/* Image Section */}
                      <div className="relative overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-40 sm:h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-4xl sm:text-6xl">
                            {getCategoryIcon(item.category)}
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-2 right-2 space-y-1">
                          {activeTab === 'products' && (item as ProductItem).discount && (item as ProductItem).discount! > 0 && (
                            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {(item as ProductItem).discount}% OFF
                            </div>
                          )}
                          {activeTab === 'products' && (item as ProductItem).isNew && (
                            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                              New
                            </div>
                          )}
                          {activeTab === 'services' && (
                            <div className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              Featured
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-4 sm:p-5">
                        {activeTab === 'services' ? (
                          <>
                            <div className="flex items-center mb-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm mr-3">
                                {String((item as ServiceItem).provider).charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm sm:text-base truncate">{String((item as ServiceItem).provider)}</h4>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    {renderStars(item.rating)}
                                    <span className="text-gray-500 ml-1 text-xs">{item.rating.toFixed(1)}</span>
                                  </div>
                                  {renderReviewCount(item.reviews, true)}
                                </div>
                              </div>
                            </div>
                            
                            <h3 className="text-sm sm:text-lg font-bold mb-2 line-clamp-2">
                              {String(item.name)}
                            </h3>
                            
                            <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                              {String(item.description)}
                            </p>
                            
                            <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-3 space-x-3">
                              <div className="flex items-center">
                                <MapPin size={12} className="mr-1 flex-shrink-0" />
                                <span className="truncate">{String(item.location)}</span>
                              </div>
                              {(item as ServiceItem).duration && (
                                <div className="flex items-center">
                                  <Clock size={12} className="mr-1 flex-shrink-0" />
                                  <span className="truncate">{String((item as ServiceItem).duration)}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-blue-600 font-bold text-sm sm:text-base">
                                {formatPrice(item.price)}
                              </span>
                              <button 
                                onClick={() => handleBookNow(item)}
                                disabled={processingAction === `booking-${item.id}`}
                                className="px-3 py-1.5 bg-white text-blue-600 border border-blue-600 text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                {processingAction === `booking-${item.id}` ? (
                                  <>
                                    <Loader className="w-3 h-3 animate-spin mr-1" />
                                    <span className="hidden sm:inline">Booking...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Book Now</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <Package size={14} className="text-blue-600 mr-2" />
                                <span className="text-xs sm:text-sm text-gray-600 capitalize truncate">{String(item.category)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {renderStars(item.rating)}
                                <span className="text-gray-500 ml-1 text-xs">{item.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center mb-2">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs mr-2">
                                {String((item as ProductItem).seller).charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs sm:text-sm text-gray-600 font-medium truncate">{String((item as ProductItem).seller)}</span>
                            </div>
                            
                            <h3 className="text-sm sm:text-lg font-bold mb-2 line-clamp-2">
                              {String(item.name)}
                            </h3>
                            
                            <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                              {String(item.description)}
                            </p>
                            
                            <div className="flex items-center justify-between mb-3">
                              {renderReviewCount(item.reviews, true)}
                              <div className="flex items-center text-gray-500 text-xs">
                                <MapPin size={10} className="mr-1" />
                                <span className="truncate max-w-16 sm:max-w-20">{String(item.location)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                {(item as ProductItem).originalPrice && (item as ProductItem).discount! > 0 && (
                                  <span className="text-gray-400 line-through text-xs">
                                    {formatPrice((item as ProductItem).originalPrice!)}
                                  </span>
                                )}
                                <span className="text-blue-600 font-bold text-sm sm:text-base">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                              <div className="flex gap-1 sm:gap-2">
                                <button 
                                  onClick={() => handlePurchase(item)}
                                  disabled={processingAction === `purchase-${item.id}`}
                                  className="px-2 sm:px-3 py-1.5 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                  {processingAction === `purchase-${item.id}` ? (
                                    <>
                                      <Loader className="w-3 h-3 animate-spin mr-1" />
                                      <span className="hidden sm:inline">Processing...</span>
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart size={12} className="mr-1" />
                                      <span className="hidden sm:inline">Purchase</span>
                                      <span className="sm:hidden">Buy</span>
                                    </>
                                  )}
                                </button>
                                <button 
                                  onClick={() => handleViewDetails(item)}
                                  disabled={processingAction === `details-${item.id}`}
                                  className="px-2 sm:px-3 py-1.5 bg-white text-blue-600 border border-blue-600 text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                  {processingAction === `details-${item.id}` ? (
                                    <>
                                      <Loader className="w-3 h-3 animate-spin mr-1" />
                                      <span className="hidden sm:inline">Loading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Eye size={12} className="mr-1" />
                                      <span>Details</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* View All Button */}
            {currentItems.length > 0 && (
              <div className="text-center mt-8 sm:mt-10 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
                  <button 
                    onClick={handleRegisterRedirect}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    View All {activeTab === 'services' ? 'Services' : 'Products'}
                    {selectedCategory !== 'all' && ` in ${selectedCategoryName}`}
                    {activeTab === 'services' ? <Wrench size={16} /> : <ShoppingBag size={16} />}
                  </button>
                  
                  <button 
                    onClick={() => window.location.href = '/register?role=provider'}
                    className="w-full sm:w-auto px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 font-medium transition-colors"
                  >
                    {activeTab === 'services' ? 'Become a Provider' : 'Start Selling'}
                  </button>
                </div>
                
                {/* Summary Stats */}
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-600 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-blue-600">{currentItems.length}</span>
                    <span>Featured {activeTab}</span>
                    {selectedCategory !== 'all' && <span>in {selectedCategoryName}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-blue-600">{currentCategories.length}</span>
                    <span>Categories Available</span>
                  </div>
                  {(activeTab === 'services' ? stats.totalServices : stats.totalProducts) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-blue-600">
                        {activeTab === 'services' ? stats.totalServices : stats.totalProducts}
                      </span>
                      <span>Total Listed</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Categories Management Notice */}
        {!categoriesLoading && (serviceCategories.length > 0 || productCategories.length > 0) && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm">
              <RefreshCw size={14} />
              <span>Categories are automatically updated when new {activeTab} are added</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;