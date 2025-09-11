import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, MapPin, Eye, ChevronDown, SlidersHorizontal, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Define interfaces to match the backend data structure
export interface Review {
  user: string;
  comment: string;
  rating: number;
}

export interface Product {
  id: number;
  providerId: number;
  name: string;
  description: string;
  price: string;
  images: string[];
  categoryId: number | null; 
  stock?: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;

  // Legacy/compatibility properties
  image?: string | null; 
  primaryImage?: string | null;  
  imageUrl?: string | null;      

  provider: {
    firstName: string;
    lastName: string;
    rating?: number;
    profileImageUrl?: string | null | undefined;
  };

  // Optional properties
  featured?: boolean;
  originalPrice?: number;
  location?: string;
  rating?: number;
  reviews?: Review[];
  tags?: string[];
  inStock?: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  count?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Internal component interface for formatted products
interface FormattedProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string | null;
  rating: number;
  reviews: number;
  images: string[];
  category: string;
  categoryId: number | null;
  tags: string[];
  inStock: boolean;
  shipping: string;
  featured: boolean;
  createdAt: string;
  status: string;
  location: string;
  provider: string;
}

const ProductsComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [sortBy, setSortBy] = useState('popular');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';

  // Get user from AuthContext
  const { user, isAuthenticated } = useAuth();

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

  // Enhanced wishlist and view handlers
  const handleWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      showLoginPrompt('add to wishlist');
      return;
    }

    setProcessingAction(`wishlist-${productId}`);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      showSuccessMessage('Added to wishlist!');
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Failed to add to wishlist');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewDetails = async (productId: string) => {
    if (!isAuthenticated) {
      showLoginPrompt('view product details');
      return;
    }

    // Check if user has client role for product details
    if (user && user.role && user.role.toLowerCase() !== 'client') {
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
      return;
    }

    setProcessingAction(`view-${productId}`);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      window.location.href = `/marketplace?product=${productId}`;
    } catch (error) {
      console.error('View details error:', error);
      toast.error('Failed to load product details');
    } finally {
      setProcessingAction(null);
    }
  };

  // Purchase handler for authenticated users
 const handlePurchaseProduct = async (
  productId: string,
  purchaseData?: {
    quantity?: number;
    paymentMethod?: string;
    shippingAddress?: string;
  }
) => {
  if (!isAuthenticated) {
    showLoginPrompt('purchase products');
    setTimeout(() => {
      window.location.href = '/register';
    }, 1500);
    return;
  }

  // Check if user has client role
  if (user && user.role && user.role.toLowerCase() === 'client') {
    // Redirect client users directly to marketplace with specific product for purchase
    const defaultPurchaseData = {
      quantity: 1,
      paymentMethod: 'card',
      shippingAddress: '',
      ...purchaseData,
    };

    const productData = encodeURIComponent(
      JSON.stringify({
        productId: parseInt(productId),
        ...defaultPurchaseData,
      })
    );

    window.location.href = `/marketplace?product=${productId}&action=purchase&data=${productData}`;
  } else {
    // For non-client users, show message to register as client
    toast.info(
      <div className="flex flex-col space-y-2">
        <span>You need a client account to purchase products</span>
        <button
          onClick={() => (window.location.href = '/register?role=client')}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Register as Client
        </button>
      </div>,
      {
        position: 'top-right',
        autoClose: 5000,
        closeOnClick: false,
      }
    );
  }
};


  // Fetch categories from backend using the public categories endpoint
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(`${BASE_URL}/api/public/categories`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure we have an array of categories
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.warn('Categories response is not an array:', data);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
      // Don't show error for categories as it's not critical
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch ALL products from backend (no category filtering on backend)
  const fetchAllProducts = async () => {
    try {
      setLoading(true);
      
      // Always fetch all products, no category filter in URL
      const url = `${BASE_URL}/api/products`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Ensure we have an array of products
      if (Array.isArray(data)) {
        setAllProducts(data);
        setError(null);
      } else {
        throw new Error('Products response is not an array');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering function
  const getFilteredProducts = () => {
    let filtered = [...allProducts];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.provider.firstName && product.provider.firstName.toLowerCase().includes(query)) ||
        (product.provider.lastName && product.provider.lastName.toLowerCase().includes(query))
      );
    }

    // Apply category filter (compare numbers with numbers)
    if (selectedCategory !== 'all' && selectedCategory !== 'uncategorized') {
      const categoryId = parseInt(selectedCategory);
      if (!isNaN(categoryId)) {
        filtered = filtered.filter(product => 
          product.categoryId === categoryId
        );
      }
    } else if (selectedCategory === 'uncategorized') {
      filtered = filtered.filter(product => 
        product.categoryId === null || product.categoryId === undefined
      );
    }

    // Apply price range filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price);
      return !isNaN(price) && price >= priceRange[0] && price <= priceRange[1];
    });

    return filtered;
  };

  // Get category name by ID
  const getCategoryNameById = (categoryId: number | null) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Get categories with correct counts based on filtered products
  const getCategoriesWithCounts = () => {
    // Filter products by search only (not by category) to get accurate counts
    const searchFilteredProducts = searchQuery.trim() 
      ? allProducts.filter(product => {
          const query = searchQuery.toLowerCase();
          return product.name.toLowerCase().includes(query) ||
                 product.description.toLowerCase().includes(query) ||
                 (product.provider.firstName && product.provider.firstName.toLowerCase().includes(query)) ||
                 (product.provider.lastName && product.provider.lastName.toLowerCase().includes(query));
        })
      : allProducts;

    // Count products in each category
    const categoryCounts = categories.map(cat => {
      const count = searchFilteredProducts.filter(product => 
        product.categoryId === cat.id
      ).length;
      return {
        id: cat.id.toString(),
        name: cat.name,
        count
      };
    });

    // Count uncategorized products
    const uncategorizedCount = searchFilteredProducts.filter(product => 
      !product.categoryId || product.categoryId === null
    ).length;

    // Build categories list
    const allCategoriesWithCounts = [
      { 
        id: 'all', 
        name: 'All Products', 
        count: searchFilteredProducts.length 
      }
    ];

    // Add categories that have products or show all if not filtering by search
    const categoriesToShow = searchQuery.trim() 
      ? categoryCounts.filter(cat => cat.count > 0)
      : categoryCounts;
    
    allCategoriesWithCounts.push(...categoriesToShow);

    // Add uncategorized if there are uncategorized products
    if (uncategorizedCount > 0) {
      allCategoriesWithCounts.push({
        id: 'uncategorized',
        name: 'Uncategorized',
        count: uncategorizedCount
      });
    }

    return allCategoriesWithCounts;
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load categories and products in parallel
      await Promise.all([
        fetchCategories(),
        fetchAllProducts()
      ]);
    };
    loadInitialData();
  }, []);

  // Reset category selection when categories change (new categories added)
  useEffect(() => {
    if (categories.length > 0 && selectedCategory !== 'all') {
      // Check if selected category still exists
      const categoryExists = categories.some(cat => cat.id.toString() === selectedCategory);
      if (!categoryExists && selectedCategory !== 'uncategorized') {
        setSelectedCategory('all');
      }
    }
  }, [categories, selectedCategory]);

  const filteredProducts = getFilteredProducts();

  const sortedProducts = filteredProducts.sort((a, b) => {
    const priceA = parseFloat(a.price);
    const priceB = parseFloat(b.price);

    switch (sortBy) {
      case 'price-low': return priceA - priceB;
      case 'price-high': return priceB - priceA;
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return b.featured ? 1 : -1;
    }
  });

  // Format product data to match our component's expectations
  const formatProduct = (product: Product): FormattedProduct => {
    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJiaXJhLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNmI3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+Cg==';
    
    // Helper function to format provider name
    const formatProviderName = (provider: Product['provider']) => {
      if (!provider) return 'Registered Provider';
      
      const firstName = provider.firstName || '';
      const lastName = provider.lastName || '';
      
      if (firstName || lastName) {
        return `${firstName} ${lastName}`.trim();
      }
      
      return 'Registered Provider';
    };
    
    // Helper function to get review count
    const getReviewCount = (reviews?: Review[]) => {
      if (Array.isArray(reviews)) {
        return reviews.length;
      }
      return Math.floor(Math.random() * 100) + 10;
    };
    
    return {
      id: product.id.toString(),
      name: product.name || 'Unnamed Product',
      description: product.description || '',
      price: product.price || '0',
      originalPrice: product.originalPrice ? product.originalPrice.toString() : null,
      rating: product.rating ? Number(product.rating) : 4.5,
      reviews: getReviewCount(product.reviews),
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [fallbackImage],
      category: getCategoryNameById(product.categoryId),
      categoryId: product.categoryId,
      tags: Array.isArray(product.tags) ? product.tags : ['new', 'popular'],
      inStock: product.inStock ?? (product.stock ? product.stock > 0 : true),
      shipping: '',
      featured: product.featured || Math.random() > 0.7,
      createdAt: product.createdAt || new Date().toISOString(),
      status: product.status || 'published',
      location: product.location || 'Nairobi, Kenya',
      provider: formatProviderName(product.provider)
    };
  };

  // Enhanced price formatting for KSH
  const formatPrice = (price: string | number) => {
    const amount = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(amount)) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formattedProducts = sortedProducts.map(formatProduct);
  const allCategoriesWithCounts = getCategoriesWithCounts();

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Optional: Scroll to products section on mobile
    if (window.innerWidth <= 1024) {
      const productsSection = document.querySelector('.products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Enhanced register redirect handler
  const handleRegisterRedirect = (role: 'client' | 'seller' = 'client') => {
    if (!isAuthenticated) {
      window.location.href = `/register?role=${role}`;
    } else {
      // If already logged in but wrong role, redirect to appropriate registration
      window.location.href = `/register?role=${role}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Discover Amazing Products
              </h1>
              <p className="text-gray-600">Find unique items from sellers around the world</p>
            </div>
            
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 min-w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg border ${viewMode === 'grid' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg border ${viewMode === 'list' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 lg:hidden"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-8">
              {/* Categories */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                  {categoriesLoading && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <div className="space-y-2">
                  {allCategoriesWithCounts.length > 0 ? (
                    allCategoriesWithCounts.map(category => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id.toString())}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id.toString()
                            ? 'bg-blue-50 text-blue-600 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{category.name}</span>
                          <span className="text-sm text-gray-400">({category.count})</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm py-2">
                      {categoriesLoading ? 'Loading categories...' : 'No categories available'}
                    </div>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range (KES)</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000000])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    Current range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </div>
                </div>
              </div>

              {/* Sort By */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="popular">Most Popular</option>
                  <option value='newest'>Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1 products-section">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {formattedProducts.length} of {allProducts.length} products
                {selectedCategory !== 'all' && (
                  <span className="ml-2 text-blue-600 font-medium">
                    in {allCategoriesWithCounts.find(cat => cat.id === selectedCategory)?.name || 'Selected Category'}
                  </span>
                )}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear search
                </button>
              )}
            </div>

            {formattedProducts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <div className="mb-4">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedCategory !== 'all' 
                      ? `No products found in the selected category${searchQuery ? ' matching your search' : ''}.`
                      : searchQuery 
                        ? `No products match "${searchQuery}". Try different keywords.`
                        : 'No products available at the moment.'
                    }
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 10000000]);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {formattedProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJiaXJhLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNmI3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+Cg==';
                          (e.target as HTMLImageElement).src = fallbackSvg;
                        }}
                      />

                      <div className="absolute top-4 left-4 flex gap-2">
                        {product.featured && (
                          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </span>
                        )}
                        {product.originalPrice && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                            Sale
                          </span>
                        )}
                        <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                          onClick={() => handleWishlist(product.id)}
                          disabled={processingAction === `wishlist-${product.id}`}
                        >
                          {processingAction === `wishlist-${product.id}` ? (
                            <Loader className="w-4 h-4 animate-spin text-gray-600" />
                          ) : (
                            <Heart className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                        <button 
                          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                          onClick={() => handleViewDetails(product.id)}
                          disabled={processingAction === `view-${product.id}`}
                        >
                          {processingAction === `view-${product.id}` ? (
                            <Loader className="w-4 h-4 animate-spin text-gray-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-blue-600 font-medium mb-2">{product.provider}</p>
                      
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {product.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          {product.rating} ({product.reviews})
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.tags?.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handlePurchaseProduct(product.id)}
                        disabled={processingAction === `purchase-${product.id}` || !product.inStock}
                        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          product.inStock
                            ? processingAction === `purchase-${product.id}`
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {processingAction === `purchase-${product.id}` ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {formattedProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-64 h-48 md:h-auto overflow-hidden">
                        <img
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJiaXJhLCBzYW5zLXNlcmlmIiBmb250LXNpemU2IjE2IiBmaWxsPSIjNmI3MzgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPk5vIEltYWdlIEF2YWlsYWJsZTwvdGV4dD4KPC9zdmc+Cg==';
                            (e.target as HTMLImageElement).src = fallbackSvg;
                          }}
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          {product.featured && (
                            <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Featured
                            </span>
                          )}
                          {product.originalPrice && (
                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                              Sale
                            </span>
                          )}
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-blue-600 font-medium mb-2">{product.provider}</p>
                            
                            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {product.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                {product.rating} ({product.reviews})
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mb-4">
                              {product.tags?.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-4 mt-4 lg:mt-0">
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-lg text-gray-500 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                )}
                              </div>
                              <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            
                            <div className="flex gap-2">
                              <button 
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                onClick={() => handleViewDetails(product.id)}
                                disabled={processingAction === `view-${product.id}`}
                              >
                                {processingAction === `view-${product.id}` ? (
                                  <Loader className="w-5 h-5 animate-spin text-gray-600" />
                                ) : (
                                  <Eye className="w-5 h-5 text-gray-600" />
                                )}
                              </button>
                              <button
                                onClick={() => handlePurchaseProduct(product.id)}
                                disabled={processingAction === `purchase-${product.id}` || !product.inStock}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                  product.inStock
                                    ? processingAction === `purchase-${product.id}`
                                      ? 'bg-blue-400 cursor-not-allowed'
                                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {processingAction === `purchase-${product.id}` ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin mr-2" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="w-4 h-4" />
                                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Register Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Register to Purchase Products
          </h2>
          <h3 className="text-2xl lg:text-3xl font-semibold mb-8 text-blue-100">
            From Our Verified Sellers
          </h3>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            Create an account to access exclusive deals, track your orders, and connect with trusted sellers worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              className="bg-white text-blue-600 px-10 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => handleRegisterRedirect('client')}
            >
              Register as Buyer
            </button>
            <button 
              className="border-2 border-white text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => handleRegisterRedirect('seller')}
            >
              Register as Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsComponent;