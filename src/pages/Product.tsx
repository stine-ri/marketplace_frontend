import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, MapPin, Eye, ChevronDown, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  images: string[];
  category?: string;
  tags?: string[];
  inStock?: boolean;
  shipping?: string;
  featured?: boolean;
  createdAt: string;
  status: string;
  location?: string;
  provider?: string;
}

const ProductsComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]); // Increased max range
  const [sortBy, setSortBy] = useState('popular');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Products', count: 2840 },
    { id: 'electronics', name: 'Electronics', count: 456 },
    { id: 'fashion', name: 'Fashion', count: 678 },
    { id: 'home', name: 'Home & Garden', count: 389 },
    { id: 'crafts', name: 'Handmade Crafts', count: 234 },
    { id: 'books', name: 'Books', count: 567 },
    { id: 'sports', name: 'Sports & Outdoors', count: 345 },
    { id: 'beauty', name: 'Beauty & Health', count: 289 }
  ];

  const showLoginMessage = () => {
    alert("Kindly login or register to view or purchase our products");
  };

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching products...'); // Add this line
        
        let endpoint = 'https://mkt-backend-sz2s.onrender.com/api/products';
        let params = {};
        
        if (searchQuery) {
          endpoint = 'https://mkt-backend-sz2s.onrender.com/api/products/search';
          params = { q: searchQuery.toLowerCase() };
        }
        
        if (selectedCategory !== 'all') {
          endpoint = 'https://mkt-backend-sz2s.onrender.com/api/products/search';
          params = { ...params, category: selectedCategory };
        }

        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        console.log('API URL:', url); // Add this line
        
        const response = await fetch(url);
        console.log('Response status:', response.status); // Add this line
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        console.log('Received data:', data); // Add this line
        
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error:', err); // Make sure this is logging
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
        console.log('Loading complete'); // Add this line
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory]);

  const filteredProducts = products.filter(product => {
    const price = parseFloat(product.price);
    // Add debug logging to see what's happening
    console.log(`Product: ${product.name}, Price: ${price}, Range: ${priceRange[0]}-${priceRange[1]}, Included: ${price >= priceRange[0] && price <= priceRange[1]}`);
    return price >= priceRange[0] && price <= priceRange[1];
  });

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
  const formatProduct = (product: any): Product => {
    // Create a fallback image using a data URL (this will always work)
    const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+Tm8gSW1hZ2UgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4K';
    
    // Helper function to format provider name
    const formatProviderName = (providerName: string | undefined) => {
      if (!providerName) return 'Registered Provider';
      
      // If it's 'unknown provider' or similar, return 'Registered Provider'
      if (providerName.toLowerCase().includes('unknown') || 
          providerName.toLowerCase().includes('default') ||
          providerName.trim() === '') {
        return 'Registered Provider';
      }
      
      // Otherwise return the actual provider name
      return providerName;
    };
    
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price || '0',
      originalPrice: product.originalPrice || null,
      rating: product.rating ? Number(product.rating) : 4.5, // Default rating for demo
      reviews: product.reviews ? Number(product.reviews) : Math.floor(Math.random() * 100) + 10, // Random reviews for demo
      images: Array.isArray(product.images) && product.images.length > 0 ? product.images : [fallbackImage], // Fallback image
      category: product.category || 'uncategorized',
      tags: Array.isArray(product.tags) ? product.tags : ['new', 'popular'], // Default tags
      inStock: product.inStock ?? (product.stock ? product.stock > 0 : true),
      shipping: '', // Remove shipping info
      featured: product.featured || Math.random() > 0.7, // Random featured for demo
      createdAt: product.createdAt || new Date().toISOString(),
      status: product.status || 'published',
      location: product.location || 'Nairobi, Kenya', // Default location
      provider: formatProviderName(product.provider)
    };
  };

  // Enhanced price formatting for KSH
  const formatPrice = (price: string | number) => {
    // Convert to number if it's a string
    const amount = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formattedProducts = sortedProducts.map(formatProduct);

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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-sm text-gray-400">({category.count})</span>
                      </div>
                    </button>
                  ))}
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
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
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
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid/List */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {formattedProducts.length} of {products.length} products
              </p>
            </div>

            {formattedProducts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 10000]);
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
                          const fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2UgVW5hdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
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
                      </div>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                          onClick={showLoginMessage}
                        >
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                          onClick={showLoginMessage}
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
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
                        onClick={showLoginMessage}
                        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                          product.inStock
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
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
                            const fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y4ZjlmYSIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2YjczODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSI+SW1hZ2UgVW5hdmFpbGFibGU8L3RleHQ+Cjwvc3ZnPgo=';
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
                                onClick={showLoginMessage}
                              >
                                <Heart className="w-5 h-5 text-gray-600" />
                              </button>
                              <button 
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                onClick={showLoginMessage}
                              >
                                <Eye className="w-5 h-5 text-gray-600" />
                              </button>
                              <button
                                onClick={showLoginMessage}
                                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                                  product.inStock
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
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
              onClick={showLoginMessage}
            >
              Register as Buyer
            </button>
            <button 
              className="border-2 border-white text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={showLoginMessage}
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