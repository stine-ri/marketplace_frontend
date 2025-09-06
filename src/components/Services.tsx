import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ShoppingBag, Wrench, ChevronRight, Users, Package, TrendingUp, ArrowRight, Filter, RefreshCw, Loader, AlertCircle } from 'lucide-react';

interface PopularItem {
  name: string;
  icon: string;
  rating: number;
  providers?: number;
  sellers?: number;
}

interface FeaturedItem {
  id: number | string;
  type: 'service' | 'product';
  title: string;
  provider?: string;
  seller?: string;
  location: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  tags: string[];
  category: string;
}

interface Category {
  id: number | string;
  name: string;
  count?: number;
}

type StatsData = {
  totalServices: number;
  totalProducts: number;
  totalProviders: number;
  totalCategories: number;
};

// Utility function 
const extractNameFromObject = (obj: any): string => {
  if (!obj) return '';
  
  if (typeof obj === 'string') return obj;
  
  if (typeof obj === 'object') {
    if (obj.firstName) {
      return `${obj.firstName} ${obj.lastName || ''}`.trim();
    }
    return obj.name || obj.title || obj.company || '';
  }
  
  return String(obj);
};

const getCategoryIcon = (category: any): string => {
  if (category === undefined || category === null) {
    return '🛍️';
  }
  
  if (typeof category === 'object') {
    category = category.name || category.title || 'default';
  }
  
  const categoryString = String(category).toLowerCase();
  
  const icons: Record<string, string> = {
    'web': '💻', 'tech': '💻', 'development': '💻',
    'cleaning': '🧹', 'housekeeping': '🧹',
    'tutoring': '📚', 'education': '📚', 'teaching': '📚',
    'photography': '📸', 'photo': '📸',
    'landscaping': '🌿', 'gardening': '🌿',
    'pet': '🐕', 'animal': '🐕',
    'electronics': '⚡', 'gadgets': '⚡',
    'crafts': '🎨', 'art': '🎨', 'handmade': '🎨',
    'decor': '🏺', 'home': '🏠',
    'fashion': '👕', 'clothing': '👕',
    'books': '📖', 'literature': '📖',
    'sports': '⚽', 'fitness': '💪',
    'beauty': '💄', 'cosmetics': '💄',
    'health': '❤️', 'medical': '🏥',
    'food': '🍕', 'restaurant': '🍕',
    'transport': '🚗', 'automotive': '🚗',
    'repair': '🔧', 'plumbing': '🔧',
    'design': '🎨', 'music': '🎵',
    'event': '🎉', 'business': '💼',
    'technology': '💾', 'garden': '🌻',
    'childcare': '👶', 'eldercare': '👵',
    'legal': '⚖️', 'financial': '💰',
    'default': '🛍️'
  };

  if (icons[categoryString]) {
    return icons[categoryString];
  }

  for (const key in icons) {
    if (categoryString.includes(key)) {
      return icons[key];
    }
  }

  return icons['default'];
};

const formatPrice = (price: number | string | undefined | null): string => {
  if (price === undefined || price === null) return 'KSh 0.00';
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return 'KSh 0.00';
  
  return `KSh ${numericPrice.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const StatsSection = () => {
  const [stats, setStats] = useState<StatsData>({
    totalServices: 0,
    totalProducts: 0,
    totalProviders: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [servicesRes, productsRes] = await Promise.allSettled([
          fetch('https://mkt-backend-sz2s.onrender.com/api/services'),
          fetch('https://mkt-backend-sz2s.onrender.com/api/products')
        ]);

        const services = servicesRes.status === 'fulfilled' && servicesRes.value.ok ? 
          await servicesRes.value.json() : [];
        const products = productsRes.status === 'fulfilled' && productsRes.value.ok ? 
          await productsRes.value.json() : [];

        const serviceCategories = new Set(services.map((s: any) => s.category).filter(Boolean));
        const productCategories = new Set(products.map((p: any) => p.category).filter(Boolean));
        const allCategories = new Set([...serviceCategories, ...productCategories]);

        setStats({
          totalServices: services.length,
          totalProducts: products.length,
          totalProviders: Math.floor((services.length + products.length) * 0.7),
          totalCategories: allCategories.size
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsItems = [
    {
      icon: Wrench,
      value: loading ? '...' : stats.totalServices.toLocaleString(),
      label: 'Services Available',
      color: 'text-blue-600'
    },
    {
      icon: Package,
      value: loading ? '...' : stats.totalProducts.toLocaleString(),
      label: 'Products Listed',
      color: 'text-green-600'
    },
    {
      icon: Users,
      value: loading ? '...' : stats.totalProviders.toLocaleString() + '+',
      label: 'Service Providers',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      value: loading ? '...' : stats.totalCategories.toLocaleString(),
      label: 'Categories',
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Growing Marketplace
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers and trusted providers in our thriving ecosystem
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statsItems.map((item, index) => (
            <div key={index} className="text-center p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className={`inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-gray-100 mb-4 ${item.color}`}>
                <item.icon size={24} className="lg:w-8 lg:h-8" />
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                {item.value}
              </div>
              <div className="text-sm lg:text-base text-gray-600">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ServicesProductsComponent = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Category filtering states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [serviceCategories, setServiceCategories] = useState<Category[]>([]);
  const [productCategories, setProductCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Fetch categories for services and products
  const fetchCategories = React.useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);

    try {
      const [servicesCategoriesRes, productsCategoriesRes] = await Promise.allSettled([
        fetch('https://mkt-backend-sz2s.onrender.com/api/services/categories'),
        fetch('https://mkt-backend-sz2s.onrender.com/api/public/categories')
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
        // Fallback: Use predefined service categories
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
        // Fallback: Try to get categories from products endpoint
        try {
          const productsRes = await fetch('https://mkt-backend-sz2s.onrender.com/api/products');
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

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Reset category when switching tabs
  useEffect(() => {
    setSelectedCategory('all');
  }, [activeTab]);

  // Load recent searches from memory
  useEffect(() => {
    // In a real app, you'd use localStorage here
  }, []);

  const saveToRecentSearches = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
  };

  // Fetch initial data on component mount and tab change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsSearching(true);
        
        // Build URL with category filtering
        const currentCategories = activeTab === 'services' ? serviceCategories : productCategories;
        const selectedCategoryName = selectedCategory === 'all' 
          ? null 
          : currentCategories.find(cat => String(cat.id) === selectedCategory)?.name || selectedCategory;

        let endpoint = activeTab === 'services' 
          ? 'https://mkt-backend-sz2s.onrender.com/api/services'
          : 'https://mkt-backend-sz2s.onrender.com/api/products';

        if (selectedCategoryName) {
          endpoint += `?category=${encodeURIComponent(selectedCategoryName)}`;
        }

        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let items = Array.isArray(data) ? data : data?.data || [];

        // Apply client-side filtering if needed
        if (selectedCategoryName) {
          items = items.filter((item: any) => {
            const itemCategory = typeof item.category === 'object' 
              ? item.category?.name || 'General'
              : item.category || 'General';
            return String(itemCategory).toLowerCase().includes(selectedCategoryName.toLowerCase()) ||
                   selectedCategoryName.toLowerCase().includes(String(itemCategory).toLowerCase());
          });
        }

        // Create popular items from the first 6 items with better error handling
        const popular = items.slice(0, 6).map((item: any) => {
          // Safely extract category - handle both string and object categories
          let categoryValue = 'default';
          if (item.category) {
            if (typeof item.category === 'object') {
              categoryValue = item.category.name || item.category.title || 'default';
            } else {
              categoryValue = item.category;
            }
          }
          
          return {
            name: item.name || item.title || 'Unknown Item',
            icon: getCategoryIcon(categoryValue),
            rating: item.rating || item.rating_score || 4.5,
            providers: activeTab === 'services' ? Math.floor(Math.random() * 200) + 50 : undefined,
            sellers: activeTab === 'products' ? Math.floor(Math.random() * 200) + 50 : undefined
          };
        });

        // Create featured items (first 4 items) with better error handling
        const featured = items.slice(0, 4).map((item: any, index: number) => {
          // Safely extract category
          let categoryValue = 'default';
          if (item.category) {
            if (typeof item.category === 'object') {
              categoryValue = item.category.name || item.category.title || 'default';
            } else {
              categoryValue = item.category;
            }
          }
          
          // Safely extract provider/seller - handle both string and object
          let providerValue = 'Verified Provider';
          let sellerValue = 'Verified Seller';
          
          if (item.provider) {
            if (typeof item.provider === 'object') {
              providerValue = item.provider.firstName 
                ? `${item.provider.firstName} ${item.provider.lastName || ''}`.trim()
                : item.provider.name || item.provider.company || 'Verified Provider';
            } else {
              providerValue = item.provider;
            }
          }
          
          if (item.seller) {
            if (typeof item.seller === 'object') {
              sellerValue = item.seller.firstName 
                ? `${item.seller.firstName} ${item.seller.lastName || ''}`.trim()
                : item.seller.name || item.seller.company || 'Verified Seller';
            } else {
              sellerValue = item.seller;
            }
          }
          
          return {
            id: item.id || index,
            type: activeTab,
            title: item.name || item.title || 'Unknown Item',
            provider: activeTab === 'services' ? providerValue : undefined,
            seller: activeTab === 'products' ? sellerValue : undefined,
            location: item.location || item.address || 'Nairobi, Kenya',
            rating: item.rating || item.rating_score || 4.0 + (Math.random() * 0.9),
            reviews: item.reviews || item.review_count || Math.floor(Math.random() * 100) + 5,
            price: formatPrice(item.price || item.cost || item.amount),
            image: item.image || item.images?.[0] || item.photo || '',
            tags: item.tags || [categoryValue] || ['Popular'],
            category: categoryValue
          };
        });

        setPopularItems(popular);
        setFeaturedItems(featured);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set default data to prevent complete breakdown
        setPopularItems([]);
        setFeaturedItems([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchData();
  }, [activeTab, selectedCategory, serviceCategories, productCategories]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If no search query, show all items (filtered by category if selected)
      setIsSearching(true);
      setShowResults(true);
      
      try {
        // Build URL with category filtering
        const currentCategories = activeTab === 'services' ? serviceCategories : productCategories;
        const selectedCategoryName = selectedCategory === 'all' 
          ? null 
          : currentCategories.find(cat => String(cat.id) === selectedCategory)?.name || selectedCategory;

        let endpoint = activeTab === 'services' 
          ? 'https://mkt-backend-sz2s.onrender.com/api/services'
          : 'https://mkt-backend-sz2s.onrender.com/api/products';

        if (selectedCategoryName) {
          endpoint += `?category=${encodeURIComponent(selectedCategoryName)}`;
        }
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let apiResults = Array.isArray(data) ? data : data?.data || [];

        // Apply client-side filtering if needed
        if (selectedCategoryName) {
          apiResults = apiResults.filter((item: any) => {
            const itemCategory = typeof item.category === 'object' 
              ? item.category?.name || 'General'
              : item.category || 'General';
            return String(itemCategory).toLowerCase().includes(selectedCategoryName.toLowerCase()) ||
                   selectedCategoryName.toLowerCase().includes(String(itemCategory).toLowerCase());
          });
        }

        // Format results with provider/seller extraction
        const formattedResults = apiResults.slice(0, 10).map((item: any) => {
          // Handle provider/seller objects
          let providerValue = 'Verified Provider';
          let sellerValue = 'Verified Seller';
          
          if (item.provider) {
            if (typeof item.provider === 'object') {
              providerValue = item.provider.firstName 
                ? `${item.provider.firstName} ${item.provider.lastName || ''}`.trim()
                : item.provider.name || item.provider.company || 'Verified Provider';
            } else {
              providerValue = item.provider;
            }
          }
          
          if (item.seller) {
            if (typeof item.seller === 'object') {
              sellerValue = item.seller.firstName 
                ? `${item.seller.firstName} ${item.seller.lastName || ''}`.trim()
                : item.seller.name || item.seller.company || 'Verified Seller';
            } else {
              sellerValue = item.seller;
            }
          }
          
          return {
            id: item.id || Math.random().toString(36).substring(2, 9),
            name: item.name || item.title || 'Unknown',
            category: item.category || 'General',
            description: item.description || 'No description available',
            price: formatPrice(item.price),
            image: item.image || item.images?.[0] || '',
            provider: activeTab === 'services' ? providerValue : undefined,
            seller: activeTab === 'products' ? sellerValue : undefined,
            rating: item.rating || 4.0,
            reviews: item.reviews || 0,
            tags: item.tags || [item.category || 'Popular'],
            type: activeTab
          };
        });

        setSearchResults(formattedResults);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    saveToRecentSearches(searchQuery);

    try {
      let endpoint = '';
      let url = '';

      if (activeTab === 'services') {
        endpoint = 'https://mkt-backend-sz2s.onrender.com/api/services';
        url = `${endpoint}?q=${encodeURIComponent(searchQuery.toLowerCase())}`;
      } else {
        endpoint = 'https://mkt-backend-sz2s.onrender.com/api/products/search';
        url = `${endpoint}?q=${encodeURIComponent(searchQuery.toLowerCase())}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const apiResults = Array.isArray(data) ? data : data?.data || [];

      if (apiResults.length === 0) {
        setSearchResults([]);
      } else {
        setSearchResults(apiResults.map((item: any) => ({
          id: item.id || Math.random().toString(36).substring(2, 9),
          name: item.name || item.title || 'Unknown',
          category: item.category || 'General',
          description: item.description || 'No description available',
          price: formatPrice(item.price),
          image: item.image || item.images?.[0] || '',
          provider: activeTab === 'services' ? (item.provider || 'Verified Provider') : undefined,
          seller: activeTab === 'products' ? (item.seller || 'Verified Seller') : undefined,
          rating: item.rating || 4.0,
          reviews: item.reviews || 0,
          tags: item.tags || [item.category || 'Popular'],
          type: activeTab
        })));
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRegisterRedirect = () => {
    window.location.href = '/register';
  };

  const handleBookNow = () => {
    alert('Please register or login to book our services');
    window.location.href = '/register';
  };

  const handlePurchase = () => {
    alert('Please register or login to purchase our products');
    window.location.href = '/register';
  };

  const handleViewDetails = () => {
    alert('Please register or login to view product details');
    window.location.href = '/register';
  };

  const renderImage = (item: { image?: string; title: string; type: 'service' | 'product' }) => {
    if (item.image) {
      return (
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).className = 'hidden';
          }}
        />
      );
    }
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-5xl">
        {getCategoryIcon(item.type === 'service' ? 'service' : 'product')}
      </div>
    );
  };

  const popularSearches = [
    { term: 'Cleaning', type: 'services' as const },
    { term: 'Plumbing', type: 'services' as const },
    { term: 'Electronics', type: 'products' as const },
    { term: 'Furniture', type: 'products' as const },
  ];

  const currentCategories = activeTab === 'services' ? serviceCategories : productCategories;
  const totalItemsCount = currentCategories.reduce((sum, cat) => sum + (cat.count || 0), 0);
  const selectedCategoryName = selectedCategory === 'all' 
    ? 'All' 
    : currentCategories.find(cat => String(cat.id) === selectedCategory)?.name || selectedCategory;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-6"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Services & Products
              <span className="block text-yellow-300">In One Place</span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Discover trusted local service providers and unique products from verified sellers around you.
            </p>
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-sm p-1 rounded-lg inline-flex border border-white/20">
                <button
                  onClick={() => {
                    setActiveTab('services');
                    setShowResults(false);
                    setSearchQuery('');
                  }}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'services'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:text-yellow-300'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  Services
                </button>
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setShowResults(false);
                    setSearchQuery('');
                  }}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'products'
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'text-white hover:text-yellow-300'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Products
                </button>
              </div>
            </div>

            {/* Category Filter Section */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-blue-100" />
                  <h3 className="text-lg font-semibold text-blue-100">Filter by Category</h3>
                  {categoriesLoading && <Loader className="w-4 h-4 animate-spin text-blue-100" />}
                </div>
              </div>

              {/* Categories Error State */}
              {categoriesError && (
                <div className="bg-yellow-50/10 border border-yellow-200/30 rounded-lg p-3 mb-4 max-w-md mx-auto">
                  <div className="flex items-center gap-2 justify-center">
                    <AlertCircle size={16} className="text-yellow-300" />
                    <span className="text-yellow-100 text-sm">{categoriesError}</span>
                    <button
                      onClick={fetchCategories}
                      className="ml-auto text-yellow-100 hover:text-yellow-300 text-sm underline"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
                {/* All Categories Button */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === 'all'
                      ? 'bg-white text-blue-600 shadow-md scale-105'
                      : 'bg-white/10 text-blue-100 hover:bg-white/20 hover:scale-105 border border-white/20'
                  }`}
                >
                  All {activeTab}
                  {totalItemsCount > 0 && (
                    <span className="ml-1 text-xs opacity-75">({totalItemsCount})</span>
                  )}
                </button>
                
                {/* Category Buttons */}
                {currentCategories.length > 0 ? (
                  currentCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(String(category.id))}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === String(category.id)
                          ? 'bg-white text-blue-600 shadow-md scale-105'
                          : 'bg-white/10 text-blue-100 hover:bg-white/20 hover:scale-105 border border-white/20'
                      }`}
                    >
                      <span className="mr-1">{getCategoryIcon(category.name)}</span>
                      {String(category.name)}
                      {category.count !== undefined && (
                        <span className="ml-1 text-xs opacity-75">({category.count})</span>
                      )}
                    </button>
                  ))
                ) : !categoriesLoading && !categoriesError && (
                  <div className="text-center py-4 text-blue-100">
                    <p className="text-sm">No categories available for {activeTab}</p>
                  </div>
                )}
              </div>

              {/* Category Loading State */}
              {categoriesLoading && currentCategories.length === 0 && (
                <div className="flex justify-center items-center py-6">
                  <div className="text-center">
                    <Loader className="w-6 h-6 animate-spin text-blue-100 mx-auto mb-2" />
                    <p className="text-blue-100 text-sm">Loading categories...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Search Bar */}
            <div className="bg-white rounded-xl p-3 lg:p-4 flex flex-col lg:flex-row items-stretch shadow-2xl max-w-3xl mx-auto mb-8">
              <div className="flex-grow relative mb-3 lg:mb-0">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Search for ${activeTab}${selectedCategory !== 'all' ? ` in ${selectedCategoryName}` : ''}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 pr-4 py-3 lg:py-4 text-gray-800 text-lg focus:outline-none rounded-lg lg:rounded-r-none border-0 placeholder-gray-500"
                />
              </div>
              
              <button 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 lg:px-8 py-3 lg:py-4 rounded-lg lg:rounded-l-none flex items-center justify-center transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Search size={24} className="mr-2" />
                    {selectedCategory !== 'all' ? `Search in ${selectedCategoryName}` : 'Search'}
                  </span>
                )}
              </button>
            </div>

            {/* Popular & Recent Searches */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 mt-8 text-sm">
              {/* Popular Searches */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="text-blue-200 font-medium">Popular:</span>
                {popularSearches.map((item, index) => (
                  <button 
                    key={index}
                    onClick={() => {
                      setSearchQuery(item.term);
                      setActiveTab(item.type);
                    }} 
                    className="text-white hover:text-yellow-300 transition-colors px-3 py-1 rounded-full border border-white/30 hover:border-yellow-300/50"
                  >
                    {item.term}
                  </button>
                ))}
              </div>
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="text-blue-200 font-medium">Recent:</span>
                  {recentSearches.slice(0, 3).map((term, index) => (
                    <button 
                      key={index}
                      onClick={() => setSearchQuery(term)} 
                      className="text-white hover:text-yellow-300 transition-colors px-3 py-1 rounded-full border border-white/30 hover:border-yellow-300/50"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Category Display */}
            {selectedCategory !== 'all' && (
              <div className="mt-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20">
                  <span className="text-sm">Currently browsing:</span>
                  <span className="font-semibold text-yellow-300">
                    {getCategoryIcon(selectedCategoryName)} {selectedCategoryName}
                  </span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 text-white hover:text-yellow-300 text-sm underline"
                  >
                    Clear filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* Enhanced Search Results */}
      {showResults && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {searchQuery 
                    ? `Search Results for "${searchQuery}"${selectedCategory !== 'all' ? ` in ${selectedCategoryName}` : ''}` 
                    : `All ${activeTab}${selectedCategory !== 'all' ? ` in ${selectedCategoryName}` : ''}`
                  }
                </h3>
                <p className="text-sm text-gray-600">Found {searchResults.length} results</p>
              </div>
              <button 
                onClick={() => setShowResults(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">
                  {selectedCategory === 'all' 
                    ? (activeTab === 'services' ? '🛠️' : '📦')
                    : '🔍'
                  }
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-4">
                  {searchQuery && selectedCategory !== 'all' 
                    ? `No ${activeTab} found for "${searchQuery}" in ${selectedCategoryName}` 
                    : searchQuery 
                      ? `No ${activeTab} found for "${searchQuery}"` 
                      : `No ${activeTab} found in ${selectedCategoryName}`
                  }
                </h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? `We couldn't find any ${activeTab} matching your search. Try different keywords or check other categories.`
                    : `This category doesn't have any ${activeTab} yet. Check back later or explore other categories.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {selectedCategory !== 'all' && (
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center"
                    >
                      <Filter size={16} className="mr-2" />
                      View All {activeTab}
                    </button>
                  )}
                  <button 
                    onClick={handleRegisterRedirect}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center"
                  >
                    Join as Provider <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {searchResults.map((item) => (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0 w-full md:w-48 h-48">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/192x192/e2e8f0/64748b?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-5xl rounded-lg">
                            {getCategoryIcon(item.category)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-900">{item.name}</h4>
                            <p className="text-blue-600 font-medium mt-1">
                              {extractNameFromObject(item.provider || item.seller) || 'Verified Provider'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                              {getCategoryIcon(item.category)} {String(item.category)}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-2">{item.description}</p>
                        <div className="mt-3 flex items-center gap-4">
                          {item.type === 'product' && (
                            <span className="text-lg font-bold text-green-600">
                              {item.price}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            {item.rating} ({item.reviews} reviews)
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          {item.type === 'service' ? (
                            <button 
                              onClick={handleBookNow}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              Book Now
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={handlePurchase}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                Purchase
                              </button>
                              <button 
                                onClick={handleViewDetails}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                View Details
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Popular Categories - Only show when not showing search results */}
      {!showResults && (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategory === 'all' ? 'Popular Categories' : `Items in ${selectedCategoryName}`}
              </h2>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? `Browse trending ${activeTab} in your area`
                  : `Discover ${activeTab} in the ${selectedCategoryName} category`
                }
              </p>
            </div>
            
            {popularItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">
                  {selectedCategory === 'all' ? '🔍' : getCategoryIcon(selectedCategoryName)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedCategory === 'all' 
                    ? `No ${activeTab} available yet` 
                    : `No ${activeTab} in ${selectedCategoryName} category`
                  }
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {selectedCategory === 'all' 
                    ? `Be the first to list ${activeTab} on our platform!`
                    : `This category is currently empty. Try exploring other categories or be the first to add your ${activeTab.slice(0, -1)} here.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {selectedCategory !== 'all' && (
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                    >
                      <Filter size={16} className="mr-2" />
                      View All Categories
                    </button>
                  )}
                  <button 
                    onClick={() => window.location.href = '/register?role=provider'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                  >
                    {activeTab === 'services' ? 'Become a Provider' : 'Start Selling'}
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {popularItems.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 group"
                  >
                    <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{item.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {activeTab === 'services' ? item.providers : item.sellers} {activeTab === 'services' ? 'providers' : 'sellers'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Items */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Featured {activeTab === 'services' ? 'Services' : 'Products'}
                  {selectedCategory !== 'all' && ` in ${selectedCategoryName}`}
                </h2>
                <p className="text-gray-600">Top-rated options just for you</p>
              </div>
              <button 
                onClick={handleRegisterRedirect}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {featuredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">
                  {selectedCategory === 'all' ? '🔍' : getCategoryIcon(selectedCategoryName)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedCategory === 'all' 
                    ? `No ${activeTab} available yet` 
                    : `No ${activeTab} in ${selectedCategoryName} category`
                  }
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {selectedCategory === 'all' 
                    ? `Be the first to list ${activeTab} on our platform!`
                    : `This category is currently empty. Try exploring other categories or be the first to add your ${activeTab.slice(0, -1)} here.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {selectedCategory !== 'all' && (
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                    >
                      <Filter size={16} className="mr-2" />
                      View All Categories
                    </button>
                  )}
                  <button 
                    onClick={() => window.location.href = '/register?role=provider'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors inline-flex items-center"
                  >
                    {activeTab === 'services' ? 'Become a Provider' : 'Start Selling'}
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {featuredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                  >
                    <div className="relative overflow-hidden">
                      {renderImage(item)}
                      <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.type === 'service' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.type === 'service' ? 'Service' : 'Product'}
                        </span>
                      </div>
                      {selectedCategory !== 'all' && (
                        <div className="absolute top-4 right-4">
                          <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full">
                            {getCategoryIcon(item.category)} {item.category}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-blue-600 font-medium mb-2">
                         {extractNameFromObject(item.provider || item.seller) || 'Verified Provider/Seller'}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          {item.rating.toFixed(1)} ({item.reviews})
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag, index) => (
                          <span
                            key={`${tag}-${index}`}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        {item.type === 'product' && (
                          <span className="text-lg font-bold text-gray-900">
                            {item.price}
                          </span>
                        )}
                        {item.type === 'service' && <div></div>}
                        
                        <div className="flex gap-2">
                          {item.type === 'service' ? (
                            <button 
                              onClick={handleBookNow}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              Book Now
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={handlePurchase}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mr-2"
                              >
                                Purchase
                              </button>
                              <button 
                                onClick={handleViewDetails}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                              >
                                View Details
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Enhanced Register Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-6"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Register to View and Request Services
          </h2>
          <h3 className="text-2xl lg:text-3xl font-semibold mb-8 text-blue-100">
            From Our Service Providers
          </h3>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Join our platform to connect with verified service providers and access exclusive products from trusted sellers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={() => window.location.href = '/register?role=customer'}
              className="bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Register as Customer
            </button>
            <button 
              onClick={() => window.location.href = '/register?role=provider'}
              className="border-2 border-white text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Register as Provider
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/register'}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center"
            >
              Browse Services
              <ArrowRight size={16} className="ml-2" />
            </button>
            <button 
              onClick={() => window.location.href = '/register'}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              Shop Products
              <ShoppingBag size={16} className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories Management Notice */}
      {!categoriesLoading && (serviceCategories.length > 0 || productCategories.length > 0) && (
        <div className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
              <RefreshCw size={14} />
              <span>Categories are automatically updated when new {activeTab} are added</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesProductsComponent;